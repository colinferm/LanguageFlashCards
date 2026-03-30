/* ==========================================================================
   Service Worker – German Flashcards PWA
   Strategy:
     • On install  → pre-cache the app shell (local assets only)
     • On activate → delete any caches from previous versions
     • On fetch    → cache-first for same-origin assets;
                     network-first (falling back to cache) for CDN resources
   ========================================================================== */

var CACHE_VERSION = 'v1';
var CACHE_NAME    = 'german-flashcards-' + CACHE_VERSION;

// Local assets that make up the app shell.
// These are pre-cached at install time so the app works offline immediately.
var APP_SHELL = [
  '/',
  '/index.html',
  '/js/app.bundle.js',
  '/css/app.css',
  '/icons/icon.svg',
  '/manifest.json'
];

// ---------------------------------------------------------------------------
// Install – pre-cache app shell
// ---------------------------------------------------------------------------
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      // Activate immediately rather than waiting for old tabs to close
      return self.skipWaiting();
    })
  );
});

// ---------------------------------------------------------------------------
// Activate – remove stale caches from previous versions
// ---------------------------------------------------------------------------
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key)   { return caches.delete(key);   })
      );
    }).then(function () {
      // Take control of all open clients without requiring a page reload
      return self.clients.claim();
    })
  );
});

// ---------------------------------------------------------------------------
// Fetch – serve from cache when possible
// ---------------------------------------------------------------------------
self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  if (url.origin === self.location.origin) {
    // -----------------------------------------------------------------------
    // Same-origin assets: cache-first, then network
    // On a network hit the response is stored so it is available offline.
    // -----------------------------------------------------------------------
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached;

        return fetch(request).then(function (response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
  } else {
    // -----------------------------------------------------------------------
    // Cross-origin (CDN) resources: network-first, fall back to cache
    // This keeps Bootstrap/jQuery/Backbone up-to-date when online while
    // still allowing the app to run offline after the first visit.
    // -----------------------------------------------------------------------
    event.respondWith(
      fetch(request).then(function (response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request);
      })
    );
  }
});
