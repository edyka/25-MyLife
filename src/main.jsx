import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initSentry } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import { hasAnalyticsConsent } from './utils/consentManager';

// Initialize Sentry error monitoring (essential, no consent needed)
initSentry();

// Initialize analytics only if consent is given
// Will be re-checked when user accepts cookies
if (hasAnalyticsConsent()) {
  initAnalytics();
}

// Listen for consent changes to initialize analytics dynamically
window.addEventListener('privacyConsentChanged', (event) => {
  const { analyticsEnabled } = event.detail;
  if (analyticsEnabled) {
    initAnalytics();
  }
});

// Initialize performance monitoring (async, non-blocking)
(async () => {
  try {
    const { initPerformanceMonitoring } = await import('./utils/performanceMonitor');
    initPerformanceMonitoring();
  } catch (error) {
    console.error('[Viventiva] Error initializing performance monitoring:', error);
  }
})();

// Initialize accessibility features (async, non-blocking)
(async () => {
  try {
    const { initAccessibility } = await import('./utils/accessibility');
    initAccessibility();
  } catch (error) {
    console.error('[Viventiva] Error initializing accessibility:', error);
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker only in production (skip in development to avoid errors)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js');
      }
    } catch (err) {
      console.warn('[Viventiva] SW registration skipped:', err);
    }
  });
} else if (import.meta.env.DEV) {
  // Unregister service workers in development (one-time only)
  if ('serviceWorker' in navigator) {
    const unregisterServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          console.log(`[Viventiva] Found ${registrations.length} service worker(s) to unregister`);

          await Promise.all(
            registrations.map(async (registration) => {
              const unregistered = await registration.unregister();
              console.log(`[Viventiva] Service worker unregistered:`, unregistered);
              return unregistered;
            })
          );

          console.log('[Viventiva] All service workers unregistered');
        }
      } catch (error) {
        console.warn('[Viventiva] Error unregistering service workers:', error);
      }
    };

    // Run ONCE on page load only
    window.addEventListener('load', unregisterServiceWorkers);
  }
}