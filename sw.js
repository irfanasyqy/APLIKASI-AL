// ========== SERVICE WORKER ==========
const CACHE_NAME = 'al-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/config.js',
  '/css/style.css',
  '/css/login.css'
  // Hapus file JS dan pages/ dulu karena bisa error
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        // Cache each file individually, catch errors
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.log(`Failed to cache: ${url}`, err))
          )
        );
      })
  );
});

// Fetch dari cache (dengan fallback ke network)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Fallback untuk offline
          return caches.match('/');
        });
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