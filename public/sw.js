const CACHE_NAME = 'todo-app-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Add other assets like stylesheets, scripts, etc.
]

// Install the service worker and cache the app's assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Activate the service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        // Cache hit - return the response from cache
        if (response) {
          return response
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // Return the offline page if can't fetch
        if (event.request.url.indexOf('/api/') === -1) {
          return caches.match('/')
        }
      })
  )
})
