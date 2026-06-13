// ========== SERVICE WORKER ==========
const CACHE_NAME = 'al-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/config.js',
  '/css/style.css',
  '/css/login.css',
  '/js/data.js',
  '/js/supplier.js',
  '/js/customer.js',
  '/js/transfer.js',
  '/js/tukar-faktur.js',
  '/js/tanda-terima.js',
  '/js/riwayat.js',
  '/js/export.js',
  '/pages/transfer.html',
  '/pages/supplier.html',
  '/pages/customer.html',
  '/pages/tukar-faktur.html',
  '/pages/tanda-terima.html',
  '/pages/cetak-label.html',
  '/pages/riwayat.html',
  '/pages/statistik.html',
  '/pages/users.html',
  '/pages/backup.html',
  '/pages/notifikasi.html',
  '/pages/activity-log.html'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch dari cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});