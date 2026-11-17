import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {turnTask,taskIssues} from '../src/turn-task.js';
const {files}=JSON.parse(readFileSync(new URL('../docs/evidence/prime-task-predecessor-real.json',import.meta.url),'utf8'));
const get=id=>files.find(x=>x.file===id+'.json').data;
test('Real Bruma offer is rejected; corrected Vértice discovery stays valid',()=>{
 const b=get('bruma-social'),v=get('vertice-turma');
 assert.deepEqual(taskIssues(turnTask(b.input),b.response),['premature_offer']);
 assert.deepEqual(taskIssues(turnTask(v.input),v.response),[]);
});
test('Both real Trilha promises are rejected, including rephrased repair',()=>{
 const d=get('objecao-fornecedor');
 for(const c of d.generatedCandidates)assert.deepEqual(taskIssues(turnTask(d.input),c.text),['unverified_supplier_compatibility']);
 assert.deepEqual(taskIssues(turnTask(d.input),'A forma de implementar precisaria ser alinhada com sua agência.'),[]);
});
test('Real Rumo explanation is not forced into new cold discovery',()=>{
 const d=get('interesse-explicacao');assert.equal(turnTask(d.input).id,'explain');assert.deepEqual(taskIssues(turnTask(d.input),d.response),[]);
});

test('Real supplier response is safe but bureaucratic; concrete next step remains allowed',()=>{
 const {files}=JSON.parse(readFileSync(new URL('../docs/evidence/prime-supplier-targeted-real.json',import.meta.url),'utf8'));
 const d=files.find(x=>x.file==='objecao-fornecedor.json').data;
 assert.deepEqual(taskIssues(turnTask(d.input),d.response),['bureaucratic_supplier_reply']);
 assert.deepEqual(taskIssues(turnTask(d.input),'Podemos avaliar a apresentação da expedição junto com sua agência antes de definir o formato. Você prefere seguir dessa forma?'),[]);
});
