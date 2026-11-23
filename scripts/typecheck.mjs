import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const files = ['scripts/test-server.mjs', 'worker/index.js', 'scripts/build-worker.mjs', 'tests/smoke.mjs'];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
await readFile('dist/index.html', 'utf8');
console.log('TYPECHECK_PASS', JSON.stringify({ files: files.length }));
