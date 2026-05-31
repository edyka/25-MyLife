import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAnalytics, trackEvent } from './utils/analytics'
import { APP_VERSION, GIT_COMMIT, BUILD_TIME } from './utils/version'
import { hasAnalyticsConsent } from './utils/consentManager'
import { cleanupLegacyStorage } from './utils/storageUtils'
import { initNative } from './native'
import { auth } from './lib/supabase'

// One-time removal of orphan crypto-js localStorage keys (encryption removed 2026-05-23).
cleanupLegacyStorage()

// Expose the build stamp for quick deploy verification from the console
// (console.* is stripped in prod builds, so a window global is used instead).
window.__BUILD__ = { version: APP_VERSION, commit: GIT_COMMIT, time: BUILD_TIME }

// Initialize native (Capacitor) integration — no-op on the web build. The OAuth
// code-exchange handler is injected so the native layer doesn't import supabase.
initNative({ onOAuthCode: code => auth.exchangeCodeForSession(code) })

// Initialize Sentry error monitoring (async, non-blocking for faster initial render)
;(async () => {
  try {
    const { initSentry } = await import('./utils/sentry')
    initSentry()
  } catch (error) {
    console.error('[Viventiva] Error initializing Sentry:', error)
  }
})()

// Initialize analytics only if consent is given
// Will be re-checked when user accepts cookies
if (hasAnalyticsConsent()) {
  initAnalytics()
}

// Listen for consent changes to initialize analytics dynamically
window.addEventListener('privacyConsentChanged', event => {
  const { analyticsEnabled } = event.detail
  if (analyticsEnabled) {
    initAnalytics()
  }
})

// Track a returning Stripe Checkout success as a Purchase conversion, then strip
// the params so a refresh can't double-count. Value/currency are passed through
// the success_url by stripeConfig.redirectToCheckout.
;(() => {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      const value = parseFloat(params.get('value'))
      trackEvent('purchase', {
        ...(Number.isFinite(value) ? { value } : {}),
        currency: params.get('currency') || 'USD',
      })
      params.delete('checkout')
      params.delete('value')
      params.delete('currency')
      const query = params.toString()
      window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''))
    }
  } catch (error) {
    console.warn('[Viventiva] Checkout success tracking skipped:', error)
  }
})()

// Initialize performance monitoring (async, non-blocking)
;(async () => {
  try {
    const { initPerformanceMonitoring } = await import('./utils/performanceMonitor')
    initPerformanceMonitoring()
  } catch (error) {
    console.error('[Viventiva] Error initializing performance monitoring:', error)
  }
})()

// Initialize accessibility features (async, non-blocking)
;(async () => {
  try {
    const { initAccessibility } = await import('./utils/accessibility')
    initAccessibility()
  } catch (error) {
    console.error('[Viventiva] Error initializing accessibility:', error)
  }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker only in production (skip in development to avoid errors)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js')
      }
    } catch (err) {
      console.warn('[Viventiva] SW registration skipped:', err)
    }
  })
} else if (import.meta.env.DEV) {
  // Unregister service workers in development (one-time only)
  if ('serviceWorker' in navigator) {
    const unregisterServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        if (registrations.length > 0) {
          console.log(`[Viventiva] Found ${registrations.length} service worker(s) to unregister`)

          await Promise.all(
            registrations.map(async registration => {
              const unregistered = await registration.unregister()
              console.log(`[Viventiva] Service worker unregistered:`, unregistered)
              return unregistered
            })
          )

          console.log('[Viventiva] All service workers unregistered')
        }
      } catch (error) {
        console.warn('[Viventiva] Error unregistering service workers:', error)
      }
    }

    // Run ONCE on page load only
    window.addEventListener('load', unregisterServiceWorkers)
  }
}
