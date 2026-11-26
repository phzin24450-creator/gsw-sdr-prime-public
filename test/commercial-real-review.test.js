import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditClaims,claimUnits} from '../src/claims.js';
const evidence=JSON.parse(readFileSync(new URL('../docs/evidence/prime-stabilization-commercial-real.json',import.meta.url),'utf8'));
const get=id=>evidence.files.find(f=>f.file===id+'.json').data;
for(const id of ['ipe-madeira','bruma-social'])test('Unmodified real approving ledger is rejected: '+id,()=>{
 const d=get(id),ledger=d.metadata.claimLedger;
 assert.ok(ledger.length);
 const result=auditClaims(ledger,ledger,d.input.evidenceRegister);
 assert.ok(result.issues.includes('unsupported_premise'));
 assert.ok(result.findings.some(f=>f.text.includes('Acompanhei')));
});
for(const id of ['interesse-explicacao','vertice-turma'])test('Unmodified final real review no longer mistakes neutral research status for client fact: '+id,()=>{
 const d=get(id),ledger=d.rejectedDrafts.at(-1).claimLedger;
 assert.deepEqual(auditClaims(ledger,ledger,d.input.evidenceRegister).issues,[]);
});
test('Unmodified Trilha review still blocks technical promise after neutral status fix',()=>{
 const d=get('objecao-fornecedor'),ledger=d.rejectedDrafts.at(-1).claimLedger;
 assert.ok(auditClaims(ledger,ledger,d.input.evidenceRegister).issues.includes('unsupported_claim'));
});
test('Neutral status exemption cannot cover added factual assertions or override explicit rejection',()=>{
 for(const text of ['nenhuma, pois não existe site','nenhuma no momento; a página não interfere na agência']){
 const u=claimUnits({contactPlan:{researchNeeded:text}})[0];
 const check={id:u.id,commitment:'fact',domain:'implementation',evidence:[],reason:'fixture',missingAction:'none',acceptable:true};
 assert.ok(auditClaims([u],[check],[]).issues.includes('claim_not_entailed'));
 }
});
