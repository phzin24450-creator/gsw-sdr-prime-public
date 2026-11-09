import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../src/core.js';
import {createReviewedDraft,GEMINI_MODEL} from '../src/advisor.js';
const phone='000000050001';
function setup(text='Preciso de um sistema para organizar 40 orçamentos por semana') {const s=createStore();s.ingest({phone,id:'m1',text});s.setContext(phone,{sector:'Serviços',challenge:'Orçamentos dispersos',goal:'Organizar acompanhamento'});return s;}
const reply=text=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]})});
test('Gemini simulated response: official endpoint, private header, relevant context and HUMAN preserved',async()=>{
 const s=setup();let body,url,headers;
 const result=await createReviewedDraft(s,phone,{manual:true,geminiApiKey:'fake-test-key'},async(u,o)=>{url=u;headers=o.headers;body=JSON.parse(o.body);return reply('Para organizar esses 40 orçamentos semanais, onde a equipe registra hoje cada etapa?')});
 assert.equal(result.draft.provider,'gemini');assert.equal(result.draft.generationMeta.model,GEMINI_MODEL);assert.equal(s.get(phone).mode,'HUMAN');
 assert.match(url,/^https:\/\/generativelanguage.googleapis.com\/v1beta\/models\//);assert.ok(!url.includes('fake-test-key'));assert.equal(headers['x-goog-api-key'],'fake-test-key');assert.ok(!JSON.stringify(body).includes('fake-test-key'));
 const input=JSON.parse(body.contents[0].parts[0].text);assert.match(input.latestMessage,/40 orçamentos/);assert.equal(input.commercialContext.goal,'Organizar acompanhamento');assert.equal(input.history.length,1);assert.match(body.systemInstruction.parts[0].text,/aceite de handoff/);
});
for(const [status,code] of [[401,'invalid_key'],[403,'permission_denied'],[404,'model_unavailable'],[429,'quota_exceeded'],[503,'provider_unavailable']])test('Gemini HTTP '+status+' gives safe explicit reason',async()=>{
 const result=await createReviewedDraft(setup(),phone,{manual:true,geminiApiKey:'fake-test-key'},async()=>({ok:false,status}));assert.equal(result.draft.provider,'rules_fallback');assert.equal(result.draft.generationMeta.errorCode,code);assert.ok(!JSON.stringify(result).includes('fake-test-key'));
});
test('Gemini missing key never claims generative success',async()=>{const r=await createReviewedDraft(setup(),phone,{manual:true,geminiApiKey:''});assert.equal(r.draft.provider,'rules');assert.equal(r.draft.generationMeta.errorCode,'missing_key')});
test('Gemini safety block does not replace blocked content with a sendable fallback',async()=>{const r=await createReviewedDraft(setup(),phone,{manual:true,geminiApiKey:'fake'},async()=>({ok:true,json:async()=>({promptFeedback:{blockReason:'SAFETY'}})}));assert.equal(r.created,false);assert.equal(r.generationMeta.errorCode,'safety_block')});
test('Gemini timeout identified; arbitrary network error messages are never exposed',async()=>{const r=await createReviewedDraft(setup(),phone,{manual:true,geminiApiKey:'fake'},async()=>{throw Object.assign(Error('secret value'),{name:'AbortError'})});assert.equal(r.draft.generationMeta.errorCode,'timeout');assert.ok(!JSON.stringify(r).includes('secret value'))});
test('Gemini opt-out blocks network calls, including regenerate',async()=>{const s=setup('Não tenho interesse');let called=false;const r=await createReviewedDraft(s,phone,{manual:true,regenerate:true,geminiApiKey:'fake'},async()=>{called=true;return reply('No')});assert.equal(r.created,false);assert.equal(called,false)});
test('Gemini receives distinct fictional scenarios without presenting unsent drafts as outbound history',async()=>{
 const scenarios=['Tenho interesse em automatizar a recepção da clínica','Já tenho fornecedor, qual seria o diferencial?','Vocês integram o estoque ao sistema?','Recebemos 60 pedidos por dia, feitos por três atendentes','Retomando a conversa sobre nosso site, podemos continuar?','Pode encaminhar meu contexto ao responsável de desenvolvimento'];
 const inputs=[];for(const text of scenarios){await createReviewedDraft(setup(text),phone,{manual:true,geminiApiKey:'fake'},async(u,o)=>{inputs.push(JSON.parse(JSON.parse(o.body).contents[0].parts[0].text));return reply('Resposta simulada exclusiva do teste de transporte.')})}
 assert.equal(new Set(inputs.map(i=>i.latestMessage)).size,6);assert.deepEqual(inputs.map(i=>i.latestMessage),scenarios);
});
