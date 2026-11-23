import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../worker/index.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../.openai/hosting.json', import.meta.url), 'utf8'));

if (!manifest.project_id || manifest.d1 !== 'DB' || manifest.r2 !== 'BUCKET') throw new Error('hosting bindings are incomplete');
for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1], { filename: 'dist/index.html' });

const workerRoutes = ['/api/auth/register', '/api/auth/login', '/api/feed', '/api/recommendations', '/api/posts', '/api/messages', '/api/conversations', '/api/stories', '/api/reels', '/api/videos', '/api/drafts', '/api/scheduled', '/api/groups', '/api/pages', '/api/calls', '/api/moderation', '/api/media'];
for (const route of workerRoutes) if (!worker.includes(route.split('/').filter(Boolean)[1])) {
  const resource = route.split('/')[2];
  if (!worker.includes(`resource === '${resource}'`)) throw new Error(`missing worker resource: ${resource}`);
}
for (const hook of ['apiRequest', 'localStorage', 'WebSocket', '/api/media', 'storyMediaInput', 'loadServerStories', 'storyViewers', 'storyDelete', '/stories/', 'reelVideoInput', '/reels', '/videos', 'loadMarketplace', 'loadEvents', 'loadGroupsAndPages', 'ensurePageCreateButton', 'data-create-page', 'ensureFriendListButton', 'data-create-friend-list', '/friend-lists', 'loadFriends', 'friend-remove', '/friends', 'loadSaved', 'universalSearchTimer', '/search-history', 'listing-save', 'event-attend', 'group-join', 'page-follow', 'friend-accept', 'comment-react', 'comment-reply', 'report-post', '/reports', 'notification-delete', '/notifications/', 'activeCallId', 'data-call-kind', '/calls', '/drafts', '/scheduled', 'renderServerChats', 'messagePollTimer', 'chatAttach', 'chatMediaUrl', 'postAudience', 'privacy-choice', '/messages?conversation_id=', '/recommendations?limit=30', 'loadMoreFeed', 'before=']) if (!html.includes(hook)) throw new Error(`missing frontend hook: ${hook}`);
for (const invariant of ['file.size>25*1024*1024', 'unsupported_media_type', 'deleted_at IS NULL', 'message_reaction', 'comment_reaction', 'new_message', 'next_before', 'post_media', 'cover_url', 'links_json', "result_type", 'search-history', 'friend-lists', 'friend_id_required', 'story_views', 'story_not_found', 'media_url', 'parent_id', 'const pick=', "resource === 'comments'", "request.method === 'DELETE'", "p.audience='public'", 'friendships f', 'x-content-type-options', 'x-frame-options', 'permissions-policy']) if (!worker.includes(invariant)) throw new Error(`missing backend invariant: ${invariant}`);

execFileSync(process.execPath, ['--check', 'dist/server/index.js'], { stdio: 'inherit' });
console.log('SMOKE_PASS', JSON.stringify({ workerBytes: worker.length, htmlBytes: html.length, routeCount: workerRoutes.length }));
