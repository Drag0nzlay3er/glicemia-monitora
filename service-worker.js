const CACHE_NAME = 'glicemia-v1';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/glicemia-monitora/',
  '/glicemia-monitora/index.html',
  '/glicemia-monitora/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// CDN origins that should always use Cache-First
const CACHE_FIRST_ORIGINS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ── Install: pre-cache all critical assets ────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: route by strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // GitHub API calls — always network, never cache
  if (url.hostname === 'api.github.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // CDN assets — Cache-First (they never change for a given version)
  if (CACHE_FIRST_ORIGINS.includes(url.hostname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // index.html and app shell — Network-First with cache fallback
  if (url.pathname.startsWith('/glicemia-monitora')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Everything else — Network-First
  event.respondWith(networkFirst(event.request));
});

// ── Strategy: Cache-First ─────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline — recurso não disponível', { status: 503 });
  }
}

// ── Strategy: Network-First ───────────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback to app shell if no cache
    const shell = await caches.match('/glicemia-monitora/');
    if (shell) return shell;
    return new Response('Offline', { status: 503 });
  }
}

// ── Push Notifications (med alarms) ──────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '💊 Lembrete', {
      body: data.body || 'Hora de tomar o remédio',
      icon: data.icon || '/glicemia-monitora/icon-192.png',
      badge: '/glicemia-monitora/icon-192.png',
      tag: data.tag || 'med-alarm',
      renotify: true,
      requireInteraction: false,
      silent: false
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('glicemia-monitora') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/glicemia-monitora/');
    })
  );
});
