import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {commercialPrompt} from '../src/commercial.js';
import {auditClaims,claimUnits,evidenceScope} from '../src/claims.js';
import {requestModelDraft,prepareDecision} from '../src/advisor.js';
import {transportAudit} from './helpers/claim-review.js';
const conversation={mode:'HUMAN',context:{},messages:[{direction:'inbound',text:'Já temos programa e link de inscrição. Pode explicar a página?'}]};
const decision=prepareDecision(conversation,{manual:true});
const register=JSON.parse(commercialPrompt(conversation,decision).input).evidenceRegister;
const source=register.find(s=>s.id==='policy:functions');
const ref={sourceId:source.id,quote:source.text,relation:'supports_possibility'};

test('Rumo actual centralization candidate has a legitimate function source without rewriting the message',async()=>{
 const d=JSON.parse(await readFile(new URL('../docs/evidence/prime-keyed-review-real/interesse-explicacao.json',import.meta.url),'utf8'));
 const claim=d.rejectedDrafts[1].claimLedger.find(c=>c.text.includes('centraliza as informações'));
 assert.ok(claim);assert.ok(auditClaims([claim],[claim],register).issues.includes('unbounded_inference'));
 const reviewed={...claim,evidence:[ref]};
 const result=auditClaims([claim],[reviewed],register);
 assert.deepEqual(result.issues,[]);assert.equal(result.ledger[0].text,claim.text);
 // This tests provenance validation, not a live semantic approval of the whole response.
});
for(const domain of ['outcome','implementation','global_absence','relationship'])test(`Function source cannot prove ${domain}`,()=>{
 const unit=claimUnits({text:'Uma alegação cuja comprovação está ausente.'})[0];
 const check={id:unit.id,commitment:'fact',domain,evidence:[{...ref,relation:'entails'}],reason:'Regression annotation',acceptable:true,missingAction:'none'};
 assert.ok(auditClaims([unit],[check],register).issues.includes('claim_not_entailed'));
});
test('No automatic evidence is attached to an unsupported functional claim',()=>{
 const unit=claimUnits({text:'Isso filtra os alunos interessados.'})[0];
 const check={id:unit.id,commitment:'functional_proposal',domain:'function',evidence:[],reason:'Historical reviewer misclassification',acceptable:true,missingAction:'none'};
 assert.ok(auditClaims([unit],[check],register).issues.includes('unbounded_inference'));
 assert.deepEqual(evidenceScope(source),['function']);
});
test('Reviewer receives complete commercial decision and only customer text as draft',async()=>{
 const plan={action:'draft',strength:'plausible',service:'landing_page',evidenceRefs:['inbound:0'],buyerTask:'Consultar programa',contactReason:'Explicação solicitada',pageRole:'Apresentar programa e link fornecidos',nextMove:'Explicar a função',researchNeeded:'Compatibilidade técnica desconhecida'};
 const text='A página poderia reunir o programa e o link de inscrição que vocês já têm.';
 let reviewed=false;
 const response=x=>({ok:true,status:200,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(x)}]}}]})});
 await requestModelDraft(conversation,decision,{geminiApiKey:'fixture'},async(url,options)=>{
  const body=JSON.parse(options.body),input=JSON.parse(body.contents[0].parts[0].text);
  if(!body.generationConfig.responseSchema.properties.questionCount)return response({contactPlan:plan,strategy:'valor',interlocutor:'Desconhecido',unknowns:['Compatibilidade técnica'],text});
  reviewed=true;assert.deepEqual(input.decision.contactPlan,plan);assert.equal(input.decision.strategy,'valor');assert.deepEqual(input.draft,{text});
  return response({...transportAudit(options),questionCount:0,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true,feedback:'Transport fixture'});
 });
 assert.equal(reviewed,true);
});
