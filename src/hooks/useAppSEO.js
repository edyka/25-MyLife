import { useEffect } from "react";

const hasAuthTokensInHash = (hash = '') => {
  const h = (hash || '').toLowerCase();
  return (
    h.includes('access_token=') ||
    h.includes('refresh_token=') ||
    h.includes('error=') ||
    h.includes('error_description=') ||
    h.includes('type=signup') ||
    h.includes('type=recovery') ||
    h.includes('type=magiclink')
  );
};

const getSafePathForTracking = () => {
  const { pathname, search, hash } = window.location;
  if (hasAuthTokensInHash(hash)) return `${pathname}${search}`;
  return `${pathname}${search}${hash}`;
};

export const useAppSEO = (currentPage, user) => {
  // Hash sanitation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasAuthTokensInHash(window.location.hash)) {
      try {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      } catch { /* ignore */ }
    }
  }, []);

  // SEO and Analytics
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { trackPageView: track } = await import('../utils/analytics');
        track(getSafePathForTracking());
      } catch { /* ignore */ }
    };

    const updateSEO = async () => {
      try {
        const { initSEO, generateOrganizationSchema, generateWebAppSchema, setStructuredData } = await import('../utils/seo');

        if (currentPage === 'main' && user) {
          initSEO({
            title: 'My Life Grid',
            description: 'Visualize your life journey, track milestones, and set goals with your personal life grid.',
          });
        } else if (currentPage === 'about') {
          initSEO({
            title: 'About Viventiva',
            description: 'Learn about Viventiva - a tool to visualize your life as a grid of weeks and live intentionally.',
          });
        } else if (currentPage === 'privacy') {
          initSEO({
            title: 'Privacy Policy',
            description: 'Viventiva Privacy Policy - How we collect, use, and protect your data.',
          });
        } else if (currentPage === 'terms') {
          initSEO({
            title: 'Terms of Service',
            description: 'Viventiva Terms of Service - Terms and conditions for using our service.',
          });
        } else {
          initSEO({
            title: 'Viventiva - Visualize Your Life',
            description: 'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally. Each square represents one week of your life.',
          });
        }

        if (currentPage === 'main' && !user) {
          setStructuredData(generateOrganizationSchema());
          setStructuredData(generateWebAppSchema());
        }
      } catch (error) {
        console.error('[Viventiva] Error updating SEO:', error);
      }
    };

    trackPageView();
    updateSEO();
  }, [currentPage, user]);
};
