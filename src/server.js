import http from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createStore, normalizePhone } from './core.js';
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
      messages.push({ phone, id: m.id, text: m.text?.body ?? '', timestamp: Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000).toISOString() : undefined });
    }
  }
  return messages;
}
const htmlPath = fileURLToPath(new URL('../web/index.html', import.meta.url));
export function createApp({ adminKey, metaSecret, verifyToken, demo = false, autoDrafts = false, store = createStore(), aiConfig = {}, fetcher = fetch } = {}) {
  if (!adminKey || adminKey.length < 20 || !metaSecret || !verifyToken) throw new Error('Configure ADMIN_API_KEY (20+ caracteres), META_APP_SECRET e META_VERIFY_TOKEN');
  // Rate limiter local de desenvolvimento; em produção usar gateway/proxy.
  const attempts = new Map();
  function adminRateLimit(req) {
    const address = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
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
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, stage: 'prototype-v0.3', autoSend: false, storage: typeof store.close === 'function' ? 'postgres' : 'memory' });
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
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
          'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" });
        return res.end(await readFile(htmlPath));
      }
      if (url.pathname.startsWith('/api/')) {
        if (adminRateLimit(req)) return json(res, 429, { error: 'Muitas requisicoes; tente mais tarde' });
        if (!authorized(req)) return json(res, 401, { error: 'Autorizacao necessaria' });
        if (req.method === 'GET' && url.pathname === '/api/conversations') return json(res, 200, { conversations: await store.list() });
        const match = /^\/api\/conversations\/(\d{8,15})(?:\/(mode|draft|context))?$/.exec(url.pathname);
        if (match && req.method === 'GET' && !match[2]) return json(res, 200, await store.get(match[1]));
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
        if (match && req.method === 'POST' && match[2] === 'draft') return json(res, 200, await createReviewedDraft(store, match[1], aiConfig, fetcher));
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
    const app = createApp({ adminKey: process.env.ADMIN_API_KEY, metaSecret: process.env.META_APP_SECRET, verifyToken: process.env.META_VERIFY_TOKEN,
      demo: process.env.ENABLE_DEMO === 'true', autoDrafts: process.env.AUTO_DRAFTS === 'true', store });
    const port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1';
    app.listen(port, host, () => console.log(`GSW SDR PRIME v0.3 em http://${host}:${port} (${process.env.DATABASE_URL ? 'PostgreSQL' : 'memoria de testes'})`));
    for (const sig of ['SIGINT','SIGTERM']) process.on(sig, () => app.close(async () => { if (store.close) await store.close(); process.exit(0); }));
  };
  main().catch(e => { console.error('Nao foi possivel iniciar:', e.message); process.exitCode = 1; });
}
