import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {applyMigrations} from '../src/db/migrate.js';
import {createPostgresStore} from '../src/db/postgres.js';
import {createApp} from '../src/server.js';

// Replay recorded synthetic provider output, not a new Gemini call or semantic evaluation.
test('Approved supplier response survives authenticated API, PostgreSQL reload, edit and opt-out',async()=>{
 const {files}=JSON.parse(await readFile(new URL('../docs/evidence/prime-commercial-approved-real.json',import.meta.url),'utf8'));
 const actual=files.find(x=>x.file==='objecao-fornecedor.json').data;
 const db=new PGlite();
 const query=async(sql,args)=>{const r=args?.length?await db.query(sql,args):(await db.exec(sql)).at(-1);return {...r,rowCount:r.rows.length||r.affectedRows||0};};
 const pool={query,connect:async()=>({query,release(){}}),end:async()=>{}};
 let app,calls=0;
 try{
 await applyMigrations(pool);await db.exec('SET search_path TO gsw_sdr');
 const store=await createPostgresStore('synthetic',{pool});const phone='000000024001';
 await store.setContext(phone,actual.input.commercialContext);
 for(const [i,m] of actual.input.history.entries())if(m.direction==='inbound')await store.ingest({phone,id:'fixture-'+i,text:m.text,manual:true});
 const groups=new Map();
 for(const entry of actual.metadata.claimLedger){
  const id=entry.id.replace(/\.\d+$/,'');
  const parts=groups.get(id)||[];
  const {text,commitment,domain,evidence,reason,missingAction,acceptable}=entry;
  parts.push({text,commitment,domain,evidence,reason,missingAction,acceptable});groups.set(id,parts);
 }
 const review={claimAudit:[...groups].map(([id,parts])=>({id,parts})),quality:actual.metadata.qualityAssessment,feedback:actual.metadata.semanticFeedback,questionCount:1,unsupportedClaims:[],wrongIdentity:false,repeatedQuestion:false,pressureAfterRefusal:false,genericApproach:false,strategyConsistent:true};
 const candidate=actual.generatedCandidates[0];
 const fetcher=async(_url,options)=>{
  calls++;assert.ok(calls<=2,'no unexpected provider retry');
  const isReview=!!JSON.parse(options.body).generationConfig.responseSchema.properties.claimAudit;
  const body=isReview?review:{...candidate.decision,text:candidate.text};
  return {ok:true,status:200,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(body)}]}}]})};
 };
 app=createApp({store,metaSecret:'synthetic-meta',verifyToken:'synthetic-verify',adminKey:'synthetic-local-api-key-123',aiConfig:{geminiApiKey:'synthetic-replay-only'},fetcher});
 await new Promise(r=>app.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+app.address().port+'/api/conversations/'+phone;
 const headers={authorization:'Bearer synthetic-local-api-key-123','content-type':'application/json'};
 assert.equal((await fetch(url+'/draft',{method:'POST'})).status,401);
 const response=await fetch(url+'/draft',{method:'POST',headers,body:'{}'});assert.equal(response.status,200);
 const result=await response.json();assert.equal(result.created,true);assert.equal(result.draft.text,actual.response);
 assert.equal(result.draft.generationMeta.qualityReview,'gemini_semantic_and_local');assert.equal(calls,2);
 const reopened=await createPostgresStore('synthetic',{pool});const saved=await reopened.get(phone);
 assert.equal(saved.mode,'HUMAN');assert.equal(saved.drafts.length,1);
 assert.deepEqual(saved.drafts[0].generationMeta.claimLedger,result.draft.generationMeta.claimLedger);
 const again=await (await fetch(url+'/draft',{method:'POST',headers,body:'{}'})).json();assert.equal(again.created,false);assert.equal(calls,2);
 const editText=actual.response+' Posso aguardar sua avaliação.';
 const edit=await (await fetch(url+'/drafts/'+result.draft.id+'/edit',{method:'POST',headers,body:JSON.stringify({text:editText,expectedVersion:result.draft.conversationVersion})})).json();
 assert.equal(edit.updated,true);assert.ok((await reopened.get(phone)).drafts.some(d=>d.text===editText));
 assert.equal((await fetch(url+'/send',{method:'POST',headers})).status,404);
 await store.ingest({phone,id:'fixture-optout',text:'Não me mande mais mensagens.',manual:true});
 const blocked=await (await fetch(url+'/draft',{method:'POST',headers,body:'{}'})).json();assert.equal(blocked.created,false);assert.equal(calls,2);
 await store.setArchived(phone,true);await store.setArchived(phone,false);assert.equal((await reopened.get(phone)).optedOut,true);
 }finally{if(app)await new Promise(r=>app.close(r));await db.close();}
});
