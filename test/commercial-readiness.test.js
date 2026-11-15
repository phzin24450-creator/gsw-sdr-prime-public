import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../src/core.js';
import {requestModelDraft,prepareDecision,createReviewedDraft} from '../src/advisor.js';
import {commercialPrompt} from '../src/commercial.js';
import {draftVisual} from '../src/visual.js';
const phone='000000099101';
const observation={observation:'Perfil fictício apresenta móveis autorais e link de contato.',sourceUrl:'https://fixture.example.invalid',verifiedOn:new Date().toISOString().slice(0,10)};
const plan=(extra={})=>({action:'draft',strength:'plausible',service:'site',evidenceRefs:['public:observation'],buyerTask:'Apresentar trabalhos',contactReason:'Portfólio publicado e destino do link conhecidos',pageRole:'Apresentar os trabalhos',nextMove:'Verificar se existe portfólio próprio',researchNeeded:'',...extra});
const response=x=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(x)}]}}]})});
function transport(contactPlan,text='Há um portfólio próprio para consultar os trabalhos?'){
 return async(_u,o)=>{
  const b=JSON.parse(o.body);
  if(b.generationConfig.responseSchema.properties.questionCount){const text=JSON.parse(b.contents[0].parts[0].text).draft.text;return response({questionCount:1,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true,feedback:'Synthetic transport fixture',factChecks:[],messageSegments:[{text,assessment:'Synthetic transport fixture',acceptable:true}]});}
  return response({strategy:'descoberta',contactPlan,text});
 };
}
test('Cold outreach with only company and niche recommends research without an API call',async()=>{
 const store=createStore();store.setContext(phone,{company:'Empresa Fictícia',sector:'Marcenaria'});
 const before=store.get(phone);const r=await createReviewedDraft(store,phone,{manual:true,opening:true,geminiApiKey:'fake'},()=>assert.fail('No API call'));
 assert.equal(r.created,false);assert.equal(r.generationMeta.errorCode,'research_required');assert.equal(r.generationMeta.provider,'rules');assert.equal(r.generationMeta.model,null);
 assert.deepEqual(store.get(phone),before);
});
test('Unverified or stale research cannot unlock cold outreach',async()=>{
 for(const context of [{observation:'Não localizei site.'},{...observation,verifiedOn:'2020-01-01'}]){
  const c={mode:'HUMAN',context,messages:[]};const d=prepareDecision(c,{manual:true,opening:true});
  await assert.rejects(requestModelDraft(c,d,{geminiApiKey:'fake'},()=>assert.fail('No API')),e=>e.code==='research_required');
 }
});
test('Current provided observation allows original generation and preserves the commercial plan',async()=>{
 const c={mode:'HUMAN',context:observation,messages:[]};const d=prepareDecision(c,{manual:true,opening:true});
 const r=await requestModelDraft(c,d,{geminiApiKey:'fake'},transport(plan()));
 assert.equal(r.provider,'gemini');assert.equal(r.generationMeta.qualityReview,'gemini_semantic_and_local');assert.equal(r.generationMeta.commercialDecision.contactPlan.pageRole,'Apresentar os trabalhos');
});
test('An active request for an explanation does not require a cold outreach observation',async()=>{
 const c={mode:'HUMAN',context:{},messages:[{direction:'inbound',text:'Quero um site para apresentar meu trabalho. Pode explicar?'}]};
 const r=await requestModelDraft(c,prepareDecision(c,{manual:true}),{geminiApiKey:'fake'},transport(plan({evidenceRefs:['inbound:0']}),'A página poderia reunir os trabalhos e os contatos que você quer apresentar.'));
 assert.ok(r.text);assert.equal(r.generationMeta.commercialDecision.contactPlan.evidenceRefs[0],'inbound:0');
});
test('A Gemini decision not to approach is not replaced with local commercial copy',async()=>{
 const store=createStore();store.setContext(phone,observation);const before=store.get(phone);
 const r=await createReviewedDraft(store,phone,{manual:true,opening:true,geminiApiKey:'fake'},transport(plan({action:'do_not_approach',strength:'insufficient',service:'none'}),''));
 assert.equal(r.created,false);assert.equal(r.generationMeta.provider,'gemini');assert.equal(r.generationMeta.errorCode,'no_opportunity');assert.deepEqual(store.get(phone),before);
});
test('A weak cold opportunity cannot be sent even if Gemini selects draft',async()=>{
 const c={mode:'HUMAN',context:observation,messages:[]};
 await assert.rejects(requestModelDraft(c,prepareDecision(c,{manual:true,opening:true}),{geminiApiKey:'fake'},transport(plan({strength:'insufficient'}))),e=>e.code==='research_required'&&e.contactPlan.action==='research');
});
test('Brand policy and operator sales goals alone cannot ground cold outreach',async()=>{
 const c={mode:'HUMAN',context:{...observation,goal:'Vender um site'},messages:[]};
 await assert.rejects(requestModelDraft(c,prepareDecision(c,{manual:true,opening:true}),{geminiApiKey:'fake'},transport(plan({evidenceRefs:['policy:portfolio','context:goal']}))),e=>e.code==='research_required');
});
test('Research recommendation from the model remains an operator decision, not a message',async()=>{
 const store=createStore();store.ingest({phone,id:'fixture',text:'Como posso ajudar?',manual:true});const before=store.get(phone);
 const r=await createReviewedDraft(store,phone,{manual:true,geminiApiKey:'fake'},transport(plan({action:'research',strength:'insufficient',service:'none',evidenceRefs:['inbound:0'],researchNeeded:'Confirmar o objetivo da página'}),'Este rascunho não deve ser salvo.'));
 assert.equal(r.created,false);assert.equal(r.generationMeta.status,'needs_context');assert.equal(r.generationMeta.commercialDecision.contactPlan.researchNeeded,'Confirmar o objetivo da página');assert.deepEqual(store.get(phone),before);
});
test('Visual opening with no evidence reports research rather than a Gemini fallback',async()=>{
 await assert.rejects(draftVisual({reviewed:true,company:'Fixture',sector:'Marcenaria'},{opening:true,config:{geminiApiKey:'fake'},fetcher:()=>assert.fail('No API')}),e=>e.visual&&e.status===409&&/pesquise/.test(e.message));
});
test('Context hierarchy preserves sources and answered questions without duplicating declarations',()=>{
 const c={context:observation,messages:[{direction:'outbound',text:'Como apresentam os trabalhos?'},{direction:'inbound',text:'Num catálogo em PDF.'}]};
 const i=JSON.parse(commercialPrompt(c,{latest:c.messages[1]}).input);
 assert.equal(i.turnPurpose,'reply');assert.equal(i.sourceProvenance.kind,'operator_provided_observation');assert.equal(i.commercialSignals.answeredQuestionPairs[0].answer,'Num catálogo em PDF.');
 assert.ok(!('declaredEvidence' in i.commercialSignals));assert.equal(i.evidenceRegister.find(e=>e.id==='inbound:0').text,'Num catálogo em PDF.');
});

test('Phone-free researched opening remains supported without creating a contact',async()=>{
 const result=await draftVisual({reviewed:true,company:'Empresa Fictícia',research:observation},{opening:true,config:{geminiApiKey:'fake'},fetcher:transport(plan())});
 assert.equal(result.provider,'gemini');assert.ok(result.text);
});
