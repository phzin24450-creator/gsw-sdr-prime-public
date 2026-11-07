import { fold, classify, INTENTS } from './intent.js';
import { MODES } from './core.js';

const SERVICE_PATTERNS = [
  ['WhatsApp / automações', /whatsapp|automacao|chatbot/],
  ['Sites', /\bsite\b|landing page|loja virtual/],
  ['Sistemas sob medida', /sistema|software|painel|dashboard|aplicativo/],
  ['IA aplicada', /inteligencia artificial|\bia\b/],
  ['SEO / Google / anúncios', /\bseo\b|trafego|google|anuncios/]
];

// Extrai só sinais explicitamente mencionados; não inventa orçamento, decisão ou intenção de compra.
export function summarizeQualification(conversation) {
  const messages = (conversation.messages || []).filter(m => m.direction === 'inbound');
  const context = conversation.context || {};
  const all = fold(messages.map(m => m.text).join(' '));
  const services = SERVICE_PATTERNS.filter(([,re]) => re.test(all)).map(([name]) => name);
  const hasUrgentSignal = /\b(urgente|urgencia|pra ontem|o quanto antes|essa semana|hoje ainda)\b/.test(all);
  const latest = messages.length ? messages[messages.length - 1] : null;
  const intent = latest ? classify(latest.text) : null;
  const humanNeeded = conversation.mode === MODES.HANDOFF_PENDING || intent === INTENTS.HUMAN_REQUEST;
  const optedOut = !!conversation.optedOut || intent === INTENTS.OPT_OUT;
  const missing = [];
  if (!services.length) missing.push('serviço de interesse');
  if (!context.challenge && !context.goal) missing.push('desafio ou objetivo comercial');
  if (!hasUrgentSignal) missing.push('prazo (não informado)');
  return {
    summary: services.length ? `Interesse mencionado: ${services.join(', ')}.` : 'Serviço ainda não identificado.',
    services,
    sector: context.sector || null,
    challenge: context.challenge || null,
    goal: context.goal || null,
    urgentSignal: hasUrgentSignal,
    budget: null,
    decisionMaker: null,
    missing,
    handoffRecommended: humanNeeded,
    optedOut,
    nextAction: optedOut ? 'Interromper contatos e registrar opt-out.' : humanNeeded ? 'Operador humano deve assumir a conversa.' : missing.length ? `Descobrir ${missing[0]}.` : 'Revisão humana para qualificação e próximo passo.',
    note: 'Resumo heurístico; dados ausentes permanecem nulos. Não representa qualificação validada.'
  };
}
