import { fold } from './intent.js';

// Evidence cues, not a diagnosis. Gemini decides the commercial move from the supplied conversation.
export function commercialSignals(conversation, decision) {
  const messages = (conversation.messages || []).filter(m => ['inbound', 'outbound'].includes(m.direction));
  const inbound = messages.filter(m => m.direction === 'inbound');
  const latest = fold(decision.latest?.text);
  const evidence = inbound.map(m => ({ id: m.id, text: String(m.text).slice(0, 1000) }));
  let interlocutor = { role: 'desconhecido', confidence: 'baixa', evidence: null };
  for (const m of inbound) {
    const s = fold(m.text);
    if (!/depende de outra|nao (?:sou|decido)|responsavel (?:pelo|pela|por)/.test(s) && /\b(?:sou (?:eu )?(?:o |a )?(?:responsavel|proprietari[oa]|decisor)|eu decido)\b/.test(s))
      interlocutor = { role: 'decisor confirmado por declaração', confidence: 'alta', evidence: m.id };
    else if (interlocutor.confidence !== 'alta' && /\b(?:sou (?:a |o )?(?:recepcionista|atendente)|vou chamar (?:o |a )?responsavel)\b/.test(s))
      interlocutor = { role: 'atendente humano declarado', confidence: 'media', evidence: m.id };
    else if (interlocutor.confidence !== 'alta' && /\b(?:sou (?:um |uma )?(?:assistente virtual|chatbot)|atendimento automatico)\b/.test(s))
      interlocutor = { role: 'possível chatbot', confidence: 'media', evidence: m.id };
  }
  const refusal = /\b(?:nao (?:temos|tenho|ha) interesse|sem interesse|nao (?:quero|queremos) (?:continuar|prosseguir)|prefiro encerrar|dispenso)\b/.test(latest);
  const objections = [
    ['orcamento', /sem (?:verba|orcamento)|cortando custos|nao (?:temos|tenho) (?:verba|orcamento)/],
    ['preco', /caro|preco|qual o valor|quanto custa/],
    ['prioridade', /prioridade|agora nao|sem tempo/],
    ['confianca', /nao conheco|confiar|confianca|comprovar/],
    ['fornecedor atual', /ja (?:temos|tenho|uso|usamos).{0,30}(?:fornecedor|agencia|sistema)/],
    ['necessidade', /nao preciso|nao vejo (?:necessidade|utilidade)/]
  ].filter(([, pattern]) => pattern.test(latest)).map(([kind]) => kind);
  return {
    interlocutor,
    refusal,
    objectionCues: objections,
    strategyConstraint: conversation.optedOut ? 'interromper' : refusal ? 'encerrar cordialmente sem pergunta ou retomada' :
      decision.opening ? 'motivo relevante sem inventar pesquisa' : objections.length ? 'esclarecer somente se houver abertura' : 'decidir pelo contexto',
    declaredEvidence: evidence,
    answeredQuestionPairs: messages.flatMap((m, i) => m.direction === 'outbound' && m.text.includes('?') && messages[i + 1]?.direction === 'inbound'
      ? [{ question: m.text, answer: messages[i + 1].text }] : []),
    missingInformation: ['empresa', 'segmento', 'necessidade'].filter((_, i) => !conversation.context?.[['company', 'sector', 'challenge'][i]]),
    limitation: 'Sinais locais conservadores. Saudação não identifica robô. Declarações não são pesquisa pública.'
  };
}

export { PRIME_POLICY as ADAPTIVE_POLICY } from './brand.js';

// A bounded decision brief for a neutral first reply, not a message template.
export function isOrientationTurn(conversation, decision) {
  return (conversation.messages || []).length === 1 && !conversation.context?.challenge &&
    /como posso ajudar|qual (?:o )?assunto|motivo do contato/.test(fold(decision.latest?.text));
}
export { PRIME_POLICY as ORIENTATION_POLICY } from './brand.js';
