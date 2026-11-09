import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, MODES } from '../src/core.js';
import { classify, INTENTS } from '../src/intent.js';
import { createReviewedDraft, prepareDecision, localDraft } from '../src/advisor.js';
const phone='5511999999999';
test('classifica contextos em português', () => {
  assert.equal(classify('Qual o preço?'),INTENTS.PRICING);
  assert.equal(classify('Quero criar uma automação para WhatsApp'),INTENTS.SERVICES);
  assert.equal(classify('Podemos agendar reunião?'),INTENTS.SCHEDULING);
  assert.equal(classify('Já tenho fornecedor'),INTENTS.OBJECTION);
  assert.equal(classify('Bom dia!'),INTENTS.GREETING);
});
test('respostas locais se adaptam ao serviço mencionado', () => {
  assert.match(localDraft(INTENTS.SERVICES, 'Preciso de um site'), /site que precisa melhorar|primeiro/);
  assert.match(localDraft(INTENTS.SERVICES, 'Quero automatizar WhatsApp'), /WhatsApp/);
  assert.match(localDraft(INTENTS.SERVICES, 'Quero melhorar SEO no Google'), /Google/);
});
test('pedidos de humano e opt-out são prioritários', () => {
  assert.equal(classify('Quero falar com atendente sobre preço'),INTENTS.HUMAN_REQUEST);
  assert.equal(classify('PARE DE ME ENVIAR MENSAGENS'),INTENTS.OPT_OUT);
  const store=createStore(); store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'opt',text:'Não quero mais receber mensagens'});
  const c=store.get(phone);
  assert.equal(c.mode,MODES.PAUSED);
  assert.equal(c.optedOut,true);
  assert.throws(()=>store.setMode(phone,MODES.AI_ACTIVE),/bloqueada/);
});
test('rascunho contextual é gerado e nunca enviado; preço não é inventado',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'m1',text:'Quanto custa uma automação?'});
  const r=await createReviewedDraft(store,phone,{geminiApiKey:''});
  assert.equal(r.created,true);
  assert.equal(r.draft.provider,'rules');
  assert.equal(r.draft.intent,INTENTS.PRICING);
  assert.match(r.draft.text,/valores|opções/);
  assert.doesNotMatch(r.draft.text,/R\$\s*[0-9]/);
  assert.equal(store.get(phone).drafts.length,1);
  assert.equal((await createReviewedDraft(store,phone,{geminiApiKey:''})).created,false);
});
test('takeover humano durante geração longa descarta resposta atrasada',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'m1',text:'Quero um site'});
  let release;
  const gate=new Promise(resolve=>{release=resolve});
  const fetcher=async()=>{await gate;return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'Mensagem de teste'}]}}]})}};
  const draftPromise=createReviewedDraft(store,phone,{geminiApiKey:'fake-for-tests'},fetcher);
  await new Promise(resolve=>setImmediate(resolve));
  store.setMode(phone,MODES.HUMAN);
  release();
  const result=await draftPromise;
  assert.equal(result.created,false);
  assert.equal(store.get(phone).drafts.length,0);
});
test('nova mensagem invalida o rascunho anterior',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'m1',text:'Oi'});
  await createReviewedDraft(store,phone,{geminiApiKey:''});
  store.ingest({phone,id:'m2',text:'Queria falar sobre um sistema'});
  assert.equal(store.get(phone).drafts[0].status,'SUPERSEDED');
  const r=await createReviewedDraft(store,phone,{geminiApiKey:''});
  assert.equal(r.created,true);
  assert.equal(store.get(phone).drafts[1].intent,INTENTS.SERVICES);
});
test('pedidos de humano não geram novo rascunho',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'m1',text:'quero falar com um humano'});
  const d=prepareDecision(store.get(phone));
  assert.equal(d.canDraft,false);
  assert.equal(store.get(phone).mode,MODES.HANDOFF_PENDING);
});

test('fallback de endereço no Google preserva o objetivo quando o lead já tem site', () => {
  const text = localDraft(INTENTS.SERVICES, 'Já temos site. Queremos atualizar o endereço no Google.');
  assert.match(text, /Perfil da Empresa no Google/);
  assert.doesNotMatch(text, /site/);
});
