const CACHE = 'bestgram-shell-v2'
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/', '/index.html', '/best-gram-mark.svg', '/manifest.webmanifest']))) })
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()) })
self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => list[0]?.focus() || clients.openWindow('/messages'))) })
self.addEventListener('fetch', event => { if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return; event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response || caches.match('/index.html')))) })
