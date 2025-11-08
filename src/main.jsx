import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initSentry } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import { hasAnalyticsConsent } from './utils/cookieConsent';

// Initialize Sentry error monitoring (essential, no consent needed)
initSentry();

// Initialize analytics only if consent is given
// Will be re-checked when user accepts cookies
if (hasAnalyticsConsent()) {
  initAnalytics();
}

// Listen for consent changes to initialize analytics dynamically
window.addEventListener('cookieConsentChanged', (event) => {
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

// Register service worker once (avoid duplicate registration)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js');
      }
    } catch (err) {
      console.warn('SW registration skipped:', err);
    }
  });
}