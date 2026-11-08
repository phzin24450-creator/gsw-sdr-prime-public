import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createPostgresStore} from '../src/db/postgres.js';
import {createReviewedDraft} from '../src/advisor.js';
test('V4 PostgreSQL engine: draft/edit/regenerate/reconnect/history/duplicate/opt-out without schema migration',async()=>{
 const db=new PGlite();await db.exec('CREATE SCHEMA gsw_sdr; SET search_path=gsw_sdr;');await db.exec(await readFile(new URL('../db/001_init.sql',import.meta.url),'utf8'));
 const query=async(sql,args)=>{const r=await db.query(sql,args);return {...r,rowCount:r.affectedRows??r.rows.length}};
 const pool={query,connect:async()=>({query,release(){}}),end:async()=>{}};
 const s=await createPostgresStore('test',{pool});const phone='000000040002';
 try{
 assert.equal((await s.ingest({phone,id:'sql-1',text:'Quero um site',manual:true})).accepted,true);
 const a=await createReviewedDraft(s,phone,{manual:true,apiKey:''});assert.equal(a.created,true);assert.equal((await s.get(phone)).mode,'HUMAN');
 const edit=await s.editDraft(phone,a.draft.id,{text:'Edição preservada',expectedVersion:a.draft.conversationVersion});assert.equal(edit.updated,true);
 const b=await createReviewedDraft(s,phone,{manual:true,regenerate:true,apiKey:''});assert.equal(b.created,true);
 const restarted=await createPostgresStore('test',{pool});const c=await restarted.get(phone);assert.equal(c.messages.length,1);assert.equal(c.drafts.length,3);assert.ok(c.drafts.some(d=>d.text==='Edição preservada'));
 assert.equal((await s.editDraft(phone,edit.draft.id,{text:'Obsoleta',expectedVersion:edit.draft.conversationVersion})).updated,false);
 assert.equal((await s.ingest({phone,id:'sql-2',text:'Quero um site',manual:true})).reason,'duplicate_text');
 assert.equal((await s.ingest({phone,id:'sql-2',text:'Quero um site',manual:true,allowRepeat:true})).accepted,true);
 assert.equal((await s.ingest({phone,id:'sql-3',text:'Não tenho interesse',manual:true})).accepted,true);assert.equal((await s.get(phone)).optedOut,true);
 assert.equal((await createReviewedDraft(s,phone,{manual:true,apiKey:''})).created,false);
 await s.erase(phone);assert.equal((await s.list()).length,0);
 }finally{await db.close()}
});
