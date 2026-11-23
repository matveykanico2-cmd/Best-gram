import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const template = await readFile(resolve(root, 'worker/index.js'), 'utf8');
const page = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const output = template.replace('"__EMBEDDED_HTML__"', JSON.stringify(page));
await mkdir(resolve(root, 'dist/server'), { recursive: true });
await mkdir(resolve(root, 'dist/.openai'), { recursive: true });
await writeFile(resolve(root, 'dist/server/index.js'), output);
await writeFile(resolve(root, 'dist/.openai/hosting.json'), await readFile(resolve(root, '.openai/hosting.json')));
console.log('Built Worker:', Buffer.byteLength(output), 'bytes');
