import { lazy, Suspense, useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components for code splitting
const SettingsPage = lazy(() => import("./components/SettingsPage"));
import MainApp from "./components/MainApp";
import HomePage from "./components/HomePage";
import CompleteProfile from "./components/CompleteProfile";
const About = lazy(() => import("./components/About"));
const AppPolicy = lazy(() => import("./components/AppPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
import LoadingSpinner from "./components/LoadingSpinner";
import BrowserCompatibility from "./components/BrowserCompatibility";

// Import optimized Zustand selectors
import { useUIStore } from "./stores/useUIStore";

const App = () => {
  // Use optimized Zustand selectors to prevent unnecessary re-renders
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const currentPage = useUIStore(state => state.currentPage);
  const setCurrentPage = useUIStore(state => state.setCurrentPage);

  // Authentication and onboarding state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Check authentication on mount and handle OAuth callback
  useEffect(() => {
    const loadUserData = async () => {
      const authStatus = localStorage.getItem('viventiva_authenticated');

      if (authStatus === 'true') {
        // User is authenticated - check if they have completed their profile
        const { auth, database } = await import('./lib/supabase');
        const { useLifeStore } = await import('./stores/useLifeStore');
        const { useMilestoneStore } = await import('./stores/useMilestoneStore');

        const { user } = await auth.getCurrentUser();

        if (user) {
          // Load user profile from Supabase
          const { data: profile } = await database.getUserProfile(user.id);

          if (profile && profile.birth_day) {
            // Profile is complete - load into Zustand store
            console.log('[Viventiva] Loading user profile:', profile);
            const store = useLifeStore.getState();
            store.setBirthData(
              profile.birth_day,
              profile.birth_month,
              profile.birth_year
            );
            store.setLifeExpectancy(profile.life_expectancy || 80);
            if (profile.name) {
              store.setUserName(profile.name);
            }

            // Load milestones/mood data from Supabase
            const milestoneStore = useMilestoneStore.getState();
            const { data: milestonesData, error: milestonesError } = await database.getMilestones(user.id);

            console.log('[Viventiva] Loading milestones:', { milestonesData, milestonesError });

            if (milestonesData && milestonesData.milestones_data) {
              console.log('[Viventiva] Setting milestones from Supabase:', Object.keys(milestonesData.milestones_data).length, 'weeks');
              milestoneStore.setMilestones(milestonesData.milestones_data);
            } else {
              console.log('[Viventiva] No milestone data found in Supabase, starting fresh');
              milestoneStore.setMilestones({});
            }

            setIsAuthenticated(true);
            setNeedsProfileSetup(false);
            localStorage.setItem('viventiva_profile_complete', 'true');
          } else {
            // Profile is NOT complete - user needs to complete onboarding
            setIsAuthenticated(true);
            setNeedsProfileSetup(true);
            localStorage.removeItem('viventiva_profile_complete');
          }
        } else {
          // No user found - clear authentication
          localStorage.removeItem('viventiva_authenticated');
          localStorage.removeItem('viventiva_profile_complete');
          setIsAuthenticated(false);
          setNeedsProfileSetup(false);
        }
      } else {
        setIsAuthenticated(false);
        setNeedsProfileSetup(false);
      }
    };

    // Handle OAuth callback (Google, Facebook, etc.)
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        // Import auth and database from supabase
        const { auth, database } = await import('./lib/supabase');
        const { useLifeStore } = await import('./stores/useLifeStore');
        const { useMilestoneStore } = await import('./stores/useMilestoneStore');

        // Get the authenticated user
        const { user } = await auth.getCurrentUser();

        if (user) {
          // Check if user already has a profile in Supabase
          const { data: existingProfile } = await database.getUserProfile(user.id);

          if (existingProfile && existingProfile.birth_day) {
            // Returning user - load their data
            console.log('[Viventiva OAuth] Loading returning user profile:', existingProfile);
            const store = useLifeStore.getState();
            store.setBirthData(
              existingProfile.birth_day,
              existingProfile.birth_month,
              existingProfile.birth_year
            );
            store.setLifeExpectancy(existingProfile.life_expectancy || 80);
            if (existingProfile.name) {
              store.setUserName(existingProfile.name);
            }

            // Load milestones/mood data
            const milestoneStore = useMilestoneStore.getState();
            const { data: milestonesData, error: milestonesError } = await database.getMilestones(user.id);

            console.log('[Viventiva OAuth] Loading milestones:', { milestonesData, milestonesError });

            if (milestonesData && milestonesData.milestones_data) {
              console.log('[Viventiva OAuth] Setting milestones from Supabase:', Object.keys(milestonesData.milestones_data).length, 'weeks');
              milestoneStore.setMilestones(milestonesData.milestones_data);
            } else {
              console.log('[Viventiva OAuth] No milestone data found, starting fresh');
              milestoneStore.setMilestones({});
            }

            // Mark as complete
            localStorage.setItem('viventiva_authenticated', 'true');
            localStorage.setItem('viventiva_profile_complete', 'true');
            setIsAuthenticated(true);
            setNeedsProfileSetup(false);
          } else {
            // New user - needs to complete profile
            localStorage.setItem('viventiva_authenticated', 'true');
            localStorage.removeItem('viventiva_profile_complete');
            setIsAuthenticated(true);
            setNeedsProfileSetup(true);
          }

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    loadUserData();
    handleOAuthCallback();
  }, []);

  const handleLogin = async () => {
    localStorage.setItem('viventiva_authenticated', 'true');

    // Check if user has completed their profile
    const { auth, database } = await import('./lib/supabase');
    const { user } = await auth.getCurrentUser();

    if (user) {
      const { data: profile } = await database.getUserProfile(user.id);

      if (profile && profile.birth_day) {
        // Profile complete - load data and go to main app
        console.log('[Viventiva handleLogin] Loading profile:', profile);
        const { useLifeStore } = await import('./stores/useLifeStore');
        const { useMilestoneStore } = await import('./stores/useMilestoneStore');

        const store = useLifeStore.getState();
        store.setBirthData(profile.birth_day, profile.birth_month, profile.birth_year);
        store.setLifeExpectancy(profile.life_expectancy || 80);
        if (profile.name) {
          store.setUserName(profile.name);
        }

        const milestoneStore = useMilestoneStore.getState();
        const { data: milestonesData, error: milestonesError } = await database.getMilestones(user.id);

        console.log('[Viventiva handleLogin] Loading milestones:', { milestonesData, milestonesError });

        if (milestonesData && milestonesData.milestones_data) {
          console.log('[Viventiva handleLogin] Setting milestones:', Object.keys(milestonesData.milestones_data).length, 'weeks');
          milestoneStore.setMilestones(milestonesData.milestones_data);
        } else {
          console.log('[Viventiva handleLogin] No milestone data, starting fresh');
          milestoneStore.setMilestones({});
        }

        setIsAuthenticated(true);
        setNeedsProfileSetup(false);
        localStorage.setItem('viventiva_profile_complete', 'true');
      } else {
        // New user - needs to complete profile
        setIsAuthenticated(true);
        setNeedsProfileSetup(true);
        localStorage.removeItem('viventiva_profile_complete');
      }
    }
  };

  const handleProfileComplete = () => {
    localStorage.setItem('viventiva_profile_complete', 'true');
    setNeedsProfileSetup(false);
  };

  const handleError = (error, errorInfo) => {
    console.error("App Error:", error, errorInfo);
    // Could send to error reporting service here
  };

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
      <div className={`${darkMode ? 'modern-bg-dark' : 'modern-bg'} min-h-screen transition-all duration-500`}>
        {!isAuthenticated ? (
          <HomePage darkMode={darkMode} onLogin={handleLogin} />
        ) : needsProfileSetup ? (
          <CompleteProfile darkMode={darkMode} onComplete={handleProfileComplete} />
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
