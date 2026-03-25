importScripts('version.js'); // Legge la versione dal file centrale

const CACHE_VERSION = 'v' + APP_VERSION;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;

const OFFLINE_URLS = ['index.html', './'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(PAGES_CACHE).then(cache => cache.addAll(OFFLINE_URLS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !k.includes(CACHE_VERSION)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
