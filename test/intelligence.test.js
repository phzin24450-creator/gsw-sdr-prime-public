import test from 'node:test';
import assert from 'node:assert/strict';
import { commercialSignals } from '../src/intelligence.js';
import { commercialPrompt, reviewCopy } from '../src/commercial.js';
import { prepareDecision, requestModelDraft, createReviewedDraft } from '../src/advisor.js';
import { draftVisual } from '../src/visual.js';
import { createStore } from '../src/core.js';
const decision=text=>({latest:{text},intent:'OTHER'});
const conversation=text=>({mode:'HUMAN',context:{company:'Brisa Técnica Climatização',sector:'Climatização'},messages:[{id:'1',direction:'inbound',text}]});
const acceptedReview=()=>response(JSON.stringify({questionCount:1,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true}));
const response=text=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]})});
for(const [text,role] of [
 ['Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?','desconhecido'],
 ['Sou eu o responsável.','decisor confirmado por declaração'],
 ['Sou a recepcionista.','atendente humano declarado'],
 ['Sou uma assistente virtual.','possível chatbot']
]) test('Evidence-aware interlocutor: '+role,()=>assert.equal(commercialSignals(conversation(text),decision(text)).interlocutor.role,role));
for(const [text,cue] of [['Está caro','preco'],['Estamos sem orçamento','orcamento'],['Não é prioridade','prioridade'],['Já temos fornecedor','fornecedor atual'],['Não conheço vocês','confianca'],['Não vejo necessidade','necessidade']])test('Objection cue: '+cue,()=>assert.ok(commercialSignals(conversation(text),decision(text)).objectionCues.includes(cue)));
test('Critical refusal overrides budget and blocks network',async()=>{
 const s=createStore();s.ingest({phone:'000000070001',id:'refusal',text:'No momento não temos interesse. Estamos cortando custos. Obrigado pelo contato, ótimo dia.'});
 const r=await createReviewedDraft(s,'000000070001',{manual:true},()=>assert.fail('No network after refusal'));
 assert.equal(r.created,false);assert.equal(s.get('000000070001').optedOut,true);
});
test('Identity and answered questions survive subsequent turns',()=>{
 const c=conversation('Sou eu o responsável.');c.messages.push({id:'2',direction:'outbound',text:'Como registram os pedidos?'},{id:'3',direction:'inbound',text:'Usamos uma planilha.'});
 const signals=commercialSignals(c,decision('Usamos uma planilha.'));
 assert.equal(signals.interlocutor.confidence,'alta');assert.equal(signals.answeredQuestionPairs[0].answer,'Usamos uma planilha.');
 assert.equal(reviewCopy('Quem é o responsável?',c,decision('Usamos uma planilha.')),'resolved_identity');
});
test('Quality failure is repaired once using Gemini, with original context',async()=>{
 const c=conversation('Como posso ajudar?');let calls=0;
 const r=await requestModelDraft(c,decision('Como posso ajudar?'),{geminiApiKey:'fake'},async(u,o)=>{
  calls++;const body=JSON.parse(o.body);if(calls===2)assert.match(body.systemInstruction.parts[0].text,/multiple_questions/);
  return response(calls===1?'Quem decide? Qual o orçamento?':'Aqui é o Pedro, da GSW. Podemos avaliar uma página que reúna os serviços de climatização e facilite pedidos de orçamento. Essa possibilidade depende de avaliar o contexto da empresa.');
 });assert.equal(calls,2);assert.equal(r.generationMeta.qualityAttempts,2);
});
test('Persistent quality failure never becomes sendable fallback',async()=>{
 let calls=0;await assert.rejects(requestModelDraft(conversation('Olá'),decision('Olá'),{geminiApiKey:'fake'},async()=>{calls++;return response('Garanto resultado garantido.')}),e=>e.code==='quality_block');assert.equal(calls,2);
});
test('Visual fallback preserves HTTP diagnostics without secret or response body',async()=>{
 const r=await draftVisual({reviewed:true,messages:[{direction:'inbound',text:'Como posso ajudar?'}]}, {config:{geminiApiKey:'fake-secret'},fetcher:async()=>({ok:false,status:503,json:()=>assert.fail('Do not read error body')})});
 assert.equal(r.provider,'rules_fallback');assert.equal(r.generationMeta.httpStatus,503);assert.equal(r.generationMeta.errorCode,'provider_unavailable');assert.ok(!JSON.stringify(r).includes('fake-secret'));
});
test('Feedback is supplied to future generation only for its conversation',()=>{
 const store=createStore(),phone='000000070002';store.ingest({phone,id:'m',text:'Como posso ajudar?'});const c=store.get(phone);
 const d=store.saveDraft({phone,expectedVersion:c.version,sourceMessageId:'m',text:'Texto fictício',intent:'OTHER',provider:'gemini',manual:true});
 store.recordFeedback(phone,d.draft.id,'generica');const current=store.get(phone);
 assert.equal(JSON.parse(commercialPrompt(current,prepareDecision(current,{manual:true})).input).operatorFeedback[0].category,'generica');
 assert.equal(store.get('000000070003').feedback.length,0);
});
test('Functional responsibility does not prove purchase authority',()=>{
 const text='Sou responsável pelo estoque, mas a compra de sistemas depende de outra pessoa.';
 assert.equal(commercialSignals(conversation(text),decision(text)).interlocutor.role,'desconhecido');
});
test('Transient server error retries once, quota and credentials never retry',async()=>{
 for(const status of [503,429,401]){
  let calls=0;
  await assert.rejects(requestModelDraft(conversation('Como posso ajudar?'),decision('Como posso ajudar?'),{geminiApiKey:'fake'},async()=>{calls++;return {ok:false,status};}));
  assert.equal(calls,status===503?2:1);
 }
 let calls=0;
 const result=await requestModelDraft(conversation('Como posso ajudar?'),decision('Como posso ajudar?'),{geminiApiKey:'fake'},async()=>++calls===1?{ok:false,status:503}:response('Aqui é o Pedro, da GSW. Posso explicar o motivo do contato?'));
 assert.equal(result.provider,'gemini');assert.equal(result.generationMeta.requestAttempts,2);
});
test('Review distinguishes SDR identity from invented customer identity',()=>{
 const c=conversation('Como posso ajudar?'),d=decision('Como posso ajudar?');
 assert.equal(reviewCopy('Entendo, Pedro. Vamos conversar?',c,d),'wrong_interlocutor_name');
 assert.equal(reviewCopy('Sou o Pedro, da GSW. Posso explicar o contato?',c,d),null);
});
test('Gemini structured strategy is retained with evidence and unknowns',async()=>{
 const c=conversation('Como posso ajudar?'),d=decision('Como posso ajudar?');
 const r=await requestModelDraft(c,d,{geminiApiKey:'fake'},async(u,o)=>{
  if(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount)return acceptedReview();
  assert.equal(JSON.parse(o.body).generationConfig.responseMimeType,'application/json');
  return response(JSON.stringify({strategy:'motivo',focus:{topic:'Apresentação dos serviços',basis:'hypothesis',relevance:'Facilitar consulta antes de pedir orçamento'},interlocutor:'Desconhecido',evidence:'Saudação não define cargo',unknowns:['responsabilidade'],nextStep:'Explicar contato',text:'Sou o Pedro, da GSW. Posso explicar o contato?'}));
 });assert.equal(r.generationMeta.commercialDecision.strategy,'motivo');assert.equal(r.generationMeta.commercialDecision.focus.basis,'hypothesis');assert.deepEqual(r.generationMeta.commercialDecision.unknowns,['responsabilidade']);
});
test('Semantic review catches a compound question with one question mark and repairs once',async()=>{
 let generated=0,reviewed=0;
 const r=await requestModelDraft(conversation('Quanto custa um site?'),decision('Quanto custa um site?'),{geminiApiKey:'fake'},async(u,o)=>{
  const schema=JSON.parse(o.body).generationConfig.responseSchema;
  if(schema.properties.questionCount){reviewed++;return response(JSON.stringify({questionCount:reviewed===1?2:1,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true}));}
  generated++;return response(JSON.stringify({strategy:'esclarecimento',interlocutor:'Desconhecido',evidence:'Pedido de preço',unknowns:['objetivo'],nextStep:'Entender objetivo',text:generated===1?'O valor depende do escopo. Você quer catálogo e também precisa de pagamento online?':'O valor depende do escopo e será definido após uma avaliação da necessidade.'}));
 });assert.equal(generated,2);assert.equal(reviewed,2);assert.equal(r.generationMeta.qualityReview,'gemini_semantic_and_local');
});
test('Semantic review failures block instead of exposing an unreviewed draft',async()=>{
 let calls=0;
 await assert.rejects(requestModelDraft(conversation('Como posso ajudar?'),decision('Como posso ajudar?'),{geminiApiKey:'fake'},async(u,o)=>{
  calls++;if(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount)return {ok:false,status:429};
  return response(JSON.stringify({strategy:'motivo',interlocutor:'Desconhecido',evidence:'Saudação',unknowns:['empresa'],nextStep:'Conhecer contexto',text:'Aqui é o Pedro, da GSW. Qual é a área de atuação da empresa?'}));
 }),e=>e.code==='quota_exceeded');assert.equal(calls,2);
});
test('Portfolio pitch is blocked without an explicit request for services',()=>{
 const c=conversation('Como posso ajudar?'),d=decision('Como posso ajudar?');
 assert.equal(reviewCopy('Oferecemos sites, automações de atendimento e painéis de gestão. Qual desafio você tem?',c,d),'portfolio_pitch');
});
test('Generation and semantic review receive separate bounded deadlines',async()=>{
 const c=conversation('Como posso ajudar?'),d=decision('Como posso ajudar?');
 const result=await requestModelDraft(c,d,{geminiApiKey:'fake',timeoutMs:100},async(u,o)=>{
  await new Promise((resolve,reject)=>{const t=setTimeout(resolve,65);o.signal.addEventListener('abort',()=>{clearTimeout(t);reject(Object.assign(Error(),{name:'AbortError'}));},{once:true});});
  if(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount)return acceptedReview();
  return response(JSON.stringify({strategy:'motivo',interlocutor:'Desconhecido',evidence:'Saudação',unknowns:['empresa'],nextStep:'Conhecer segmento',text:'Sou Pedro, da GSW. Qual é a área de atuação da empresa?'}));
 });assert.equal(result.generationMeta.qualityReview,'gemini_semantic_and_local');assert.equal(result.generationMeta.requestAttempts,2);
});
test('Compound-question repair removes secondary requests without using a canned reply',async()=>{
 const rejected=[];let generations=0;
 const result=await requestModelDraft(conversation('Me chamo Marina. Como posso ajudar?'),decision('Me chamo Marina. Como posso ajudar?'),{geminiApiKey:'fake',onQualityRejection:item=>rejected.push(item)},async(u,o)=>{
  const b=JSON.parse(o.body);if(b.generationConfig.responseSchema.properties.questionCount)return acceptedReview();
  generations++;
  if(generations===2)assert.match(b.systemInstruction.parts[0].text,/Escolha uma única informação/);
  return response(JSON.stringify({strategy:'motivo',interlocutor:'Marina',evidence:'Saudação',unknowns:['processo'],nextStep:'Explicar contato',text:generations===1?'Marina, quem decide? Como recebem os pedidos?':'Marina, o contato é sobre a apresentação dos serviços de climatização para quem solicita orçamento.'}));
 });assert.equal(generations,2);assert.equal(rejected[0].issues[0],'multiple_questions');assert.equal(result.generationMeta.qualityReview,'gemini_semantic_and_local');
});
test('Implicit compound requests are rejected even without question marks or with reversed topics',()=>{
 const c=conversation('Me chamo Marina. Como posso ajudar?'),d=decision('Me chamo Marina. Como posso ajudar?');
 assert.equal(reviewCopy('Gostaria de saber como a Brisa lida com a organização do atendimento ou o fluxo de solicitações de orçamento.',c,d),'multiple_questions');
 assert.equal(reviewCopy('Como organizam os orçamentos ou a presença digital?',c,d),'multiple_questions');
 assert.equal(reviewCopy('Como registram os orçamentos: em planilha ou sistema?',c,d),null);
});
test('Current PRIME policy governs neutral replies, pricing and established discovery',()=>{
 for(const text of ['Me chamo Marina. Como posso ajudar?','Quanto custa um site?']){
  const c=conversation(text);const policy=commercialPrompt(c,decision(text)).system;
  assert.match(policy,/PRIME/);assert.match(policy,/EXCLUSIVAMENTE sites profissionais e landing pages/);
  assert.doesNotMatch(policy,/A GSW|O responsável de desenvolvimento aprofunda/);
 }
});
test('A conditional integration into one process is not mistaken for a portfolio list',()=>{
 const c=conversation('Quero integrar o agendamento ao sistema.'),d=decision(c.messages[0].text);
 assert.equal(reviewCopy('Uma integração poderia conectar a automação do agendamento ao sistema, dependendo da viabilidade técnica.',c,d),null);
 assert.equal(reviewCopy('Oferecemos sites, automações e painéis de gestão. Qual o desafio?',c,d),'portfolio_pitch');
});

test('Evidence register separates operator intentions from client facts and excludes drafts',()=>{
 const c=conversation('Sou Marina da recepção.');c.context.goal='Vender automação';c.drafts=[{text:'Vocês perdem pedidos.'}];
 const register=JSON.parse(commercialPrompt(c,decision(c.messages[0].text)).input).evidenceRegister;
 assert.equal(register.find(x=>x.id==='context:goal').kind,'operator_intention');
 assert.equal(register.find(x=>x.id==='inbound:0').text,'Sou Marina da recepção.');
 assert.ok(!JSON.stringify(register).includes('perdem pedidos'));
});
test('Semantic criticism reaches the repair instead of losing the unsupported premise',async()=>{
 let generations=0,reviews=0;
 const result=await requestModelDraft(conversation('Como posso ajudar?'),decision('Como posso ajudar?'),{geminiApiKey:'fake'},async(u,o)=>{
  const b=JSON.parse(o.body);
  if(b.generationConfig.responseSchema.properties.questionCount){reviews++;return response(JSON.stringify({questionCount:1,unsupportedClaims:reviews===1?['Processo inexistente no contexto']:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true,feedback:'Não foi confirmado que recebem solicitações de assistência.'}));}
  generations++;if(generations===2)assert.match(b.systemInstruction.parts[0].text,/Não foi confirmado que recebem solicitações/);
  return response(JSON.stringify({strategy:'descoberta',text:'Marina, a empresa trabalha com manutenção de equipamentos?',opportunity:{status:'exploratory',evidenceRefs:['context:sector'],missingEvidence:'Serviços',discoveryTarget:'Serviços'}}));
 });assert.equal(generations,2);assert.equal(reviews,2);assert.equal(result.generationMeta.requestAttempts,4);
});
test('Source audit rejects unsupported claims even when summary flags incorrectly approve',async()=>{
 let reviews=0;
 await assert.rejects(requestModelDraft(conversation('Como posso ajudar?'),decision('Como posso ajudar?'),{geminiApiKey:'fake'},async(u,o)=>{
  const body=JSON.parse(o.body);
  if(body.generationConfig.responseSchema.properties.questionCount){reviews++;return response(JSON.stringify({questionCount:0,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true,feedback:'O nicho não confirma manutenção.',factChecks:[{claim:'A empresa faz manutenção',sourceId:'context:sector',sourceQuote:'Climatização',verdict:'unsupported'}]}));}
  return response(JSON.stringify({strategy:'motivo',text:'Marina, meu contato é sobre a divulgação da manutenção.'}));
 }),e=>e.code==='quality_block'&&e.qualityIssues.includes('unsupported_claim'));assert.equal(reviews,2);
});
test('Source audit refuses a fabricated quotation attached to a real source ID',async()=>{
 await assert.rejects(requestModelDraft(conversation('Como posso ajudar?'),decision('Como posso ajudar?'),{geminiApiKey:'fake'},async(u,o)=>{
  const body=JSON.parse(o.body);
  if(body.generationConfig.responseSchema.properties.questionCount)return response(JSON.stringify({questionCount:0,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true,feedback:'',factChecks:[{claim:'Manutenção',sourceId:'context:sector',sourceQuote:'Fazemos manutenção',verdict:'supported'}]}));
  return response(JSON.stringify({strategy:'motivo',text:'Marina, meu contato é sobre a divulgação da manutenção.'}));
 }),e=>e.code==='quality_block');
});
