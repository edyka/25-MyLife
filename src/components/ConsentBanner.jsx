import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { getTheme } from '../utils/themeConfig';
import { getCookieConsent, setCookieConsent } from '../utils/consentManager';

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const theme = getTheme(themePreset);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = getCookieConsent();
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Listen for request to show banner again (from Settings)
    const handleShowBanner = () => {
      setShowBanner(true);
    };

    window.addEventListener('showConsentBanner', handleShowBanner);
    return () => {
      window.removeEventListener('showConsentBanner', handleShowBanner);
    };
  }, []);

  const handleAccept = async () => {
    // Set consent with analytics enabled
    setCookieConsent('accepted', true);
    setShowBanner(false);

    // Initialize analytics now that consent is given
    try {
      const { initAnalytics } = await import('../utils/analytics');
      initAnalytics();
    } catch (error) {
      console.error('[CookieConsent] Error initializing analytics:', error);
    }
  };

  const handleDecline = () => {
    // Set consent as declined (analytics disabled)
    setCookieConsent('declined', false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${darkMode
            ? 'bg-slate-900/95 backdrop-blur-xl border-t border-slate-700'
            : 'bg-white/95 backdrop-blur-xl border-t border-slate-200'
          } shadow-2xl`}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.primary} bg-opacity-10`}>
              <Cookie className={`w-5 h-5 ${theme.accent}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Cookie Consent
              </h3>
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <a
                  href="#/app-policy"
                  className={`underline ${theme.accent} hover:opacity-80`}
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to privacy policy
                    window.location.hash = '/app-policy';
                  }}
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleDecline}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${darkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
            >
              Decline
            </button>
            <button
              onClick={() => {
                // Navigate to settings for granular control
                const setCurrentPage = useUIStore.getState().setCurrentPage;
                setCurrentPage('settings');
                setShowBanner(false);
                // Scroll to cookie preferences section
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('scrollToPrivacySettings'));
                }, 100);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${darkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
            >
              Customize
            </button>
            <button
              onClick={handleAccept}
              className={`px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all bg-gradient-to-r ${theme.primary} hover:opacity-90 shadow-lg`}
            >
              Accept All
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConsentBanner;

