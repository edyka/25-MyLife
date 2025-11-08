// Sentry error monitoring configuration
// To use: Add VITE_SENTRY_DSN to your .env file
// Get your DSN from: https://sentry.io/settings/[your-org]/projects/[your-project]/keys/

import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('[Sentry] DSN not configured. Error monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Filter out common non-critical errors
    beforeSend(event, hint) {
      // Don't send errors from browser extensions
      if (event.exception?.values?.[0]?.value?.includes('chrome-extension://') ||
          event.exception?.values?.[0]?.value?.includes('moz-extension://')) {
        return null;
      }
      
      // Don't send network errors for blocked requests (Brave Shields, etc.)
      if (event.exception?.values?.[0]?.value?.includes('Failed to fetch') ||
          event.exception?.values?.[0]?.value?.includes('NetworkError')) {
        // Only send if it's not a 406 (Brave Shields blocking)
        const error = hint.originalException;
        if (error?.status === 406) {
          return null;
        }
      }
      
      return event;
    },
  });

  console.log('[Sentry] Error monitoring initialized');
};

export default Sentry;

