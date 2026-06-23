const CACHE = 'hejiu-v1';
const ASSETS = [
  '/', '/index.html', '/app.js', '/style.css',
  '/manifest.json',
  '/js/store.js', '/js/router-core.js', '/js/api.js',
  '/js/utils.js', '/js/home.js', '/js/china.js',
  '/js/world.js', '/js/pub.js', '/js/search.js',
  '/js/categories.js', '/js/tags.js', '/js/liquor.js',
  '/zh/index.json', '/zh/world/continents.json',
  '/zh/world/countries.json', '/zh/china/china_index.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || fetchPromise;
    })
  );
});