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

test('IA isolada nao cria uma oferta comercial', () => {
  const store = createStore();
  store.ingest({ phone, id: 'ai-only', text: 'Vocês vendem agentes de IA?' });
  assert.deepEqual(summarizeQualification(store.get(phone)).services, []);
});

test('separa landing pages, paineis e trafego sem afirmar interesse', () => {
  const store = createStore();
  store.ingest({ phone, id: 'services', text: 'Já tenho landing page, painel e tráfego pago.' });
  const result = summarizeQualification(store.get(phone));
  assert.deepEqual(result.services, ['Landing pages', 'Painéis administrativos', 'Tráfego pago']);
  assert.match(result.summary, /interesse a confirmar/);
});
