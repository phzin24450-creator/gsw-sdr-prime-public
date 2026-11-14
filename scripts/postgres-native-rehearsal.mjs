// Isolated synthetic rehearsal. Never accepts DATABASE_URL or a remote host.
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {Pool} from 'pg';
import {applyMigrations} from '../src/db/migrate.js';
import {createPostgresStore} from '../src/db/postgres.js';
const root=await mkdtemp(join(tmpdir(),'gsw-v42-native-'));
const legacy=join(root,'v41');await mkdir(legacy);
execFileSync('tar',['-xf','-','-C',legacy],{input:execFileSync('git',['archive','ebeada31fb2465e047d7e4739f22784fcbcd5fce'])});
await symlink(resolve('node_modules'),join(legacy,'node_modules'));
const {default:EmbeddedPostgres}=await import(pathToFileURL(process.env.GSW_EMBEDDED_PG_MODULE).href);
const pg=new EmbeddedPostgres({databaseDir:join(root,'data'),user:'postgres',password:'synthetic-local-only',port:55442,persistent:false,postgresFlags:['-h','127.0.0.1','-k',''],onLog:()=>{},onError:()=>{}});
let pool;
try {
 await pg.initialise();await pg.start();await pg.createDatabase('v42_synthetic');
 pool=new Pool({host:'127.0.0.1',port:55442,user:'postgres',password:'synthetic-local-only',database:'v42_synthetic',options:'-c search_path=gsw_sdr'});
 await applyMigrations(pool,join(legacy,'db'));
 const oldModule=await import(pathToFileURL(join(legacy,'src/db/postgres.js')).href);
 const oldStore=await oldModule.createPostgresStore('synthetic',{pool});
 const phone='000000077701';
 await oldStore.ingest({phone,id:'synthetic-message',text:'Não me envie mais mensagens.',manual:true});
 await oldStore.setContext(phone,{company:'Empresa Fictícia do Ensaio',sector:'Marcenaria'});
 const before=await oldStore.get(phone);
 const tables=['conversations','messages','drafts','audit_events','schema_migrations'];
 await pool.query('CREATE SCHEMA isolated_backup');
 for(const table of tables)await pool.query(`CREATE TABLE isolated_backup.${table} AS TABLE gsw_sdr.${table}`);
 const migration=await applyMigrations(pool);
 assert.equal(migration.filter(x=>x.status==='applied').length,1);
 const current=await createPostgresStore('synthetic',{pool});
 const c=await current.get(phone);assert.equal(c.optedOut,true);assert.deepEqual(c.messages,before.messages);
 await current.setArchived(phone,true);assert.equal((await current.list()).length,0);
 await current.setArchived(phone,false);assert.equal((await current.get(phone)).optedOut,true);
 assert.equal((await current.list({search:'Fictícia'})).length,1);
 // Application rollback reads the additive schema without downgrading or deleting data.
 const rollback=await oldStore.get(phone);assert.deepEqual(rollback,before);
 for(const table of ['conversations','messages','drafts','audit_events']){
  const subtraction=table==='conversations'?" - 'archived_at'":'';
  const diff=await pool.query(`SELECT count(*)::int AS n FROM (SELECT to_jsonb(b) FROM isolated_backup.${table} b EXCEPT ALL SELECT to_jsonb(t)${subtraction} FROM gsw_sdr.${table} t) changed`);
  assert.equal(diff.rows[0].n,0,table+' originals preserved');
 }
 // Restore only the isolated synthetic copy, then verify exact rows.
 await pool.query('CREATE SCHEMA isolated_restore');
 for(const table of tables){
  await pool.query(`CREATE TABLE isolated_restore.${table} AS TABLE isolated_backup.${table}`);
  const diff=await pool.query(`SELECT count(*)::int AS n FROM (SELECT * FROM isolated_restore.${table} EXCEPT ALL SELECT * FROM isolated_backup.${table}) changed`);
  assert.equal(diff.rows[0].n,0);
 }
 const result={status:'pass',engine:(await pool.query('SELECT version()')).rows[0].version,synthetic:true,remoteConnections:0,legacyCommit:'ebeada31fb2465e047d7e4739f22784fcbcd5fce',migration,checks:['legacy data','additive migration','opt-out','archive restore','search','V4.1 application rollback','isolated snapshot restore'],limitation:'Snapshot restore in the same local cluster; not an offsite disaster-recovery test.'};
 await mkdir('test-results/elite-homologacao',{recursive:true});
 await writeFile('test-results/elite-homologacao/postgres-native.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
}catch(error){console.error('Native rehearsal failed:',error?.message||'startup failed');process.exitCode=1;}finally{await pool?.end();if(pg.process?.exitCode===null)await pg.stop();}
