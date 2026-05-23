const CACHE_NAME = 'hotaru-pwa-v2';
const ASSETS_TO_CACHE = [
  './',
  './hotaru_trial.html',
  './index_trial.html',
  './manifest.json',
  './sw.js',
  './background_hotaru.jpg',
  './bgm_summer.m4a'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Cache hit
      }
      return fetch(event.request).catch(() => {
        // Fallback for offline if network fails
        if (event.request.mode === 'navigate') {
          return caches.match('./hotaru_trial.html');
        }
      });
    })
  );
});
