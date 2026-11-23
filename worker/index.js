const page = "__EMBEDDED_HTML__";
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const hash = async (value) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
};
const readBody = async request => { try { return await request.json(); } catch { return {}; } };
const safeUser = row => row && ({ id: row.id, email: row.email, phone: row.phone, display_name: row.display_name, username: row.username, avatar_url: row.avatar_url });
const requireSession = async (request, env) => {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('cookie')?.match(/retrynet_session=([^;]+)/)?.[1];
  if (!token) return null;
  return env.DB.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?1 AND s.revoked_at IS NULL AND s.expires_at>?2`).bind(token, now()).first();
};
const route = (pathname, method) => {
  const parts = pathname.split('/').filter(Boolean);
  return { parts, resource: parts[1], action: parts[2], method };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (request.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS' } });
    const { resource, action } = route(url.pathname, request.method);
    try {
      if (resource === 'health') return json({ ok: true, service: 'retrynet-api', time: now() });
      if (resource === 'auth' && action === 'register' && request.method === 'POST') {
        const body = await readBody(request); if ((!body.email && !body.phone) || !body.password || !body.display_name || !body.username) return json({ error: 'email_or_phone_password_name_username_required' }, 400);
        const userId = id(); const passwordHash = await hash(body.password);
        await env.DB.batch([
          env.DB.prepare('INSERT INTO users (id,email,phone,password_hash,display_name,username) VALUES (?,?,?,?,?,?)').bind(userId, body.email || null, body.phone || null, passwordHash, body.display_name, body.username),
          env.DB.prepare('INSERT INTO profiles (user_id) VALUES (?)').bind(userId)
        ]);
        return json({ user: { id: userId, display_name: body.display_name, username: body.username }, verification_required: true }, 201);
      }
      if (resource === 'auth' && action === 'login' && request.method === 'POST') {
        const body = await readBody(request); const user = await env.DB.prepare('SELECT * FROM users WHERE email=?1 OR phone=?1').bind(body.identity).first();
        if (!user || user.password_hash !== await hash(body.password || '')) return json({ error: 'invalid_credentials' }, 401);
        const session = id(); await env.DB.prepare('INSERT INTO sessions (id,user_id,device_name,expires_at) VALUES (?,?,?,?)').bind(session, user.id, body.device_name || 'Web browser', new Date(Date.now() + 30 * 86400000).toISOString()).run();
        return new Response(JSON.stringify({ user: safeUser(user), session }), { headers: { 'content-type': 'application/json', 'set-cookie': `retrynet_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000` } });
      }
      if (resource === 'auth' && action === 'logout' && request.method === 'POST') {
        const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('cookie')?.match(/retrynet_session=([^;]+)/)?.[1];
        if (token) await env.DB.prepare('UPDATE sessions SET revoked_at=? WHERE id=?').bind(now(), token).run();
        return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json', 'set-cookie': 'retrynet_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0' } });
      }
      const user = await requireSession(request, env); if (!user) return json({ error: 'authentication_required' }, 401);
      if (resource === 'me' && request.method === 'GET') return json({ user: safeUser(user) });
      if (resource === 'profile' && request.method === 'GET') { const profile=await env.DB.prepare('SELECT u.id,u.display_name,u.username,u.avatar_url,p.* FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.id=?').bind(user.id).first(); return json({profile}); }
      if (resource === 'profile' && request.method === 'PATCH') { const body=await readBody(request); await env.DB.prepare('UPDATE profiles SET bio=?,city=?,hometown=?,education=?,work=?,relationship_status=?,birthday=?,privacy_json=?,professional_mode=? WHERE user_id=?').bind(body.bio||null,body.city||null,body.hometown||null,body.education||null,body.work||null,body.relationship_status||null,body.birthday||null,JSON.stringify(body.privacy||{}),body.professional_mode?1:0,user.id).run(); await env.DB.prepare('UPDATE users SET display_name=?,avatar_url=?,updated_at=? WHERE id=?').bind(body.display_name||user.display_name,body.avatar_url||user.avatar_url,now(),user.id).run(); return json({ok:true}); }
      if (resource === 'feed' && request.method === 'GET') {
        const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50); const rows = await env.DB.prepare(`SELECT p.*,u.display_name,u.username,u.avatar_url FROM posts p JOIN users u ON u.id=p.author_id WHERE p.archived_at IS NULL ORDER BY p.created_at DESC LIMIT ?`).bind(limit).all(); return json({ items: rows.results || [] });
      }
      if (resource === 'search' && request.method === 'GET') { const q=(url.searchParams.get('q')||'').trim(); if(q.length<2)return json({items:[]}); const rows=await env.DB.prepare('SELECT id,display_name,username,avatar_url FROM users WHERE deleted_at IS NULL AND (display_name LIKE ? OR username LIKE ?) LIMIT 20').bind(`%${q}%`,`%${q}%`).all(); return json({items:rows.results||[]}); }
      if (resource === 'posts' && request.method === 'POST') { const body = await readBody(request); const postId=id(); await env.DB.prepare('INSERT INTO posts (id,author_id,body,audience,location,mood,activity,poll_json) VALUES (?,?,?,?,?,?,?,?)').bind(postId,user.id,body.body||'',body.audience||'friends',body.location||null,body.mood||null,body.activity||null,body.poll_json?JSON.stringify(body.poll_json):null).run(); return json({ id:postId },201); }
      if (resource === 'posts' && action && route(url.pathname,request.method).parts[3] === 'comments' && request.method === 'POST') { const body=await readBody(request); const commentId=id(); await env.DB.prepare('INSERT INTO comments (id,post_id,author_id,parent_id,body) VALUES (?,?,?,?,?)').bind(commentId,action,user.id,body.parent_id||null,body.body||'').run(); return json({ id:commentId },201); }
      if (resource === 'posts' && action && route(url.pathname,request.method).parts[3] === 'reactions' && request.method === 'POST') { const body=await readBody(request); await env.DB.prepare('INSERT OR REPLACE INTO reactions (user_id,target_type,target_id,reaction) VALUES (?,?,?,?)').bind(user.id,'post',action,body.reaction||'like').run(); return json({ ok:true }); }
      if (resource === 'posts' && action && route(url.pathname,request.method).parts[3] === 'save' && request.method === 'POST') { await env.DB.prepare('INSERT OR REPLACE INTO saved_posts (user_id,post_id) VALUES (?,?)').bind(user.id,action).run(); return json({ ok:true }); }
      if (resource === 'saved' && request.method === 'GET') { const rows=await env.DB.prepare('SELECT s.*,p.body,p.author_id FROM saved_posts s JOIN posts p ON p.id=s.post_id WHERE s.user_id=? ORDER BY s.created_at DESC').bind(user.id).all(); return json({items:rows.results||[]}); }
      if (resource === 'stories' && request.method === 'GET') { const rows=await env.DB.prepare(`SELECT s.*,u.display_name,u.username,u.avatar_url FROM stories s JOIN users u ON u.id=s.author_id WHERE s.expires_at>? ORDER BY s.created_at DESC LIMIT 100`).bind(now()).all(); return json({items:rows.results||[]}); }
      if (resource === 'stories' && request.method === 'POST') { const body=await readBody(request); const storyId=id(); await env.DB.prepare('INSERT INTO stories (id,author_id,kind,media_url,body,audience,expires_at) VALUES (?,?,?,?,?,?,?)').bind(storyId,user.id,body.kind||'text',body.media_url||null,body.body||'',body.audience||'friends',new Date(Date.now()+86400000).toISOString()).run(); return json({id:storyId},201); }
      if (resource === 'reels' && request.method === 'GET') { const rows=await env.DB.prepare('SELECT r.*,u.display_name,u.username,u.avatar_url FROM reels r JOIN users u ON u.id=r.author_id ORDER BY r.created_at DESC LIMIT 50').all(); return json({items:rows.results||[]}); }
      if (resource === 'reels' && request.method === 'POST') { const body=await readBody(request); if(!body.video_url)return json({error:'video_url_required'},400); const reelId=id(); await env.DB.prepare('INSERT INTO reels (id,author_id,video_url,cover_url,caption,hashtags_json,duration_ms) VALUES (?,?,?,?,?,?,?)').bind(reelId,user.id,body.video_url,body.cover_url||null,body.caption||'',JSON.stringify(body.hashtags||[]),body.duration_ms||null).run(); return json({id:reelId},201); }
      if (resource === 'videos' && request.method === 'GET') { const rows=await env.DB.prepare('SELECT v.*,u.display_name,u.username,u.avatar_url FROM videos v JOIN users u ON u.id=v.author_id ORDER BY v.created_at DESC LIMIT 50').all(); return json({items:rows.results||[]}); }
      if (resource === 'videos' && request.method === 'POST') { const body=await readBody(request); if(!body.video_url)return json({error:'video_url_required'},400); const videoId=id(); await env.DB.prepare('INSERT INTO videos (id,author_id,video_url,title,description,subtitles_url) VALUES (?,?,?,?,?,?)').bind(videoId,user.id,body.video_url,body.title||'',body.description||'',body.subtitles_url||null).run(); return json({id:videoId},201); }
      if (resource === 'conversations' && request.method === 'GET') { const rows=await env.DB.prepare('SELECT c.* FROM conversations c JOIN conversation_members m ON m.conversation_id=c.id WHERE m.user_id=? ORDER BY c.created_at DESC').bind(user.id).all(); return json({items:rows.results||[]}); }
      if (resource === 'conversations' && request.method === 'POST') { const body=await readBody(request); const conversationId=id(); const members=[...new Set([user.id,...(Array.isArray(body.member_ids)?body.member_ids:[])])]; await env.DB.batch([env.DB.prepare('INSERT INTO conversations (id,title,avatar_url,is_group,created_by) VALUES (?,?,?,?,?)').bind(conversationId,body.title||null,body.avatar_url||null,members.length>2?1:0,user.id),...members.map(memberId=>env.DB.prepare('INSERT INTO conversation_members (conversation_id,user_id,role) VALUES (?,?,?)').bind(conversationId,memberId,memberId===user.id?'admin':'member'))]); return json({id:conversationId},201); }
      if (resource === 'messages' && request.method === 'GET') { const conversationId=url.searchParams.get('conversation_id'); const member=await env.DB.prepare('SELECT 1 FROM conversation_members WHERE conversation_id=? AND user_id=?').bind(conversationId,user.id).first(); if(!member)return json({error:'not_a_member'},403); const rows=await env.DB.prepare('SELECT * FROM messages WHERE conversation_id=? ORDER BY sent_at ASC LIMIT 100').bind(conversationId).all(); return json({items:rows.results||[]}); }
      if (resource === 'messages' && request.method === 'POST') { const body=await readBody(request); const messageId=id(); const member=await env.DB.prepare('SELECT 1 FROM conversation_members WHERE conversation_id=? AND user_id=?').bind(body.conversation_id,user.id).first(); if(!member)return json({error:'not_a_member'},403); await env.DB.prepare('INSERT INTO messages (id,conversation_id,sender_id,body,reply_to_id) VALUES (?,?,?,?,?)').bind(messageId,body.conversation_id,user.id,body.body||'',body.reply_to_id||null).run(); return json({id:messageId},201); }
      if (resource === 'friends' && request.method === 'POST') { const body=await readBody(request); await env.DB.prepare('INSERT OR REPLACE INTO friendships (user_id,friend_id,status,requested_by,updated_at) VALUES (?,?,?,?,?)').bind(user.id,body.friend_id,'pending',user.id,now()).run(); return json({ok:true},201); }
      if (resource === 'friends' && request.method === 'PATCH') { const body=await readBody(request); const status=['accepted','declined','blocked'].includes(body.status)?body.status:'declined'; await env.DB.prepare('UPDATE friendships SET status=?,updated_at=? WHERE user_id=? AND friend_id=?').bind(status,now(),body.user_id||user.id,body.friend_id).run(); return json({ok:true}); }
      if (resource === 'notifications' && request.method === 'GET') { const rows=await env.DB.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50').bind(user.id).all(); return json({items:rows.results||[]}); }
      if (resource === 'reports' && request.method === 'POST') { const body=await readBody(request); if(!body.target_type||!body.target_id||!body.reason)return json({error:'report_fields_required'},400); const reportId=id(); await env.DB.prepare('INSERT INTO reports (id,reporter_id,target_type,target_id,reason) VALUES (?,?,?,?,?)').bind(reportId,user.id,body.target_type,body.target_id,body.reason).run(); return json({id:reportId},201); }
      return json({ error: 'not_found' }, 404);
    } catch (error) { return json({ error: 'server_error', message: error instanceof Error ? error.message : String(error) }, 500); }
  }
};
