import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";
import StoreProvider from "./StoreProvider";
import ModernMainApp from "./ModernMainApp";
import LoadingSpinner from "./LoadingSpinner";
import BrowserCompatibility from "./BrowserCompatibility";

// Lazy load page components for code splitting
const SetupPage = lazy(() => import("./SetupPage"));
const SettingsPage = lazy(() => import("./SettingsPage"));
const About = lazy(() => import("./About"));
const AppPolicy = lazy(() => import("./AppPolicy"));
const TermsOfService = lazy(() => import("./TermsOfService"));

// Import stores
import { useLifeStore, useMilestoneStore, useUIStore } from "../stores";
import { saveToLocalStorage } from "../utils/storageUtils";
import { applyTheme } from "../utils/themeUtils";

/**
 * Modern App component using Zustand stores
 * Eliminates local state and provides better state management
 */
const ModernApp = () => {
  // Get state from Zustand stores
  const { 
    birthDay, 
    birthMonth, 
    birthYear, 
    lifeExpectancy,
    setBirthData,
    setLifeExpectancy
  } = useLifeStore();

  const { 
    milestones, 
    customCategories, 
    goals,
    setMilestones,
    setCustomCategories
  } = useMilestoneStore();

  const { 
    currentPage, 
    darkMode, 
    setCurrentPage,
    setDarkMode
  } = useUIStore();

  // Auto-save to localStorage when data changes
  useEffect(() => {
    if (birthDay && birthMonth && birthYear && lifeExpectancy) {
      try {
        const success = saveToLocalStorage(
          birthDay,
          birthMonth,
          birthYear,
          lifeExpectancy,
          milestones,
          customCategories,
          goals
        );
        if (!success) {
          console.warn("Failed to save data to storage");
        }
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
  }, [
    birthDay,
    birthMonth,
    birthYear,
    lifeExpectancy,
    milestones,
    customCategories,
    goals
  ]);

  // Apply theme when darkMode changes
  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  // Setup completion handler
  const handleSetupComplete = (day, month, year, expectancy) => {
    setBirthData(day, month, year);
    setLifeExpectancy(expectancy);
    setCurrentPage("main");
  };

  // Loading fallback with theme awareness
  const LoadingFallback = () => (
    <LoadingSpinner message="Loading component..." />
  );

  // Check browser compatibility
  if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
    return <BrowserCompatibility />;
  }

  return (
    <ErrorBoundary>
      <StoreProvider>
        <div className="app-container">
          {currentPage === "setup" && (
            <Suspense fallback={<LoadingFallback />}>
              <SetupPage
                onSetupComplete={handleSetupComplete}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            </Suspense>
          )}

          {currentPage === "main" && <ModernMainApp />}

          {currentPage === "settings" && (
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage
                birthDay={birthDay}
                setBirthDay={(day) => setBirthData(day, birthMonth, birthYear)}
                birthMonth={birthMonth}
                setBirthMonth={(month) => setBirthData(birthDay, month, birthYear)}
                birthYear={birthYear}
                setBirthYear={(year) => setBirthData(birthDay, birthMonth, year)}
                lifeExpectancy={lifeExpectancy}
                setLifeExpectancy={setLifeExpectancy}
                milestones={milestones}
                setMilestones={setMilestones}
                setCurrentPage={setCurrentPage}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                customCategories={customCategories}
                setCustomCategories={setCustomCategories}
              />
            </Suspense>
          )}

          {currentPage === "about" && (
            <Suspense fallback={<LoadingFallback />}>
              <About onNavigate={setCurrentPage} />
            </Suspense>
          )}

          {currentPage === "policy" && (
            <Suspense fallback={<LoadingFallback />}>
              <AppPolicy darkMode={darkMode} onNavigate={setCurrentPage} />
            </Suspense>
          )}

          {currentPage === "terms" && (
            <Suspense fallback={<LoadingFallback />}>
              <TermsOfService darkMode={darkMode} onNavigate={setCurrentPage} />
            </Suspense>
          )}
        </div>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default ModernApp;