const CACHE = 'heavenly-dao-v3-loadfix';
const ASSETS = ['./','./index.html','./css/styles.css','./js/data.js','./js/app.js','./js/factions-extra.js','./manifest.json','./js/sim.worker.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
