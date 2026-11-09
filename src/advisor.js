import { classify, fold, INTENTS } from './intent.js';
import { MODES } from './core.js';

import { commercialPrompt, reviewCopy, polishCopy } from './commercial.js';

function serviceFromHistory(messages = []) {
  const history = [...messages].reverse().map(m => fold(m.text || '')).slice(0, 8);
  for (const s of history) {
    if (/whatsapp|automacao de atendimento/.test(s)) return 'automação de WhatsApp';
    if (/site|landing page|pagina web/.test(s)) return 'site';
    if (/seo|trafego|anuncio|google/.test(s)) return 'presença no Google e marketing digital';
    if (/sistema|software|dashboard|painel/.test(s)) return 'sistema sob medida';
  }
  return null;
}
export function localDraft(intent, latest, context = {}) {
  if (/advoc|juridic/.test(fold(latest)) && ![INTENTS.OPT_OUT, INTENTS.HUMAN_REQUEST].includes(intent)) return 'Podemos avaliar a presença digital do escritório e o caminho até o contato no site atual. Hoje vocês acompanham de onde vêm as visitas e quantas viram contatos?';
  switch (intent) {
    case INTENTS.PRICING: return context.service ? `Sobre ${context.service}, a GSW define valores conforme o escopo. Para encaminhar uma avaliação sem inventar preço, qual funcionalidade é indispensável para você?` : 'Posso te ajudar a entender as opções da GSW. Para falar de valores com precisão, qual necessidade você quer resolver hoje? Assim encaminhamos o contexto para uma avaliação, sem estimativas precipitadas.';
    case INTENTS.SERVICES: {
      const s = fold(latest);
      if (/whatsapp|automacao|atendimento/.test(s)) return 'A GSW trabalha com automações de atendimento. Hoje, qual parte do seu WhatsApp mais toma tempo: responder dúvidas, organizar pedidos ou fazer acompanhamento?';
      if (/site|pagina|landing/.test(s)) return 'A GSW desenvolve sites e soluções digitais conforme a necessidade. Você já tem um site que precisa melhorar ou quer criar o primeiro?';
      if (/seo|google|trafego|anuncio/.test(s)) return 'A GSW também atua com presença no Google, SEO e tráfego pago. Seu foco é aumentar a procura pelo negócio ou melhorar a presença digital atual?';
      if (/inteligencia artificial|\bia\b/.test(s)) return 'A utilização de IA depende da necessidade do projeto. Qual tarefa ou processo você quer melhorar?';
      if (/sistema|software|painel|dashboard/.test(s)) return 'A GSW desenvolve sistemas e painéis sob medida. Que tarefa ou informação você gostaria de organizar melhor no seu negócio?';
      return 'A GSW desenvolve soluções digitais conforme a necessidade de cada empresa. O que você gostaria de melhorar no seu negócio?';
    }
    case INTENTS.SCHEDULING: return 'Podemos encaminhar seu interesse para uma conversa com a equipe. Qual assunto você gostaria de tratar e qual período costuma ser melhor para você? Ainda não estou confirmando nenhum horário.';
    case INTENTS.OBJECTION: return 'Entendido, obrigado por explicar. Não quero insistir. Se fizer sentido, posso anotar o principal ponto para a equipe considerar; caso prefira, encerramos por aqui.';
    case INTENTS.GREETING: return 'Olá! Aqui é o Pedro, da GSW. Qual necessidade você gostaria de resolver no seu negócio?';
    default: return 'Obrigado pela mensagem. Para te orientar sem presumir detalhes, você pode explicar um pouco mais sobre o que precisa ou qual dificuldade quer resolver?';
  }
}

export function getLatestInbound(conversation) {
  return [...(conversation.messages || [])].reverse().find(m => m.direction === 'inbound');
}

export function prepareDecision(conversation, { manual = false, opening = false } = {}) {
  if (!(conversation.mode === MODES.AI_ACTIVE || (manual && conversation.mode === MODES.HUMAN)) || conversation.optedOut) return { canDraft: false, reason: 'Modo humano/pausado, transferência pendente ou opt-out' };
  if (opening) {
    if (!manual || conversation.messages?.length) return {canDraft:false,reason:'Primeiro contato disponível apenas antes de mensagens registradas.'};
    return {canDraft:true,opening:true,intent:'OPENING',latest:{id:null,text:''},
      fallback:'Oi, aqui é o Pedro, da GSW, uma empresa de tecnologia especializada em soluções digitais e operações inteligentes para negócios. Posso explicar brevemente o motivo do contato?'};
  }
  const latest = getLatestInbound(conversation);
  if (!latest) return { canDraft: false, reason: 'Nenhuma mensagem recebida' };
  const intent = classify(latest.text);
  if (intent === INTENTS.OPT_OUT || intent === INTENTS.HUMAN_REQUEST) return { canDraft: false, reason: 'Deve ser tratado por humano ou interrompido' };
  return { canDraft: true, intent, latest, fallback: localDraft(intent, latest.text, { ...conversation.context, service: serviceFromHistory(conversation.messages) }) };
}

function rulesVariant(conversation, decision, config) {
  const current = [...(conversation.drafts || [])].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
  if (decision.opening || !config.regenerate || current?.text !== decision.fallback) return decision.fallback;
  if (/advoc|juridic/.test(fold(decision.latest.text))) return 'Como o escritório já tem uma presença digital, vale entender primeiro onde está a dificuldade. Vocês recebem visitas ao site, mas poucos contatos, ou ainda não acompanham esses dados?';
  if (decision.intent === INTENTS.PRICING) return 'O investimento depende das funcionalidades e do escopo. Qual é a principal tarefa que a solução precisa resolver para sua equipe?';
  return 'Para indicar uma solução adequada à sua operação, quero entender melhor a necessidade. Qual parte desse processo mais dificulta a rotina da equipe hoje?';
}

export const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GENERATION_ERRORS = Object.freeze({
  missing_key:'GEMINI_API_KEY não está configurada no Render.',
  invalid_key:'O Gemini recusou a chave de API (HTTP 401). Confira a credencial.',
  invalid_request:'O Gemini recusou a configuração da requisição ou da chave (HTTP 400).',
  permission_denied:'O projeto ou a chave não tem acesso ao Gemini (HTTP 403).',
  quota_exceeded:'O limite ou a cota gratuita do Gemini foi atingido (HTTP 429). Aguarde a renovação; cobrança não foi ativada.',
  model_unavailable:'O modelo Gemini não está disponível para este projeto (HTTP 404).',
  provider_unavailable:'O Gemini está temporariamente indisponível.',
  timeout:'O Gemini excedeu o tempo limite de 25 segundos.',
  network_error:'Não foi possível conectar ao Gemini.',
  safety_block:'O Gemini bloqueou a resposta por segurança. Revise a mensagem e o contexto.',
  invalid_response:'O Gemini não retornou uma resposta completa utilizável.',
  quality_block:'A resposta do Gemini não passou pela revisão de qualidade. Gere outra versão ou altere o estilo.',
  invalid_model:'O modelo configurado não é o modelo gratuito aprovado para esta integração.'
});
class GenerationError extends Error { constructor(code) {super(GENERATION_ERRORS[code]);this.code=code;} }
export const generationPrompt = commercialPrompt;
// API oficial do Google; chave somente em cabeçalho servidor-servidor.
export async function requestModelDraft(conversation, decision, config = {}, fetcher = fetch) {
  const apiKey=config.geminiApiKey??process.env.GEMINI_API_KEY;
  const model=config.geminiModel??process.env.GEMINI_MODEL??GEMINI_MODEL;
  if (!apiKey) throw new GenerationError('missing_key');
  // Não troca silenciosamente para modelos/provedores potencialmente pagos.
  if (model!==GEMINI_MODEL) throw new GenerationError('invalid_model');
  const prompt=generationPrompt(conversation,decision,config);
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),config.timeoutMs??25000);
  try {
    const response=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'x-goog-api-key':apiKey,'content-type':'application/json'},
      body:JSON.stringify({systemInstruction:{parts:[{text:prompt.system}]},contents:[{role:'user',parts:[{text:prompt.input}]}],generationConfig:{temperature:0.7,maxOutputTokens:2048}}),signal:controller.signal
    });
    if(!response.ok) throw new GenerationError(({400:'invalid_request',401:'invalid_key',403:'permission_denied',404:'model_unavailable',429:'quota_exceeded'})[response.status]||'provider_unavailable');
    let data;try{data=await response.json()}catch{throw new GenerationError('invalid_response')}
    const candidate=data.candidates?.[0];
    if(data.promptFeedback?.blockReason || ['SAFETY','RECITATION','BLOCKLIST','PROHIBITED_CONTENT','SPII'].includes(candidate?.finishReason)) throw new GenerationError('safety_block');
    const text=polishCopy((candidate?.content?.parts||[]).filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join('').trim());
    if(candidate?.finishReason!=='STOP'||!text||text.length>1000)throw new GenerationError('invalid_response');
    const issue=reviewCopy(text,conversation,decision);
    if(issue) throw new GenerationError('quality_block');
    return {text,provider:'gemini',generationMeta:{provider:'gemini',model,status:'success'}};
  }catch(error){if(error instanceof GenerationError)throw error;throw new GenerationError(error.name==='AbortError'?'timeout':'network_error')}
  finally{clearTimeout(timer)}
}

const pendingByStore = new WeakMap();
export async function createReviewedDraft(store, phone, config = {}, fetcher = fetch) {
  let pending = pendingByStore.get(store);
  if (!pending) pendingByStore.set(store, pending = new Set());
  const key = String(phone).replace(/\D/g,'');
  if (pending.has(key)) return {created:false,reason:'Já existe uma geração em andamento nesta conversa.'};
  pending.add(key);
  try { return await generate(store,phone,config,fetcher); }
  finally { pending.delete(key); }
}

async function generate(store, phone, config, fetcher) {
  const conversation = await store.get(phone);
  const decision = prepareDecision(conversation, config);
  if (config.expectedVersion !== undefined && config.expectedVersion !== conversation.version) return { created:false, reason:'A conversa mudou. Atualize antes de gerar.' };
  if (!decision.canDraft) return { created: false, reason: decision.reason };
  const current = conversation.drafts?.find(d=>d.status==='PENDING_REVIEW' && d.conversationVersion===conversation.version && d.sourceMessageId===decision.latest.id);
  if (current && !config.regenerate) return {created:false,draft:current,reason:'Já existe um rascunho para esta mensagem. Use Outra versão para regenerar.'};
  let generated;
  try { generated = await requestModelDraft(conversation, decision, config, fetcher); }
  catch(error) {
    const code=error instanceof GenerationError?error.code:'provider_unavailable';
    const generationMeta={provider:'gemini',model:config.geminiModel??process.env.GEMINI_MODEL??GEMINI_MODEL,status:'fallback',errorCode:code,message:GENERATION_ERRORS[code]};
    if(['safety_block','quality_block'].includes(code))return {created:false,reason:generationMeta.message,generationMeta:{...generationMeta,status:'error'}};
    generated={text:rulesVariant(conversation,decision,config),provider:code==='missing_key'?'rules':'rules_fallback',generationMeta};
  }
  // Uma regeneração pode repetir uma sugestão arquivada, inclusive após uma edição manual.
  if (current && config.regenerate && conversation.drafts.some(d =>
    d.sourceMessageId===decision.latest.id && fold(d.text)===fold(generated.text))) {
    const reason=generated.generationMeta?.message;
    return {created:false,draft:current,reason:(reason ? reason+' ' : '')+
      'A tentativa repetiu um texto do histórico. A versão atual foi mantida.'};
  }
  // A revalidação com revisão otimista de versão impede salvar um rascunho
  // produzido antes de uma troca para HUMANO ou de nova mensagem.
  return store.saveDraft({ phone, expectedVersion: conversation.version, sourceMessageId: decision.latest.id,
    opening:decision.opening === true, intent: decision.intent, text: generated.text, provider: generated.provider, generationMeta: generated.generationMeta, manual: config.manual === true, regenerate: config.regenerate === true });
}
