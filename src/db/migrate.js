import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Todas as tabelas ficam em gsw_sdr, não no schema public exposto pelo Supabase.
// A migração e o registro são atômicos; uma falha não marca a migração como aplicada.
export async function applyMigrations(pool, directory = fileURLToPath(new URL('../../db/', import.meta.url))) {
  const client = await pool.connect();
  const results = [];
  let locked = false;
  try {
    await client.query('SELECT pg_advisory_lock(7214820)');
    locked = true;
    await client.query('CREATE SCHEMA IF NOT EXISTS gsw_sdr');
    await client.query('REVOKE ALL ON SCHEMA gsw_sdr FROM PUBLIC');
    await client.query('CREATE TABLE IF NOT EXISTS gsw_sdr.schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    for (const filename of (await readdir(directory)).filter(f => /^\d+_.*\.sql$/.test(f)).sort()) {
      const already = await client.query('SELECT 1 FROM gsw_sdr.schema_migrations WHERE filename=$1', [filename]);
      if (already.rowCount) { results.push({ filename, status: 'already-applied' }); continue; }
      await client.query('BEGIN');
      try {
        await client.query('SET LOCAL search_path TO gsw_sdr');
        const sql = await readFile(path.join(directory, filename), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO gsw_sdr.schema_migrations(filename) VALUES($1)', [filename]);
        await client.query('COMMIT');
        results.push({ filename, status: 'applied' });
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        throw e;
      }
    }
    return results;
  } finally {
    if (locked) await client.query('SELECT pg_advisory_unlock(7214820)').catch(() => {});
    client.release();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não configurada. Nenhuma migração foi aplicada.');
    process.exitCode = 1;
  } else {
    let pool;
    try {
      const { Pool } = await import('pg');
      pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 10000 });
      for (const item of await applyMigrations(pool)) console.log(item.status, item.filename);
    } catch (e) {
      console.error('Falha na migração:', e.message);
      process.exitCode = 1;
    } finally { if (pool) await pool.end(); }
  }
}
