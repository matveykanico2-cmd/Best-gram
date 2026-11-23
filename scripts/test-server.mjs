import { createServer } from 'node:http';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { DatabaseSync } from 'node:sqlite';
import { WebSocketServer } from 'ws';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDir = resolve(process.env.RETRYNET_DATA_DIR || join(root, 'data'));
const dbPath = resolve(process.env.RETRYNET_DB_PATH || join(dataDir, 'retrynet.sqlite'));
const mediaDir = resolve(process.env.RETRYNET_MEDIA_DIR || join(dataDir, 'media'));
const port = Number(process.env.RETRYNET_PORT || 4173);
const host = process.env.RETRYNET_HOST || '0.0.0.0';
await mkdir(mediaDir, { recursive: true });
const database = new DatabaseSync(dbPath);
database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
for (const name of (await readdir(join(root, 'drizzle'))).filter(x => x.endsWith('.sql')).sort()) {
  try { database.exec(await readFile(join(root, 'drizzle', name), 'utf8')); } catch (error) { if (!/already exists|duplicate column/i.test(String(error))) throw error; }
}
database.exec(`
CREATE TABLE IF NOT EXISTS feed_hidden_posts (user_id TEXT NOT NULL,post_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,post_id));
CREATE TABLE IF NOT EXISTS post_audience_users (post_id TEXT NOT NULL,user_id TEXT NOT NULL,PRIMARY KEY(post_id,user_id));
CREATE TABLE IF NOT EXISTS favorite_friends (user_id TEXT NOT NULL,friend_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,friend_id));
CREATE TABLE IF NOT EXISTS comment_features (comment_id TEXT PRIMARY KEY,media_url TEXT,gif_url TEXT,mentions_json TEXT NOT NULL DEFAULT '[]',pinned INTEGER NOT NULL DEFAULT 0,hidden INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS post_settings (post_id TEXT PRIMARY KEY,commenting TEXT NOT NULL DEFAULT 'everyone',moderation_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS story_features (story_id TEXT PRIMARY KEY,music_url TEXT,stickers_json TEXT NOT NULL DEFAULT '[]',filter_name TEXT,drawing_json TEXT,links_json TEXT,archived_at TEXT);
CREATE TABLE IF NOT EXISTS story_hidden_users (story_id TEXT NOT NULL,user_id TEXT NOT NULL,PRIMARY KEY(story_id,user_id));
CREATE TABLE IF NOT EXISTS media_interactions (user_id TEXT NOT NULL,target_type TEXT NOT NULL,target_id TEXT NOT NULL,action TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,target_type,target_id,action));
CREATE TABLE IF NOT EXISTS reel_features (reel_id TEXT PRIMARY KEY,music_url TEXT,text_overlay TEXT,effect_name TEXT,filter_name TEXT,speed REAL NOT NULL DEFAULT 1,clip_urls_json TEXT NOT NULL DEFAULT '[]',views INTEGER NOT NULL DEFAULT 0,monetization_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS video_features (video_id TEXT PRIMARY KEY,quality_json TEXT NOT NULL DEFAULT '{}',autoplay INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS message_features (message_id TEXT PRIMARY KEY,pinned INTEGER NOT NULL DEFAULT 0,forwarded_from_id TEXT,sticker TEXT,gif_url TEXT);
CREATE TABLE IF NOT EXISTS message_receipts (message_id TEXT NOT NULL,user_id TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(message_id,user_id));
CREATE TABLE IF NOT EXISTS typing_status (conversation_id TEXT NOT NULL,user_id TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(conversation_id,user_id));
CREATE TABLE IF NOT EXISTS conversation_settings (conversation_id TEXT NOT NULL,user_id TEXT NOT NULL,notifications INTEGER NOT NULL DEFAULT 1,blocked INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(conversation_id,user_id));
CREATE TABLE IF NOT EXISTS call_settings (call_id TEXT NOT NULL,user_id TEXT NOT NULL,microphone INTEGER NOT NULL DEFAULT 1,camera INTEGER NOT NULL DEFAULT 1,screen_share INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(call_id,user_id));
CREATE TABLE IF NOT EXISTS group_features (group_id TEXT PRIMARY KEY,avatar_url TEXT,cover_url TEXT,rules TEXT,moderation_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS group_requests (group_id TEXT NOT NULL,user_id TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(group_id,user_id));
CREATE TABLE IF NOT EXISTS group_invites (group_id TEXT NOT NULL,user_id TEXT NOT NULL,invited_by TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(group_id,user_id));
CREATE TABLE IF NOT EXISTS page_roles (page_id TEXT NOT NULL,user_id TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'editor',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(page_id,user_id));
CREATE TABLE IF NOT EXISTS page_features (page_id TEXT PRIMARY KEY,contact_json TEXT NOT NULL DEFAULT '{}',address TEXT,hours_json TEXT NOT NULL DEFAULT '{}',buttons_json TEXT NOT NULL DEFAULT '[]',moderation_json TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS media_comments (id TEXT PRIMARY KEY,target_type TEXT NOT NULL,target_id TEXT NOT NULL,user_id TEXT NOT NULL,body TEXT NOT NULL,parent_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS group_posts (group_id TEXT NOT NULL,post_id TEXT NOT NULL,author_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(group_id,post_id));
CREATE TABLE IF NOT EXISTS page_posts (page_id TEXT NOT NULL,post_id TEXT NOT NULL,author_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(page_id,post_id));
CREATE TABLE IF NOT EXISTS page_messages (id TEXT PRIMARY KEY,page_id TEXT NOT NULL,sender_id TEXT NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS feature_items (id TEXT PRIMARY KEY,target_type TEXT NOT NULL,target_id TEXT NOT NULL,user_id TEXT NOT NULL,kind TEXT NOT NULL,payload_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
`);

const db = { prepare(sql) { const statement = database.prepare(sql); const execute = (...args) => { const result = statement.run(...args); return { meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid || 0) } }; }; return { run: async () => execute(), bind(...args) { return { first: async () => statement.get(...args) || null, all: async () => ({ results: statement.all(...args) }), run: async () => execute(...args) }; } }; }, batch(statements) { return Promise.all(statements.map(statement => statement.run())); } };
const bucket = { async put(key, body) { const target = resolve(mediaDir, key); if (!target.startsWith(mediaDir)) throw new Error('invalid_media_path'); await mkdir(join(target, '..'), { recursive: true }); const chunks = []; for await (const chunk of Readable.fromWeb(body)) chunks.push(Buffer.from(chunk)); await writeFile(target, Buffer.concat(chunks)); }, async get(key) { const target = resolve(mediaDir, key); if (!target.startsWith(mediaDir)) return null; try { return { body: Readable.toWeb(createReadStream(target)), httpMetadata: { contentType: 'application/octet-stream' } }; } catch { return null; } } };
const worker = (await import('../dist/server/index.js')).default;
const env = { DB: db, BUCKET: bucket };
const server = createServer(async (request, response) => { try { const method = request.method || 'GET'; const init = { method, headers: request.headers }; if (!['GET', 'HEAD'].includes(method)) { init.body = Readable.toWeb(request); init.duplex = 'half'; } const result = await worker.fetch(new Request(`http://${request.headers.host || 'localhost'}${request.url || '/'}`, init), env); response.writeHead(result.status, Object.fromEntries(result.headers)); if (result.body) Readable.fromWeb(result.body).pipe(response); else response.end(); } catch (error) { response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' }); response.end(JSON.stringify({ error: 'local_server_error', message: error.message })); } });
const sockets = new Set(); const websocket = new WebSocketServer({ noServer: true }); websocket.on('connection', socket => { sockets.add(socket); socket.on('message', message => { for (const peer of sockets) if (peer.readyState === 1) peer.send(message.toString()); }); socket.on('close', () => sockets.delete(socket)); }); server.on('upgrade', (request, socket, head) => { if (new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname !== '/api/realtime') return socket.destroy(); websocket.handleUpgrade(request, socket, head, client => websocket.emit('connection', client, request)); });
server.listen(port, host, () => console.log(`RetryNet server: http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}`));
