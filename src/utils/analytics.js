// Analytics utility for Plausible (privacy-friendly), Google Analytics, and the
// Meta (Facebook) Pixel.
// To use Plausible: Add VITE_PLAUSIBLE_DOMAIN to your .env file
// To use Google Analytics: Add VITE_GA_MEASUREMENT_ID to your .env file
// To use the Meta Pixel: Add VITE_META_PIXEL_ID to your .env file

const isDev = process.env.NODE_ENV === 'development'

// Map internal action names → Meta Pixel standard events. Only events listed
// here are forwarded to the Pixel (as standard events); everything else stays
// in Plausible/GA only, so ad telemetry stays clean.
const META_STANDARD_EVENTS = {
  sign_up: 'CompleteRegistration',
  lead: 'Lead',
  initiate_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
}

/**
 * Check if analytics consent is given
 */
const checkAnalyticsConsent = () => {
  // Check localStorage directly (works in all contexts)
  try {
    const consent = localStorage.getItem('viventiva_cookie_consent')
    const analyticsConsent = localStorage.getItem('viventiva_analytics_consent')
    if (consent === 'accepted') {
      return analyticsConsent !== 'false'
    }
    return false
  } catch {
    // Silently fail - no consent if we can't check
    return false
  }
}

/**
 * Initialize analytics based on environment variables
 * Only initializes if user has given consent
 */
export const initAnalytics = () => {
  // Check consent before initializing
  if (!checkAnalyticsConsent()) {
    if (isDev) console.log('[Analytics] Consent not given, skipping initialization')
    return null
  }

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID

  // Each provider initializes independently so GA and the Meta Pixel can run
  // side by side (the common setup: GA for product analytics, Pixel for ads).
  const initialized = []

  // Initialize Plausible (privacy-friendly, GDPR compliant)
  if (plausibleDomain && !window.plausible) {
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = plausibleDomain
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)
    if (isDev) console.log('[Analytics] Plausible initialized for domain:', plausibleDomain)
    initialized.push('plausible')
  }

  // Initialize Google Analytics 4
  if (gaMeasurementId && !window.gtag) {
    // Load gtag.js
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`
    document.head.appendChild(script1)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', gaMeasurementId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    })
    if (isDev) console.log('[Analytics] Google Analytics initialized:', gaMeasurementId)
    initialized.push('ga')
  }

  // Initialize Meta (Facebook) Pixel — injected dynamically (no inline script)
  // so it complies with the CSP in netlify.toml ('unsafe-inline' is not allowed
  // in script-src; connect.facebook.net is whitelisted there).
  if (metaPixelId && !window.fbq) {
    // Pixel bootstrap (function declaration mirrors the gtag pattern above)
    function fbq(...args) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args)
      } else {
        fbq.queue.push(args)
      }
    }
    if (!window._fbq) window._fbq = fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq

    const script2 = document.createElement('script')
    script2.async = true
    script2.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script2)

    window.fbq('init', metaPixelId)
    window.fbq('track', 'PageView')
    if (isDev) console.log('[Analytics] Meta Pixel initialized:', metaPixelId)
    initialized.push('meta')
  }

  // No analytics configured (or all already initialized) - stay silent
  return initialized.length > 0 ? initialized : null
}

/**
 * Track a page view
 * Only tracks if user has given consent
 */
export const trackPageView = path => {
  if (!checkAnalyticsConsent()) {
    return // Don't track without consent
  }

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID

  if (plausibleDomain && window.plausible) {
    window.plausible('pageview', { u: path })
  }

  if (gaMeasurementId && window.gtag) {
    window.gtag('config', gaMeasurementId, {
      page_path: path,
    })
  }

  if (metaPixelId && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

/**
 * Track a custom event
 * Only tracks if user has given consent
 */
export const trackEvent = (eventName, props = {}) => {
  if (!checkAnalyticsConsent()) {
    return // Don't track without consent
  }

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID

  if (plausibleDomain && window.plausible) {
    window.plausible(eventName, { props })
  }

  if (gaMeasurementId && window.gtag) {
    window.gtag('event', eventName, props)
  }

  // Forward only mapped conversions to the Meta Pixel as standard events.
  if (metaPixelId && window.fbq) {
    const standardEvent = META_STANDARD_EVENTS[eventName]
    if (standardEvent) {
      window.fbq('track', standardEvent, props)
    }
  }
}

/**
 * Track user actions (login, signup, etc.)
 */
export const trackUserAction = (action, metadata = {}) => {
  trackEvent(action, {
    ...metadata,
    timestamp: new Date().toISOString(),
  })
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackUserAction,
}
