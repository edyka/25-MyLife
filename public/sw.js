const CACHE_NAME = 'viventiva-cache-v2'
const URLS_TO_CACHE = ['/', '/index.html', '/manifest.webmanifest', '/vite.svg']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache URLs with error handling
      return Promise.allSettled(
        URLS_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Failed to cache:', url, err)
            return null
          })
        )
      )
    })
  )
  // Skip waiting to activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null))))
  )
})

self.addEventListener('fetch', event => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other unsupported schemes
  if (
    request.url.startsWith('chrome-extension://') ||
    request.url.startsWith('moz-extension://') ||
    request.url.startsWith('safari-extension://')
  ) {
    return // Let browser handle these
  }

  // Skip non-http/https requests
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return
  }

  // Skip localhost in development - let browser handle directly
  if (request.url.includes('localhost') || request.url.includes('127.0.0.1')) {
    return // Don't intercept localhost requests
  }

  // Skip Supabase API requests - let them go directly to the network
  if (request.url.includes('supabase.co')) {
    return
  }

  // Skip OAuth callback navigation (URLs with ?code= parameter)
  if (request.url.includes('code=') || request.url.includes('access_token=')) {
    return
  }

  // Skip external analytics/tracking requests
  if (
    request.url.includes('googletagmanager.com') ||
    request.url.includes('google-analytics.com') ||
    request.url.includes('plausible.io')
  ) {
    return
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request)
        .then(response => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone response before caching
          const responseClone = response.clone()

          // Cache with error handling
          caches.open(CACHE_NAME).then(cache => {
            try {
              cache.put(request, responseClone).catch(err => {
                console.warn('[SW] Failed to cache:', request.url, err)
              })
            } catch (err) {
              console.warn('[SW] Cache error:', err)
            }
          })

          return response
        })
        .catch(error => {
          console.warn('[SW] Fetch failed:', request.url, error)
          // Return cached version if available, otherwise let browser handle (don't return 408)
          return cached || fetch(request)
        })

      return cached || fetchPromise
    })
  )
})
