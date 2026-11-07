import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, MODES } from '../src/core.js';
import { summarizeQualification } from '../src/qualification.js';
const phone='5511999999999';
test('qualificacao nao inventa valor ou decisor',()=>{
 const s=createStore();s.ingest({phone,id:'q1',text:'Quero um sistema para minha loja'});
 const q=summarizeQualification(s.get(phone));
 assert.ok(q.services.includes('Sistemas sob medida'));
 assert.equal(q.budget,null);assert.equal(q.decisionMaker,null);
 assert.equal(q.urgentSignal,false);
});
test('pedido de humano tem precedencia no proximo passo',()=>{
 const s=createStore();s.setMode(phone,MODES.AI_ACTIVE);
 s.ingest({phone,id:'q2',text:'Preciso de automação no WhatsApp, quero falar com atendente'});
 const q=summarizeQualification(s.get(phone));
 assert.equal(q.handoffRecommended,true);
 assert.match(q.nextAction,/humano/);
});
