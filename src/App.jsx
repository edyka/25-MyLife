import { useState, useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load page components for code splitting
const SetupPage = lazy(() => import("./components/SetupPage"));
const SettingsPage = lazy(() => import("./components/SettingsPage"));
import MainApp from "./components/MainApp";
const About = lazy(() => import("./components/About"));
const AppPolicy = lazy(() => import("./components/AppPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/storageUtils";
import { loadTheme, applyTheme } from "./utils/themeUtils";
import { validateAppData } from "./utils/validation";
import LoadingSpinner from "./components/LoadingSpinner";
import BrowserCompatibility from "./components/BrowserCompatibility";

const App = () => {
  const [currentPage, setCurrentPage] = useState("setup");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [milestones, setMilestones] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [customCategories, setCustomCategories] = useState({});
  const [goals, setGoals] = useState([]);

  // Save data to localStorage with validation
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
    goals,
  ]);

  // Load data from localStorage with validation
  useEffect(() => {
    try {
      const data = loadFromLocalStorage();
      if (data) {
        const validatedData = validateAppData(data);

        if (validatedData.birthDay) setBirthDay(validatedData.birthDay);
        if (validatedData.birthMonth) setBirthMonth(validatedData.birthMonth);
        if (validatedData.birthYear) setBirthYear(validatedData.birthYear);
        if (validatedData.lifeExpectancy)
          setLifeExpectancy(validatedData.lifeExpectancy);
        if (validatedData.milestones) setMilestones(validatedData.milestones);
        if (validatedData.customCategories)
          setCustomCategories(validatedData.customCategories);
        if (validatedData.goals) setGoals(validatedData.goals);

        if (
          validatedData.birthYear &&
          validatedData.birthMonth &&
          validatedData.birthDay
        ) {
          setCurrentPage("main");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Reset to setup page if data is corrupted
      setCurrentPage("setup");
    }

    // Load theme
    try {
      const theme = loadTheme();
      setDarkMode(theme === "dark");
      applyTheme(theme);
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    applyTheme(theme);
  }, [darkMode]);

  const handleError = (error, errorInfo) => {
    console.error("App Error:", error, errorInfo);
    // Could send to error reporting service here
  };

  if (currentPage === "setup") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Setting up your life tracker..." />}>
          <SetupPage
            birthDay={birthDay}
            setBirthDay={setBirthDay}
            birthMonth={birthMonth}
            setBirthMonth={setBirthMonth}
            birthYear={birthYear}
            setBirthYear={setBirthYear}
            lifeExpectancy={lifeExpectancy}
            setLifeExpectancy={setLifeExpectancy}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setCurrentPage={setCurrentPage}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPage === "settings") {
    return (
      <ErrorBoundary darkMode={darkMode} onError={handleError}>
        <Suspense fallback={<LoadingSpinner darkMode={darkMode} message="Loading settings..." />}>
          <SettingsPage
            birthDay={birthDay}
            setBirthDay={setBirthDay}
            birthMonth={birthMonth}
            setBirthMonth={setBirthMonth}
            birthYear={birthYear}
            setBirthYear={setBirthYear}
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
        <MainApp
          birthDay={birthDay}
          birthMonth={birthMonth}
          birthYear={birthYear}
          lifeExpectancy={lifeExpectancy}
          milestones={milestones}
          setMilestones={setMilestones}
          setCurrentPage={setCurrentPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          customCategories={customCategories}
          setCustomCategories={setCustomCategories}
          goals={goals}
          setGoals={setGoals}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
