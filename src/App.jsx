import { useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components for code splitting
const SetupPage = lazy(() => import("./components/SetupPage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));
import MainApp from "./components/MainApp";
const About = lazy(() => import("./components/About"));
const AppPolicy = lazy(() => import("./components/AppPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
import LoadingSpinner from "./components/LoadingSpinner";
import BrowserCompatibility from "./components/BrowserCompatibility";

// Import optimized Zustand selectors
import { useLifeStore } from "./stores/useLifeStore";
import { useUIStore } from "./stores/useUIStore";

const App = () => {
  // Use optimized Zustand selectors to prevent unnecessary re-renders
  const birthDay = useLifeStore(state => state.birthDay);
  const birthMonth = useLifeStore(state => state.birthMonth);
  const birthYear = useLifeStore(state => state.birthYear);
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy);
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const currentPage = useUIStore(state => state.currentPage);
  const setCurrentPage = useUIStore(state => state.setCurrentPage);

  // Check if user has completed setup
  const hasCompletedSetup = birthYear && birthMonth && birthDay && lifeExpectancy;

  // Set initial page based on whether setup is complete
  // Only auto-redirect to main if user hasn't manually navigated to setup
  useEffect(() => {
    // Only force redirect to setup if no data exists and not already on setup page
    if (!hasCompletedSetup && currentPage !== "setup") {
      setCurrentPage("setup");
    }
    // Remove the automatic redirect from setup to main - allow manual navigation
  }, [hasCompletedSetup, currentPage, setCurrentPage]);

  const handleError = (error, errorInfo) => {
    console.error("App Error:", error, errorInfo);
    // Could send to error reporting service here
  };

  if (currentPage === "setup") {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Setting up your life tracker..." />}>
          <SetupPage darkMode={darkMode} />
        </Suspense>
      </ErrorBoundary>
    );
  }

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
        <Suspense fallback={<LoadingSpinner message="Loading your life weeks..." />}>
          <MainApp />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;
