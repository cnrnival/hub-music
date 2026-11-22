/**
 * Hub Music - Service Worker
 * Offline support and caching strategies
 */

const CACHE_NAME = 'hub-music-v1';
const STATIC_CACHE = 'hub-music-static-v1';
const DYNAMIC_CACHE = 'hub-music-dynamic-v1';
const IMAGE_CACHE = 'hub-music-images-v1';
const AUDIO_CACHE = 'hub-music-audio-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first - for static assets
  cacheFirst: async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  },

  // Network first - for API requests
  networkFirst: async (request) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  // Stale while revalidate - for images
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cached);

    return cached || fetchPromise;
  },

  // Network only - for audio streams
  networkOnly: async (request) => {
    try {
      return await fetch(request);
    } catch {
      return new Response('Audio unavailable offline', { status: 503 });
    }
  },
};

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE && name !== AUDIO_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Determine cache strategy based on request
  let strategy = CACHE_STRATEGIES.networkFirst;

  // Static assets (JS, CSS, fonts)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    strategy = CACHE_STRATEGIES.cacheFirst;
  }
  // Images
  else if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/)) {
    strategy = CACHE_STRATEGIES.staleWhileRevalidate;
  }
  // Audio streams
  else if (request.destination === 'audio' || url.pathname.match(/\.(mp3|ogg|wav|m4a|aac)$/)) {
    strategy = CACHE_STRATEGIES.networkOnly;
  }
  // API requests
  else if (url.pathname.startsWith('/api/')) {
    strategy = CACHE_STRATEGIES.networkFirst;
  }
  // Navigation requests
  else if (request.mode === 'navigate') {
    strategy = CACHE_STRATEGIES.networkFirst;
  }

  event.respondWith(strategy(request));
});

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncMutations());
  }
});

async function syncMutations() {
  const db = await openDB();
  const tx = db.transaction('mutations', 'readwrite');
  const store = tx.objectStore('mutations');
  const mutations = await store.getAll();

  for (const mutation of mutations) {
    try {
      await fetch(mutation.url, {
        method: mutation.method,
        headers: mutation.headers,
        body: mutation.body,
      });
      await store.delete(mutation.id);
    } catch (error) {
      console.error('Failed to sync mutation:', error);
    }
  }
}

// IndexedDB for offline mutations
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hub-music-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('mutations')) {
        db.createObjectStore('mutations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    clients.openWindow(event.action);
  } else if (event.notification.data?.url) {
    // Handle notification click
    clients.openWindow(event.notification.data.url);
  }
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});