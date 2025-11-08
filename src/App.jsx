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
import LoadingProgress from "./components/LoadingProgress";
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

  // Set theme data attribute for CSS variable-based scrollbar colors
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themePreset);
  }, [themePreset]);

  // Track page views for analytics and update SEO
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { trackPageView: track } = await import('./utils/analytics');
        const path = window.location.pathname + window.location.hash;
        track(path);
      } catch (error) {
        // Analytics not critical, continue silently
      }
    };
    
    const updateSEO = async () => {
      try {
        const { initSEO, generateOrganizationSchema, generateWebAppSchema, setStructuredData } = await import('./utils/seo');
        
        // Update SEO based on current page
        if (currentPage === 'main' && isAuthenticated) {
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
          // Default/homepage SEO
          initSEO({
            title: 'Viventiva - Visualize Your Life',
            description: 'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally. Each square represents one week of your life.',
          });
        }
        
        // Add structured data for homepage
        if (currentPage === 'main' && !isAuthenticated) {
          setStructuredData(generateOrganizationSchema());
          setStructuredData(generateWebAppSchema());
        }
      } catch (error) {
        console.error('[Viventiva] Error updating SEO:', error);
      }
    };
    
    trackPageView();
    updateSEO();
  }, [currentPage, isAuthenticated]);

  // Authentication and onboarding state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Loading state while checking auth
  const [loadingStage, setLoadingStage] = useState('auth'); // Loading stage for progress indicator

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
        const { data: profile, error: profileError } = await database.getUserProfile(user.id);
        
        // Check for Brave Shields blocking (406 errors)
        if (profileError && profileError.status === 406) {
          console.error('[Viventiva] Brave Shields is blocking Supabase requests. Please disable Shields for localhost.');
          // The BrowserCompatibility component will show a warning
        }

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

          setLoadingStage('ready');
          setIsAuthenticated(true);
          setNeedsProfileSetup(false);
          setIsCheckingAuth(false);
          localStorage.setItem('viventiva_authenticated', 'true');
          localStorage.setItem('viventiva_profile_complete', 'true');

          // Initialize session timeout
          try {
            const { initSessionTimeout } = await import('./utils/sessionTimeout');
            initSessionTimeout({
              inactivityTimeout: 30 * 60 * 1000,
              warningTime: 5 * 60 * 1000,
              onWarning: (info) => console.warn(`[SessionTimeout] Session expiring in ${info.minutesRemaining} minute(s)`),
              onTimeout: async () => {
                const { auth } = await import('./lib/supabase');
                await auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              },
            });
          } catch (error) {
            console.error('[Viventiva] Error initializing session timeout:', error);
          }
          
          // Load user settings from Supabase
          try {
            const { useUIStore } = await import('./stores/useUIStore');
            await useUIStore.getState().loadSettingsFromSupabase();
          } catch (error) {
            console.error('[Viventiva] Error loading settings:', error);
          }
        } else {
          // Profile is NOT complete - check if this is a new session or stale one
          // If user just logged in, show profile setup. Otherwise, clear session and show homepage.
          const justLoggedIn = localStorage.getItem('viventiva_just_logged_in') === 'true';
          
          if (justLoggedIn) {
            // User just logged in - show profile setup
            localStorage.removeItem('viventiva_just_logged_in');
            setIsAuthenticated(true);
            setNeedsProfileSetup(true);
            setIsCheckingAuth(false);
            localStorage.setItem('viventiva_authenticated', 'true');
            localStorage.removeItem('viventiva_profile_complete');
          } else {
            // Stale session without profile - clear it and show homepage
            console.log('[Viventiva] Stale session detected (no profile), clearing and showing homepage');
            const { auth } = await import('./lib/supabase');
            await auth.signOut();
            setIsAuthenticated(false);
            setNeedsProfileSetup(false);
            setIsCheckingAuth(false);
            localStorage.removeItem('viventiva_authenticated');
            localStorage.removeItem('viventiva_profile_complete');
          }
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
      // Check if we're logging out - skip session check
      if (sessionStorage.getItem('viventiva_logging_out') === 'true') {
        console.log('[Viventiva] Logout in progress, skipping session check');
        setIsAuthenticated(false);
        setNeedsProfileSetup(false);
        setIsCheckingAuth(false);
        isInitialized = true;
        sessionStorage.removeItem('viventiva_logging_out');
        return;
      }
      
      // Wait a bit for the auth listener to fire first
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If still not initialized, do a manual check
      if (!isInitialized) {
        // Check again if logout happened during wait
        if (sessionStorage.getItem('viventiva_logging_out') === 'true') {
          console.log('[Viventiva] Logout detected during wait, skipping session check');
          setIsAuthenticated(false);
          setNeedsProfileSetup(false);
          setIsCheckingAuth(false);
          isInitialized = true;
          sessionStorage.removeItem('viventiva_logging_out');
          return;
        }
        
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
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        console.error('[Viventiva OAuth] OAuth error:', error, errorDescription);
        setIsCheckingAuth(false);
        return;
      }

      if (accessToken) {
        console.log('[Viventiva OAuth] OAuth callback detected');
        setIsCheckingAuth(true);
        
        const { auth } = await import('./lib/supabase');

        // Wait a bit for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the authenticated user
        const { user, error: userError } = await auth.getCurrentUser();

        if (user && !userError) {
          console.log('[Viventiva OAuth] User authenticated, loading data');
          // Mark that user just logged in
          localStorage.setItem('viventiva_just_logged_in', 'true');
          // Set authenticated state immediately
          setIsAuthenticated(true);
          
          // Reset rate limit on successful OAuth login
          try {
            const { resetRateLimit } = await import('./utils/rateLimiter');
            const provider = window.location.hash.includes('provider=google') ? 'google' :
                           window.location.hash.includes('provider=facebook') ? 'facebook' :
                           window.location.hash.includes('provider=apple') ? 'apple' : 'oauth';
            resetRateLimit('oauth', `oauth:${provider}`);
          } catch (error) {
            console.error('[Viventiva] Error resetting rate limit:', error);
          }
          
          // Track OAuth login
          try {
            const { trackUserAction } = await import('./utils/analytics');
            const provider = window.location.hash.includes('provider=google') ? 'google' :
                           window.location.hash.includes('provider=facebook') ? 'facebook' :
                           window.location.hash.includes('provider=apple') ? 'apple' : 'oauth';
            trackUserAction('user_login', { method: provider });
          } catch (error) {
            console.error('[Viventiva] Error tracking OAuth login:', error);
          }
          
          // Use the shared loadUserDataFromSession function
          // It will set setIsCheckingAuth(false) when done
          await loadUserDataFromSession(user);

          // Clean up URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('[Viventiva OAuth] Failed to get user after OAuth:', userError);
          setIsCheckingAuth(false);
        }
      }
    };

    // Set up auth state listener for ongoing auth state changes
    const setupAuthListener = async () => {
      const { auth } = await import('./lib/supabase');
      const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
        console.log('[Viventiva] Auth state changed:', event, session?.user?.id);

        // Check if we're in the middle of logging out - ignore auth events
        if (sessionStorage.getItem('viventiva_logging_out') === 'true') {
          console.log('[Viventiva] Logout in progress, ignoring auth event:', event);
          if (event === 'SIGNED_OUT') {
            sessionStorage.removeItem('viventiva_logging_out');
          }
          return;
        }

        // Handle INITIAL_SESSION or SIGNED_IN events - prioritize auth listener as source of truth
        if (event === 'SIGNED_IN' && session?.user) {
          // User just signed in (email or OAuth) - mark it
          localStorage.setItem('viventiva_just_logged_in', 'true');
          console.log('[Viventiva] User signed in via listener (email/OAuth), loading user data');
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          
          // Initialize session timeout
          try {
            const { initSessionTimeout } = await import('./utils/sessionTimeout');
            initSessionTimeout({
              inactivityTimeout: 30 * 60 * 1000,
              warningTime: 5 * 60 * 1000,
              onWarning: (info) => console.warn(`[SessionTimeout] Session expiring in ${info.minutesRemaining} minute(s)`),
              onTimeout: async () => {
                const { auth } = await import('./lib/supabase');
                await auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              },
            });
          } catch (error) {
            console.error('[Viventiva] Error initializing session timeout:', error);
          }
          
          await loadUserDataFromSession(session.user);
          isInitialized = true;
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // Initial session on page load - check if user just logged in
          console.log('[Viventiva] Initial session found via listener, loading user data');
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          
          // Initialize session timeout for existing sessions
          try {
            const { initSessionTimeout } = await import('./utils/sessionTimeout');
            initSessionTimeout({
              inactivityTimeout: 30 * 60 * 1000,
              warningTime: 5 * 60 * 1000,
              onWarning: (info) => console.warn(`[SessionTimeout] Session expiring in ${info.minutesRemaining} minute(s)`),
              onTimeout: async () => {
                const { auth } = await import('./lib/supabase');
                await auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              },
            });
          } catch (error) {
            console.error('[Viventiva] Error initializing session timeout:', error);
          }
          
          await loadUserDataFromSession(session.user);
          isInitialized = true;
        } else if (event === 'SIGNED_OUT') {
          // Clear everything on sign out
          console.log('[Viventiva] SIGNED_OUT event received, clearing state');
          
          // Destroy session timeout
          try {
            const { destroySessionTimeout } = await import('./utils/sessionTimeout');
            destroySessionTimeout();
          } catch (error) {
            console.error('[Viventiva] Error destroying session timeout:', error);
          }
          
          localStorage.removeItem('viventiva_authenticated');
          localStorage.removeItem('viventiva_profile_complete');
          localStorage.removeItem('viventiva_just_logged_in');
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
    console.log('[Viventiva handleLogin] Login handler called');
    setIsCheckingAuth(true);
    
    // Wait a moment for session to be fully established (especially for email login)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if user has completed their profile
    const { auth, database } = await import('./lib/supabase');
    
    // Try multiple times to get user (session might take a moment)
    let user = null;
    let userError = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts && !user) {
      const result = await auth.getCurrentUser();
      user = result.user;
      userError = result.error;
      
      if (user && !userError) {
        break;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`[Viventiva handleLogin] Attempt ${attempts} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (user && !userError) {
      console.log('[Viventiva handleLogin] User found:', user.id);
      // Mark that user just logged in
      localStorage.setItem('viventiva_just_logged_in', 'true');
      localStorage.setItem('viventiva_authenticated', 'true');
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

        setLoadingStage('ready');
        setIsAuthenticated(true);
        setNeedsProfileSetup(false);
        setIsCheckingAuth(false);
        localStorage.setItem('viventiva_profile_complete', 'true');

        // Initialize session timeout for authenticated users
        try {
          const { initSessionTimeout } = await import('./utils/sessionTimeout');
          initSessionTimeout({
            inactivityTimeout: 30 * 60 * 1000, // 30 minutes
            warningTime: 5 * 60 * 1000, // 5 minutes warning
            onWarning: (info) => {
              // Show warning notification (could be enhanced with a toast/notification component)
              console.warn(`[SessionTimeout] Session expiring in ${info.minutesRemaining} minute(s)`);
            },
            onTimeout: async () => {
              // Handle session timeout - logout user
              console.log('[SessionTimeout] Session expired, logging out');
              const { auth } = await import('./lib/supabase');
              await auth.signOut();
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/';
            },
          });
        } catch (error) {
          console.error('[Viventiva] Error initializing session timeout:', error);
        }
        
        // Load user settings from Supabase
        try {
          const { useUIStore } = await import('./stores/useUIStore');
          await useUIStore.getState().loadSettingsFromSupabase();
        } catch (error) {
          console.error('[Viventiva] Error loading settings:', error);
        }
      } else {
        // New user - needs to complete profile
        setIsAuthenticated(true);
        setNeedsProfileSetup(true);
        setIsCheckingAuth(false);
        localStorage.removeItem('viventiva_profile_complete');
      }
    } else {
      console.error('[Viventiva handleLogin] No user found after', maxAttempts, 'attempts. Error:', userError);
      setIsCheckingAuth(false);
      
      // The auth listener should handle SIGNED_IN events, but if it hasn't fired yet,
      // wait a bit more and let it handle the session restoration
      console.log('[Viventiva handleLogin] Session may still be establishing. Auth listener will handle SIGNED_IN event.');
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
        <CookieConsent />
        <div className={`${darkMode ? 'modern-bg-dark' : 'modern-bg'} min-h-screen transition-all duration-500`}>
          {isCheckingAuth ? (
            <LoadingProgress stage={loadingStage} />
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
