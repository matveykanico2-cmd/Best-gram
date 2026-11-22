const CACHE = 'bestgram-shell-v1'
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']))) })
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', event => { if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return; event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response || caches.match('/index.html')))) })
