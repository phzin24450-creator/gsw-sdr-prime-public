import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditClaims,claimUnits} from '../src/claims.js';

const evidence=id=>JSON.parse(readFileSync(new URL('../docs/evidence/prime-compact-partitions-real/'+id+'.json',import.meta.url),'utf8'));
const check=(unit,domain,commitment='fact',refs=[])=>({id:unit.id,commitment,domain,evidence:refs,reason:'Explicit regression annotation; not a new semantic model verdict',missingAction:'none',acceptable:true});
const cases=[
 ['ipe-madeira','qualidade das cozinhas','quality'],
 ['ipe-madeira','Acompanho o trabalho','relationship'],
 ['ipe-madeira','WhatsApp como canal principal','channel_exclusivity'],
 ['vertice-turma','dificultando o acesso direto','outcome'],
 ['interesse-explicacao','facilita a decisão','outcome'],
 ['objecao-fornecedor','sem tocar no seu site institucional','implementation']
];
for(const [id,fragment,domain]of cases)test('Preserved MINIMAL candidate rejects unproven '+id+'/'+domain,()=>{
 const d=evidence(id),candidate=d.generatedCandidates[0];
 const literal=candidate.text.includes(fragment)?candidate.text:candidate.decision.contactPlan.contactReason;
 assert.ok(literal.includes(fragment),'Fixture must retain the actual offending text');
 const unit={id:'u0',path:'text',text:literal,role:'assertion'};
 const source=d.input.evidenceRegister.find(s=>s.id==='public:observation')||d.input.evidenceRegister.find(s=>s.id.startsWith('inbound:'));
 const verdict=check(unit,domain,'fact',[{sourceId:source.id,quote:source.text,relation:source.id==='public:observation'?'entails':'does_not_establish'}]);
 assert.ok(auditClaims([unit],[verdict],d.input.evidenceRegister).issues.includes('claim_not_entailed'));
});
for(const path of ['buyerTask','pageRole','nextMove','researchNeeded'])test('Plan field cannot exempt unsupported factual premise: '+path,()=>{
 const d=evidence('objecao-fornecedor');
 const text=d.generatedCandidates[0].text;
 const unit=claimUnits({contactPlan:{[path]:text}})[0];
 assert.ok(auditClaims([unit],[check(unit,'implementation')],d.input.evidenceRegister).issues.includes('claim_not_entailed'));
});
test('Functional plan requires a source and preserves legitimate proposed presentation',()=>{
 const d=evidence('interesse-explicacao'),source=d.input.evidenceRegister.find(s=>s.id==='policy:functions');
 const unit=claimUnits({contactPlan:{pageRole:d.generatedCandidates[0].decision.contactPlan.pageRole}})[0];
 assert.ok(auditClaims([unit],[check(unit,'function','functional_proposal')],d.input.evidenceRegister).issues.includes('unbounded_inference'));
 const refs=[{sourceId:source.id,quote:source.text,relation:'supports_possibility'}];
 assert.deepEqual(auditClaims([unit],[check(unit,'function','functional_proposal',refs)],d.input.evidenceRegister).issues,[]);
});
test('Actual planned intention and unknown remain exempt from proof of occurrence',()=>{
 for(const [path,text,commitment]of [['nextMove','verificar se há rota equivalente','intention'],['researchNeeded','existência de rota equivalente desconhecida','unknown']]){
 const unit=claimUnits({contactPlan:{[path]:text}})[0];
 assert.deepEqual(auditClaims([unit],[check(unit,'other',commitment)],[]).issues,[]);
 }
});
