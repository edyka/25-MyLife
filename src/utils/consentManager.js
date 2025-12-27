/**
 * Cookie Consent Utility
 * Manages cookie consent preferences and checks consent status
 */

const CONSENT_KEY = 'viventiva_cookie_consent';
const CONSENT_DATE_KEY = 'viventiva_cookie_consent_date';
const ANALYTICS_CONSENT_KEY = 'viventiva_analytics_consent';

/**
 * Check if user has given cookie consent
 * @returns {string|null} 'accepted', 'declined', or null
 */
export const getCookieConsent = () => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (error) {
    console.warn('[Cookie Consent] Error reading consent:', error);
    return null;
  }
};

/**
 * Check if analytics consent is given
 * @returns {boolean}
 */
export const hasAnalyticsConsent = () => {
  try {
    const consent = getCookieConsent();
    if (consent === 'accepted') {
      // Check if analytics is specifically enabled (granular control)
      const analyticsConsent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
      // If analytics consent is explicitly set, use that; otherwise use main consent
      return analyticsConsent !== 'false';
    }
    return false;
  } catch (error) {
    console.warn('[Cookie Consent] Error checking analytics consent:', error);
    return false;
  }
};

/**
 * Set cookie consent
 * @param {string} status - 'accepted' or 'declined'
 * @param {boolean} analyticsEnabled - Whether analytics cookies are enabled
 */
export const setCookieConsent = (status, analyticsEnabled = true) => {
  try {
    localStorage.setItem(CONSENT_KEY, status);
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    localStorage.setItem(ANALYTICS_CONSENT_KEY, analyticsEnabled ? 'true' : 'false');

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('privacyConsentChanged', {
      detail: { status, analyticsEnabled }
    }));

    return true;
  } catch (error) {
    console.error('[Cookie Consent] Error setting consent:', error);
    return false;
  }
};

/**
 * Clear all cookie consent data
 */
export const clearCookieConsent = () => {
  try {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_DATE_KEY);
    localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    window.dispatchEvent(new CustomEvent('privacyConsentChanged', {
      detail: { status: null, analyticsEnabled: false }
    }));
  } catch (error) {
    console.error('[Cookie Consent] Error clearing consent:', error);
  }
};

/**
 * Get consent date
 * @returns {string|null}
 */
export const getConsentDate = () => {
  try {
    return localStorage.getItem(CONSENT_DATE_KEY);
  } catch {
    return null;
  }
};

export default {
  getCookieConsent,
  hasAnalyticsConsent,
  setCookieConsent,
  clearCookieConsent,
  getConsentDate,
};

