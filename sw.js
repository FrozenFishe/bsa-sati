// Offline-first cache for the app shell.
const CACHE = 'sati-v6';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'content.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'fonts/fraunces-latin.woff2', 'fonts/fraunces-latin-ext.woff2', 'art/home.webp', 'art/garden.webp', 'art/sit.webp', 'art/session.webp', 'art/guard.webp', 'art/pause.webp', 'art/learn.webp', 'art/stones.webp', 'art/focus.webp', 'art/complete.webp', 'art/stats.webp', 'art/evening.webp', 'privacy.html', 'support.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  // Network first for our own files so updates arrive; cache fallback offline.
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
