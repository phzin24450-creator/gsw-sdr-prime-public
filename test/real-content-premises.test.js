import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditClaims,claimUnits} from '../src/claims.js';
const {files}=JSON.parse(readFileSync(new URL('../docs/evidence/prime-schema-predecessor-real.json',import.meta.url),'utf8'));
for(const id of ['bruma-social','interesse-explicacao'])test('Unmodified approving ledger catches additional real premise: '+id,()=>{
 const d=files.find(f=>f.file===id+'.json').data;
 const r=auditClaims(d.metadata.claimLedger,d.metadata.claimLedger,d.input.evidenceRegister);
 assert.ok(r.issues.includes(id==='bruma-social'?'unsupported_premise':'unconfirmed_content'));
});
test('Confirmed content and explicit availability question are allowed',()=>{
 const source={id:'inbound:0',kind:'client_statement',text:'Temos metodologia e diferenciais documentados.'};
 for(const text of ['Podemos apresentar a metodologia e os diferenciais.','Vocês possuem depoimentos?']){
 const u=claimUnits({text})[0];const c={id:u.id,commitment:'question',domain:'other',evidence:[],reason:'Fixture',missingAction:'none',acceptable:true};
 assert.deepEqual(auditClaims([u],[c],[source]).issues,[]);
 }
});
