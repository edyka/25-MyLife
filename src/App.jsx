import { lazy, Suspense, useState, useEffect, useRef } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components for code splitting
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const MainApp = lazy(() => import("./components/MainApp"));
const HomePage = lazy(() => import("./components/HomePage"));
const OnboardingWizard = lazy(() => import("./components/OnboardingWizard"));
const About = lazy(() => import("./components/About"));
const AppPolicy = lazy(() => import("./components/AppPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
import LoadingSpinner from "./components/LoadingSpinner";
import BrowserCompatibility from "./components/BrowserCompatibility";
import CookieConsent from "./components/CookieConsent";

// Import optimized Zustand selectors
import { useUIStore } from "./stores/useUIStore";

const App = () => {
  // Use optimized Zustand selectors to prevent unnecessary re-renders
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const currentPage = useUIStore(state => state.currentPage);
  const setCurrentPage = useUIStore(state => state.setCurrentPage);

  // New State Machine
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Checking if logged in
  const [dataLoading, setDataLoading] = useState(false); // Fetching user data
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const { auth } = await import('./lib/supabase');
        const status = await auth.checkConnection();

        if (!status.online) {
          console.error('[Viventiva] Backend connection failed:', status);
          setIsBackendAvailable(false);
          setAuthLoading(false); // Stop loading if backend is down
        }
      } catch (error) {
        console.error('[Viventiva] Error checking backend:', error);
        setIsBackendAvailable(false);
        setAuthLoading(false);
      }
    };

    checkBackend();
  }, []);

  // Set theme data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themePreset);
  }, [themePreset]);

  // SEO and Analytics
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { trackPageView: track } = await import('./utils/analytics');
        const path = window.location.pathname + window.location.hash;
        track(path);
      } catch (error) { }
    };

    const updateSEO = async () => {
      try {
        const { initSEO, generateOrganizationSchema, generateWebAppSchema, setStructuredData } = await import('./utils/seo');

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

  // Core Authentication Logic
  useEffect(() => {
    let authListener = null;

    const setupAuth = async () => {
      const { auth } = await import('./lib/supabase');

      // 1. Set up listener
      const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
        console.log('[Viventiva Auth] Event:', event, 'User:', session?.user?.id);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            // Only update state if changing from no user to user, or if it's a different user
            // or if we were loading
            setUser(session.user);
            setAuthLoading(false);

            // Start data loading
            loadUserData(session.user);
          } else {
            // INITIAL_SESSION with no user means not logged in
            if (event === 'INITIAL_SESSION') {
              console.log('[Viventiva Auth] No initial session found');
              setUser(null);
              setAuthLoading(false);
              setDataLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Viventiva Auth] User signed out');
          setUser(null);
          setAuthLoading(false);
          setDataLoading(false);
          setNeedsProfileSetup(false);
          localStorage.removeItem('viventiva_authenticated');
          localStorage.removeItem('viventiva_profile_complete');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Viventiva Auth] Token refreshed');
        }
      });

      authListener = subscription;
    };

    setupAuth();

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const loadUserData = async (currentUser) => {
    // Prevent double loading if we are already loading data for this user
    // Simple check: if dataLoading is true, we might be already fetching. 
    // But multiple events might fire, so we'll just proceed. 
    // The data service handles some deduplication.

    setDataLoading(true);
    console.log('[Viventiva Data] Loading data for:', currentUser.id);

    try {
      const { database } = await import('./lib/supabase');
      const { useLifeStore } = await import('./stores/useLifeStore');
      const { useMilestoneStore } = await import('./stores/useMilestoneStore');
      const { useSelectionStore } = await import('./stores/useSelectionStore');

      // 1. Get Profile
      const { data: profile, error: profileError } = await database.getUserProfile(currentUser.id);

      if (profile && profile.birth_day) {
        // Profile exists
        console.log('[Viventiva Data] Profile found');
        const lifeStore = useLifeStore.getState();
        lifeStore.setBirthData(profile.birth_day, profile.birth_month, profile.birth_year);
        lifeStore.setLifeExpectancy(profile.life_expectancy || 80);
        if (profile.name) lifeStore.setUserName(profile.name);
        else if (currentUser.user_metadata?.full_name) lifeStore.setUserName(currentUser.user_metadata.full_name);

        // 2. Get Milestones
        const { data: milestonesData } = await database.getMilestones(currentUser.id);
        const milestoneStore = useMilestoneStore.getState();
        if (milestonesData?.milestones_data) {
          const mData = milestonesData.milestones_data;
          milestoneStore.setMilestones(mData.milestones || {});
          milestoneStore.setCustomMoods(mData.customMoods || {});
          milestoneStore.setCustomCategories(mData.customCategories || {});
        } else {
          milestoneStore.setMilestones({});
          milestoneStore.setCustomMoods({});
          milestoneStore.setCustomCategories({});
        }

        // 3. Get Selections
        const { data: selectionsData } = await database.getSelections(currentUser.id);
        const selectionStore = useSelectionStore.getState();
        if (selectionsData?.selections_data) {
          const sData = selectionsData.selections_data;
          selectionStore.setSelectedWeeks(new Set(sData.selectedWeeks || []));
          selectionStore.setPinnedWeeks(new Set(sData.pinnedWeeks || []));
          selectionStore.setSelectedColor(sData.selectedColor || null);
        } else {
          selectionStore.clearAllSelections();
        }

        // 4. Settings
        try {
          const { useUIStore } = await import('./stores/useUIStore');
          await useUIStore.getState().loadSettingsFromSupabase();
        } catch (e) { console.error(e); }

        setNeedsProfileSetup(false);
        localStorage.setItem('viventiva_authenticated', 'true');
        localStorage.setItem('viventiva_profile_complete', 'true');

      } else {
        // Profile missing
        console.log('[Viventiva Data] Profile incomplete');
        setNeedsProfileSetup(true);
        // Set basic user info if available
        const lifeStore = useLifeStore.getState();
        if (currentUser.user_metadata?.full_name) lifeStore.setUserName(currentUser.user_metadata.full_name);
        else if (currentUser.email) {
          const name = currentUser.email.split('@')[0];
          lifeStore.setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }

    } catch (error) {
      console.error('[Viventiva Data] Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthLoading(true);

    try {
      const { auth } = await import('./lib/supabase');
      const { data: { session } } = await auth.getSession();
      if (session?.user) {
        console.log('[Viventiva Auth] Manual check found user:', session.user.id);
        setUser(session.user);
        setAuthLoading(false);
        loadUserData(session.user);
      }
    } catch (error) {
      console.error('[Viventiva Auth] Error in manual login check:', error);
      setAuthLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setNeedsProfileSetup(false);
    localStorage.setItem('viventiva_profile_complete', 'true');
  };

  const handleError = (error, errorInfo) => {
    console.error("App Error:", error, errorInfo);
  };

  // Render Logic
  if (currentPage === "settings") {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
          <SettingsPage darkMode={darkMode} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "about") {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading about page..." />}>
          <About onBack={() => setCurrentPage("main")} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "privacy") {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading privacy policy..." />}>
          <AppPolicy darkMode={darkMode} onBack={() => setCurrentPage("main")} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "terms") {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading terms of service..." />}>
          <TermsOfService
            darkMode={darkMode}
            onBack={() => setCurrentPage("main")}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
      <BrowserCompatibility darkMode={darkMode} />
      <CookieConsent />

      {/* Backend Offline Warning Banner */}
      {!isBackendAvailable && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[100] p-4 shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg">System Offline</h3>
                <p className="text-white/90 text-sm">
                  The backend server is currently unreachable (Error 521). Login and data saving are disabled.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Check Dashboard
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-700 text-white border border-red-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-800 transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${darkMode ? 'modern-bg-dark' : 'modern-bg'} min-h-screen transition-all duration-500 ${!isBackendAvailable ? 'pt-20' : ''}`}>
        {authLoading ? (
          <Suspense fallback={<LoadingSpinner message="Checking session..." />}>
            <LoadingSpinner message="Checking session..." />
          </Suspense>
        ) : !user ? (
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <HomePage darkMode={darkMode} onLogin={handleLogin} />
          </Suspense>
        ) : dataLoading ? (
          <Suspense fallback={<LoadingSpinner message="Loading your journey..." />}>
            <LoadingSpinner message="Loading your journey..." />
          </Suspense>
        ) : needsProfileSetup ? (
          <Suspense fallback={<LoadingSpinner message="Preparing setup..." />}>
            <OnboardingWizard darkMode={darkMode} onComplete={handleProfileComplete} />
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner message="Loading your journey..." />}>
            <MainApp />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
