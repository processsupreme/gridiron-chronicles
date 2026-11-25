// Service worker — auto-updating, offline-capable.
//
// Shell (HTML / JS / CSS) → network-first. Every launch while online pulls
// fresh code; the cache is only the offline fallback. Pushing a build to
// Vercel reaches installed home-screen apps on their next open.
//
// League archive (data/)  → network-first, cache fallback.
// Live scores (/api/)     → never cached here. The app keeps its own
//                           last-known snapshot and says when it is stale.
// Media (rings, video, icons, fonts) → cache-first, refreshed in the background.

var SHELL_CACHE  = 'bkgffl-shell-v2';
var STATIC_CACHE = 'bkgffl-static-v2';
var DATA_CACHE   = 'bkgffl-data-v2';
var FONTS_CACHE  = 'bkgffl-fonts-v2';

var OFFLINE_SEED = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/league.js',
  '/js/live.js',
  '/js/insights.js',
  '/manifest.json',
  '/favicon.svg',
  '/data/league_data.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return Promise.all(OFFLINE_SEED.map(function (url) {
        return cache.add(url).catch(function () { /* best-effort */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  var keep = [SHELL_CACHE, STATIC_CACHE, DATA_CACHE, FONTS_CACHE];
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return keep.indexOf(k) === -1; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Network-first. Offline, serve the cached copy — matching without the ?v=
// query so a versioned URL still finds the seeded file. Only page navigations
// fall back to the app shell; a missing script must fail, not return HTML.
function networkFirst(event, cacheName, isNavigation) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(event.request).then(function (response) {
      if (response && response.status === 200 && response.type !== 'opaque') {
        cache.put(event.request, response.clone());
      }
      return response;
    }).catch(function () {
      return cache.match(event.request, { ignoreSearch: true }).then(function (cached) {
        if (cached) return cached;
        if (isNavigation) return caches.match('/index.html');
        return Response.error();
      });
    });
  });
}

function cacheFirst(event, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(event.request).then(function (cached) {
      var refresh = fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type !== 'opaque') {
          cache.put(event.request, response.clone());
        }
        return response;
      }).catch(function () { return cached; });
      return cached || refresh;
    });
  });
}

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);

  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(event, FONTS_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Live scores: straight to the network, no service-worker cache.
  if (url.pathname.indexOf('/api/') === 0) return;

  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(networkFirst(event, SHELL_CACHE, true));
    return;
  }
  if (event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(networkFirst(event, SHELL_CACHE, false));
    return;
  }
  if (url.pathname.indexOf('/data/') === 0) {
    event.respondWith(networkFirst(event, DATA_CACHE, false));
    return;
  }
  if (event.request.destination === 'image' || event.request.destination === 'video' ||
      url.pathname.indexOf('/assets/') === 0 || url.pathname.indexOf('/icons/') === 0) {
    // Range requests (video scrubbing) can't be served from a full cached body.
    if (event.request.headers.get('range')) return;
    event.respondWith(cacheFirst(event, STATIC_CACHE));
    return;
  }
  event.respondWith(networkFirst(event, SHELL_CACHE, false));
});
