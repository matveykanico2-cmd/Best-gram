import { readFile } from 'node:fs/promises';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL || 'postgres://nexora:nexora@127.0.0.1:5432/nexora' });
await client.connect();
try {
  await client.query(await readFile(new URL('../apps/api/drizzle/0000_initial.sql', import.meta.url), 'utf8'));
  console.log('POSTGRES_MIGRATION_PASS');
} finally { await client.end(); }
