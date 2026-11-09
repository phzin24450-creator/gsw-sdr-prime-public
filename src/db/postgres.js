import { randomUUID } from 'node:crypto';
import { normalizePhone, MODES, assertMode, validateContext } from '../core.js';
import { classify, INTENTS } from '../intent.js';

function validPhone(phone) {
  const p = normalizePhone(phone);
  if (!p) throw new Error('Telefone invalido');
  return p;
}
function mapConversation(row, messages = [], drafts = []) {
  return { id: row.phone, mode: row.mode, optedOut: row.opted_out, version: Number(row.version), updatedAt: row.updated_at, context: row.context ?? {},
    messages: messages.map(m => ({ id: m.external_id, direction: m.direction, text: m.body, timestamp: m.occurred_at })),
    drafts: drafts.map(d => ({ id: d.id, conversationVersion: Number(d.conversation_version), sourceMessageId: d.source_external_id, text: d.body, intent: d.intent, provider: d.provider, generationMeta: d.generation_meta??{}, status: d.status, reviewedAt: d.reviewed_at, createdAt: d.created_at })) };
}
export async function createPostgresStore(url, { pool: suppliedPool } = {}) {
  if (!url) throw new Error('DATABASE_URL ausente');
  const { Pool } = await import('pg');
  const pool = suppliedPool || new Pool({ connectionString: url, options: '-c search_path=gsw_sdr', max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 });
  await pool.query('SELECT 1');
  async function transaction(operation) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally { client.release(); }
  }
  async function ensureLocked(client, phone) {
    await client.query('INSERT INTO conversations(phone) VALUES($1) ON CONFLICT (phone) DO NOTHING', [phone]);
    return (await client.query('SELECT * FROM conversations WHERE phone=$1 FOR UPDATE', [phone])).rows[0];
  }
  async function get(phone) {
    const id = validPhone(phone);
    await pool.query('INSERT INTO conversations(phone) VALUES($1) ON CONFLICT DO NOTHING', [id]);
    const [c, m, d, history] = await Promise.all([
      pool.query('SELECT * FROM conversations WHERE phone=$1', [id]),
      pool.query('SELECT external_id, direction, body, occurred_at FROM (SELECT external_id, direction, body, occurred_at, created_at FROM messages WHERE conversation_phone=$1 ORDER BY created_at DESC LIMIT 50) recent ORDER BY created_at ASC', [id]),
      pool.query('SELECT d.id,d.body,d.intent,d.provider,d.generation_meta,d.status,d.reviewed_at,d.conversation_version,d.created_at,m.external_id AS source_external_id FROM drafts d JOIN messages m ON m.id=d.source_message_id WHERE d.conversation_phone=$1 ORDER BY d.created_at DESC LIMIT 25', [id]),
      pool.query("SELECT details FROM audit_events WHERE conversation_phone=$1 AND event_type='DRAFT_REVISION' ORDER BY id DESC LIMIT 25", [id])
    ]);
    const result = mapConversation(c.rows[0], m.rows, d.rows);
    result.drafts = [...result.drafts, ...history.rows.map(r=>r.details)].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    return result;
  }
  async function erase(phone) {
    const key = validPhone(phone);
    const result = await pool.query('DELETE FROM conversations WHERE phone=$1', [key]);
    return { deleted: result.rowCount > 0 };
  }
  async function list() {
    const result = await pool.query(`SELECT c.phone AS id,c.mode,c.opted_out AS "optedOut",c.version,c.updated_at AS "updatedAt",
      (SELECT count(*)::integer FROM messages m WHERE m.conversation_phone=c.phone) AS "messageCount"
      FROM conversations c ORDER BY c.updated_at DESC LIMIT 100`);
    return result.rows.map(r => ({ ...r, version: Number(r.version) }));
  }
  async function ingest({ phone, id, text, timestamp, manual = false, allowRepeat = false }) {
    if (!normalizePhone(phone) || typeof id !== 'string' || id.length < 1 || id.length > 300 || typeof text !== 'string') return { accepted: false, reason: 'invalid' };
    const key = validPhone(phone);
    return transaction(async client => {
      const existing = await ensureLocked(client, key);
      if (manual && !allowRepeat) {
        const last = (await client.query('SELECT body FROM messages WHERE conversation_phone=$1 ORDER BY created_at DESC, id DESC LIMIT 1',[key])).rows[0];
        if (last?.body === text.trim()) return {accepted:false, reason:'duplicate_text'};
      }
      const inserted = await client.query(`INSERT INTO messages(id,conversation_phone,external_id,direction,body,occurred_at)
        VALUES ($1,$2,$3,'inbound',$4,$5) ON CONFLICT (external_id) DO NOTHING RETURNING id`,
        [randomUUID(), key, id, text.slice(0, 4000), timestamp ?? new Date()]);
      if (!inserted.rowCount) return { accepted: false, reason: 'duplicate' };
      const intent = classify(text);
      let mode = existing.mode;
      let optedOut = existing.opted_out;
      if (intent === INTENTS.OPT_OUT) { mode = MODES.PAUSED; optedOut = true; }
      else if (intent === INTENTS.HUMAN_REQUEST) mode = MODES.HANDOFF_PENDING;
      const updated = (await client.query(`UPDATE conversations SET mode=$2,opted_out=$3,version=version+1,updated_at=NOW() WHERE phone=$1 RETURNING mode,version`, [key,mode,optedOut])).rows[0];
      await client.query("UPDATE drafts SET status='SUPERSEDED' WHERE conversation_phone=$1 AND status='PENDING_REVIEW'", [key]);
      if (intent === INTENTS.OPT_OUT || intent === INTENTS.HUMAN_REQUEST) {
        await client.query('INSERT INTO audit_events(conversation_phone,event_type,details) VALUES($1,$2,$3::jsonb)', [key,intent,JSON.stringify({ new_mode: mode })]);
      }
      return { accepted: true, mode: updated.mode, version: Number(updated.version), intent };
    });
  }
  async function setMode(phone, mode) {
    const key = validPhone(phone);
    return transaction(async client => {
      const existing = await ensureLocked(client, key);
      assertMode(mode, existing.opted_out);
      await client.query('UPDATE conversations SET mode=$2,version=version+1,updated_at=NOW() WHERE phone=$1', [key,mode]);
      await client.query("UPDATE drafts SET status='SUPERSEDED' WHERE conversation_phone=$1 AND status='PENDING_REVIEW'", [key]);
      await client.query('INSERT INTO audit_events(conversation_phone,event_type,details) VALUES($1,$2,$3::jsonb)', [key,'MODE_CHANGED',JSON.stringify({ from: existing.mode, to: mode })]);
      const updated = (await client.query('SELECT * FROM conversations WHERE phone=$1', [key])).rows[0];
      return mapConversation(updated);
    });
  }
  async function setContext(phone, context) {
    const key = validPhone(phone);
    const changes = validateContext(context);
    return transaction(async client => {
      await ensureLocked(client, key);
      await client.query(`UPDATE conversations SET context=context || $2::jsonb, version=version+1, updated_at=NOW()
        WHERE phone=$1`, [key, JSON.stringify(changes)]);
      await client.query("UPDATE drafts SET status='SUPERSEDED' WHERE conversation_phone=$1 AND status='PENDING_REVIEW'", [key]);
      await client.query('INSERT INTO audit_events(conversation_phone,event_type,details) VALUES($1,$2,$3::jsonb)',
        [key, 'CONTEXT_UPDATED', JSON.stringify({ fields: Object.keys(changes) })]);
      return mapConversation((await client.query('SELECT * FROM conversations WHERE phone=$1', [key])).rows[0]);
    });
  }
  async function reviewDraft(phone, draftId, decision) {
    const key = validPhone(phone);
    if (!['APPROVED','REJECTED'].includes(decision)) throw new Error('Decisao invalida');
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(draftId)) throw new Error('ID invalido');
    return transaction(async client => {
      const c = await ensureLocked(client, key);
      const d = (await client.query('SELECT * FROM drafts WHERE conversation_phone=$1 AND id=$2 FOR UPDATE',[key,draftId])).rows[0];
      if (!d || d.status !== 'PENDING_REVIEW') return { updated: false, reason: 'Rascunho nao esta pendente' };
      if (decision === 'APPROVED' && (![MODES.HUMAN, MODES.AI_ACTIVE].includes(c.mode) || c.opted_out || Number(d.conversation_version) !== Number(c.version))) {
        return { updated: false, reason: 'Estado mudou; rascunho nao pode ser aprovado' };
      }
      await client.query('UPDATE drafts SET status=$3, reviewed_at=NOW() WHERE conversation_phone=$1 AND id=$2', [key,draftId,decision]);
      await client.query('INSERT INTO audit_events(conversation_phone,event_type,details) VALUES($1,$2,$3::jsonb)',
        [key, 'DRAFT_REVIEWED', JSON.stringify({ draft_id: draftId, decision })]);
      return { updated: true, draft: { id: draftId, status: decision }, sent: false };
    });
  }
  async function archiveDraft(client, key, d, sourceMessageId) {
    const snapshot = {id:d.id,conversationVersion:Number(d.conversation_version),sourceMessageId,text:d.body,intent:d.intent,provider:d.provider,generationMeta:d.generation_meta??{},status:'SUPERSEDED',createdAt:d.created_at,reviewedAt:d.reviewed_at};
    await client.query("INSERT INTO audit_events(conversation_phone,event_type,details) VALUES($1,'DRAFT_REVISION',$2::jsonb)",[key,JSON.stringify(snapshot)]);
  }
  async function editDraft(phone, draftId, {text, expectedVersion}) {
    const key = validPhone(phone);
    if (typeof text !== 'string' || !text.trim() || text.length>1000) throw new Error('Texto invalido');
    return transaction(async client => {
      const c = await ensureLocked(client,key);
      const d = (await client.query('SELECT d.*,m.external_id FROM drafts d JOIN messages m ON m.id=d.source_message_id WHERE d.conversation_phone=$1 AND d.id=$2 FOR UPDATE OF d',[key,draftId])).rows[0];
      if (!d || d.status!=='PENDING_REVIEW' || Number(c.version)!==expectedVersion || Number(d.conversation_version)!==Number(c.version) || c.opted_out || ![MODES.HUMAN,MODES.AI_ACTIVE].includes(c.mode)) return {updated:false,reason:'A conversa ou sugestão mudou. Gere uma nova sugestão.'};
      await archiveDraft(client,key,d,d.external_id);
      const id=randomUUID(),version=Number(c.version)+1;
      await client.query('UPDATE conversations SET version=version+1,updated_at=NOW() WHERE phone=$1',[key]);
      const row=(await client.query('UPDATE drafts SET id=$3,body=$4,conversation_version=$5,created_at=NOW() WHERE conversation_phone=$1 AND id=$2 RETURNING *',[key,draftId,id,text.trim(),version])).rows[0];
      return {updated:true,sent:false,draft:{id,conversationVersion:version,sourceMessageId:d.external_id,text:row.body,intent:row.intent,provider:row.provider,generationMeta:row.generation_meta??{},status:row.status,createdAt:row.created_at}};
    });
  }
  async function saveDraft({ phone, expectedVersion, sourceMessageId, text, intent, provider, generationMeta = {}, manual = false, regenerate = false }) {
    const key = validPhone(phone);
    return transaction(async client => {
      const c = await ensureLocked(client, key);
      if (!(c.mode === MODES.AI_ACTIVE || (manual && c.mode === MODES.HUMAN)) || c.opted_out || Number(c.version) !== expectedVersion) return { created: false, reason: 'Estado mudou; rascunho descartado' };
      const m = (await client.query("SELECT id,external_id FROM messages WHERE conversation_phone=$1 AND direction='inbound' ORDER BY created_at DESC, id DESC LIMIT 1",[key])).rows[0];
      if (!m || m.external_id !== sourceMessageId) return { created: false, reason: 'Chegou uma mensagem mais recente' };
      const old = (await client.query('SELECT * FROM drafts WHERE source_message_id=$1',[m.id])).rows[0];
      if (old && !regenerate && Number(old.conversation_version) === expectedVersion && old.status !== 'SUPERSEDED') return {created:false,reason:'Rascunho ja existe para essa mensagem'};
      if (old) await archiveDraft(client,key,old,sourceMessageId);
      const version = expectedVersion + 1;
      await client.query('UPDATE conversations SET version=version+1,updated_at=NOW() WHERE phone=$1',[key]);
      await client.query("UPDATE drafts SET status='SUPERSEDED' WHERE conversation_phone=$1 AND status='PENDING_REVIEW'",[key]);
      const saved = await client.query(`INSERT INTO drafts(id,conversation_phone,source_message_id,conversation_version,intent,provider,body,generation_meta)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT(source_message_id) DO UPDATE SET id=EXCLUDED.id,conversation_version=EXCLUDED.conversation_version,intent=EXCLUDED.intent,provider=EXCLUDED.provider,body=EXCLUDED.body,generation_meta=EXCLUDED.generation_meta,status='PENDING_REVIEW',reviewed_at=NULL,created_at=NOW() RETURNING *`,
        [randomUUID(),key,m.id,version,intent,provider,String(text).slice(0,1000),JSON.stringify(generationMeta)]);
      const d = saved.rows[0];
      return {created:true,draft:{id:d.id,conversationVersion:version,sourceMessageId,text:d.body,intent:d.intent,provider:d.provider,generationMeta:d.generation_meta??{},status:d.status,createdAt:d.created_at}};
    });
  }
  return { get, list, ingest, setMode, setContext, reviewDraft, editDraft, erase, saveDraft, ping: () => pool.query('SELECT 1'), close: () => pool.end() };
}
