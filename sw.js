const CACHE_NAME = "vadkostarsoppan-v3";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/fuel-data.js",
  "/market-data.js",
  "/county-data.js",
  "/glossary-data.js",
  "/policy-data.js",
  "/data-sources.json",
  "/version.json",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/offline.html"
];

const DATA_ASSETS = new Set([
  "/fuel-data.js",
  "/market-data.js",
  "/county-data.js",
  "/glossary-data.js",
  "/policy-data.js",
  "/data-sources.json",
  "/version.json"
]);

const STATIC_ASSETS = new Set([
  "/style.css",
  "/script.js",
  "/favicon.svg",
  "/manifest.webmanifest"
]);

async function networkWithTimeout(request, ms = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(request, {signal:controller.signal});
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_APP_CACHE") {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
    );
  }
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      networkWithTimeout(request, 3000)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("/", copy));
          return response;
        })
        .catch(async () => (await caches.match("/")) || caches.match("/offline.html"))
    );
    return;
  }

  if (DATA_ASSETS.has(url.pathname)) {
    event.respondWith(
      networkWithTimeout(request, 2200)
        .then(response => {
          if (response?.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (STATIC_ASSETS.has(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        const refresh = fetch(request)
          .then(response => {
            if (response?.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || refresh;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
