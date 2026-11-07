import { randomUUID } from 'node:crypto';
import { classify, INTENTS } from './intent.js';

export const MODES = Object.freeze({ HUMAN: 'HUMAN', AI_ACTIVE: 'AI_ACTIVE', HANDOFF_PENDING: 'HANDOFF_PENDING', PAUSED: 'PAUSED' });
const validModes = new Set(Object.values(MODES));
const REVIEW_DECISIONS = new Set(['APPROVED', 'REJECTED']);
const CONTEXT_KEYS = new Set(['sector', 'challenge', 'goal']);
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
  function getInternal(phone) {
    const id = normalizePhone(phone);
    if (!id) throw new Error('Telefone invalido');
    if (!conversations.has(id)) conversations.set(id, { id, mode: MODES.HUMAN, optedOut: false, context: {}, version: 0, messages: [], drafts: [], updatedAt: new Date().toISOString() });
    return conversations.get(id);
  }
  function supersede(c) { for (const d of c.drafts) if (d.status === 'PENDING_REVIEW') d.status = 'SUPERSEDED'; }
  function ingest({ phone, id, text, timestamp }) {
    if (!normalizePhone(phone) || typeof id !== 'string' || id.length < 1 || id.length > 300 || typeof text !== 'string') return { accepted: false, reason: 'invalid' };
    if (seen.has(id)) return { accepted: false, reason: 'duplicate' };
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
  function saveDraft({ phone, expectedVersion, sourceMessageId, text, intent, provider }) {
    const c = getInternal(phone);
    if (c.mode !== MODES.AI_ACTIVE || c.optedOut || c.version !== expectedVersion) return { created: false, reason: 'Estado mudou; rascunho descartado' };
    const latest = [...c.messages].reverse().find(m => m.direction === 'inbound');
    if (!latest || latest.id !== sourceMessageId) return { created: false, reason: 'Chegou uma mensagem mais recente' };
    if (c.drafts.some(d => d.sourceMessageId === sourceMessageId)) return { created: false, reason: 'Rascunho ja existe para essa mensagem' };
    const draft = { id: randomUUID(), conversationVersion: expectedVersion, sourceMessageId, text: String(text).slice(0, 1000), intent, provider, status: 'PENDING_REVIEW', createdAt: new Date().toISOString() };
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
    if (decision === 'APPROVED' && (c.mode !== MODES.AI_ACTIVE || c.optedOut || d.conversationVersion !== c.version)) {
      return { updated: false, reason: 'Estado mudou; rascunho nao pode ser aprovado' };
    }
    d.status = decision;
    d.reviewedAt = new Date().toISOString();
    return { updated: true, draft: structuredClone(d), sent: false };
  }
  function erase(phone) {
    const key = normalizePhone(phone);
    if (!key) throw new Error('Telefone invalido');
    const record = conversations.get(key);
    if (record) for (const m of record.messages) seen.delete(m.id);
    const hadData = conversations.delete(key);
    return { deleted: hadData };
  }
  function list() { return [...conversations.values()].map(c => ({ id: c.id, mode: c.mode, version: c.version, optedOut: c.optedOut, messageCount: c.messages.length, updatedAt: c.updatedAt })); }
  return { get: phone => structuredClone(getInternal(phone)), ingest, setMode, setContext, saveDraft, reviewDraft, erase, list };
}
