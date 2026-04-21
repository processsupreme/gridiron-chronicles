var SHELL_VERSION = 'bkgffl-shell-v26';
var DATA_VERSION = 'bkgffl-data-v2';
var FONTS_CACHE = 'bkgffl-fonts-v1';

var SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/favicon.svg'
];

var DATA_ASSETS = [
  '/assets/videos/hall-intro.mp4',
  '/data/league_data.json',
  '/rings/ring_2014.png',
  '/rings/ring_2015.png',
  '/rings/ring_2016.png',
  '/rings/ring_2017.png',
  '/rings/ring_2018.png',
  '/rings/ring_2019.png',
  '/rings/ring_2020.png',
  '/rings/ring_2021.png',
  '/rings/ring_2022.png',
  '/rings/ring_2023.png',
  '/rings/ring_2024.png',
  '/rings/ring_2025.png'
];

// INSTALL: precache all assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_VERSION).then(function(cache) {
        return cache.addAll(SHELL_ASSETS);
      }),
      caches.open(DATA_VERSION).then(function(cache) {
        return cache.addAll(DATA_ASSETS);
      })
    ]).then(function() {
      return self.skipWaiting();
    })
  );
});

// ACTIVATE: clean up old cache versions
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== SHELL_VERSION && key !== DATA_VERSION && key !== FONTS_CACHE;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// FETCH: cache-first for all requests
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Google Fonts: stale-while-revalidate
  if (url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var fetched = fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone());
            return response;
          }).catch(function() { return cached; });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // Everything else: cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
