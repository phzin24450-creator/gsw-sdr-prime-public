import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {claimUnits,auditClaims} from '../src/claims.js';
import {commercialPrompt} from '../src/commercial.js';
import {requestModelDraft,prepareDecision,createReviewedDraft} from '../src/advisor.js';
import {createStore} from '../src/core.js';
import {draftVisual} from '../src/visual.js';
import {transportAudit} from './helpers/claim-review.js';
const json=x=>({ok:true,status:200,json:async()=>({usageMetadata:{promptTokenCount:100,candidatesTokenCount:20,totalTokenCount:120},candidates:[{finishReason:'STOP',content:{parts:[{text:typeof x==='string'?x:JSON.stringify(x)}]}}]})});
const fixture=async id=>JSON.parse(await readFile(new URL(`./fixtures/prime-round1/${id}.json`,import.meta.url),'utf8'));
const check=(u,extra={})=>({id:u.id,classification:'supported',domain:'observation',language:'factual',evidence:[],reason:'Explicit regression annotation, not a live model review',missingAction:'none',acceptable:true,...extra});
const base={id:'public:observation',kind:'provided_verified_observation',text:'Perfil mostra cozinhas autorais. Site não localizado; pode existir em outra rota.'};
const ref=(source,relation='entails')=>({sourceId:source.id,quote:source.text,relation});
const conversation={mode:'HUMAN',context:{},messages:[{direction:'inbound',text:'Quero uma página para apresentar o programa. Pode explicar?'}]};
const draft={strategy:'valor',text:'Podemos apresentar o programa e direcionar ao link informado.'};
const verdict=(o,extra={})=>({...transportAudit(o),questionCount:0,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true,feedback:'Fixture',...extra});

test('Server inventory preserves every message character and all plan propositions',async()=>{
 for(const id of ['ipe-madeira','bruma-social','vertice-turma','interesse-explicacao','objecao-fornecedor']){
  const x=await fixture(id),c=x.generatedCandidates[0],u=claimUnits({...c.decision,text:c.text});
  assert.equal(u.filter(v=>v.path==='text').map(v=>v.text).join(''),c.text);
  assert.ok(u.some(v=>v.path==='contactPlan.contactReason'&&v.text===c.decision.contactPlan.contactReason));
  assert.ok(u.some(v=>v.path==='interlocutor'));
  // Old real approvals do not satisfy the stronger per-proposition contract.
  assert.ok(auditClaims(u,x.metadata?.semanticFactChecks,x.input.evidenceRegister).issues.includes('incomplete_claim_audit'));
 }
});
for(const [id,fragment,domain] of [
 ['ipe-madeira','muito bem feitas','quality'],
 ['ipe-madeira','apenas o Instagram','channel_exclusivity'],
 ['bruma-social','ausência de domínio','global_absence'],
 ['bruma-social','Acompanho','relationship'],
 ['interesse-explicacao','reforça a decisão','outcome'],
 ['objecao-fornecedor','não toca em nada','implementation']
])test(`Original regression: evidence does not authorize ${id}/${domain}`,async()=>{
 const x=await fixture(id),c=x.generatedCandidates[0];
 const u=claimUnits({...c.decision,text:c.text}).find(u=>u.text.includes(fragment));assert.ok(u);
 const source=domain==='implementation'||domain==='outcome'?x.input.evidenceRegister.find(s=>s.id==='policy:portfolio'):x.input.evidenceRegister.find(s=>s.id==='public:observation');
 // Even an approving reviewer cannot use scoped observation or portfolio as global proof.
 const r=auditClaims([u],[check(u,{domain,evidence:[ref(source)]})],x.input.evidenceRegister);
 assert.ok(r.issues.includes('claim_not_entailed'));
 assert.equal(r.ledger[0].text,u.text);
});
test('Vértice: a proposed replacement cannot hide a rejected plan behind a safe question',async()=>{
 const x=await fixture('vertice-turma'),c=x.generatedCandidates[0],u=claimUnits({...c.decision,text:c.text});
 const checks=u.map(v=>check(v,{classification:'non_assertive',domain:'other',language:'non_assertive'}));
 const i=u.findIndex(v=>v.path==='contactPlan.contactReason');
 checks[i]=check(u[i],{classification:'unsupported',evidence:[ref(x.input.evidenceRegister.at(-1),'does_not_establish')],missingAction:'research',acceptable:false});
 assert.ok(auditClaims(u,checks,x.input.evidenceRegister).issues.includes('unsupported_claim'));
});
test('Missing, duplicate, fabricated or weakened reviewer units are refused',()=>{
 const u=claimUnits({text:'A página não interfere no contrato. O site já existe.'});
 const checks=u.map(x=>check(x,{classification:'non_assertive',domain:'other',language:'non_assertive'}));
 for(const bad of [checks.slice(1),[checks[0],checks[0]],[...checks,{...checks[0],id:'invented'}]])assert.ok(auditClaims(u,bad,[]).issues.includes('incomplete_claim_audit'));
 const r=auditClaims(u,checks.map(c=>({...c,text:'A PRIME faz páginas.',path:'other'})),[]);
 assert.equal(r.ledger[0].text,u[0].text);assert.equal(r.ledger[0].path,'text');
});
test('Valid source ID with invented quotation fails',()=>{
 const u=claimUnits({text:'O site existe.'});
 assert.ok(auditClaims(u,[check(u[0],{evidence:[{sourceId:base.id,quote:'Site confirmado',relation:'entails'}]})],[base]).issues.includes('invalid_claim_evidence'));
});
test('Partial or contradictory support cannot pass as a fact',()=>{
 const u=claimUnits({text:'A empresa não tem site.'});
 for(const relation of ['supports_possibility','does_not_establish','contradicts'])assert.ok(auditClaims(u,[check(u[0],{evidence:[ref(base,relation)]})],[base]).issues.length);
});
test('Conditional functional benefit remains intact and does not require a question',()=>{
 const text='Uma página poderia reunir o programa e o link de inscrição que vocês já têm.';
 const source={id:'inbound:0',kind:'client_statement',text:'Já temos programa e link de inscrição.'};
 const u=claimUnits({text}),r=auditClaims(u,[check(u[0],{classification:'admissible_inference',domain:'function',language:'conditional',evidence:[ref(source,'supports_possibility')]})],[source]);
 assert.deepEqual(r.issues,[]);assert.equal(r.ledger[0].text,text);
});
test('Confirmed absence from an explicit client declaration can be reported',()=>{
 const source={id:'inbound:0',kind:'client_statement',text:'Não temos site próprio.'};
 const u=claimUnits({text:'Vocês disseram que não têm site próprio.'});
 assert.deepEqual(auditClaims(u,[check(u[0],{domain:'global_absence',evidence:[ref(source)]})],[source]).issues,[]);
});
test('A hypothesis stays conditional and requires validation; facts cannot contain it',()=>{
 const u=claimUnits({knowledge:{facts:['Uma página poderia apresentar a coleção.']}});
 const c=check(u[0],{classification:'hypothesis',domain:'function',language:'conditional',missingAction:'ask'});
 assert.ok(auditClaims(u,[c],[]).issues.includes('hypothesis_as_fact'));
 assert.ok(auditClaims(claimUnits({text:u[0].text}),[{...c,missingAction:'none'}],[]).issues.includes('unbounded_hypothesis'));
});
test('Observation caveats beyond 200 chars are retained; oversized observations fail closed',()=>{
 const observation='Perfil fictício mostra projetos. '.repeat(8)+'Não é possível concluir exclusividade.';
 const c={context:{observation,sourceUrl:'https://fixture.example.invalid',verifiedOn:new Date().toISOString().slice(0,10)},messages:[]};
 assert.equal(JSON.parse(commercialPrompt(c,{opening:true,latest:{text:''}}).input).verifiedObservation,observation);
 c.context.observation='x'.repeat(1001);assert.equal(JSON.parse(commercialPrompt(c,{opening:true,latest:{text:''}}).input).verifiedObservation,null);
});
test('Semantic plan criticism reaches one repair; correct final text is preserved',async()=>{
 let generations=0,reviews=0;const rejected=[];
 const r=await requestModelDraft(conversation,prepareDecision(conversation,{manual:true}),{geminiApiKey:'fixture',onQualityRejection:r=>rejected.push(r)},async(u,o)=>{
  if(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount){
   reviews++;const v=verdict(o);if(reviews===1){v.quality.planQuality='revise';v.feedback='Verificar página equivalente antes de recomendar substituição.';}return json(v);
  }
  generations++;if(generations===2)assert.match(o.body,/Verificar página equivalente/);return json(draft);
 });
 assert.equal(generations,2);assert.equal(reviews,2);assert.equal(rejected[0].quality.planQuality,'revise');
 assert.equal(r.text,draft.text);assert.equal(r.generationMeta.semanticQuestionCount,0);assert.equal(r.generationMeta.requestAttempts,4);
});
test('Reviewer omission blocks instead of approving a safe-looking text',async()=>{
 await assert.rejects(requestModelDraft(conversation,prepareDecision(conversation,{manual:true}),{geminiApiKey:'fixture'},async(u,o)=>{
  return json(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount?verdict(o,{claimAudit:[]}):draft);
 }),e=>e.code==='quality_block'&&e.qualityIssues.includes('incomplete_claim_audit'));
});
test('Review timeout preserves trace and never saves the unreviewed candidate',async()=>{
 const store=createStore(),phone='000000099901';store.ingest({phone,id:'fiction',text:conversation.messages[0].text,manual:true});
 let calls=0;
 const r=await createReviewedDraft(store,phone,{manual:true,geminiApiKey:'SECRET-FIXTURE',timeoutMs:10},async(u,o)=>{
  calls++;if(calls===1)return json(draft);
  return new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>reject(Object.assign(Error('SECRET-FIXTURE'),{name:'AbortError'})),{once:true}));
 });
 assert.equal(calls,2);assert.equal(r.draft.provider,'rules_fallback');assert.notEqual(r.draft.text,draft.text);
 assert.equal(r.draft.generationMeta.errorCode,'timeout');assert.equal(r.draft.generationMeta.stage,'semantic_review');
 assert.equal(r.draft.generationMeta.telemetry.calls[1].errorCode,'timeout');
 assert.ok(!JSON.stringify(r).includes('SECRET-FIXTURE'));assert.ok(!r.draft.generationMeta.qualityReview);
});
test('503 retry, success and review have distinct status/latency/token records',async()=>{
 let calls=0;
 const r=await requestModelDraft(conversation,prepareDecision(conversation,{manual:true}),{geminiApiKey:'SECRET-FIXTURE'},async(u,o)=>{
  calls++;if(calls===1)return {ok:false,status:503,json:()=>assert.fail('No error body')};
  return json(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount?verdict(o):draft);
 });
 assert.deepEqual(r.generationMeta.telemetry.calls.map(x=>x.httpStatus),[503,200,200]);
 assert.deepEqual(r.generationMeta.telemetry.calls.map(x=>x.stage),['generation','generation','semantic_review']);
 assert.equal(r.generationMeta.telemetry.calls[2].tokens.totalTokenCount,120);
 assert.equal(r.generationMeta.generationAttempts,2);assert.equal(calls,3);
 assert.ok(!JSON.stringify(r).includes('SECRET-FIXTURE'));
});
test('Truncated review is a failed execution, never reviewed success',async()=>{
 await assert.rejects(requestModelDraft(conversation,prepareDecision(conversation,{manual:true}),{geminiApiKey:'fixture'},async(u,o)=>{
  if(JSON.parse(o.body).generationConfig.responseSchema.properties.questionCount)return {ok:true,status:200,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{}'}]}}]})};
  return json(draft);
 }),e=>e.code==='invalid_response'&&e.stage==='semantic_review'&&e.telemetry.calls.at(-1).finishReason==='MAX_TOKENS');
});

test('Malformed ledger entries fail closed without throwing or exposing provider content',()=>{
 const u=claimUnits({text:'Uma possibilidade.'});
 for(const checks of [[null],[check(u[0],{evidence:[null]})]])assert.ok(auditClaims(u,checks,[]).issues.length);
});


test('Visual research cannot discard the tail of an oversized observation',async()=>{
 const research={observation:'Projeto publicado. '.repeat(60)+'A rota completa não foi verificada.',sourceUrl:'https://fixture.example.invalid',verifiedOn:new Date().toISOString().slice(0,10)};
 const r=await draftVisual({reviewed:true,company:'Empresa Fictícia',research},{opening:true,config:{geminiApiKey:'fixture'},fetcher:()=>assert.fail('No call for truncated research')});
 assert.equal(r.ready,false);assert.equal(r.generationMeta.errorCode,'research_required');
});

test('503 then actual supplier local rejection still allows one reviewed repair within four calls',async()=>{
 const {files}=JSON.parse(await readFile(new URL('../docs/evidence/prime-full-final-real.json',import.meta.url),'utf8'));
 const original=files.find(x=>x.file==='objecao-fornecedor.json').data;
 const c={mode:'HUMAN',context:{},messages:original.input.history};
 let calls=0;
 const fixed={strategy:'objecao',text:'Você prefere avaliar a ideia com sua agência antes de definir o formato?'};
 const r=await requestModelDraft(c,prepareDecision(c,{manual:true}),{geminiApiKey:'fixture'},async(u,o)=>{
  calls++;
  if(calls===1)return {ok:false,status:503};
  if(calls===2)return json({strategy:'objecao',text:original.generatedCandidates[0].text});
  return json(calls===3?fixed:verdict(o));
 });
 assert.equal(calls,4);assert.equal(r.text,fixed.text);
 assert.deepEqual(r.generationMeta.telemetry.calls.map(x=>x.stage),['generation','generation','generation','semantic_review']);
});
test('503 plus a semantic rejection does not exceed four-call repair budget',async()=>{
 let calls=0;
 await assert.rejects(requestModelDraft(conversation,prepareDecision(conversation,{manual:true}),{geminiApiKey:'fixture'},async(u,o)=>{
  calls++;if(calls===1)return {ok:false,status:503};
  return json(calls===2?draft:verdict(o,{genericApproach:true}));
 }),e=>e.code==='quality_block');
 assert.equal(calls,3);
});

test('Actual Ipe premise after 503 is rejected before remote review, with evidence in repair',async()=>{
 const {refinementCases}=await import('../scripts/prime-refinement-cases.mjs');
 const {files}=JSON.parse(await readFile(new URL('../docs/evidence/prime-final-confirmation-preflight.json',import.meta.url),'utf8'));
 const actual=files.find(x=>x.file==='ipe-madeira.json').data;
 const item=refinementCases.find(x=>x.id==='ipe-madeira');
 const c={mode:'HUMAN',context:{...item.context,verifiedOn:new Date().toISOString().slice(0,10)},messages:[]};
 const original=actual.generatedCandidates[0];
 const corrected={strategy:'descoberta',text:'Olá, aqui é o Pedro, da PRIME. Onde vocês apresentam as cozinhas autorais?'};
 let calls=0;const rejections=[];
 const r=await requestModelDraft(c,prepareDecision(c,{manual:true,opening:true}),{geminiApiKey:'fixture',onQualityRejection:x=>rejections.push(x)},async(u,o)=>{
  calls++;if(calls===1)return {ok:false,status:503};
  if(calls===2)return json({...original.decision,text:original.text});
  if(calls===3){const payload=JSON.parse(JSON.parse(o.body).contents[0].parts[0].text);assert.ok(payload.repairFindings.some(f=>f.reason.includes('acompanhamento')));return json(corrected);}
  return json(verdict(o));
 });
 assert.equal(calls,4);assert.equal(r.text,corrected.text);assert.equal(rejections[0].stage,'local');
 assert.deepEqual(r.generationMeta.telemetry.calls.map(x=>x.stage),['generation','generation','generation','semantic_review']);
});
