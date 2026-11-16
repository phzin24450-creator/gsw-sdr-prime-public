import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {auditClaims,canonicalClaim,claimAuditSchema,claimUnits,repairFindings} from '../src/claims.js';
import {liveOutcome} from '../scripts/prime-live-outcome.mjs';
const historical=async id=>JSON.parse(await readFile(new URL(`../docs/evidence/prime-round4-real/${id}.json`,import.meta.url),'utf8'));

test('Real round 4 conditional Rumo statements no longer fail merely due to redundant supported label',async()=>{
 const d=await historical('interesse-explicacao');
 const checks=d.rejectedDrafts[0].claimLedger.filter(c=>c.path==='text'&&c.commitment==='functional_proposal');assert.equal(checks.length,2);
 for(const c of checks){const r=auditClaims([c],[c],d.input.evidenceRegister);assert.ok(!r.issues.includes('claim_not_entailed'));assert.equal(r.ledger[0].classification,'admissible_inference');}
});
test('A question does not need proof of its answer, but unsupported premises still fail',async()=>{
 const d=await historical('bruma-social');const c=d.rejectedDrafts[0].claimLedger.find(c=>c.commitment==='question');assert.ok(c);
 assert.deepEqual(auditClaims([c],[c],d.input.evidenceRegister).issues,[]);
 assert.ok(auditClaims([c],[{...c,acceptable:false,reason:'Pergunta pressupõe ausência de site não comprovada'}],d.input.evidenceRegister).issues.includes('unsupported_claim'));
});
test('A canonical proposal cannot erase contradiction or false citation',()=>{
 const unit=claimUnits({text:'A página poderia apresentar o programa.'})[0];
 const base={id:unit.id,commitment:'functional_proposal',domain:'function',evidence:[{sourceId:'policy:portfolio',quote:'Página gera vendas',relation:'supports_possibility'}],reason:'Fixture',missingAction:'none',acceptable:true};
 assert.ok(auditClaims([unit],[base],[{id:'policy:portfolio',text:'Sites e landing pages'}]).issues.includes('invalid_claim_evidence'));
 for(const extra of [{classification:'unsupported'},{acceptable:false}])assert.ok(auditClaims([unit],[{...base,...extra}],[]).issues.includes('unsupported_claim'));
});
test('Provider schema forces inventory length and allowed IDs without modifying shared schema',()=>{
 const a=claimUnits({contactPlan:{contactReason:'Programa anunciado'},text:'Olá. Há uma página do programa?'}),b=claimUnits({text:'Obrigado.'});
 const sa=claimAuditSchema(a),sb=claimAuditSchema(b);
 assert.equal(sa.minItems,a.length);assert.equal(sa.maxItems,a.length);assert.deepEqual(sa.items.properties.id.enum,a.map(x=>x.id));assert.equal(sb.maxItems,b.length);
 assert.ok(!sa.items.required.includes('classification'));assert.ok(!sa.items.required.includes('language'));assert.ok(sa.items.required.includes('commitment'));
});
test('Omitted real plan units are pinpointed, not hidden behind a generic code',async()=>{
 const d=await historical('bruma-social'),candidate=d.generatedCandidates[0];
 const u=claimUnits({...candidate.decision,text:candidate.text}),r=auditClaims(u,d.rejectedDrafts[0].claimLedger,d.input.evidenceRegister);
 const missing=repairFindings(r).filter(f=>f.code==='incomplete_claim_audit');assert.ok(missing.length);assert.ok(missing.every(f=>f.id&&f.path&&f.text));assert.ok(missing.some(f=>f.path.startsWith('contactPlan.')));
});
test('No conflicting classification overrides the single semantic commitment',()=>{
 const x=canonicalClaim({commitment:'question',classification:'supported',language:'factual'});assert.equal(x.classification,'non_assertive');assert.equal(x.language,'question');
 assert.equal(canonicalClaim({commitment:'fact'}).classification,'supported');assert.equal(canonicalClaim({commitment:'invalid'}).classification,'invalid');
});
test('Research is a technical result requiring human assessment; quota and empty advice still fail',()=>{
 const p={action:'research',researchNeeded:'Verificar domínio alternativo'};
 const r=liveOutcome({}, {code:'research_required'},p);assert.equal(r.pass,true);assert.equal(r.requiresHumanAssessment,true);
 assert.equal(liveOutcome({}, {code:'research_required'},{...p,researchNeeded:''}).pass,false);
 assert.equal(liveOutcome({}, {code:'quota_exceeded'},p).pass,false);
 assert.equal(liveOutcome({expectedDecision:'blocked'},{code:'research_required'},p).pass,false);
});
