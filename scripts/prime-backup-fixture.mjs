import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {createPostgresStore} from '../src/db/postgres.js';
const db=process.env.PRIME_REHEARSAL_VERIFY?'prime_restored':'prime_source';
const pool=new Pool({host:'127.0.0.1',port:55487,user:'postgres',password:'synthetic-only-not-a-real-credential',database:db,options:'-c search_path=gsw_sdr'});
try{
 const store=await createPostgresStore('unused',{pool});
 if(!process.env.PRIME_REHEARSAL_VERIFY){
  await store.ingest({phone:'000000018001',id:'fixture-site',text:'Quero apresentar minha empresa em um site.',manual:true});
  await store.setContext('000000018001',{company:'PRIME Fixture Aurora',sector:'Marcenaria'});
  const c=await store.get('000000018001');
  const draft=await store.saveDraft({phone:c.phone||'000000018001',expectedVersion:c.version,sourceMessageId:'fixture-site',text:'Rascunho fictício para revisão.',intent:'SERVICES',provider:'gemini',manual:true});
  assert.equal(draft.created,true);
  await store.editDraft('000000018001',draft.draft.id,{text:'Versão fictícia editada pelo proprietário.',expectedVersion:draft.draft.conversationVersion});
  await store.ingest({phone:'000000018002',id:'fixture-optout',text:'Não me envie mais mensagens.',manual:true});
  await store.setArchived('000000018001',true);
 }else{
  const original=new Pool({host:'127.0.0.1',port:55487,user:'postgres',password:'synthetic-only-not-a-real-credential',database:'prime_source',options:'-c search_path=gsw_sdr'});
  try{for(const table of ['conversations','messages','drafts','audit_events']){
   const query=`SELECT to_jsonb(t) AS row FROM ${table} t ORDER BY to_jsonb(t)::text`;
   assert.deepEqual((await pool.query(query)).rows,(await original.query(query)).rows,table);
  }}finally{await original.end();}
  assert.equal((await store.get('000000018002')).optedOut,true);
  assert.ok((await store.get('000000018001')).archivedAt);
  await store.setArchived('000000018001',false);
  assert.equal((await store.list({search:'Aurora'})).length,1);
 }
}finally{await pool.end();}
