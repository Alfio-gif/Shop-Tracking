// Nome e versione della cache
const CACHE_NAME = "shop-tracking-v1";

// File da precache (essenziali per funzionare offline)
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Installazione del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting(); // Attiva subito la nuova versione
});

// Attivazione e pulizia vecchie cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Controlla subito tutte le pagine
});

// Strategia di caching: Network First con fallback alla cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Salva dinamicamente nella cache
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        // Se offline → prova la cache
        return caches.match(event.request).then((cached) => {
          return (
            cached ||
            caches.match("./index.html") // fallback offline
          );
        });
      })
  );
});
