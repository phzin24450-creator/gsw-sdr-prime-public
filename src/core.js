import { randomUUID } from 'node:crypto';
import { classify, INTENTS } from './intent.js';
import { CONTEXT_FIELDS } from './commercial.js';

export const MODES = Object.freeze({ HUMAN: 'HUMAN', AI_ACTIVE: 'AI_ACTIVE', HANDOFF_PENDING: 'HANDOFF_PENDING', PAUSED: 'PAUSED' });
const validModes = new Set(Object.values(MODES));
const REVIEW_DECISIONS = new Set(['APPROVED', 'REJECTED']);
const CONTEXT_KEYS = new Set(CONTEXT_FIELDS);
const FEEDBACK = new Set(['boa','longa','generica','comercial','contexto','repetida','artificial','interesse','objecao','avanco']);
export function validateFeedback(category) {
  if (!FEEDBACK.has(category)) throw new Error('Feedback invalido');
}
export function validateContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) throw new Error('Contexto invalido');
  const clean = {};
  for (const [k, v] of Object.entries(context)) {
    if (!CONTEXT_KEYS.has(k) || typeof v !== 'string' || v.length > 200) throw new Error('Contexto invalido');
    clean[k] = v.trim();
  }
  return clean;
}

export function normalizePhone(value) {
  if (typeof value !== 'string') return null;
  const phone = value.replace(/\D/g, '');
  return phone.length >= 8 && phone.length <= 15 ? phone : null;
}
export function assertMode(mode, optedOut = false) {
  if (!validModes.has(mode)) throw new Error('Modo invalido');
  if (optedOut && mode === MODES.AI_ACTIVE) throw new Error('Contato pediu para nao receber mensagens; reativacao de IA bloqueada');
}
export function createStore() {
  // Fallback estritamente local para testes. DATABASE_URL ativa o Postgres.
  const conversations = new Map();
  const seen = new Set();
  const feedback = new Map();
  function getInternal(phone) {
    const id = normalizePhone(phone);
    if (!id) throw new Error('Telefone invalido');
    if (!conversations.has(id)) conversations.set(id, { id, mode: MODES.HUMAN, optedOut: false, context: {}, version: 0, messages: [], drafts: [], updatedAt: new Date().toISOString() });
    return conversations.get(id);
  }
  function supersede(c) { for (const d of c.drafts) if (d.status === 'PENDING_REVIEW') d.status = 'SUPERSEDED'; }
  function ingest({ phone, id, text, timestamp, manual = false, allowRepeat = false }) {
    if (!normalizePhone(phone) || typeof id !== 'string' || id.length < 1 || id.length > 300 || typeof text !== 'string') return { accepted: false, reason: 'invalid' };
    if (seen.has(id)) return { accepted: false, reason: 'duplicate' };
    const previous = getInternal(phone).messages.at(-1);
    if (manual && !allowRepeat && previous?.text === text.trim()) return { accepted:false, reason:"duplicate_text" };
    seen.add(id);
    if (seen.size > 10000) seen.delete(seen.values().next().value);
    const c = getInternal(phone);
    c.messages.push({ id, direction: 'inbound', text: text.slice(0, 4000), timestamp: timestamp ?? new Date().toISOString() });
    if (c.messages.length > 100) c.messages.shift();
    supersede(c);
    const intent = classify(text);
    if (intent === INTENTS.OPT_OUT) { c.mode = MODES.PAUSED; c.optedOut = true; }
    else if (intent === INTENTS.HUMAN_REQUEST) c.mode = MODES.HANDOFF_PENDING;
    c.version += 1;
    c.updatedAt = new Date().toISOString();
    return { accepted: true, mode: c.mode, version: c.version, intent };
  }
  function setMode(phone, mode) {
    const c = getInternal(phone);
    assertMode(mode, c.optedOut);
    supersede(c);
    c.mode = mode;
    c.version += 1;
    c.updatedAt = new Date().toISOString();
    return structuredClone(c);
  }
  function saveDraft({ phone, expectedVersion, sourceMessageId, text, intent, provider, generationMeta = {}, manual = false, regenerate = false, opening = false }) {
    const c = getInternal(phone);
    if (!(c.mode === MODES.AI_ACTIVE || (manual && c.mode === MODES.HUMAN)) || c.optedOut || c.version !== expectedVersion) return { created: false, reason: 'Estado mudou; rascunho descartado' };
    const latest = [...c.messages].reverse().find(m => m.direction === 'inbound');
    if (opening ? (c.messages.length || sourceMessageId!==null) : (!latest || latest.id !== sourceMessageId)) return { created: false, reason: 'Chegou uma mensagem mais recente' };
    if (!regenerate && c.drafts.some(d => d.sourceMessageId === sourceMessageId && d.conversationVersion === c.version && d.status !== 'SUPERSEDED')) return { created: false, reason: 'Rascunho ja existe para essa mensagem' };
    const current = c.drafts.find(d=>d.sourceMessageId===sourceMessageId && d.conversationVersion===c.version && d.status==='PENDING_REVIEW');
    if (current && current.provider===provider && current.text.trim()===String(text).trim()) return {created:false,draft:structuredClone(current),reason:'A sugestão já é a versão atual.'};
    supersede(c);
    c.version += 1;
    const draft = { id: randomUUID(), conversationVersion: c.version, sourceMessageId, text: String(text).slice(0, 1000), intent, provider, generationMeta, status: 'PENDING_REVIEW', createdAt: new Date().toISOString() };
    c.drafts.push(draft);
    return { created: true, draft: structuredClone(draft) };
  }
  function setContext(phone, context) {
    const c = getInternal(phone);
    const changes = validateContext(context);
    c.context = { ...c.context, ...changes };
    supersede(c);
    c.version += 1;
    c.updatedAt = new Date().toISOString();
    return structuredClone(c);
  }
  function reviewDraft(phone, draftId, decision) {
    const c = getInternal(phone);
    if (!REVIEW_DECISIONS.has(decision)) throw new Error('Decisao invalida');
    const d = c.drafts.find(d => d.id === draftId);
    if (!d || d.status !== 'PENDING_REVIEW') return { updated: false, reason: 'Rascunho nao esta pendente' };
    if (decision === 'APPROVED' && (![MODES.AI_ACTIVE, MODES.HUMAN].includes(c.mode) || c.optedOut || d.conversationVersion !== c.version)) {
      return { updated: false, reason: 'Estado mudou; rascunho nao pode ser aprovado' };
    }
    d.status = decision;
    d.reviewedAt = new Date().toISOString();
    return { updated: true, draft: structuredClone(d), sent: false };
  }
  function editDraft(phone, draftId, {text, expectedVersion}) {
    const c = getInternal(phone), d = c.drafts.find(d => d.id === draftId);
    if (typeof text !== 'string' || !text.trim() || text.length > 1000) throw new Error('Texto invalido');
    if (!d || d.status !== 'PENDING_REVIEW' || c.version !== expectedVersion || d.conversationVersion !== c.version || c.optedOut || ![MODES.HUMAN, MODES.AI_ACTIVE].includes(c.mode)) return {updated:false, reason:'A conversa ou sugestão mudou. Gere uma nova sugestão.'};
    if (d.text === text.trim()) return {updated:true,unchanged:true,draft:structuredClone(d),sent:false};
    const previous = structuredClone(d); previous.status = 'SUPERSEDED';
    c.drafts.splice(c.drafts.indexOf(d), 0, previous);
    d.id = randomUUID(); d.text = text.trim(); d.createdAt = new Date().toISOString();
    c.version += 1; d.conversationVersion = c.version;
    return {updated:true, draft:structuredClone(d), sent:false};
  }
  function recordFeedback(phone, draftId, category) {
    validateFeedback(category);
    const c = getInternal(phone);
    if (!c.drafts.some(d=>d.id===draftId)) return {recorded:false,reason:'Sugestão não encontrada nesta conversa.'};
    if (!feedback.has(c.id)) feedback.set(c.id, new Set());
    feedback.get(c.id).add(draftId+':'+category);
    return {recorded:true};
  }
  function erase(phone) {
    const key = normalizePhone(phone);
    if (!key) throw new Error('Telefone invalido');
    const record = conversations.get(key);
    if (record) for (const m of record.messages) seen.delete(m.id);
    feedback.delete(key);
    const hadData = conversations.delete(key);
    return { deleted: hadData };
  }
  function setArchived(phone, archived) {
    const c = conversations.get(normalizePhone(phone));
    if (!c) return null;
    c.archivedAt = archived ? c.archivedAt ?? new Date().toISOString() : null;
    return { archivedAt: c.archivedAt };
  }
  function list({ archived = false, search = '' } = {}) {
    const needle = search.toLowerCase();
    return [...conversations.values()]
      .filter(c => Boolean(c.archivedAt) === archived &&
        (c.id.includes(search) || (c.context.company ?? '').toLowerCase().includes(needle)))
      .map(c => ({ id: c.id, company: c.context.company, mode: c.mode, version: c.version,
        optedOut: c.optedOut, archivedAt: c.archivedAt ?? null, messageCount: c.messages.length, updatedAt: c.updatedAt }));
  }
  return { get: phone => { const c=structuredClone(getInternal(phone)); c.feedback=[...(feedback.get(c.id)||[])].map(value=>({draftId:value.slice(0,value.indexOf(':')),category:value.slice(value.indexOf(':')+1)})); return c; }, ingest, setMode, setContext, saveDraft, editDraft, reviewDraft, recordFeedback, erase, list, setArchived };
}
