/* Technicals service worker: caches the whole app so it works offline.
   Run node tools/bump.js before every deploy. It raises VERSION and rebuilds ASSETS from index.html,
   and the new version makes installed copies show "Update ready". Progress in localStorage is never touched. */
const VERSION = 6;
const CACHE = `technicals-v${VERSION}`;
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  'styles.css',
  'deck.js',
  'data/ib-acct.js',
  'data/ib-acct-adv.js',
  'data/ib-comps.js',
  'data/ib-credit.js',
  'data/ib-dcf.js',
  'data/ib-ev.js',
  'data/ib-lbo.js',
  'data/ib-ma.js',
  'data/ib-model.js',
  'data/ib-precedents.js',
  'data/ib-process.js',
  'data/ib-ratios.js',
  'data/ib-rx.js',
  'data/ib-sectors.js',
  'data/ib-val.js',
  'data/ib-wacc.js',
  'data/ib-walk.js',
  'data/re-acct.js',
  'data/re-acq.js',
  'data/re-am.js',
  'data/re-basics.js',
  'data/re-deals.js',
  'data/re-debt.js',
  'data/re-dev.js',
  'data/re-leases.js',
  'data/re-market.js',
  'data/re-model.js',
  'data/re-noi.js',
  'data/re-returns.js',
  'data/re-val.js',
  'data/hotel-agreements.js',
  'data/hotel-am.js',
  'data/hotel-basics.js',
  'data/hotel-capex.js',
  'data/hotel-debt.js',
  'data/hotel-metrics.js',
  'data/hotel-rm.js',
  'data/hotel-usali.js',
  'data/hotel-val.js',
  'drills/engine.js',
  'drills/ib.js',
  'drills/re.js',
  'drills/hotel.js',
  'visuals.js',
  'app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the HTTP cache so a deploy never mixes old and new files.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('technicals-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The page sends this when you tap Reload on the "Update ready" prompt.
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('index.html', { cacheName: CACHE }).then((hit) => hit || fetch(req)));
    return;
  }
  event.respondWith(caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
