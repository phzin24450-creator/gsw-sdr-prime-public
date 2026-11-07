// Classificador conservador local. Regras críticas independem do LLM.
export const INTENTS = Object.freeze({
  OPT_OUT: 'OPT_OUT', HUMAN_REQUEST: 'HUMAN_REQUEST', PRICING: 'PRICING',
  SERVICES: 'SERVICES', SCHEDULING: 'SCHEDULING', OBJECTION: 'OBJECTION',
  GREETING: 'GREETING', OTHER: 'OTHER'
});
export function fold(text) {
  return String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
export function classify(text) {
  const s = fold(text).slice(0, 4000);
  // Não tratar frases negativas como solicitação de handoff ou opt-out.
  if (/\b(pare de (me )?(enviar|mandar)|nao (me )?(mande|envie|contate|chame)|remova (meu|o meu) (numero|contato)|exclua (meu|o meu) (contato|numero)|quero sair da lista|descadastrar|nao quero mais receber|stop\b|sair da lista)\b/.test(s)) return INTENTS.OPT_OUT;
  if (/\b(quero (falar|conversar) com (um |uma )?(humano|pessoa|atendente|consultor)|falar com alguem|me passa pra (um |uma )?(pessoa|atendente)|atendimento humano|chama (um |uma )?(atendente|pessoa)|prefiro (um |uma )?(humano|pessoa))\b/.test(s)) return INTENTS.HUMAN_REQUEST;
  if (/\b(preco|precos|quanto custa|qual o valor|orcamento|cotacao|mensalidade|investimento|quanto fica)\b/.test(s)) return INTENTS.PRICING;
  if (/\b(agendar|agendamento|reuniao|marcar horario|marcar uma conversa|disponibilidade|podemos conversar|ligacao|chamada)\b/.test(s)) return INTENTS.SCHEDULING;
  if (/\b(nao tenho interesse|nao preciso|muito caro|ja tenho fornecedor|ja uso outra ferramenta|sem tempo|nao e prioridade)\b/.test(s)) return INTENTS.OBJECTION;
  if (/\b(site|sistema|software|whatsapp|automacao|inteligencia artificial|ia|seo|google|trafego|anuncios|painel|dashboard|solucao|servico|voc[eê]s fazem|voces fazem)\b/.test(s)) return INTENTS.SERVICES;
  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|opa)[!.? ]*$/.test(s)) return INTENTS.GREETING;
  return INTENTS.OTHER;
}
export function mustStop(intent) { return intent === INTENTS.OPT_OUT || intent === INTENTS.HUMAN_REQUEST; }
