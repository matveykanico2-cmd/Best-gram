import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.RETRYNET_PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = normalize(join(root, relative));
  if (!target.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
  try { const body = await readFile(target); response.writeHead(200, { 'content-type': types[extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' }); response.end(body); }
  catch { try { const body = await readFile(join(root,'index.html')); response.writeHead(200, { 'content-type':'text/html; charset=utf-8', 'cache-control':'no-store' }); response.end(body); } catch { response.writeHead(404, { 'content-type':'text/plain; charset=utf-8' }); response.end('Not found'); } }
});
server.listen(port, '127.0.0.1', () => console.log(`RetryNet test server: http://127.0.0.1:${port}`));
