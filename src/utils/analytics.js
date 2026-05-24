// Analytics utility for Plausible (privacy-friendly) or Google Analytics
// To use Plausible: Add VITE_PLAUSIBLE_DOMAIN to your .env file
// To use Google Analytics: Add VITE_GA_MEASUREMENT_ID to your .env file

const isDev = process.env.NODE_ENV === 'development'

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

  // Initialize Plausible (privacy-friendly, GDPR compliant)
  if (plausibleDomain) {
    // Check if already initialized
    if (window.plausible) {
      return 'plausible'
    }

    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = plausibleDomain
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)
    if (isDev) console.log('[Analytics] Plausible initialized for domain:', plausibleDomain)
    return 'plausible'
  }

  // Initialize Google Analytics 4
  if (gaMeasurementId) {
    // Check if already initialized
    if (window.gtag) {
      return 'ga'
    }

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
    return 'ga'
  }

  // No analytics configured - this is fine, stay silent
  return null
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

  if (plausibleDomain && window.plausible) {
    window.plausible('pageview', { u: path })
  }

  if (gaMeasurementId && window.gtag) {
    window.gtag('config', gaMeasurementId, {
      page_path: path,
    })
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

  if (plausibleDomain && window.plausible) {
    window.plausible(eventName, { props })
  }

  if (gaMeasurementId && window.gtag) {
    window.gtag('event', eventName, props)
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
