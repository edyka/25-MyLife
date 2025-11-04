import { lazy, Suspense, useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components for code splitting
const SettingsPage = lazy(() => import("./components/SettingsPage"));
const MainApp = lazy(() => import("./components/MainApp"));
const HomePage = lazy(() => import("./components/HomePage"));
const CompleteProfile = lazy(() => import("./components/CompleteProfile"));
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Loading state while checking auth

  // Check authentication on mount and handle OAuth callback
  useEffect(() => {
    let authListener = null;
    let isInitialized = false;

    const loadUserDataFromSession = async (user) => {
      if (!user) {
        console.warn('[Viventiva] loadUserDataFromSession called without user');
        return;
      }

      try {
        const { auth, database } = await import('./lib/supabase');
        const { useLifeStore } = await import('./stores/useLifeStore');
        const { useMilestoneStore } = await import('./stores/useMilestoneStore');
        const { useSelectionStore } = await import('./stores/useSelectionStore');

        console.log('[Viventiva] Loading user data for user:', user.id);

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

          // Use profile name, or fallback to Google user metadata
          if (profile.name) {
            store.setUserName(profile.name);
          } else {
            // Get user to access metadata
            const { user } = await auth.getCurrentUser();
            if (user) {
              if (user.user_metadata?.full_name) {
                store.setUserName(user.user_metadata.full_name);
              } else if (user.email) {
                // Extract name from email
                const emailName = user.email.split('@')[0];
                store.setUserName(emailName.split('.')[0] || emailName);
              }
            }
          }

          // Load milestones/mood data from Supabase
          const milestoneStore = useMilestoneStore.getState();

          // CRITICAL: Clear localStorage milestones FIRST to prevent Zustand persist from loading stale data
          // This ensures Supabase data is the source of truth
          localStorage.removeItem('memento-vivere-milestones');

          // Clear existing milestones first to prevent data leakage
          milestoneStore.setMilestones({});
          milestoneStore.setCustomMoods({});
          milestoneStore.setCustomCategories({});

          const { data: milestonesData, error: milestonesError } = await database.getMilestones(user.id);

          console.log('[Viventiva] Loading milestones:', { milestonesData, milestonesError });

          if (milestonesData && milestonesData.milestones_data) {
            const data = milestonesData.milestones_data;

            // Handle both old format (just milestones object) and new format (with milestones, customMoods, customCategories)
            if (data.milestones) {
              // New format: { milestones: {}, customMoods: {}, customCategories: {} }
              console.log('[Viventiva] Loading new format data from Supabase');
              console.log('[Viventiva] Milestones data structure:', {
                weekCount: Object.keys(data.milestones || {}).length,
                sampleWeek: Object.keys(data.milestones || {})[0] ? data.milestones[Object.keys(data.milestones || {})[0]] : null,
                hasCustomMoods: !!data.customMoods,
                hasCustomCategories: !!data.customCategories
              });

              // Set milestones - Zustand persist will automatically save to localStorage
              milestoneStore.setMilestones(data.milestones || {});
              if (data.customMoods) {
                milestoneStore.setCustomMoods(data.customMoods);
              }
              if (data.customCategories) {
                milestoneStore.setCustomCategories(data.customCategories);
              }

              // Verify the data was set correctly
              const verifyStore = useMilestoneStore.getState();
              console.log('[Viventiva] Verified loaded milestones:', Object.keys(verifyStore.milestones || {}).length, 'weeks in store');
            } else {
              // Old format: just milestones object
              console.log('[Viventiva] Loading old format milestones from Supabase:', Object.keys(data).length, 'weeks');
              milestoneStore.setMilestones(data);

              // Verify the data was set correctly
              const verifyStore = useMilestoneStore.getState();
              console.log('[Viventiva] Verified loaded milestones:', Object.keys(verifyStore.milestones || {}).length, 'weeks in store');
            }
          } else {
            console.log('[Viventiva] No milestone data found in Supabase, starting fresh');
            milestoneStore.setMilestones({});
          }

          // Load selections from Supabase
          const selectionStore = useSelectionStore.getState();
          selectionStore.setSelectedWeeks(new Set());
          selectionStore.setPinnedWeeks(new Set());
          selectionStore.setSelectedColor(null);

          const { data: selectionsData, error: selectionsError } = await database.getSelections(user.id);

          console.log('[Viventiva] Loading selections:', { selectionsData, selectionsError });

          if (selectionsData && selectionsData.selections_data) {
            const data = selectionsData.selections_data;
            console.log('[Viventiva] Selections data:', data);

            // Convert arrays back to Sets
            if (data.selectedWeeks) {
              selectionStore.setSelectedWeeks(new Set(data.selectedWeeks));
            }
            if (data.pinnedWeeks) {
              selectionStore.setPinnedWeeks(new Set(data.pinnedWeeks));
            }
            if (data.selectedColor) {
              selectionStore.setSelectedColor(data.selectedColor);
            }

            const verifyStore = useSelectionStore.getState();
            console.log('[Viventiva] Verified loaded selections:', {
              selectedWeeks: verifyStore.selectedWeeks.size,
              pinnedWeeks: verifyStore.pinnedWeeks.size,
              selectedColor: verifyStore.selectedColor
            });
          } else {
            console.log('[Viventiva] No selection data found in Supabase, starting fresh');
          }

          setIsAuthenticated(true);
          setNeedsProfileSetup(false);
          localStorage.setItem('viventiva_authenticated', 'true');
          localStorage.setItem('viventiva_profile_complete', 'true');
        } else {
          // Profile is NOT complete - user needs to complete onboarding
          setIsAuthenticated(true);
          setNeedsProfileSetup(true);
          localStorage.setItem('viventiva_authenticated', 'true');
          localStorage.removeItem('viventiva_profile_complete');
        }
      } catch (error) {
        console.error('[Viventiva] Error loading user data:', error);
        // Don't override authenticated state if we already set it - the user is still authenticated
        // Just log the error and let the UI handle it
        setIsCheckingAuth(false);
      }
    };

    // Fallback session check if auth listener doesn't fire within timeout
    // This is a safety net, but the auth listener should handle most cases
    const checkExistingSessionFallback = async () => {
      // Wait a bit for the auth listener to fire first
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If still not initialized, do a manual check
      if (!isInitialized) {
        try {
          const { auth } = await import('./lib/supabase');
          const { user, error } = await auth.getCurrentUser();
          
          if (user && !error) {
            console.log('[Viventiva] Fallback: Existing session found, restoring user:', user.id);
            setIsAuthenticated(true);
            setIsCheckingAuth(false);
            await loadUserDataFromSession(user);
            isInitialized = true;
          } else {
            console.log('[Viventiva] Fallback: No existing session found');
            setIsAuthenticated(false);
            setNeedsProfileSetup(false);
            setIsCheckingAuth(false);
            isInitialized = true;
          }
        } catch (error) {
          console.error('[Viventiva] Fallback: Error checking existing session:', error);
          setIsAuthenticated(false);
          setNeedsProfileSetup(false);
          setIsCheckingAuth(false);
          isInitialized = true;
        }
      }
    };

    // Handle OAuth callback (Google, Facebook, etc.)
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        console.log('[Viventiva OAuth] OAuth callback detected');
        const { auth } = await import('./lib/supabase');

        // Wait a bit for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the authenticated user
        const { user } = await auth.getCurrentUser();

        if (user) {
          console.log('[Viventiva OAuth] User authenticated, loading data');
          // Use the shared loadUserDataFromSession function
          await loadUserDataFromSession(user);

          // Clean up URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // Set up auth state listener for ongoing auth state changes
    const setupAuthListener = async () => {
      const { auth } = await import('./lib/supabase');
      const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
        console.log('[Viventiva] Auth state changed:', event, session?.user?.id);

        // Handle INITIAL_SESSION or SIGNED_IN events - prioritize auth listener as source of truth
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
          // Session exists - load user data (even if checkExistingSession already ran)
          console.log('[Viventiva] Session restored via listener, loading user data');
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          await loadUserDataFromSession(session.user);
          isInitialized = true;
        } else if (event === 'SIGNED_OUT') {
          // Clear everything
          localStorage.removeItem('viventiva_authenticated');
          localStorage.removeItem('viventiva_profile_complete');
          setIsAuthenticated(false);
          setNeedsProfileSetup(false);
          setIsCheckingAuth(false);
          isInitialized = true;
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('[Viventiva] Token refreshed successfully');
        } else if (event === 'INITIAL_SESSION' && !session) {
          // No session found on initial load
          console.log('[Viventiva] No session found via listener');
          if (!isInitialized) {
            // Only update state if checkExistingSession hasn't already done it
            setIsAuthenticated(false);
            setNeedsProfileSetup(false);
            setIsCheckingAuth(false);
            isInitialized = true;
          }
        }
      });
      authListener = subscription;
    };

    // Set up auth listener FIRST - it's the primary mechanism for session detection
    // The INITIAL_SESSION event is Supabase's official way to detect sessions on load
    setupAuthListener();
    handleOAuthCallback();
    // Fallback check in case listener doesn't fire (shouldn't happen, but safety net)
    checkExistingSessionFallback();

    // Idle prefetch of secondary routes/components to speed up navigation
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
    idle(() => {
      // Prefetch lightweight info pages
      import('./components/About');
      import('./components/AppPolicy');
      import('./components/TermsOfService');
      // If unauthenticated, prefetch onboarding and main app for snappier login flow
      if (!localStorage.getItem('viventiva_authenticated')) {
        import('./components/CompleteProfile');
        import('./components/MainApp');
      }
    });

    // Cleanup auth listener on unmount
    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
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
        
        // Use profile name, or fallback to Google user metadata
        if (profile.name) {
          store.setUserName(profile.name);
        } else if (user.user_metadata?.full_name) {
          store.setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          // Extract name from email
          const emailName = user.email.split('@')[0];
          store.setUserName(emailName.split('.')[0] || emailName);
        }

        const milestoneStore = useMilestoneStore.getState();
        
        // CRITICAL: Clear localStorage milestones FIRST to prevent Zustand persist from loading stale data
        // This ensures Supabase data is the source of truth
        localStorage.removeItem('memento-vivere-milestones');
        
        // Clear existing milestones first to prevent data leakage
        milestoneStore.setMilestones({});
        milestoneStore.setCustomMoods({});
        milestoneStore.setCustomCategories({});
        
        const { data: milestonesData, error: milestonesError } = await database.getMilestones(user.id);

        console.log('[Viventiva handleLogin] Loading milestones:', { milestonesData, milestonesError });

        if (milestonesData && milestonesData.milestones_data) {
          const data = milestonesData.milestones_data;
          
          // Handle both old format (just milestones object) and new format (with milestones, customMoods, customCategories)
          if (data.milestones) {
            // New format: { milestones: {}, customMoods: {}, customCategories: {} }
            console.log('[Viventiva handleLogin] Loading new format data from Supabase');
            console.log('[Viventiva handleLogin] Milestones data structure:', {
              weekCount: Object.keys(data.milestones || {}).length,
              sampleWeek: Object.keys(data.milestones || {})[0] ? data.milestones[Object.keys(data.milestones || {})[0]] : null,
              hasCustomMoods: !!data.customMoods,
              hasCustomCategories: !!data.customCategories
            });
            
            // Set milestones - Zustand persist will automatically save to localStorage
            milestoneStore.setMilestones(data.milestones || {});
            if (data.customMoods) {
              milestoneStore.setCustomMoods(data.customMoods);
            }
            if (data.customCategories) {
              milestoneStore.setCustomCategories(data.customCategories);
            }
            
            // Verify the data was set correctly
            const verifyStore = useMilestoneStore.getState();
            console.log('[Viventiva handleLogin] Verified loaded milestones:', Object.keys(verifyStore.milestones || {}).length, 'weeks in store');
          } else {
            // Old format: just milestones object
            console.log('[Viventiva handleLogin] Loading old format milestones:', Object.keys(data).length, 'weeks');
            milestoneStore.setMilestones(data);
            
            // Verify the data was set correctly
            const verifyStore = useMilestoneStore.getState();
            console.log('[Viventiva handleLogin] Verified loaded milestones:', Object.keys(verifyStore.milestones || {}).length, 'weeks in store');
          }
        } else {
          console.log('[Viventiva handleLogin] No milestone data, starting fresh');
          milestoneStore.setMilestones({});
        }

        // Load selections from Supabase
        const { useSelectionStore } = await import('./stores/useSelectionStore');
        const selectionStore = useSelectionStore.getState();

        // Clear localStorage selections FIRST to prevent Zustand persist from loading stale data
        localStorage.removeItem('memento-vivere-selections');

        // Clear existing selections
        selectionStore.setSelectedWeeks(new Set());
        selectionStore.setPinnedWeeks(new Set());
        selectionStore.setSelectedColor(null);

        const { data: selectionsData, error: selectionsError } = await database.getSelections(user.id);

        console.log('[Viventiva handleLogin] Loading selections:', { selectionsData, selectionsError });

        if (selectionsData && selectionsData.selections_data) {
          const data = selectionsData.selections_data;
          console.log('[Viventiva handleLogin] Selections data:', data);

          // Convert arrays back to Sets
          if (data.selectedWeeks) {
            selectionStore.setSelectedWeeks(new Set(data.selectedWeeks));
          }
          if (data.pinnedWeeks) {
            selectionStore.setPinnedWeeks(new Set(data.pinnedWeeks));
          }
          if (data.selectedColor) {
            selectionStore.setSelectedColor(data.selectedColor);
          }

          const verifyStore = useSelectionStore.getState();
          console.log('[Viventiva handleLogin] Verified loaded selections:', {
            selectedWeeks: verifyStore.selectedWeeks.size,
            pinnedWeeks: verifyStore.pinnedWeeks.size,
            selectedColor: verifyStore.selectedColor
          });
        } else {
          console.log('[Viventiva handleLogin] No selection data found, starting fresh');
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
          {isCheckingAuth ? (
            <LoadingSpinner message="Checking authentication..." />
          ) : !isAuthenticated ? (
            <Suspense fallback={<LoadingSpinner message="Loading..." />}>
              <HomePage darkMode={darkMode} onLogin={handleLogin} />
            </Suspense>
          ) : needsProfileSetup ? (
            <Suspense fallback={<LoadingSpinner message="Preparing setup..." />}>
              <CompleteProfile darkMode={darkMode} onComplete={handleProfileComplete} />
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
