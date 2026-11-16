import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {claimUnits,auditClaims,claimRole,repairFindings} from '../src/claims.js';
import {requestModelDraft,prepareDecision} from '../src/advisor.js';
import {transportAudit} from './helpers/claim-review.js';
const entry=(u,extra={})=>({id:u.id,classification:'supported',domain:'identity',language:'factual',evidence:[],reason:'Test annotation',missingAction:'none',acceptable:true,...extra});

test('Known unknowns, neutral greeting and future intended actions do not require proof of occurrence',()=>{
 for(const [path,text] of [['interlocutor','Desconhecido'],['unknowns.0','cargo do interlocutor'],['text','Olá. '],['contactPlan.researchNeeded','nenhuma'],['contactPlan.nextMove','verificar interesse']]){
  const u={id:'u0',path,text,role:claimRole(path,text)};
  assert.deepEqual(auditClaims([u],[entry(u)],[]).issues,[]);
 }
});
test('Unknown status is not an exemption for a claimed owner identity',()=>{
 const u=claimUnits({interlocutor:'Proprietário da empresa'})[0];
 assert.equal(u.role,'assertion');assert.ok(auditClaims([u],[entry(u)],[]).issues.includes('claim_not_entailed'));
});
test('A proposed functional role is not an accomplished outcome',()=>{
 const u=claimUnits({contactPlan:{pageRole:'apresentar programa e link de inscrição'}})[0];
 const e=entry(u,{classification:'admissible_inference',domain:'function'});
 assert.deepEqual(auditClaims([u],[e],[]).issues,[]);
 assert.ok(auditClaims([{...u,path:'text',role:'assertion'}],[e],[]).issues.includes('unbounded_inference'));
});
test('Proposals still reject explicit unsupported technical premises',()=>{
 const u=claimUnits({contactPlan:{pageRole:'página que não interfere no site atual'}})[0];
 assert.ok(auditClaims([u],[entry(u,{classification:'unsupported',domain:'implementation',acceptable:false,reason:'Independência técnica não verificada'})],[]).issues.includes('unsupported_claim'));
});
test('Real round 2 neutral metadata no longer generates contradictory missing-proof errors',async()=>{
 for(const id of ['bruma-social','vertice-turma','interesse-explicacao','objecao-fornecedor']){
  const d=JSON.parse(await readFile(new URL(`../docs/evidence/prime-round2-real/${id}.json`,import.meta.url),'utf8'));
  for(const r of d.rejectedDrafts){
   const real=r.claimLedger.filter(u=>u.path==='interlocutor'&&u.text==='Desconhecido');
   assert.ok(real.length);for(const u of real)assert.deepEqual(auditClaims([u],[u],d.input.evidenceRegister).issues,[]);
  }
 }
});
test('Literal findings carry exact path, text and correction reason',()=>{
 const u=claimUnits({text:'A empresa não possui domínio próprio.'})[0];
 const r=auditClaims([u],[entry(u,{domain:'global_absence'})],[]),f=repairFindings(r);
 assert.equal(f[0].text,u.text);assert.equal(f[0].path,'text');assert.match(f[0].reason,/alcance da fonte/);
});
test('Repair receives concrete findings instead of unqualified praise from approving reviewer',async()=>{
 const c={mode:'HUMAN',context:{},messages:[{direction:'inbound',text:'Quero apresentar o programa e já tenho link de inscrição.'}]};
 let gen=0,rev=0;const rejected=[];
 const response=x=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(x)}]}}]})});
 const r=await requestModelDraft(c,prepareDecision(c,{manual:true}),{geminiApiKey:'fixture',onQualityRejection:x=>rejected.push(x)},async(_url,o)=>{
  const b=JSON.parse(o.body),input=JSON.parse(b.contents[0].parts[0].text);
  if(b.generationConfig.responseSchema.properties.questionCount){
   rev++;const v={...transportAudit(o),feedback:'Tudo está excelente e sem extrapolações.',questionCount:0,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true};
   if(rev===1)v.claimAudit[0]={...v.claimAudit[0],classification:'supported',domain:'implementation',language:'factual',reason:'Reviewer incorrectly approves'};
   return response(v);
  }
  gen++;if(gen===2){assert.equal(input.repairFindings[0].text,'Não interfere no contrato da agência.');assert.ok(!b.systemInstruction.parts[0].text.includes('Tudo está excelente'));}
  return response({strategy:'valor',text:gen===1?'Não interfere no contrato da agência.':'A página poderia apresentar o programa e direcionar ao link informado.'});
 });
 assert.equal(gen,2);assert.equal(rev,2);assert.ok(rejected[0].reviewerFeedback.includes('Tudo está excelente'));assert.match(rejected[0].feedback,/reprovada/);assert.ok(r.text);
});
