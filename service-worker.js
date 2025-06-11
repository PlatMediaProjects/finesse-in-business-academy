// Cache version identifier - change this when making updates to refresh the cache
const CACHE_NAME = 'fiba-v1';

// List of all assets we want to cache for offline access
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any old caches that don't match our current version
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - respond with cached resources when available
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Handle API requests differently - don't cache them
  if (event.request.url.includes('/api/')) {
    return fetch(event.request).catch(() => {
      // For API requests that fail, show an offline message
      return new Response(JSON.stringify({ 
        error: 'You are offline. Please check your network connection.', 
        offline: true 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }

  // For all other requests, try the cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we have a cached version, return it
        if (response) {
          return response;
        }

        // Otherwise, go to the network
        return fetch(event.request).then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response since it can only be consumed once
          const responseToCache = response.clone();

          // Add the new resource to the cache
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, show a fallback page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        // Otherwise just fail gracefully
        return new Response('Network error occurred. Unable to load resource.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Handle background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages' || event.tag === 'sync-progress') {
    // Implement background sync logic for messages or progress tracking
    event.waitUntil(syncData(event.tag));
  }
});

// Function to sync data when back online
async function syncData(syncType) {
  // This would typically retrieve data from IndexedDB and send it to the server
  // For now, we'll just log the attempt
  console.log(`Attempting to sync ${syncType} data`);
  
  // In a real implementation, you would:
  // 1. Get stored offline actions from IndexedDB
  // 2. Send them to the server
  // 3. Update local state based on success/failure
}