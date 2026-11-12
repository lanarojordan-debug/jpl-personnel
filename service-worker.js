const CACHE = 'jpl-personal-shell-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'weekly.js', 'catalogue.js', 'tactical.js', 'personal.js', 'register-sw.js', 'manifest.webmanifest', 'assets/jpl-icon-180.png', 'assets/jpl-icon-192.png', 'assets/jpl-icon-512.png', 'assets/jpl-icon.svg', 'assets/CATALOGUE-100.json', 'assets/montserrat-400.ttf', 'assets/montserrat-600.ttf', 'assets/montserrat-700.ttf', 'assets/montserrat-800.ttf'];
const ASSETS = SHELL.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('jpl-personal-shell-') && key !== CACHE).map(key => caches.delete(key))))]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && ASSETS.includes(url.href)) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || Response.error())));
});
