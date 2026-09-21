const CACHE_PREFIX = 'aghbari-shell-';
const VERSION = (new URL(self.location.href).searchParams.get('v') || 'fallback').replace(/[^a-zA-Z0-9._-]/g, '_');
const CACHE = `${CACHE_PREFIX}${VERSION}`;
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/offline.html'];
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'worker']);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key))
    ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/auth/')) return;

  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';
  const isStaticAsset = STATIC_DESTINATIONS.has(event.request.destination);
  if (!isNavigation && !isStaticAsset) return;

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached ?? caches.match('/offline.html')))
  );
});
