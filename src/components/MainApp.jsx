import { useEffect, useMemo, useCallback, memo } from "react";
import { getStats } from "../utils/dateUtils";
import TabNavigation from "./TabNavigation";
import Footer from "./Footer";
import ClearLifeGrid from "./ClearLifeGrid";
import MoodPalette from "./MoodPalette";

// Import all components directly for optimal modern performance
import GoalTracker from "./GoalTracker";
import StatsSection from "./StatsSection";
import LifeInsights from "./LifeInsights";
import MobileColorSelection from "./MobileColorSelection";
import { useWeekInteractions } from "../hooks/useWeekInteractions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTouchGestures } from "../hooks/useTouchGestures";

// Import optimized Zustand selectors
import { useLifeSelectors } from "../stores/useLifeStore";
import { useUISelectors } from "../stores/useUIStore";
import { useMilestoneSelectors } from "../stores/useMilestoneStore";
import { useSelectionSelectors } from "../stores/useSelectionStore";

// Import UI store directly for actions
import { useUIStore } from "../stores/useUIStore";

// Import performance monitoring
import { useRenderPerformance } from "../utils/performanceMonitor";

// Import theme utilities
import { getTheme } from "../utils/themeConfig";

const MainApp = memo(() => {
  // Performance monitoring for render time
  useRenderPerformance("MainApp");

  // Use optimized Zustand selectors to prevent unnecessary re-renders
  const { birthDay, birthMonth, birthYear, lifeExpectancy, currentWeek } = useLifeSelectors();
  const {
    darkMode,
    currentTab,
    setCurrentTab,
    showWeeks,
    setShowWeeks,
    setCurrentPage,
    isMobile,
    setIsMobile,
    gridLayout,
    setDarkMode,
    setGridLayout,
    pastWeekStyle,
    setPastWeekStyle
  } = useUISelectors();

  // Get UI store for actions
  const uiStore = useUIStore();
  const {
    milestones,
    setMilestones,
    updateMilestone,
    deleteMilestone,
    customCategories,
    setCustomCategories,
    addCustomCategory,
    goals,
    setGoals,
    colorOptions: storeColorOptions
  } = useMilestoneSelectors();
  const { selectedColor, setSelectedColor, selectedWeeks, setSelectedWeeks } = useSelectionSelectors();

  // Use color options from optimized store selector
  const colorOptions = storeColorOptions;

  // Memoize week interactions hook dependencies to prevent unnecessary re-creations
  const selectionSelectors = useSelectionSelectors();
  const weekInteractionsDeps = useMemo(() => ({
    lifeExpectancy,
    milestones,
    setMilestones,
    updateMilestone,
    deleteMilestone,
    customCategories,
    selectionStore: selectionSelectors,
  }), [lifeExpectancy, milestones, setMilestones, updateMilestone, deleteMilestone, customCategories, selectionSelectors]);

  // Use custom hook for week interactions
  const weekInteractions = useWeekInteractions(weekInteractionsDeps) || {};

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
    setSelectionMode,
    // selectionPreview,
    allCategories,
    getWeeksInSelection,
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
    setSelectionMode: () => {},
    allCategories: {},
    getWeeksInSelection: () => new Set(),
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

  // Memoize touch gestures dependencies
  const touchGestureDeps = useMemo(() => ({
    selectedWeeks: selectedWeeks || new Set(),
    getWeeksInSelection: getWeeksInSelection || (() => new Set()),
    paintWeeks: weekInteractions?.paintWeeks || (() => {}),
    setSelectedWeeks: setSelectedWeeks || (() => {}),
    handleWeekMouseDown: handleWeekMouseDown || (() => {}),
    isDragging: isDragging || false,
    handleWeekMouseEnter: handleWeekMouseEnter || (() => {}),
    handleMouseUp: handleMouseUp || (() => {}),
    setSelectionMode: setSelectionMode || (() => {}),
  }), [
    selectedWeeks,
    getWeeksInSelection,
    weekInteractions?.paintWeeks,
    setSelectedWeeks,
    handleWeekMouseDown,
    isDragging,
    handleWeekMouseEnter,
    handleMouseUp,
    setSelectionMode,
  ]);

  // Use touch gestures hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } =
    useTouchGestures(touchGestureDeps);

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
        {currentTab === "grid" && (
          <div className={`relative mt-8 overflow-visible space-y-8`}>
            {/* Mood/Colors card */}
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element` }>
              <MoodPalette
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedWeeks={selectedWeeks}
                setSelectedWeeks={setSelectedWeeks}
                pinnedWeeks={pinnedWeeks}
                setPinnedWeeks={setPinnedWeeks}
                lifeExpectancy={lifeExpectancy}
                darkMode={darkMode}
                onAddCustomMood={handleAddCustomMood}
                customCategories={customCategories}
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
                 enableVirtualization={false}
               />
            </div>
          </div>
        )}
        {currentTab === "stats" && (
          <div className="mt-8 mx-auto w-full max-w-6xl px-4">
            <StatsSection stats={stats} darkMode={darkMode} />
          </div>
        )}

        {currentTab === "goals" && (
          <div className="mt-8">
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <GoalTracker goals={goals} setGoals={setGoals} darkMode={darkMode} />
            </div>
          </div>
        )}
        {currentTab === "settings" && (
          <div className="mt-8 mx-auto w-full max-w-6xl px-4">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-black bg-gradient-to-r ${uiStore.themePreset ? getTheme(uiStore.themePreset).primary : 'from-emerald-500 to-teal-600'} bg-clip-text text-transparent mb-2`}>
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
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${getTheme(uiStore.themePreset).iconBg} shadow-lg`}>
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
                        <span className={`text-2xl font-bold bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
                          {Math.floor((currentWeek - 1) / 52)}y
                        </span>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                        <span className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Current Week
                        </span>
                        <span className={`text-2xl font-bold bg-gradient-to-r ${getTheme(uiStore.themePreset).secondary} bg-clip-text text-transparent`}>
                          {currentWeek}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentPage("setup")}
                      className={`w-full py-3 px-6 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg ${getTheme(uiStore.themePreset).shadow}`}
                    >
                      Update Profile
                    </button>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${getTheme(uiStore.themePreset).tertiary} shadow-lg`}>
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
                                ? `bg-gradient-to-br ${getTheme(uiStore.themePreset).primary} text-white shadow-lg`
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
                                ? `bg-gradient-to-r ${getTheme(uiStore.themePreset).tertiary} text-white shadow-lg`
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
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${getTheme(uiStore.themePreset).quaternary} shadow-lg`}>
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
                            onClick={() => uiStore.setThemePreset(t.key)}
                            className={`p-4 rounded-xl transition-all duration-200 ${
                              uiStore.themePreset === t.key
                                ? `bg-gradient-to-br ${t.preview} text-white shadow-lg scale-105`
                                : darkMode ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            <div className={`h-8 rounded-lg bg-gradient-to-r ${t.preview} mb-2 ${uiStore.themePreset === t.key ? 'ring-2 ring-white/50' : ''}`} />
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
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTheme(uiStore.themePreset || 'emerald').iconBg} shadow-lg`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className={`text-4xl font-black bg-gradient-to-r ${getTheme(uiStore.themePreset || 'emerald').primary} bg-clip-text text-transparent`}>
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
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
                        <span><strong>Birth Information:</strong> Your birth date (day, month, year) used to calculate your current age and life weeks</span>
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
                    How We Use Your Information
                  </h2>
                  <p className="leading-relaxed mb-4">
                    All data you enter into Viventiva is used exclusively on your device to:
                  </p>
                  <div className="grid gap-4 ml-6">
                    <div className="flex items-start">
                      <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                      <div>
                        <strong>Visualize your life:</strong> Display your life weeks, calculate statistics, and show your progress through time
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
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
                  <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
                    Changes to This Policy
                  </h2>
                  <p className="leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
                    Any changes will be posted on this page with an updated effective date. We encourage you to review this policy
                    periodically to stay informed about how we protect your privacy.
                  </p>
                </section>

                {/* Contact */}
                <section className={`p-8 rounded-2xl border-2 ${darkMode ? `border-${getTheme(uiStore.themePreset).primary.split('-')[1]}-500/30 bg-gradient-to-br ${getTheme(uiStore.themePreset).primary.replace('from-', 'from-').replace(' to-', '/5 to-')}/5` : `border-${getTheme(uiStore.themePreset).primary.split('-')[1]}-300 bg-gradient-to-br ${getTheme(uiStore.themePreset).primary.replace('from-', 'from-').replace(' to-', '-50 to-')}-50`}`}>
                  <h2 className={`text-xl font-bold mb-4 bg-gradient-to-r ${getTheme(uiStore.themePreset).primary} bg-clip-text text-transparent`}>
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
