import { useEffect, useCallback, memo, useMemo } from "react";
import { getStats } from "../utils/dateUtils";
import TabNavigation from "./TabNavigation";
import Footer from "./Footer";
import ClearLifeGrid from "./ClearLifeGrid";
import ModernMoodPalette from "./ModernMoodPalette";

// Import all components directly for optimal modern performance
import GoalTracker from "./GoalTracker";
import StatsSection from "./StatsSection";
import Dashboard from "./Dashboard";
import PricingPage from "./PricingPage";
import { useWeekInteractionsZustand } from "../hooks/useWeekInteractionsZustand";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useModernTouchGestures } from "../hooks/useModernTouchGestures";

// Import optimized Zustand stores
import { useLifeStore } from "../stores/useLifeStore";
import { useUIStore } from "../stores/useUIStore";
import { useMilestoneStore } from "../stores/useMilestoneStore";
import { useSelectionStore } from "../stores/useSelectionStore";

// Import performance monitoring
import { useRenderPerformance } from "../utils/performanceMonitor";

// Import theme utilities
import { getTheme } from "../utils/themeConfig";

const MainApp = memo(() => {
  // Performance monitoring for render time
  useRenderPerformance("MainApp");

  // Optimized Zustand selectors - use individual selectors to prevent unnecessary re-renders
  const birthDay = useLifeStore(state => state.birthDay);
  const birthMonth = useLifeStore(state => state.birthMonth);
  const birthYear = useLifeStore(state => state.birthYear);
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy);
  const currentWeek = useLifeStore(state => state.currentWeek);

  const darkMode = useUIStore(state => state.darkMode);
  const currentTab = useUIStore(state => state.currentTab);
  const showWeeks = useUIStore(state => state.showWeeks);
  const isMobile = useUIStore(state => state.isMobile);
  const gridLayout = useUIStore(state => state.gridLayout);
  const pastWeekStyle = useUIStore(state => state.pastWeekStyle);
  const themePreset = useUIStore(state => state.themePreset);
  const setCurrentTab = useUIStore(state => state.setCurrentTab);
  const setShowWeeks = useUIStore(state => state.setShowWeeks);
  const setCurrentPage = useUIStore(state => state.setCurrentPage);
  const setIsMobile = useUIStore(state => state.setIsMobile);
  const setDarkMode = useUIStore(state => state.setDarkMode);
  const setGridLayout = useUIStore(state => state.setGridLayout);
  const setPastWeekStyle = useUIStore(state => state.setPastWeekStyle);
  const setThemePreset = useUIStore(state => state.setThemePreset);

  const milestones = useMilestoneStore(state => state.milestones);
  const customCategories = useMilestoneStore(state => state.customCategories);
  const goals = useMilestoneStore(state => state.goals);
  const setMilestones = useMilestoneStore(state => state.setMilestones);
  const addCustomCategory = useMilestoneStore(state => state.addCustomCategory);
  const setGoals = useMilestoneStore(state => state.setGoals);
  const getColorOptions = useMilestoneStore(state => state.getColorOptions);
  const getAllCategories = useMilestoneStore(state => state.getAllCategories);

  const selectedColor = useSelectionStore(state => state.selectedColor);
  const selectedWeeks = useSelectionStore(state => state.selectedWeeks);
  const setSelectedColor = useSelectionStore(state => state.setSelectedColor);
  const setSelectedWeeks = useSelectionStore(state => state.setSelectedWeeks);

  // Memoize expensive getter functions to prevent recalculation on every render
  const colorOptions = useMemo(() => getColorOptions(), [getColorOptions]);
  const allCategories = useMemo(() => getAllCategories(), [getAllCategories]);

  // Get theme for UI rendering
  const theme = useMemo(() => getTheme(themePreset), [themePreset]);


  // Use custom hook for week interactions
  const weekInteractions = useWeekInteractionsZustand() || {};

  // Auto-sync milestones to Supabase when they change
  useEffect(() => {
    const syncMilestones = async () => {
      try {
        // Check if user is authenticated
        const authStatus = localStorage.getItem('viventiva_authenticated');
        if (authStatus !== 'true') return;

        // Dynamically import Supabase
        const { auth, database } = await import('../lib/supabase');
        const { user } = await auth.getCurrentUser();

        if (user && milestones) {
          // Debounce the save - only save after user stops editing for 1 second
          const timeoutId = setTimeout(async () => {
            console.log('[Viventiva Sync] Saving milestones to Supabase:', Object.keys(milestones).length, 'weeks');
            const { error } = await database.saveMilestones(user.id, milestones);
            if (error) {
              console.error('[Viventiva Sync] Error saving milestones:', error);
            } else {
              console.log('[Viventiva Sync] Milestones saved successfully');
            }
          }, 1000);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing milestones:', error);
      }
    };

    syncMilestones();
  }, [milestones]);

  // Profile update function
  const handleUpdateProfile = useCallback(async () => {
    try {
      // Get current state before update
      const lifeStore = useLifeStore.getState();
      const currentState = {
        currentWeek: lifeStore.currentWeek,
        birthYear: lifeStore.birthYear,
        birthMonth: lifeStore.birthMonth,
        birthDay: lifeStore.birthDay
      };

      // Check if birth data is available
      if (!currentState.birthYear || !currentState.birthMonth || !currentState.birthDay) {
        alert('Please set your birth information first in the Setup page.');
        return;
      }

      // Re-initialize the life store to recalculate current week and derived values
      lifeStore.initialize();

      // Show success feedback (can be replaced with toast notification in future)
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile data refreshed successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while refreshing data. Please try again.');
    }
  }, []);

  const {
    selectedWeek,
    isDragging,
    setIsDragging,
    draggedWeeks,
    setDraggedWeeks,
    setDragStartWeek,
    pinnedWeeks,
    setPinnedWeeks,
    selectionMode,
    // selectionPreview,
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    rangeStart,
    isInRangeMode,
    resetRangeSelection,
    clearPinnedWeeks,
  } = weekInteractions || {
    selectedWeek: null,
    isDragging: false,
    setIsDragging: () => {},
    draggedWeeks: new Set(),
    setDraggedWeeks: () => {},
    setDragStartWeek: () => {},
    pinnedWeeks: new Set(),
    setPinnedWeeks: () => {},
    selectionMode: 'single',
    handleWeekClick: () => {},
    handleWeekMouseDown: () => {},
    handleWeekMouseEnter: () => {},
    handleMouseUp: () => {},
    rangeStart: null,
    isInRangeMode: false,
    resetRangeSelection: () => {},
    clearPinnedWeeks: () => {},
  };

  // currentWeek is now provided by the lifeStore

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    
    // Throttle resize events to prevent excessive re-renders
    let resizeTimeout;
    const throttledCheckMobile = () => {
      if (resizeTimeout) return;
      resizeTimeout = setTimeout(() => {
        checkMobile();
        resizeTimeout = null;
      }, 100); // 100ms throttle
    };
    
    window.addEventListener("resize", throttledCheckMobile, { passive: true });
    return () => {
      window.removeEventListener("resize", throttledCheckMobile);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [setIsMobile]);

  // Memoize keyboard shortcuts dependencies
  const keyboardShortcutDeps = useMemo(() => ({
    selectedColor: selectedColor || null,
    selectedWeeks: selectedWeeks || new Set(),
    setSelectedWeeks: setSelectedWeeks || (() => {}),
    setSelectedColor: setSelectedColor || (() => {}),
    setIsDragging: setIsDragging || (() => {}),
    setDraggedWeeks: setDraggedWeeks || (() => {}),
    setDragStartWeek: setDragStartWeek || (() => {}),
    milestones: milestones || {},
    setMilestones: setMilestones || (() => {}),
  }), [
    selectedColor,
    selectedWeeks,
    setSelectedWeeks,
    setSelectedColor,
    setIsDragging,
    setDraggedWeeks,
    setDragStartWeek,
    milestones,
    setMilestones,
  ]);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts(keyboardShortcutDeps);

  // Removed unused resetZoom and zoom/pan code

  // Use modern touch gestures hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } =
    useModernTouchGestures({
      paintWeeks: weekInteractions?.paintWeeks || (() => {}),
      handleWeekMouseDown: handleWeekMouseDown || (() => {}),
      handleWeekMouseEnter: handleWeekMouseEnter || (() => {}),
      handleMouseUp: handleMouseUp || (() => {}),
    });

  // Handle custom mood creation - memoized to prevent unnecessary re-renders
  const handleAddCustomMood = useCallback((moodName, moodData) => {
    addCustomCategory(moodName, moodData);
  }, [addCustomCategory]);

  // theme toggle handled elsewhere

  // Memoize stats calculation
  const stats = useMemo(
    () => getStats(birthYear, birthMonth, birthDay, lifeExpectancy, milestones),
    [birthYear, birthMonth, birthDay, lifeExpectancy, milestones]
  );

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-500 ${
        darkMode
          ? "modern-bg-dark"
          : "modern-bg"
      }`}
    >
      <TabNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        showWeeks={showWeeks}
        setShowWeeks={setShowWeeks}
        setDarkMode={setDarkMode}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 pt-20 sm:pt-24 overflow-hidden">
                {/* Tabbed Navigation Content */}
        {currentTab === "home" && (
          <Dashboard stats={stats} darkMode={darkMode} />
        )}

        {currentTab === "grid" && (
          <div className={`relative mt-8 overflow-visible space-y-8`}>
            {/* Modern Mood Palette */}
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element` }>
              <ModernMoodPalette
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedWeeks={selectedWeeks}
                pinnedWeeks={pinnedWeeks}
                rangeStart={rangeStart}
                isInRangeMode={isInRangeMode}
                resetRangeSelection={resetRangeSelection}
                clearPinnedWeeks={clearPinnedWeeks}
              />
            </div>
             <div className={`${
              darkMode ? 'premium-card-dark' : 'premium-card'
            } p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl mt-8` }>
               <ClearLifeGrid
                 lifeExpectancy={lifeExpectancy}
                 currentWeek={currentWeek}
                 milestones={milestones}
                 selectedWeek={selectedWeek}
                 selectedColor={selectedColor}
                 selectedWeeks={selectedWeeks}
                 handleWeekClick={handleWeekClick}
                 handleWeekMouseDown={handleWeekMouseDown}
                 handleWeekMouseEnter={handleWeekMouseEnter}
                 handleMouseUp={handleMouseUp}
                 handleTouchStart={handleTouchStart}
                 handleTouchMove={handleTouchMove}
                 handleTouchEnd={handleTouchEnd}
                 isDragging={isDragging}
                 draggedWeeks={draggedWeeks}
                 isMobile={isMobile}
                 darkMode={darkMode}
                 allCategories={allCategories}
                 selectionMode={selectionMode}
                 showWeeks={showWeeks}
                 rangeStart={rangeStart}
                 isInRangeMode={isInRangeMode}
                 enableVirtualization={true}
               />
            </div>
          </div>
        )}

        {currentTab === "goals" && (
          <div className="mt-8">
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <GoalTracker goals={goals} setGoals={setGoals} darkMode={darkMode} />
            </div>
          </div>
        )}

        {currentTab === "pricing" && (
          <PricingPage darkMode={darkMode} />
        )}

        {currentTab === "settings" && (
          <div className="mt-8 mx-auto w-full max-w-6xl px-4">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-black bg-gradient-to-r ${themePreset ? theme.primary : 'from-emerald-500 to-teal-600'} bg-clip-text text-transparent mb-2`}>
                  Settings & Preferences
                </h2>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Customize your life visualization experience
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.iconBg} shadow-lg`}>
                      <span className="text-2xl">👤</span>
                    </div>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                      Profile
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                        <span className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Current Age
                        </span>
                        <span className={`text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                          {Math.floor((currentWeek - 1) / 52)}y
                        </span>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                        <span className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Current Week
                        </span>
                        <span className={`text-2xl font-bold bg-gradient-to-r ${theme.secondary} bg-clip-text text-transparent`}>
                          {currentWeek}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCurrentPage("setup")}
                        className={`flex-1 py-3 px-6 bg-gradient-to-r ${theme.secondary} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className={`flex-1 py-3 px-6 bg-gradient-to-r ${theme.primary} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg ${theme.shadow}`}
                      >
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.tertiary} shadow-lg`}>
                      <span className="text-2xl">🎨</span>
                    </div>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                      Grid Style
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className={`block text-sm font-medium mb-3 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        Layout
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'standard', label: 'Standard', icon: '▦' },
                          { key: 'compact', label: 'Compact', icon: '▧' },
                          { key: 'quarterly', label: 'Quarterly', icon: '▨' }
                        ].map((layout) => (
                          <button
                            key={layout.key}
                            onClick={() => setGridLayout(layout.key)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              gridLayout === layout.key
                                ? `bg-gradient-to-br ${theme.primary} text-white shadow-lg`
                                : darkMode ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            <div className="text-xl mb-1">{layout.icon}</div>
                            <div className="text-xs font-semibold">{layout.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className={`block text-sm font-medium mb-3 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        Past Week Style
                      </span>
                      <div className="flex gap-2">
                        {[
                          { key: 'none', label: 'None' },
                          { key: 'hatch', label: 'Hatch' },
                          { key: 'corner', label: 'Corner' },
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setPastWeekStyle(opt.key)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                              pastWeekStyle === opt.key
                                ? `bg-gradient-to-r ${theme.tertiary} text-white shadow-lg`
                                : darkMode ? "bg-slate-800/50 text-slate-300" : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Color */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.quaternary} shadow-lg`}>
                      <span className="text-2xl">🎨</span>
                    </div>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                      Theme Color
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className={`block text-sm font-medium mb-3 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        Stats Page Theme
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'emerald', label: 'Emerald', preview: 'from-emerald-500 to-teal-600' },
                          { key: 'ocean', label: 'Ocean', preview: 'from-blue-500 to-cyan-600' },
                          { key: 'sunset', label: 'Sunset', preview: 'from-orange-500 to-red-600' },
                          { key: 'purple', label: 'Purple', preview: 'from-purple-500 to-violet-600' },
                        ].map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setThemePreset(t.key)}
                            className={`p-4 rounded-xl transition-all duration-200 ${
                              themePreset === t.key
                                ? `bg-gradient-to-br ${t.preview} text-white shadow-lg scale-105`
                                : darkMode ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            <div className={`h-8 rounded-lg bg-gradient-to-r ${t.preview} mb-2 ${themePreset === t.key ? 'ring-2 ring-white/50' : ''}`} />
                            <div className="text-xs font-semibold">{t.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentTab === "policy" && (
          <div className="mt-8 mx-auto w-full max-w-5xl px-4 pb-16">
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-8 sm:p-12`}>
              {/* Header */}
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTheme(themePreset || 'emerald').iconBg} shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className={`text-4xl font-black bg-gradient-to-r ${getTheme(themePreset || 'emerald').primary} bg-clip-text text-transparent`}>
                      Privacy Policy
                    </h1>
                    <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-10 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                {/* Introduction */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Introduction
                  </h2>
                  <p className="leading-relaxed mb-4">
                    At Viventiva, we believe your personal data should belong to you and only you. This Privacy Policy explains our
                    commitment to protecting your privacy and outlines how we handle information when you use our life visualization application.
                  </p>
                  <p className="leading-relaxed">
                    By using Viventiva, you agree to the practices described in this policy. We encourage you to read this document
                    carefully to understand how we safeguard your information.
                  </p>
                </section>

                {/* Information Collection */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Information We Collect
                  </h2>
                  <div className={`p-6 rounded-xl mb-6 ${darkMode ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
                    <h3 className={`font-bold mb-3 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                      Personal Data You Provide
                    </h3>
                    <p className="leading-relaxed mb-4">
                      When you use Viventiva, you may choose to provide the following information, which is stored locally on your device:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start">
                        <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                        <span><strong>Birth Information:</strong> Your birth date (day, month, year) used to calculate your current age and journey timeline</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                        <span><strong>Life Expectancy:</strong> Your estimated life expectancy used to visualize remaining time</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                        <span><strong>Milestones & Events:</strong> Personal life events, memories, and colored weeks you choose to track</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                        <span><strong>Goals & Categories:</strong> Personal goals and custom categorization you create</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                        <span><strong>Preferences:</strong> UI settings including dark mode, grid layout, theme colors, and display preferences</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`p-6 rounded-xl ${darkMode ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
                    <h3 className={`font-bold mb-3 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                      Information We Do NOT Collect
                    </h3>
                    <p className="leading-relaxed">
                      We do not collect, transmit, or store any of your personal information on our servers. We do not use cookies,
                      tracking pixels, analytics services, or any other data collection mechanisms. Your information never leaves your device.
                    </p>
                  </div>
                </section>

                {/* How We Use Information */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    How We Use Your Information
                  </h2>
                  <p className="leading-relaxed mb-4">
                    All data you enter into Viventiva is used exclusively on your device to:
                  </p>
                  <div className="grid gap-4 ml-6">
                    <div className="flex items-start">
                      <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                      <div>
                        <strong>Visualize your life:</strong> Display your timeline, calculate statistics, and show your progress through time
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                      <div>
                        <strong>Track milestones:</strong> Color and categorize important weeks, events, and relationships in your life
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                      <div>
                        <strong>Manage goals:</strong> Help you set, track, and visualize personal goals and aspirations
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                      <div>
                        <strong>Personalize experience:</strong> Remember your UI preferences for a better user experience
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Storage */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Data Storage & Security
                  </h2>
                  <div className={`p-6 rounded-xl mb-4 ${darkMode ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
                    <h3 className={`font-bold mb-3 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                      Local Storage Technology
                    </h3>
                    <p className="leading-relaxed">
                      All your data is stored using your browser's localStorage technology. This means:
                    </p>
                    <ul className="space-y-2 mt-3 ml-6">
                      <li className="flex items-start">
                        <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                        <span>Data persists only in your browser on your device</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                        <span>No data is transmitted over the internet to any server</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                        <span>Clearing your browser data will delete all Viventiva information</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                        <span>Using the app on different devices or browsers creates separate, isolated data</span>
                      </li>
                    </ul>
                  </div>
                  <p className="leading-relaxed">
                    We recommend backing up your data regularly if it's important to you. Since everything is stored locally,
                    losing or clearing your browser data will result in permanent data loss.
                  </p>
                </section>

                {/* Third-Party Services */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Third-Party Services
                  </h2>
                  <p className="leading-relaxed mb-4">
                    Viventiva does not integrate with any third-party services, analytics platforms, advertising networks, or data brokers.
                    We do not share, sell, rent, or otherwise transfer your information to any third parties because we simply don't have
                    access to it.
                  </p>
                  <p className="leading-relaxed">
                    The application runs entirely in your browser without making network requests for user data. Any data you see
                    comes from your local storage, not from external servers.
                  </p>
                </section>

                {/* Your Rights */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Your Rights & Control
                  </h2>
                  <p className="leading-relaxed mb-4">
                    You have complete control over your data:
                  </p>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Access & Export</h4>
                      <p className="text-sm leading-relaxed">
                        You can access all your data at any time through the application. Export functionality allows you to download
                        your data for backup or transfer purposes.
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Modification & Deletion</h4>
                      <p className="text-sm leading-relaxed">
                        You can modify or delete any information at any time through the application's interface. You can also clear
                        all data by clearing your browser's local storage.
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>No Account Required</h4>
                      <p className="text-sm leading-relaxed">
                        You don't need to create an account, provide an email address, or register in any way to use Viventiva.
                        Start using the app immediately without sharing any identifying information.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Changes to Policy */}
                <section>
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Changes to This Policy
                  </h2>
                  <p className="leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
                    Any changes will be posted on this page with an updated effective date. We encourage you to review this policy
                    periodically to stay informed about how we protect your privacy.
                  </p>
                </section>

                {/* Contact */}
                <section className={`p-8 rounded-2xl border-2 ${darkMode ? `border-${theme.primary.split('-')[1]}-500/30 bg-gradient-to-br ${theme.primary.replace('from-', 'from-').replace(' to-', '/5 to-')}/5` : `border-${theme.primary.split('-')[1]}-300 bg-gradient-to-br ${theme.primary.replace('from-', 'from-').replace(' to-', '-50 to-')}-50`}`}>
                  <h2 className={`text-xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    Contact Us
                  </h2>
                  <p className="leading-relaxed mb-4">
                    If you have any questions, concerns, or suggestions about this Privacy Policy or our privacy practices,
                    please don't hesitate to contact us:
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong>Email:</strong>{' '}
                      <a href="mailto:privacy@viventiva.com" className={`font-semibold underline ${darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} transition-colors`}>
                        privacy@viventiva.com
                      </a>
                    </p>
                    <p>
                      <strong>Support:</strong>{' '}
                      <a href="mailto:support@viventiva.com" className={`font-semibold underline ${darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} transition-colors`}>
                        support@viventiva.com
                      </a>
                    </p>
                  </div>
                </section>

                {/* Final Note */}
                <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                  <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Your privacy is our priority. We built Viventiva to help you visualize your life without compromising your personal data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Removed duplicate bottom grid to avoid duplicate week testids */}
      <Footer darkMode={darkMode} onNavigate={setCurrentPage} />
    </div>
  );
});

MainApp.displayName = "MainApp";

export default MainApp;
