import { useEffect, lazy, Suspense, memo } from "react";
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
import { useLifeSelectors } from "./stores/useLifeStore";
import { useUISelectors } from "./stores/useUIStore";
import { useMilestoneSelectors } from "./stores/useMilestoneStore";

const App = () => {
  // Use optimized Zustand selectors to prevent unnecessary re-renders
  const { birthDay, birthMonth, birthYear, lifeExpectancy } = useLifeSelectors();
  const { darkMode, currentPage, setCurrentPage, setDarkMode } = useUISelectors();
  const { milestones, setMilestones, customCategories, setCustomCategories, goals, setGoals } = useMilestoneSelectors();

  // Check if user has completed setup
  const hasCompletedSetup = birthYear && birthMonth && birthDay && lifeExpectancy;

  // Set initial page based on whether setup is complete
  useEffect(() => {
    if (hasCompletedSetup && currentPage === "setup") {
      setCurrentPage("main");
    } else if (!hasCompletedSetup && currentPage !== "setup") {
      setCurrentPage("setup");
    }
  }, [hasCompletedSetup, currentPage, setCurrentPage]);

  const handleError = (error, errorInfo) => {
    console.error("App Error:", error, errorInfo);
    // Could send to error reporting service here
  };

  if (currentPage === "setup") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Setting up your life tracker..." />}>
          <SetupPage darkMode={darkMode} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "settings") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Loading settings..." />}>
          <SettingsPage darkMode={darkMode} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "about") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Loading about page..." />}>
          <About darkMode={darkMode} onBack={() => setCurrentPage("main")} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "privacy") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Loading privacy policy..." />}>
          <AppPolicy darkMode={darkMode} onBack={() => setCurrentPage("main")} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "terms") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Loading terms of service..." />}>
          <TermsOfService
            darkMode={darkMode}
            onBack={() => setCurrentPage("main")}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary darkMode={darkMode} onError={handleError}>
      <BrowserCompatibility darkMode={darkMode} />
      <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Loading your life weeks..." />}>
        <MainApp />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
