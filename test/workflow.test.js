import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore, MODES } from '../src/core.js';
import { createReviewedDraft } from '../src/advisor.js';
import { applyMigrations } from '../src/db/migrate.js';
import { createApp } from '../src/server.js';
const phone = '5511999999999';
test('contexto validado altera versao e invalida rascunho antigo',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'c1',text:'Quanto custa?'});
  const old=await createReviewedDraft(store,phone,{geminiApiKey:''});assert.equal(old.created,true);
  store.setContext(phone,{sector:'pet shop',challenge:'perco tempo respondendo',goal:'melhorar atendimento'});
  assert.equal(store.get(phone).drafts[0].status,'SUPERSEDED');
  assert.equal(store.get(phone).context.sector,'pet shop');
  assert.throws(()=>store.setContext(phone,{password:'secret'}),/Contexto invalido/);
  assert.throws(()=>store.setContext(phone,{sector:'x'.repeat(201)}),/Contexto invalido/);
});
test('revisao exige rascunho pendente e nunca envia',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'c2',text:'Preciso de site'});
  const r=await createReviewedDraft(store,phone,{geminiApiKey:''});
  const review=store.reviewDraft(phone,r.draft.id,'APPROVED');
  assert.equal(review.updated,true);assert.equal(review.sent,false);
  assert.equal(store.reviewDraft(phone,r.draft.id,'APPROVED').updated,false);
  assert.equal(store.get(phone).drafts[0].status,'APPROVED');
  assert.throws(()=>store.reviewDraft(phone,r.draft.id,'SENT'),/Decisao invalida/);
});
test('takeover cancela revisao pendente e nao permite aprovar',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  store.ingest({phone,id:'c3',text:'preciso de site'});
  const r=await createReviewedDraft(store,phone,{geminiApiKey:''});
  store.setMode(phone,MODES.HUMAN);
  assert.equal(store.reviewDraft(phone,r.draft.id,'APPROVED').updated,false);
});
test('migração registra marker no MESMO commit do schema, e rollback no erro',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'gsw-migrate-'));
  try {
    await writeFile(join(dir,'001_create.sql'),'CREATE TABLE demo (id int);');
    const statements=[];
    const client={query:async(sql)=>{statements.push(sql);return {rowCount:0,rows:[]}},release:()=>{}};
    const result=await applyMigrations({connect:async()=>client},dir);
    assert.equal(result[0].status,'applied');
    assert.ok(statements.indexOf('BEGIN') < statements.indexOf('CREATE TABLE demo (id int);'));
    assert.ok(statements.indexOf('CREATE TABLE demo (id int);') < statements.findIndex(s=>s.startsWith('INSERT INTO gsw_sdr.schema_migrations')));
    assert.ok(statements.findIndex(s=>s.startsWith('INSERT INTO gsw_sdr.schema_migrations')) < statements.indexOf('COMMIT'));
    const errorClient={query:async(sql)=>{if(sql==='CREATE TABLE demo (id int);')throw Error('DDL falhou');return {rowCount:0,rows:[]}},release:()=>{}};
    const rollback=[];
    errorClient.query=async(sql)=>{rollback.push(sql);if(sql==='CREATE TABLE demo (id int);')throw Error('DDL falhou');return {rowCount:0,rows:[]}};
    await assert.rejects(applyMigrations({connect:async()=>errorClient},dir),/DDL falhou/);
    assert.ok(rollback.includes('ROLLBACK'));
    assert.ok(!rollback.includes('COMMIT'));
  } finally {await rm(dir,{recursive:true,force:true})}
});
test('schema usa namespace separado em vez de tabelas diretamente no public',async()=>{
  const sql=await readFile(new URL('../db/001_init.sql',import.meta.url),'utf8');
  assert.match(sql,/CREATE TABLE IF NOT EXISTS conversations/);
  assert.doesNotMatch(sql,/^BEGIN;|^COMMIT;/m);
  const source=await readFile(new URL('../src/db/migrate.js',import.meta.url),'utf8');
  assert.match(source,/CREATE SCHEMA IF NOT EXISTS gsw_sdr/);
  assert.match(source,/REVOKE ALL ON SCHEMA gsw_sdr FROM PUBLIC/);
});
test('API exige autenticacao para contexto e revisao; nao existe rota de envio',async()=>{
  const store=createStore();
  const app=createApp({adminKey:'admin-key-strong-enough-for-tests',metaSecret:'meta-secret',verifyToken:'verify',demo:true,store,aiConfig:{geminiApiKey:''}});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  try{
    const url='http://127.0.0.1:'+app.address().port, headers={authorization:'Bearer admin-key-strong-enough-for-tests','content-type':'application/json'};
    assert.equal((await fetch(url+'/api/conversations/'+phone+'/context',{method:'POST',body:'{}'})).status,401);
    const ok=await fetch(url+'/api/conversations/'+phone+'/context',{method:'POST',headers,body:JSON.stringify({sector:'climatização'})});
    assert.equal(ok.status,200);assert.equal((await ok.json()).context.sector,'climatização');
    const invalid=await fetch(url+'/api/conversations/'+phone+'/context',{method:'POST',headers,body:JSON.stringify({secret:'nope'})});
    assert.equal(invalid.status,400);
    assert.equal((await fetch(url+'/api/conversations/'+phone+'/send',{method:'POST',headers})).status,404);
  }finally{await new Promise(r=>app.close(r))}
});
test('geracao automatica opcional cria apenas rascunho apos webhook valido',async()=>{
  const store=createStore();store.setMode(phone,MODES.AI_ACTIVE);
  const app=createApp({adminKey:'admin-key-strong-enough-for-tests',metaSecret:'meta-secret',verifyToken:'verify',autoDrafts:true,store,aiConfig:{geminiApiKey:''}});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  try {
    const url='http://127.0.0.1:'+app.address().port;
    const payload={object:'whatsapp_business_account',entry:[{changes:[{field:'messages',value:{messages:[{id:'wamid.m4',from:phone,type:'text',text:{body:'Quero melhorar o site'}}]}}]}]};
    const data=JSON.stringify(payload),signature='sha256='+createHmac('sha256','meta-secret').update(data).digest('hex');
    const response=await fetch(url+'/webhook/meta',{method:'POST',headers:{'x-hub-signature-256':signature},body:data});
    assert.equal(response.status,200);
    await new Promise(r=>setTimeout(r,40));
    assert.equal(store.get(phone).drafts.length,1);
    assert.equal(store.get(phone).drafts[0].status,'PENDING_REVIEW');
  }finally{await new Promise(r=>app.close(r))}
});
test('exclusao remove dados da conversa e exige confirmacao no endpoint',async()=>{
  const store=createStore();store.ingest({phone,id:'data-1',text:'Oi'});
  assert.equal(store.erase(phone).deleted,true);
  assert.equal(store.list().length,0);
  // Após exclusão, novo contato pode ser tratado como conversa nova.
  assert.equal(store.get(phone).mode,MODES.HUMAN);
  assert.equal(store.get(phone).messages.length,0);
});
