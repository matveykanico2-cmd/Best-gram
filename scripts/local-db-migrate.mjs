import { mkdir, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDir = resolve(process.env.NEXORA_DATA_DIR || join(root, 'data'));
await mkdir(dataDir, { recursive: true });
const db = new DatabaseSync(resolve(process.env.NEXORA_DB_PATH || join(dataDir, 'nexora.sqlite')));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
for (const name of (await readdir(join(root, 'drizzle'))).filter(x => x.endsWith('.sql')).sort()) {
  try { db.exec(await readFile(join(root, 'drizzle', name), 'utf8')); } catch (error) { if (!/already exists|duplicate column/i.test(String(error))) throw error; }
  console.log(`Applied ${name}`);
}
console.log('DB_MIGRATE_PASS');
