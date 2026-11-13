import test from 'node:test';
import assert from 'node:assert/strict';
import { commercialSignals } from '../src/intelligence.js';
import { commercialPrompt, reviewCopy } from '../src/commercial.js';
import { prepareDecision, requestModelDraft, createReviewedDraft } from '../src/advisor.js';
import { draftVisual } from '../src/visual.js';
import { createStore } from '../src/core.js';
const decision=text=>({latest:{text},intent:'OTHER'});
const conversation=text=>({mode:'HUMAN',context:{company:'Brisa Técnica Climatização',sector:'Climatização'},messages:[{id:'1',direction:'inbound',text}]});
const response=text=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]})});
for(const [text,role] of [
 ['Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?','desconhecido'],
 ['Sou eu o responsável.','decisor confirmado por declaração'],
 ['Sou a recepcionista.','atendente humano declarado'],
 ['Sou uma assistente virtual.','possível chatbot']
]) test('Evidence-aware interlocutor: '+role,()=>assert.equal(commercialSignals(conversation(text),decision(text)).interlocutor.role,role));
for(const [text,cue] of [['Está caro','preco'],['Estamos sem orçamento','orcamento'],['Não é prioridade','prioridade'],['Já temos fornecedor','fornecedor atual'],['Não conheço vocês','confianca'],['Não vejo necessidade','necessidade']])test('Objection cue: '+cue,()=>assert.ok(commercialSignals(conversation(text),decision(text)).objectionCues.includes(cue)));
test('Critical refusal overrides budget and blocks network',async()=>{
 const s=createStore();s.ingest({phone:'000000070001',id:'refusal',text:'No momento não temos interesse. Estamos cortando custos. Obrigado pelo contato, ótimo dia.'});
 const r=await createReviewedDraft(s,'000000070001',{manual:true},()=>assert.fail('No network after refusal'));
 assert.equal(r.created,false);assert.equal(s.get('000000070001').optedOut,true);
});
test('Identity and answered questions survive subsequent turns',()=>{
 const c=conversation('Sou eu o responsável.');c.messages.push({id:'2',direction:'outbound',text:'Como registram os pedidos?'},{id:'3',direction:'inbound',text:'Usamos uma planilha.'});
 const signals=commercialSignals(c,decision('Usamos uma planilha.'));
 assert.equal(signals.interlocutor.confidence,'alta');assert.equal(signals.answeredQuestionPairs[0].answer,'Usamos uma planilha.');
 assert.equal(reviewCopy('Quem é o responsável?',c,decision('Usamos uma planilha.')),'resolved_identity');
});
test('Quality failure is repaired once using Gemini, with original context',async()=>{
 const c=conversation('Como posso ajudar?');let calls=0;
 const r=await requestModelDraft(c,decision('Como posso ajudar?'),{geminiApiKey:'fake'},async(u,o)=>{
  calls++;const body=JSON.parse(o.body);if(calls===2)assert.match(body.systemInstruction.parts[0].text,/multiple_questions/);
  return response(calls===1?'Quem decide? Qual o orçamento?':'Aqui é o Pedro, da GSW. Podemos avaliar uma página que reúna os serviços de climatização e facilite pedidos de orçamento. Vocês já usam algum canal para apresentar esses serviços?');
 });assert.equal(calls,2);assert.equal(r.generationMeta.qualityAttempts,2);
});
test('Persistent quality failure never becomes sendable fallback',async()=>{
 let calls=0;await assert.rejects(requestModelDraft(conversation('Olá'),decision('Olá'),{geminiApiKey:'fake'},async()=>{calls++;return response('Garanto resultado garantido.')}),e=>e.code==='quality_block');assert.equal(calls,2);
});
test('Visual fallback preserves HTTP diagnostics without secret or response body',async()=>{
 const r=await draftVisual({reviewed:true,messages:[{direction:'inbound',text:'Como posso ajudar?'}]}, {config:{geminiApiKey:'fake-secret'},fetcher:async()=>({ok:false,status:503,json:()=>assert.fail('Do not read error body')})});
 assert.equal(r.provider,'rules_fallback');assert.equal(r.generationMeta.httpStatus,503);assert.equal(r.generationMeta.errorCode,'provider_unavailable');assert.ok(!JSON.stringify(r).includes('fake-secret'));
});
test('Feedback is supplied to future generation only for its conversation',()=>{
 const store=createStore(),phone='000000070002';store.ingest({phone,id:'m',text:'Como posso ajudar?'});const c=store.get(phone);
 const d=store.saveDraft({phone,expectedVersion:c.version,sourceMessageId:'m',text:'Texto fictício',intent:'OTHER',provider:'gemini',manual:true});
 store.recordFeedback(phone,d.draft.id,'generica');const current=store.get(phone);
 assert.equal(JSON.parse(commercialPrompt(current,prepareDecision(current,{manual:true})).input).operatorFeedback[0].category,'generica');
 assert.equal(store.get('000000070003').feedback.length,0);
});
test('Functional responsibility does not prove purchase authority',()=>{
 const text='Sou responsável pelo estoque, mas a compra de sistemas depende de outra pessoa.';
 assert.equal(commercialSignals(conversation(text),decision(text)).interlocutor.role,'desconhecido');
});
