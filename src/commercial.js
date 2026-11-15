import { PRIME_POLICY } from './brand.js';
import { fold } from './intent.js';
import { commercialSignals } from './intelligence.js';

export const CONTEXT_FIELDS = ['company', 'sector', 'challenge', 'goal', 'offer', 'observation', 'sourceUrl', 'verifiedOn', 'interlocutor'];
export const TONES = ['consultivo', 'objetivo', 'estrategico', 'acolhedor'];

const PLAYBOOK = PRIME_POLICY;

const OPENINGS = {
  observacao: 'Use somente a observação pública fornecida, sem alegar visita ou pesquisa própria. Conecte-a a uma pergunta natural.',
  oportunidade: 'Conecte a observação pública ao objetivo como hipótese. Não atribua problema, perda ou impacto ao lead.',
  pergunta: 'Abra com pergunta simples e específica sobre a dificuldade informada como hipótese; não a apresente como fato do lead.',
  segmento: 'Conecte ao segmento sem atribuir dificuldades particulares. Explore uma necessidade plausível.',
  direta: 'Apresente Pedro e a PRIME, explique brevemente o motivo e peça permissão para continuar. Sem pesquisa, diagnóstico ou pitch inventado. Sem setor informado, não fale em “seu segmento” nem sugira experiência prévia naquele mercado. Use uma possibilidade para a operação, sem insinuar trabalhos anteriores.'
};

export function minimize(text, limit = 1000) {
  return String(text ?? '').slice(0, limit)
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, '[link omitido]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, '[e-mail omitido]')
    .replace(/(?:\+\d{1,3}[ .-]?)?(?:\(?\d{2}\)?[ .-]?)?\d{4,5}[ .-]?\d{4}\b|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[dado omitido]');
}

function publicObservation(context, now) {
  if (!context.observation || !/^\d{4}-\d{2}-\d{2}$/.test(context.verifiedOn ?? '')) return '';
  const date = new Date(context.verifiedOn);
  const age = (now - date) / 86400000;
  if (!Number.isFinite(age) || date.toISOString().slice(0,10)!==context.verifiedOn || age < 0 || age > 90) return '';
  try {
    const url = new URL(context.sourceUrl);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) return '';
  } catch { return ''; }
  return minimize(context.observation, 200);
}

export function handoffAccepted(latest) {
  const text = fold(latest);
  if (/\b(nao|ainda|depois|se)\b/.test(text)) return false;
  return /^(?:sim[,.! ]+)?(?:(?:pode|podem) (?:me )?(?:encaminhar|transferir|repassar|compartilhar|falar com|conversar com)|autorizo (?:o encaminhamento|a transferencia)|aceito (?:falar|conversar))\b.{0,100}\b(?:responsavel|especialista|equipe comercial|equipe de desenvolvimento)\b/.test(text);
}

export function commercialPrompt(conversation, decision, config = {}) {
  const raw = conversation.context ?? {};
  const commercialContext = Object.fromEntries(CONTEXT_FIELDS.slice(0,5).filter(k=>raw[k]).map(k=>[k,minimize(raw[k],200)]));
  const observation = publicObservation(raw, config.now ?? Date.now());
  const strategy = !decision.opening ? null : observation ? (raw.goal ? 'oportunidade' : 'observacao') :
    raw.challenge ? 'pergunta' : raw.sector ? 'segmento' : 'direta';
  const history = (conversation.messages ?? []).filter(m=>['inbound','outbound'].includes(m.direction)).slice(-12)
    .map(m=>({direction:m.direction,text:minimize(m.text)}));
  const drafts = (conversation.drafts ?? []).slice(-3).map(d=>({text:minimize(d.text),note:'Rascunho: NÃO comprova envio nem aceite do lead'}));
  return {
    system: PLAYBOOK + '\nVincule opportunity aos IDs de evidenceRegister. Setor, metas do operador e oferta desejada não provam necessidade. Use exploratory para assunto ainda a verificar e grounded somente para oportunidade apoiada por necessidade ou objetivo confirmado do cliente. Sem base, use unknown e escolha uma lacuna útil para descoberta.' + (strategy ? '\nPrimeiro contato sem mensagem do lead. ' + OPENINGS[strategy] : ''),
    input: JSON.stringify({tone:config.tone||'consultivo',intent:decision.intent, latestMessage:minimize(decision.latest.text,1800),
      commercialContext, interlocutorDeclared:raw.interlocutor?minimize(raw.interlocutor,200):null, history, previousDrafts:drafts, commercialSignals: JSON.parse(JSON.stringify(commercialSignals(conversation, decision), (key,value)=>typeof value==='string'?minimize(value):value)), operatorFeedback: (conversation.feedback || []).slice(-10), channel:'WhatsApp manual', strategy,
      evidenceRegister: [
        ...Object.entries(commercialContext).map(([key,value])=>({id:'context:'+key,kind:['goal','offer'].includes(key)?'operator_intention':'operator_record',text:value})),
        ...(observation?[{id:'public:observation',kind:'provided_verified_observation',text:observation}]:[]),
        ...(conversation.messages||[]).filter(m=>m.direction==='inbound').map((m,i)=>({id:'inbound:'+i,kind:'client_statement',text:minimize(m.text,1000)}))
      ],
      verifiedObservation:observation||null, handoffAccepted:handoffAccepted(decision.latest.text),
      regenerate:config.regenerate===true})
  };
}

function questions(text) {
  return String(text).split('?').slice(0,-1).map(part=>fold(part.split(/[.!\n]/).at(-1)).replace(/[^a-z0-9 ]/g,'').trim()).filter(Boolean);
}

export function polishCopy(text) {
  // Uma saudação simples pode ficar; só retiramos frases de atendimento prontas e destacáveis.
  return text.replace(/^(Olá[!,.]\s*|Oi[!,.]\s*)?(?:(?:Entendo|Compreendo) perfeitamente(?: o cenário[^;.!?\n]{0,80})?|Excelente pergunta|Com certeza)[.!;]\s*/iu, (_,greeting='')=>greeting)
    .replace(/,? sem que (?:o cliente|os clientes) percebam? (?:qualquer |a |uma )?automação(?: na conversa)?(?=[.!?])/giu,
      ', mantendo a conversa com sua equipe').trim();
}

const LEAD_ASSUMPTIONS = [
  /\b(?:volume|demanda|quantidade|numero) (?:alto|alta|elevad[oa]|crescente|em crescimento)(?: (?:de|dos) (?:pedidos|encomendas|clientes|contatos|vendas))?\b/g,
  /\b(?:crescimento|aumento) (?:do volume |da demanda )?(?:de|dos|das) (?:pedidos|encomendas|clientes|contatos|vendas)\b/g,
  /\b(?:problemas? operacionais?|dificuldades? comerciais?|gargalos? (?:operacionais?|no atendimento)|perda de (?:pedidos|clientes|vendas))\b/g
];

function unsupportedLeadFact(clean, conversation, decision, now) {
  const context = conversation.context ?? {};
  const evidence = [decision.latest.text, context.challenge, publicObservation(context, now),
    ...(conversation.messages ?? []).filter(message => message.direction === 'inbound').map(message => message.text)];
  return LEAD_ASSUMPTIONS.some(pattern => [...clean.matchAll(pattern)].some(([claim]) =>
    !evidence.some(source => fold(source ?? '').includes(claim))));
}

export function reviewCopy(text, conversation, decision, now = Date.now()) {
  const clean = fold(text);
  const signals = commercialSignals(conversation, decision);
  const leadEvidence=fold((conversation.messages||[]).filter(m=>m.direction==='inbound').map(m=>m.text).join(' ')+' '+(conversation.context?.interlocutor||''));
  if (/\bpedro\b/.test(clean) && !/\bpedro\b/.test(leadEvidence) && !/(?:sou (?:o )?|e o |me chamo |aqui e (?:o )?|aqui quem fala e (?:o )?)pedro|pedro (?:aqui|da prime)/.test(clean)) return 'wrong_interlocutor_name';
  const serviceFamilies=[/sites?|landing page/,/automac|atendimento/,/paineis|painel|sistemas?/].filter(re=>re.test(clean)).length;
  if(serviceFamilies>1 && /(?:oferecemos|servicos|solucoes.{0,30}como|sites?.{0,30}(?:,| e | ou ).{0,20}(?:sistemas?|automac|paineis))/.test(clean) && !/quais.{0,20}servicos|portfolio|todos os servicos/.test(fold(decision.latest.text))) return 'portfolio_pitch';
  if (/entendo perfeitamente|compreendo perfeitamente/.test(clean)) return 'canned_empathy';
  if (/qual.{0,70}(?:segmento|setor).{0,35}e (?:qual|se)|como.{0,80}ou (?:o |a )?(?:controle|atendimento)/.test(clean)) return 'multiple_questions';
  if (/(?:como|gostaria de (?:saber|entender)).{0,200}\bou (?:o |a )?(?:fluxo|organizacao|gestao|controle|atendimento|recebimento|presenca)\b/.test(clean)) return 'multiple_questions';
  if (/empresas (?:do|desse|deste) setor|acompanhamos empresas|parceiro estrategico/.test(clean)) return 'unsupported_experience';
  if (/estimativa mais realista|em tempo real/.test(clean)) return 'unsupported_capability';
  if (signals.refusal && (/\?|\b(?:retomar|desconto|orcamento|agendar|reuniao|volto a|posso explicar)\b/.test(clean))) return 'pressure_after_refusal';
  if (signals.interlocutor.confidence === 'alta' && /quem.{0,35}(?:responsavel|decide)|voce e.{0,20}responsavel/.test(clean)) return 'resolved_identity';
  if (/voce e (?:um |uma )?(?:robo|chatbot)|percebi que.{0,25}automatizad/.test(clean)) return 'unsupported_interlocutor';
  if (/conseguiu ver minha proposta|alguma novidade\?|passando para saber se teve tempo/.test(clean)) return 'generic_followup';
  if (/\b(?:ja )?(?:encaminhei|transferi|agendei|enviei)\b|\b(?:garanto|garantimos|resultado garantido|sem risco)\b|(?:r\$|\bus\$)\s*\d/.test(clean)) return 'unsafe_claim';
  if (!handoffAccepted(decision.latest.text) && /\b(?:(?:vou|vamos|irei) (?:te )?(?:encaminhar|transferir|repassar|colocar em contato)|obrigad[oa] por autorizar|como voce autorizou)\b/.test(clean)) return 'handoff_without_consent';
  if (/\b(?:elimin(?:a|am|ando|ara|aria)|acaba com) (?:todo (?:o )?|o |esse |este |qualquer )?(?:retrabalho|conflito|problema)|\bsem perder (?:mais )?tempo com|\bresolve (?:definitivamente|de vez)\b/.test(clean)) return 'absolute_outcome';
  if (/\b(?:sem que (?:o cliente|os clientes) (?:percebam?|notem?)|(?:o cliente|os clientes) (?:nao perceberao|nem vao perceber)|automacao (?:e |fica )?invisivel)\b/.test(clean)) return 'unverified_visibility';
  if (/\bsem aumentar (?:o )?trabalho|\bsem depender de ninguem|\bprimeir[oa] (?:posicao|lugar) no google|\bretorno (?:financeiro )?garantido/.test(clean)) return 'absolute_outcome';
  if (/\b(?:vendemos|oferecemos|comercializamos) (?:um |uma |os nossos |nossos )?(?:agentes? de (?:ia|inteligencia artificial)|inteligencia artificial|ia)\b/.test(clean)) return 'standalone_ai_offer';
  if (decision.opening && text.trim().split(/\s+/).length > 90) return 'opening_too_long';
  if (/\bgarant(?:ir|indo|ira|em|e|i[dr][oa]s?)\b.{0,100}\b(?:informacoes|dados|localizacao|precisao|atualizad[oa]s?|corret[oa]s?|resultado|vendas|leads|retorno|posicionamento|alcance|conversao|experiencia)\b|\b(?:sempre|100%) (?:corret[oa]s?|atualizad[oa]s?|precis[oa]s?)\b|\b(?:vai|ira) (?:aumentar|dobrar|triplicar) (?:as |os |o |a )?(?:vendas|conversoes|faturamento|retorno|leads)\b/.test(clean)) return 'absolute_outcome';
  if (unsupportedLeadFact(clean, conversation, decision, now)) return 'unsupported_lead_fact';
  const current = questions(text);
  if (current.length > 1) return 'multiple_questions';
  const sent = (conversation.messages ?? []).filter(m=>m.direction==='outbound').flatMap(m=>questions(m.text));
  if (current.some(q=>sent.includes(q))) return 'repeated_question';
  if (decision.opening && !publicObservation(conversation.context ?? {}, now) && /\b(?:notei|observei|percebi|vi que)\b/.test(clean)) return 'unsupported_research';
  if (decision.opening && /\b(?:visitei|pesquisei|analisei|acessei)\b/.test(clean)) return 'unsupported_research';
  if (decision.opening && /\b(?:estamos aplicando|ja aplicamos|ja fizemos|ja atendemos|temos clientes|temos experiencia)\b/.test(clean)) return 'unsupported_experience';
  if (decision.opening && !conversation.context?.sector && /\b(?:seu|nesse|neste) segmento\b/.test(clean)) return 'unsupported_sector';
  return null;
}
