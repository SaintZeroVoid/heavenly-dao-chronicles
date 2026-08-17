const CACHE = 'heavenly-dao-v4-loaderfix
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './css/design-system.css',
  './js/data.js',
  './js/app.js',
  './js/factions-extra.js',
  './js/sim.worker.js',
  './js/modules/ui.js',
  './js/modules/combat.js',
  './js/modules/graph.js',
  './js/modules/lineage.js',
  './js/modules/story.js',
  './manifest.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
