const CACHE_NAME = 'frontier-os-v6-core';
const DYNAMIC_CACHE = 'frontier-os-v6-dynamic';
const MAX_DYNAMIC_ITEMS = 50; // Cache size limit

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  'icon.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                .map(name => caches.delete(name))
    ))
  );
  self.clients.claim();
});

// Helper function to prevent Dynamic Cache bloating
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
};

self.addEventListener('fetch', (event) => {
  // Exclude CDNs from manual dynamic caching (they manage their own caching headers)
  if (event.request.url.includes('cdn.tailwindcss.com') || event.request.url.includes('cdnjs.cloudflare.com')) {
      return; 
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
      return cachedResponse || networkFetch;
    })
  );
});
