const CACHE_NAME = 'viventiva-cache-v4'
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
  // Take control of all open tabs immediately
  self.clients.claim()
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
    request.url.includes('plausible.io') ||
    request.url.includes('stripe.com')
  ) {
    return
  }

  // NAVIGATION REQUESTS (HTML pages): Always network-first
  // Critical: after deployments, Vite generates new chunk hashes.
  // Serving stale index.html would reference non-existent JS files.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the fresh navigation response
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone).catch(() => {})
            })
          }
          return response
        })
        .catch(() => {
          // Offline: fall back to cached index.html
          return caches.match('/index.html') || caches.match('/')
        })
    )
    return
  }

  // STATIC ASSETS with hashes (immutable): Cache-first
  // Vite hashed assets like /assets/index-D8p7_VLa.js never change
  if (request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          // Only cache valid JS/CSS responses (not HTML rewrites from SPA fallback)
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic' &&
            !response.headers.get('content-type')?.includes('text/html')
          ) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone).catch(() => {})
            })
          }
          return response
        })
      })
    )
    return
  }

  // ALL OTHER REQUESTS: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request)
        .then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone).catch(() => {})
          })
          return response
        })
        .catch(() => {
          return cached
        })

      return cached || fetchPromise
    })
  )
})
