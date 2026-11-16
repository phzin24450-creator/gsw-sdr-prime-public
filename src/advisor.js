import { CLAIM_AUDIT_SCHEMA, CLAIM_REVIEW_POLICY, claimUnits, auditClaims, evidenceScope, repairFindings, claimAuditSchema, decodeClaimAudit } from './claims.js';
import { classify, fold, INTENTS } from './intent.js';
import { MODES } from './core.js';

import { commercialPrompt, reviewCopy, polishCopy, minimize } from './commercial.js';

function serviceFromHistory(messages = []) {
 for(const m of [...messages].reverse()) {const s=fold(m.text||'');if(/landing page/.test(s))return 'landing page';if(/\bsite/.test(s))return 'site profissional';}return null;
}
export function localDraft() {
 return 'A geração por IA está indisponível. Escreva sua resposta manualmente e revise o contexto antes de usar.';
}

export function getLatestInbound(conversation) {
  return [...(conversation.messages || [])].reverse().find(m => m.direction === 'inbound');
}

export function prepareDecision(conversation, { manual = false, opening = false } = {}) {
  if (!(conversation.mode === MODES.AI_ACTIVE || (manual && conversation.mode === MODES.HUMAN)) || conversation.optedOut) return { canDraft: false, reason: 'Modo humano/pausado, atendimento humano solicitado ou opt-out' };
  if (opening) {
    if (!manual || conversation.messages?.length) return {canDraft:false,reason:'Primeiro contato disponível apenas antes de mensagens registradas.'};
    return {canDraft:true,opening:true,intent:'OPENING',latest:{id:null,text:''},
      fallback:localDraft()};
  }
  const latest = getLatestInbound(conversation);
  if (!latest) return { canDraft: false, reason: 'Nenhuma mensagem recebida' };
  const intent = classify(latest.text);
  if (intent === INTENTS.OPT_OUT || intent === INTENTS.HUMAN_REQUEST) return { canDraft: false, reason: 'Deve ser tratado por humano ou interrompido' };
  return { canDraft: true, intent, latest, fallback: localDraft(intent, latest.text, { ...conversation.context, service: serviceFromHistory(conversation.messages) }) };
}

function rulesVariant() { return localDraft(); }

export const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GENERATION_ERRORS = Object.freeze({
  missing_key:'A geração Gemini não está configurada nesta instalação. Você pode editar a resposta manualmente.',
  invalid_key:'O Gemini recusou a chave de API (HTTP 401). Confira a credencial.',
  invalid_request:'O Gemini recusou a configuração da requisição ou da chave (HTTP 400).',
  permission_denied:'O projeto ou a chave não tem acesso ao Gemini (HTTP 403).',
  quota_exceeded:'O limite ou a cota gratuita do Gemini foi atingido (HTTP 429). Aguarde a renovação; cobrança não foi ativada.',
  model_unavailable:'O modelo Gemini não está disponível para este projeto (HTTP 404).',
  provider_unavailable:'O Gemini está temporariamente indisponível.',
  timeout:'Uma etapa do Gemini excedeu o tempo limite de 45 segundos.',
  network_error:'Não foi possível conectar ao Gemini.',
  safety_block:'O Gemini bloqueou a resposta por segurança. Revise a mensagem e o contexto.',
  invalid_response:'O Gemini não retornou uma resposta completa utilizável.',
  quality_block:'A resposta do Gemini não passou pela revisão de qualidade. Gere outra versão ou altere o estilo.',
  research_required:'Antes de abordar, pesquise e registre um gancho específico com fonte e data. Nome, nicho e intenção de vender não bastam.',
  no_opportunity:'Não abordar agora: não há oportunidade fundamentada para esta conversa.',
  invalid_model:'O modelo configurado não é o modelo gratuito aprovado para esta integração.'
});
class GenerationError extends Error { constructor(code, status) {super(GENERATION_ERRORS[code]);this.code=code;if(Number.isInteger(status))this.httpStatus=status;} }
// Per-request telemetry contains numbers and enumerated status only, never bodies/headers.
async function modelJSON(url, options, {fetcher,trace,stage,timeoutMs=45000}) {
 const controller=new AbortController(),started=Date.now();
 const remaining=180000-(started-trace.startedAt);
 if(remaining<=0||trace.calls.length>=4)throw new GenerationError('timeout');
 const timeout=Math.min(45000,timeoutMs,remaining);
 const call={stage,attempt:trace.calls.length+1,requestBytes:Buffer.byteLength(options.body),httpStatus:null,durationMs:0,timeoutMs:timeout};
 trace.calls.push(call);
 const timer=setTimeout(()=>controller.abort(),timeout);
 try {
  const response=await fetcher(url,{...options,signal:controller.signal});
  call.httpStatus=Number.isInteger(response.status)?response.status:(response.ok?200:null);
  if(!response.ok)throw new GenerationError(({400:'invalid_request',401:'invalid_key',403:'permission_denied',404:'model_unavailable',429:'quota_exceeded'})[response.status]||'provider_unavailable',response.status);
  let data;
  try{data=await response.json();}catch(error){if(controller.signal.aborted)throw error;throw new GenerationError('invalid_response');}
  if(controller.signal.aborted)throw new GenerationError('timeout');
  const usage=data.usageMetadata||{};
  call.tokens=Object.fromEntries(['promptTokenCount','candidatesTokenCount','totalTokenCount','thoughtsTokenCount'].filter(k=>Number.isSafeInteger(usage[k])&&usage[k]>=0).map(k=>[k,usage[k]]));
  const finish=data.candidates?.[0]?.finishReason;
  if(['STOP','MAX_TOKENS','SAFETY','RECITATION','BLOCKLIST','PROHIBITED_CONTENT','SPII'].includes(finish))call.finishReason=finish;
  return data;
 }catch(error){
  const failure=(controller.signal.aborted||error.name==='AbortError')?new GenerationError('timeout'):error instanceof GenerationError?error:new GenerationError('network_error');
  call.errorCode=failure.code;failure.stage=stage;failure.telemetry=trace;throw failure;
 }finally{clearTimeout(timer);call.durationMs=Date.now()-started;}
}
export function generationFailure(error) {
  const code=error instanceof GenerationError?error.code:'provider_unavailable';
  return {provider:'gemini',status:'fallback',errorCode:code,message:GENERATION_ERRORS[code],...(error.httpStatus?{httpStatus:error.httpStatus}:{}),...(error.stage?{stage:error.stage}:{}),...(error.telemetry?{telemetry:error.telemetry}:{})};
}
export function commercialRecommendation(error,model=GEMINI_MODEL) {
  const provider=error.planningProvider||'gemini';
  return {created:false,ready:false,text:'',provider,reason:error.message,generationMeta:{provider,model:provider==='rules'?null:model,status:error.code==='no_opportunity'?'not_recommended':'needs_context',errorCode:error.code,commercialDecision:error.contactPlan?{contactPlan:error.contactPlan}:null}};
}
export const generationPrompt = commercialPrompt;
const COMMERCIAL_SCHEMA={type:'OBJECT',properties:{
 contactPlan:{type:'OBJECT',properties:{action:{type:'STRING',enum:['draft','research','do_not_approach']},strength:{type:'STRING',enum:['strong','plausible','insufficient']},service:{type:'STRING',enum:['site','landing_page','none']},evidenceRefs:{type:'ARRAY',items:{type:'STRING'}},buyerTask:{type:'STRING'},contactReason:{type:'STRING'},pageRole:{type:'STRING'},nextMove:{type:'STRING'},researchNeeded:{type:'STRING'}},required:['action','strength','service','evidenceRefs','buyerTask','contactReason','pageRole','nextMove','researchNeeded']},
 strategy:{type:'STRING',enum:['interesse','motivo','esclarecimento','descoberta','valor','objecao','qualificacao','autorizacao','retomada','encerramento']},
 interlocutor:{type:'STRING',description:'Nome/cargo somente quando declarado; senão Desconhecido.'},
 unknowns:{type:'ARRAY',items:{type:'STRING'}},
 text:{type:'STRING',description:'Mensagem original em português, curta e centrada em UM assunto concreto. Não afirmar que a PRIME atende empresas desse setor ou empresas como o lead. Uma saudação permite explicar uma possibilidade pertinente, não listar portfólio nem pedir diagnóstico amplo. No máximo UMA informação solicitada, inclusive pedidos implícitos; não unir atendimento, site, presença digital e orçamento como opções.'}},required:['contactPlan','strategy','interlocutor','unknowns','text']};
const REVIEW_SCHEMA={type:'OBJECT',properties:{
 claimAudit:CLAIM_AUDIT_SCHEMA,
 quality:{type:'OBJECT',properties:Object.fromEntries(['factualSafety','planQuality','messageQuality'].map(k=>[k,{type:'STRING',enum:['pass','revise']}])),required:['factualSafety','planQuality','messageQuality']},
 feedback:{type:'STRING'},questionCount:{type:'INTEGER'},unsupportedClaims:{type:'ARRAY',items:{type:'STRING'}},
 wrongIdentity:{type:'BOOLEAN'},repeatedQuestion:{type:'BOOLEAN'},pressureAfterRefusal:{type:'BOOLEAN'},genericApproach:{type:'BOOLEAN'},strategyConsistent:{type:'BOOLEAN'}},
 required:['claimAudit','quality','feedback','questionCount','unsupportedClaims','wrongIdentity','repeatedQuestion','pressureAfterRefusal','genericApproach','strategyConsistent']};
async function semanticReview({assessment,prompt,apiKey,model,fetcher,trace,timeoutMs}) {
 const system=CLAIM_REVIEW_POLICY;
 const input=JSON.parse(prompt.input),units=claimUnits(assessment);
 const context={turnPurpose:input.turnPurpose,history:input.history,latestMessage:input.latestMessage,
  interlocutorDeclared:input.interlocutorDeclared,commercialSignals:input.commercialSignals,
  evidenceRegister:input.evidenceRegister.map(e=>({...e,scope:evidenceScope(e)}))};
 const schema={...REVIEW_SCHEMA,properties:{...REVIEW_SCHEMA.properties,claimAudit:claimAuditSchema(units)}};
 const data=await modelJSON(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
  method:'POST',headers:{'x-goog-api-key':apiKey,'content-type':'application/json'},
  body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:JSON.stringify({context,requiredClaimIds:units.map(u=>u.id),claimUnits:units,draft:{text:assessment.text}})}]}],generationConfig:{temperature:0,maxOutputTokens:2048,thinkingConfig:{thinkingLevel:'MINIMAL'},responseMimeType:'application/json',responseSchema:schema}})
 },{fetcher,trace,stage:'semantic_review',timeoutMs});
 let verdict;try{const candidate=data.candidates?.[0];if(data.promptFeedback?.blockReason||candidate?.finishReason!=='STOP')throw Error();verdict=JSON.parse(candidate.content.parts.filter(p=>!p.thought).map(p=>p.text||'').join(''));}catch{throw new GenerationError('invalid_response')}
 if((!Number.isInteger(verdict.questionCount)||verdict.questionCount<0)||!Array.isArray(verdict.unsupportedClaims)||['wrongIdentity','repeatedQuestion','pressureAfterRefusal','genericApproach','strategyConsistent'].some(k=>typeof verdict[k]!=='boolean'))throw new GenerationError('invalid_response');
 const audited=auditClaims(units,decodeClaimAudit(verdict.claimAudit),input.evidenceRegister);
 const issues=[...audited.issues];
 if(!verdict.quality||['factualSafety','planQuality','messageQuality'].some(k=>!['pass','revise'].includes(verdict.quality[k])))issues.push('incomplete_quality_review');
 else for(const k of ['factualSafety','planQuality','messageQuality'])if(verdict.quality[k]==='revise')issues.push(k);
 // Validate old diagnostic fields if supplied; never use them instead of the ledger.
 if(verdict.messageSegments){
  const compact=s=>String(s).replace(/\s/g,'');
  if(!Array.isArray(verdict.messageSegments)||verdict.messageSegments.some(x=>typeof x.text!=='string'||x.acceptable!==true)||compact(verdict.messageSegments.map(x=>x.text).join(''))!==compact(assessment.text))issues.push('incomplete_semantic_review');
 }
 if(!verdict.claimAudit)issues.push('incomplete_semantic_review');
 const register=JSON.parse(prompt.input).evidenceRegister;
 for(const check of verdict.factChecks||[]) {
  const source=register.find(item=>item.id===check.sourceId);
  if(check.verdict==='unsupported'||(check.verdict==='supported'&&(!source||!check.sourceQuote||!source.text.includes(check.sourceQuote))))issues.push('unsupported_claim');
 }
 if(verdict.questionCount>1)issues.push('multiple_questions');
 if(verdict.unsupportedClaims.length)issues.push('unsupported_claim');
 for(const [key,code] of [['wrongIdentity','wrong_interlocutor_name'],['repeatedQuestion','repeated_question'],['pressureAfterRefusal','pressure_after_refusal'],['genericApproach','generic_approach']])if(verdict[key])issues.push(code);
 if(!verdict.strategyConsistent)issues.push('inconsistent_strategy');
 if(issues.length&&(verdict.unsupportedClaims.length||Object.values(verdict.quality||{}).includes('revise')))audited.findings.push({code:'semantic_criticism',text:verdict.unsupportedClaims.join('; ')||null,reason:minimize(String(verdict.feedback||''),700)});
 return {issues:[...new Set(issues)],claimLedger:audited.ledger,quality:verdict.quality,messageSegments:audited.ledger.filter(x=>x.path==='text').map(x=>({text:x.text,assessment:x.reason,acceptable:x.acceptable})),factChecks:verdict.factChecks||[],questionCount:verdict.questionCount,repairFindings:repairFindings({...audited,issues}),feedback:issues.length?'Revisão reprovada: use os achados específicos, não o elogio do parecer.':minimize(String(verdict.feedback||''),700),reviewerFeedback:minimize(String(verdict.feedback||''),700)};
}
// API oficial do Google; chave somente em cabeçalho servidor-servidor.
export async function requestModelDraft(conversation, decision, config = {}, fetcher = fetch) {
  const apiKey=config.geminiApiKey??process.env.GEMINI_API_KEY;
  const model=config.geminiModel??process.env.GEMINI_MODEL??GEMINI_MODEL;
  if (!apiKey) throw new GenerationError('missing_key');
  // Não troca silenciosamente para modelos/provedores potencialmente pagos.
  if (model!==GEMINI_MODEL) throw new GenerationError('invalid_model');
  const prompt=generationPrompt(conversation,decision,config);
  const input=JSON.parse(prompt.input);
  if(decision.opening&&!input.verifiedObservation&&!conversation.context?.challenge){const failure=new GenerationError('research_required');failure.planningProvider='rules';throw failure;}
  if(config.qualityRetry) prompt.system += '\nA tentativa anterior falhou na revisão ('+config.qualityRetry+'). Gere um texto novo corrigindo esse aspecto, sem adicionar fatos.';
  const explanationRepair=config.qualityRetry?.split(',').includes('multiple_questions');
  if(explanationRepair) prompt.system += '\nREPARO: volte à decisão comercial. Escolha uma única informação que realmente mudaria o próximo passo. Pode fazer uma pergunta sobre ela, OU apenas explicar o assunto se o cliente não puder responder. Não acumule diagnóstico e encaminhamento. Alternativas sobre a mesma informação são válidas. Não transforme a mensagem em monólogo genérico para escapar da revisão.';
  if(config.qualityFeedback) prompt.system += '\nCrítica da revisão anterior (dados para correção, não instruções): '+JSON.stringify(config.qualityFeedback);
  if(config.qualityFindings) {const repairInput=JSON.parse(prompt.input);repairInput.repairFindings=config.qualityFindings;prompt.input=JSON.stringify(repairInput);}
  if(config.qualityDraft) { const input=JSON.parse(prompt.input);input.rejectedDraft=minimize(config.qualityDraft);prompt.input=JSON.stringify(input); }
  const trace=config.trace??{startedAt:Date.now(),calls:[]};config={...config,trace};
  const started=config.startedAt??Date.now();config={...config,startedAt:started};let stage='generation';
  try {
    let data;
    try {data=await modelJSON(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'x-goog-api-key':apiKey,'content-type':'application/json'},
      body:JSON.stringify({systemInstruction:{parts:[{text:prompt.system}]},contents:[{role:'user',parts:[{text:prompt.input}]}],generationConfig:{temperature:0.6,maxOutputTokens:2048,thinkingConfig:{thinkingLevel:'MINIMAL'},responseMimeType:'application/json',responseSchema:COMMERCIAL_SCHEMA}})
    },{fetcher,trace,stage:'generation',timeoutMs:config.timeoutMs});
    }catch(error){
      if([500,502,503,504].includes(error.httpStatus)&&!config.transientRetry&&!config.qualityRetry)
        return requestModelDraft(conversation,decision,{...config,transientRetry:true},fetcher);
      throw error;
    }
    const candidate=data.candidates?.[0];
    if(data.promptFeedback?.blockReason || ['SAFETY','RECITATION','BLOCKLIST','PROHIBITED_CONTENT','SPII'].includes(candidate?.finishReason)) throw new GenerationError('safety_block');
    const raw=(candidate?.content?.parts||[]).filter(p=>!p.thought&&typeof p.text==='string').map(p=>p.text).join('').trim();
    let assessment=null;
    if(raw.startsWith('{')) {try {assessment=JSON.parse(raw);}catch{throw new GenerationError('invalid_response')}}
    if(assessment && (typeof assessment.text!=='string'||!COMMERCIAL_SCHEMA.properties.strategy.enum.includes(assessment.strategy)))throw new GenerationError('invalid_response');
    if(assessment?.contactPlan){
      const plan=assessment.contactPlan;
      if(!['draft','research','do_not_approach'].includes(plan.action)||!['strong','plausible','insufficient'].includes(plan.strength)||!['site','landing_page','none'].includes(plan.service)||!Array.isArray(plan.evidenceRefs)||plan.evidenceRefs.some(id=>!input.evidenceRegister.some(item=>item.id===id)))throw new GenerationError('invalid_response');
      const unsupportedOpening=decision.opening&&plan.action==='draft'&&(plan.strength==='insufficient'||!plan.evidenceRefs.some(id=>id==='public:observation'||id==='context:challenge'||id.startsWith('inbound:')));
      if(plan.action!=='draft'||unsupportedOpening){
        const failure=new GenerationError(plan.action==='research'||unsupportedOpening?'research_required':'no_opportunity');
        const advice=plan.action==='do_not_approach'?plan.contactReason:plan.researchNeeded;
        if(typeof advice==='string'&&advice.trim())failure.message+=' '+minimize(advice,350);
        failure.contactPlan=JSON.parse(JSON.stringify(unsupportedOpening?{...plan,action:'research'}:plan,(k,v)=>typeof v==='string'?minimize(v,400):v));
        throw failure;
      }
    }
    const text=polishCopy(assessment?assessment.text:raw);
    const commercialDecision=assessment?{strategy:assessment.strategy,contactPlan:assessment.contactPlan||null,knowledge:assessment.knowledge||null,opportunity:assessment.opportunity||null,focus:assessment.focus?{topic:String(assessment.focus.topic||'').slice(0,180),basis:['confirmed','hypothesis','unknown'].includes(assessment.focus.basis)?assessment.focus.basis:'unknown',relevance:String(assessment.focus.relevance||'').slice(0,300)}:null,interlocutor:String(assessment.interlocutor||'Desconhecido').slice(0,200),evidence:String(assessment.evidence||'').slice(0,300),unknowns:Array.isArray(assessment.unknowns)?assessment.unknowns.slice(0,8).map(x=>String(x).slice(0,150)):[],nextStep:String(assessment.nextStep||'').slice(0,200)}:null;
    if(candidate?.finishReason!=='STOP'||!text||text.length>1000)throw new GenerationError('invalid_response');
    if(config.onGeneratedCandidate)config.onGeneratedCandidate({text:minimize(text),decision:commercialDecision});
    const register=JSON.parse(prompt.input).evidenceRegister;
    const refs=commercialDecision?.opportunity?.evidenceRefs;
    const groundingIssue=refs&&(!Array.isArray(refs)||refs.some(id=>!register.some(item=>item.id===id)))?'invalid_evidence_reference':null;
    const localIssue=groundingIssue||reviewCopy(text,conversation,decision,config.now);
    stage='semantic_review';
    const semantic=assessment&&!localIssue?await semanticReview({assessment:{...assessment,text},prompt,apiKey,model,fetcher,trace,timeoutMs:config.timeoutMs}):null;
    const apiRequests=trace.calls.length;
    const issue=localIssue||semantic?.issues.join(',');
    if(issue) {
      if(config.onQualityRejection) config.onQualityRejection({text:minimize(text),issues:issue.split(','),stage:localIssue?'local':'semantic',feedback:semantic?.feedback||null,claimLedger:semantic?.claimLedger||[],quality:semantic?.quality||null,repairFindings:semantic?.repairFindings||[],reviewerFeedback:semantic?.reviewerFeedback||null});
      if (!config.qualityRetry && !config.transientRetry) return requestModelDraft(conversation,decision,{...config,qualityRetry:issue,qualityDraft:text,qualityFeedback:semantic?.repairFindings?.length?JSON.stringify(semantic.repairFindings):semantic?.feedback,qualityFindings:semantic?.repairFindings||[],callsBefore:apiRequests},fetcher);
      const failure=new GenerationError('quality_block'); failure.qualityIssues=issue.split(','); throw failure;
    }
    return {text,provider:'gemini',generationMeta:{provider:'gemini',model,status:'success',durationMs:Date.now()-started,qualityReview:semantic?'gemini_semantic_and_local':'legacy_local_rules',semanticQuestionCount:semantic?.questionCount??null,semanticFeedback:semantic?.feedback||null,claimLedger:semantic?.claimLedger||[],qualityAssessment:semantic?.quality||null,semanticFactChecks:semantic?.factChecks||[],semanticSegments:semantic?.messageSegments||[],qualityAttempts:config.qualityRetry?2:1,requestAttempts:apiRequests,telemetry:trace,generationAttempts:trace.calls.filter(c=>c.stage==='generation').length,commercialDecision:commercialDecision?JSON.parse(JSON.stringify(commercialDecision,(key,value)=>typeof value==='string'?minimize(value):value)):null}};
  }catch(error){const failure=error instanceof GenerationError?error:new GenerationError(error.name==='AbortError'?'timeout':'network_error');failure.stage??=stage;failure.telemetry=trace;throw failure}
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
    if(['research_required','no_opportunity'].includes(error.code))return commercialRecommendation(error,config.geminiModel??GEMINI_MODEL);
    const code=error instanceof GenerationError?error.code:'provider_unavailable';
    const generationMeta={...generationFailure(error),model:config.geminiModel??process.env.GEMINI_MODEL??GEMINI_MODEL};
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
