import http from 'node:http';
import { createHmac, timingSafeEqual, randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createStore, normalizePhone } from './core.js';
import { createOperatorAuth } from './auth.js';
import { createReviewedDraft } from './advisor.js';
import { summarizeQualification } from './qualification.js';

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer' });
  res.end(JSON.stringify(value));
}
async function readRaw(req, max = 1024 * 1024) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) { const err = new Error('Payload grande demais'); err.status = 413; throw err; }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function signedByMeta(body, signature, secret) {
  if (typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  return safeEqual(signature, 'sha256=' + createHmac('sha256', secret).update(body).digest('hex'));
}
export function decodeMeta(payload) {
  const messages = [];
  if (payload?.object !== 'whatsapp_business_account') return messages;
  for (const entry of payload.entry || []) for (const change of entry.changes || []) {
    if (change.field !== 'messages') continue;
    for (const m of change.value?.messages || []) {
      if (m.type !== 'text') continue;
      const phone = normalizePhone(m.from);
      if (!phone || typeof m.id !== 'string') continue;
      const ts = m.timestamp ? Number(m.timestamp) : NaN;
      messages.push({ phone, id: m.id, text: m.text?.body ?? '', timestamp: Number.isFinite(ts) && ts > 0 ? new Date(Math.min(ts * 1000, 8640000000000000)).toISOString() : undefined });
    }
  }
  return messages;
}
const htmlPath = fileURLToPath(new URL('../web/index.html', import.meta.url));
export function createApp({ adminKey, metaSecret, verifyToken, demo = false, autoDrafts = false, store = createStore(), aiConfig = {}, fetcher = fetch, operatorAuth, integrationStatus = {} } = {}) {
  if (!adminKey || adminKey.length < 20 || !metaSecret || !verifyToken) throw new Error('Configure ADMIN_API_KEY (20+ caracteres), META_APP_SECRET e META_VERIFY_TOKEN');
  // Bounded process-local limiter. Sessions expire on deployment/restart.
  const attempts = new Map();
  function adminRateLimit(req) {
    const address = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);
    if (attempts.size >= 10000 && !attempts.has(address)) return true;
    const item = attempts.get(address);
    if (!item || item.until < now) { attempts.set(address, { count: 1, until: now + 60000 }); return false; }
    item.count += 1;
    return item.count > 120;
  }
  function authorized(req) {
    const token = req.headers.authorization || '';
    return token.startsWith('Bearer ') && safeEqual(token.slice(7), adminKey);
  }
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, stage: 'v4.0.0', autoSend: false, storage: typeof store.close === 'function' ? 'postgres' : 'memory' });
      if (req.method === 'GET' && url.pathname === '/ready') {
        try { if (store.ping) await store.ping(); return json(res,200,{ok:true}); }
        catch { return json(res,503,{ok:false}); }
      }
      if (operatorAuth && url.pathname === '/auth/login' && req.method === 'POST') {
        const result=await operatorAuth.login(req,JSON.parse((await readRaw(req,4096)).toString('utf8')));
        if(result.cookie) res.setHeader('set-cookie',result.cookie);
        return json(res,result.status,result.status===200?{ok:true,username:result.username}:{error:'Acesso recusado; confira os dados ou tente mais tarde'});
      }
      if (operatorAuth && url.pathname === '/auth/logout' && req.method === 'POST') {
        if(!operatorAuth.sameOrigin(req)) return json(res,403,{error:'Origem recusada'});
        res.setHeader('set-cookie',operatorAuth.logout(req)); return json(res,200,{ok:true});
      }
      if (req.method === 'GET' && url.pathname === '/webhook/meta') {
        if (url.searchParams.get('hub.mode') === 'subscribe' && safeEqual(url.searchParams.get('hub.verify_token'), verifyToken) && url.searchParams.get('hub.challenge')) {
          res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
          return res.end(url.searchParams.get('hub.challenge'));
        }
        return json(res, 403, { error: 'Verificacao rejeitada' });
      }
      if (req.method === 'POST' && url.pathname === '/webhook/meta') {
        const body = await readRaw(req);
        if (!signedByMeta(body, req.headers['x-hub-signature-256'], metaSecret)) return json(res, 401, { error: 'Assinatura invalida' });
        const payload = JSON.parse(body.toString('utf8'));
        let accepted = 0;
        const acceptedPhones = [];
        for (const message of decodeMeta(payload)) {
          if ((await store.ingest(message)).accepted) { accepted++; acceptedPhones.push(message.phone); }
        }
        json(res, 200, { received: true, accepted });
        // Best-effort para DESENVOLVIMENTO, sem fila durável; não envia mensagens.
        if (autoDrafts) for (const phone of new Set(acceptedPhones)) {
          setImmediate(() => createReviewedDraft(store, phone, aiConfig, fetcher)
            .catch(e => console.error('Falha de rascunho:', e.message)));
        }
        return;
      }
      if (req.method === 'GET' && url.pathname === '/') {
        const nonce=randomBytes(18).toString('base64');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
          'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` });
        return res.end((await readFile(htmlPath,'utf8')).replaceAll('__CSP_NONCE__',nonce));
      }
      if (url.pathname.startsWith('/api/')) {
        if (adminRateLimit(req)) return json(res, 429, { error: 'Muitas requisicoes; tente mais tarde' });
        const admin=authorized(req), operator=operatorAuth?.session(req);
        if (!admin && !operator) return json(res, 401, { error: 'Autorizacao necessaria' });
        if (operator && !admin && !['GET','HEAD'].includes(req.method) && !operatorAuth.sameOrigin(req)) return json(res,403,{error:'Origem recusada'});
        if (req.method === 'DELETE' && !admin) return json(res,403,{error:'Exclusao restrita ao administrador'});
        if (req.method === 'GET' && url.pathname === '/api/status') return json(res,200,{ operator:operator?.username||'administrador',storage:store.ping?'postgres':'memory',ai:integrationStatus.ai||'regras locais',whatsapp:integrationStatus.whatsapp||'nao configurado',autoSend:false });
        if (req.method === 'GET' && url.pathname === '/api/conversations') return json(res, 200, { conversations: await store.list() });
        const match = /^\/api\/conversations\/(\d{8,15})(?:\/(mode|draft|context))?$/.exec(url.pathname);
        if (match && req.method === 'GET' && !match[2]) return json(res, 200, await store.get(match[1]));
        const inbound = /^\/api\/conversations\/(\d{8,15})\/inbound$/.exec(url.pathname);
        if (inbound && req.method === 'POST') {
          const data=JSON.parse((await readRaw(req,16384)).toString('utf8'));
          if (!data || typeof data.text !== 'string' || !data.text.trim() || data.text.length>4000) return json(res,400,{error:'Informe uma mensagem recebida de ate 4000 caracteres'});
          return json(res,200,await store.ingest({phone:inbound[1],id:'manual.'+randomUUID(),text:data.text.trim(),manual:true,allowRepeat:data.allowRepeat===true}));
        }
        const qualification = /^\/api\/conversations\/(\d{8,15})\/qualification$/.exec(url.pathname);
        if (qualification && req.method === 'GET') return json(res, 200, summarizeQualification(await store.get(qualification[1])));
        if (match && req.method === 'DELETE' && !match[2]) {
          const data = JSON.parse((await readRaw(req, 4096)).toString('utf8'));
          if (data.confirm !== 'DELETE') return json(res, 400, { error: 'Confirmacao DELETE necessaria' });
          return json(res, 200, await store.erase(match[1]));
        }
        if (match && req.method === 'POST' && match[2] === 'mode') {
          const data = JSON.parse((await readRaw(req, 4096)).toString('utf8'));
          return json(res, 200, await store.setMode(match[1], data.mode));
        }
        if (match && req.method === 'POST' && match[2] === 'draft') {
          const raw=await readRaw(req,4096); const data=raw.length?JSON.parse(raw.toString('utf8')):{};
          if (data.tone && !['consultivo','objetivo','acolhedor'].includes(data.tone)) return json(res,400,{error:'Estilo invalido'});
          return json(res,200,await createReviewedDraft(store,match[1],{...aiConfig,manual:true,regenerate:data.regenerate===true,expectedVersion:data.expectedVersion,tone:data.tone},fetcher));
        }
        const edit = /^\/api\/conversations\/(\d{8,15})\/drafts\/([a-f0-9-]{36})\/edit$/i.exec(url.pathname);
        if (edit && req.method === 'POST') {
          const data=JSON.parse((await readRaw(req,8192)).toString('utf8'));
          return json(res,200,await store.editDraft(edit[1],edit[2],data));
        }
        if (match && req.method === 'POST' && match[2] === 'context') {
          const data = JSON.parse((await readRaw(req, 4096)).toString('utf8'));
          return json(res, 200, await store.setContext(match[1], data));
        }
        const review = /^\/api\/conversations\/(\d{8,15})\/drafts\/([a-f0-9-]{36})\/review$/i.exec(url.pathname);
        if (review && req.method === 'POST') {
          const data = JSON.parse((await readRaw(req, 4096)).toString('utf8'));
          return json(res, 200, await store.reviewDraft(review[1], review[2], data.decision));
        }
        if (demo && req.method === 'POST' && url.pathname === '/api/demo/inbound') {
          const data = JSON.parse((await readRaw(req, 4096)).toString('utf8'));
          return json(res, 200, await store.ingest({ phone: data.phone, id: data.id, text: data.text }));
        }
        return json(res, 404, { error: 'Rota desconhecida' });
      }
      return json(res, 404, { error: 'Nao encontrado' });
    } catch (err) {
      const status = err.status || (err instanceof SyntaxError || /invalido|bloquead|inv[aá]lid|grande demais/i.test(err.message) ? 400 : 500);
      if (status >= 500) console.error('Erro interno:', err?.message); // Não imprimir corpos nem tokens.
      return json(res, status, { error: status === 413 ? err.message : status === 400 ? 'Entrada invalida ou operacao bloqueada' : 'Erro interno' });
    }
  });
}

const launchedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (launchedDirectly) {
  const main = async () => {
    if (process.env.NODE_ENV === 'production' &&
       (!process.env.DATABASE_URL || process.env.ENABLE_DEMO === 'true' ||
        !process.env.ADMIN_API_KEY || /troque|exemplo|placeholder/i.test(process.env.ADMIN_API_KEY) ||
        !process.env.META_APP_SECRET || /segredo-do|exemplo|placeholder/i.test(process.env.META_APP_SECRET) ||
        !process.env.META_VERIFY_TOKEN || /token-privado|exemplo|placeholder/i.test(process.env.META_VERIFY_TOKEN))) {
      throw new Error('Producao exige DATABASE_URL, segredos reais e ENABLE_DEMO=false');
    }
    const store = process.env.DATABASE_URL ? await (await import('./db/postgres.js')).createPostgresStore(process.env.DATABASE_URL) : createStore();
    const operatorAuth = createOperatorAuth({username:process.env.OPERATOR_USERNAME,passwordScrypt:process.env.OPERATOR_PASSWORD_SCRYPT,origin:process.env.PUBLIC_ORIGIN,secure:process.env.NODE_ENV==='production'});
    const app = createApp({ operatorAuth, integrationStatus:{ai:process.env.OPENAI_API_KEY?'configurada; teste real pendente':'regras locais',whatsapp:process.env.META_CONFIGURED==='true'?'configurado; teste real pendente':'nao configurado'}, adminKey: process.env.ADMIN_API_KEY, metaSecret: process.env.META_APP_SECRET, verifyToken: process.env.META_VERIFY_TOKEN,
      demo: process.env.ENABLE_DEMO === 'true', autoDrafts: process.env.AUTO_DRAFTS === 'true', store });
    const port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1';
    app.listen(port, host, () => console.log(`GSW SDR PRIME V4 em http://${host}:${port} (${process.env.DATABASE_URL ? 'PostgreSQL' : 'memoria de testes'})`));
    for (const sig of ['SIGINT','SIGTERM']) process.on(sig, () => app.close(async () => { if (store.close) await store.close(); process.exit(0); }));
  };
  main().catch(e => { console.error('Nao foi possivel iniciar:', e.message); process.exitCode = 1; });
}
