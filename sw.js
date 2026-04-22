// Service worker — auto-updating strategy.
//
// Shell (HTML / JS / CSS) → network-first. Every launch, while online, pulls
// fresh code. Cache is used only as an offline fallback. This means pushing
// a new build to Vercel auto-propagates to all installed home-screen apps
// on the next open — no manual cache-version bumps required.
//
// Static media (images, rings, video, fonts) → cache-first. These rarely
// change; we revalidate quietly in the background so the cache stays warm.
//
// Data (league_data.json) → network-first with cache fallback, so fresh
// numbers show when online but the app still works on a plane.

var SHELL_CACHE  = 'bkgffl-shell-v1';   // intentionally static — we don't
var STATIC_CACHE = 'bkgffl-static-v1';  //   rely on version bumps any more
var DATA_CACHE   = 'bkgffl-data-v1';    //   because the fetch strategies
var FONTS_CACHE  = 'bkgffl-fonts-v1';   //   handle freshness directly.

var OFFLINE_SEED = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/favicon.svg',
  '/data/league_data.json'
];

// INSTALL: seed the cache with the offline essentials so a cold-start
// with no network still renders something. Any of these missing won't
// fail the install.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      return Promise.all(
        OFFLINE_SEED.map(function(url) {
          return cache.add(url).catch(function() { /* best-effort */ });
        })
      );
    }).then(function() { return self.skipWaiting(); })
  );
});

// ACTIVATE: drop any caches we no longer recognize, then claim clients so
// the new SW starts handling fetches immediately (not just next reload).
self.addEventListener('activate', function(event) {
  var keep = [SHELL_CACHE, STATIC_CACHE, DATA_CACHE, FONTS_CACHE];
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return keep.indexOf(k) === -1; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Network-first helper: try network, update cache on success, fall back
// to cached response on failure.
function networkFirst(event, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return fetch(event.request)
      .then(function(response) {
        if (response && response.status === 200 && response.type !== 'opaque') {
          cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(function() {
        return cache.match(event.request).then(function(cached) {
          return cached || cache.match('/index.html');
        });
      });
  });
}

// Cache-first helper: serve cached copy instantly; refresh in background.
function cacheFirst(event, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(event.request).then(function(cached) {
      var refresh = fetch(event.request)
        .then(function(response) {
          if (response && response.status === 200 && response.type !== 'opaque') {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(function() { return cached; });
      return cached || refresh;
    });
  });
}

// Listen for skipWaiting messages so the client can force a new SW to
// take over immediately when it wants to (used by the update toast).
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  var sameOrigin = url.origin === self.location.origin;

  // Google Fonts — stale-while-revalidate out of FONTS_CACHE.
  if (url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(event, FONTS_CACHE));
    return;
  }

  if (!sameOrigin) return; // let the browser handle cross-origin normally

  // HTML navigations → network-first. Ensures new deploys show up on the
  // next app open. Falls back to the cached index shell when offline.
  if (event.request.mode === 'navigate' ||
      event.request.destination === 'document') {
    event.respondWith(networkFirst(event, SHELL_CACHE));
    return;
  }

  // Core shell (JS, CSS) → network-first so code changes propagate.
  if (event.request.destination === 'script' ||
      event.request.destination === 'style') {
    event.respondWith(networkFirst(event, SHELL_CACHE));
    return;
  }

  // League data → network-first, cache fallback for offline.
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirst(event, DATA_CACHE));
    return;
  }

  // Images, video, rings, icons → cache-first (they change rarely).
  if (event.request.destination === 'image' ||
      event.request.destination === 'video' ||
      url.pathname.startsWith('/rings/') ||
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(event, STATIC_CACHE));
    return;
  }

  // Anything else: network-first for freshness, SHELL_CACHE as backstop.
  event.respondWith(networkFirst(event, SHELL_CACHE));
});
