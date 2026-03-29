
const CACHE_NAME = 'wpaws-platform-v1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './modules.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
