import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createPostgresStore} from '../src/db/postgres.js';
import {createReviewedDraft} from '../src/advisor.js';
test('V4 PostgreSQL engine: draft/edit/regenerate/reconnect/history/duplicate/opt-out with additive Gemini migration',async()=>{
 const db=new PGlite();await db.exec('CREATE SCHEMA gsw_sdr; SET search_path=gsw_sdr;');await db.exec(await readFile(new URL('../db/001_init.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../db/20261109015059_gemini_provider_metadata.sql',import.meta.url),'utf8'));
 const query=async(sql,args)=>{const r=await db.query(sql,args);return {...r,rowCount:r.affectedRows??r.rows.length}};
 const pool={query,connect:async()=>({query,release(){}}),end:async()=>{}};
 const s=await createPostgresStore('test',{pool});const phone='000000040002';
 try{
 assert.equal((await s.ingest({phone,id:'sql-1',text:'Quero um site',manual:true})).accepted,true);
 const a=await createReviewedDraft(s,phone,{manual:true,geminiApiKey:''});assert.equal(a.created,true);assert.equal(a.draft.generationMeta.errorCode,'missing_key');assert.equal((await s.get(phone)).mode,'HUMAN');
 const edit=await s.editDraft(phone,a.draft.id,{text:'Edição preservada',expectedVersion:a.draft.conversationVersion});assert.equal(edit.updated,true);
 const b=await createReviewedDraft(s,phone,{manual:true,regenerate:true,geminiApiKey:'fake'},async()=>({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'Sugestão Gemini simulada para teste SQL.'}]}}]})}));assert.equal(b.created,true);
 const restarted=await createPostgresStore('test',{pool});const c=await restarted.get(phone);assert.equal(c.messages.length,1);assert.ok(c.drafts.some(d=>d.provider==='gemini'&&d.generationMeta.status==='success'));assert.equal(c.drafts.length,3);assert.ok(c.drafts.some(d=>d.text==='Edição preservada'));
 assert.equal((await s.editDraft(phone,edit.draft.id,{text:'Obsoleta',expectedVersion:edit.draft.conversationVersion})).updated,false);
 assert.equal((await s.ingest({phone,id:'sql-2',text:'Quero um site',manual:true})).reason,'duplicate_text');
 assert.equal((await s.ingest({phone,id:'sql-2',text:'Quero um site',manual:true,allowRepeat:true})).accepted,true);
 assert.equal((await s.ingest({phone,id:'sql-3',text:'Não tenho interesse',manual:true})).accepted,true);assert.equal((await s.get(phone)).optedOut,true);
 assert.equal((await createReviewedDraft(s,phone,{manual:true,geminiApiKey:''})).created,false);
 await s.erase(phone);assert.equal((await s.list()).length,0);
 }finally{await db.close()}
});
