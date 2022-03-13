const permanentCode = [
  "./",
  "./styles.css",
  "./manifest.json",
  "./images/icons/icon-192x192.png"
]

self.addEventListener("install", async event =>{
  const cache = await caches.open("static-code");
  cache.addAll(permanentCode);
});

self.addEventListener("fetch", event => {
  const request = event.request;
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}
