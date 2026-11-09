import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore,MODES} from '../src/core.js';
import {createReviewedDraft} from '../src/advisor.js';
const phone='000000040001';
const setup=()=>{const s=createStore();s.ingest({phone,id:'message',text:'Preciso de um site'});return s};
test('V4 HUMAN: manual draft, edit, regenerate preserve history and never change mode',async()=>{
 const s=setup();const a=await createReviewedDraft(s,phone,{manual:true,geminiApiKey:''});assert.equal(a.created,true);assert.equal(s.get(phone).mode,'HUMAN');
 const edit=s.editDraft(phone,a.draft.id,{text:'Texto revisado pelo operador',expectedVersion:s.get(phone).version});assert.equal(edit.updated,true);assert.equal(edit.sent,false);
 assert.equal(s.editDraft(phone,a.draft.id,{text:'Edição antiga',expectedVersion:a.draft.conversationVersion}).updated,false);
 const b=await createReviewedDraft(s,phone,{manual:true,regenerate:true,geminiApiKey:''});assert.equal(b.created,true);assert.equal(s.get(phone).drafts.length,3);assert.equal(s.get(phone).mode,'HUMAN');
});
test('V4 automatic generation remains blocked in HUMAN',async()=>{const s=setup();assert.equal((await createReviewedDraft(s,phone,{geminiApiKey:''})).created,false)});
for(const mode of ['PAUSED','HANDOFF_PENDING'])test('V4 manual blocked in '+mode,async()=>{const s=setup();s.setMode(phone,mode);assert.equal((await createReviewedDraft(s,phone,{manual:true,geminiApiKey:''})).created,false)});
test('V4 opt-out blocks draft, copy-save, and stale edits',async()=>{const s=setup();const d=await createReviewedDraft(s,phone,{manual:true,geminiApiKey:''});s.ingest({phone,id:'stop',text:'Pare de me enviar mensagens'});assert.equal((await createReviewedDraft(s,phone,{manual:true,geminiApiKey:''})).created,false);assert.equal(s.editDraft(phone,d.draft.id,{text:'Não pode',expectedVersion:s.get(phone).version}).updated,false)});
test('V4 duplicate paste requires explicit repeat, idempotency stays intact',()=>{const s=setup();assert.equal(s.ingest({phone,id:'another',text:'Preciso de um site',manual:true}).reason,'duplicate_text');assert.equal(s.ingest({phone,id:'repeat',text:'Preciso de um site',manual:true,allowRepeat:true}).accepted,true);assert.equal(s.ingest({phone,id:'repeat',text:'Preciso de um site',manual:true,allowRepeat:true}).accepted,false);assert.equal(s.get(phone).messages.length,2)});
test('V4 concurrent generation allows one result, rejects stale expected version',async()=>{const s=setup();const cfg={manual:true,geminiApiKey:'fake',expectedVersion:s.get(phone).version};const fetcher=async()=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'Teste de resposta'}]}}]})});const out=await Promise.all([createReviewedDraft(s,phone,cfg,fetcher),createReviewedDraft(s,phone,cfg,fetcher)]);assert.equal(out.filter(x=>x.created).length,1);assert.equal((await createReviewedDraft(s,phone,cfg,fetcher)).created,false)});
test('V4 Gemini request server-side; errors use explicit fallback',async()=>{const s=setup();let request;const result=await createReviewedDraft(s,phone,{manual:true,geminiApiKey:'private-fake'},async(url,options)=>{request=JSON.parse(options.body);return {ok:false,status:429}});assert.equal(result.draft.provider,'rules_fallback');assert.equal(result.draft.generationMeta.errorCode,'quota_exceeded');assert.match(request.systemInstruction.parts[0].text,/orientação jurídica/);assert.equal(s.get(phone).mode,'HUMAN')});
