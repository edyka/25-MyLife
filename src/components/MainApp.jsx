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
    setCustomCategories((prev) => ({
      ...prev,
      [moodName]: moodData,
    }));
  }, [setCustomCategories]);

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
            } p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl` }>
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
          <div className="space-y-8 mt-8">
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <StatsSection stats={stats} showStats={true} darkMode={darkMode} />
            </div>
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <LifeInsights
                milestones={milestones}
                birthYear={birthYear}
                birthMonth={birthMonth}
                birthDay={birthDay}
                lifeExpectancy={lifeExpectancy}
                darkMode={darkMode}
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
        {currentTab === "settings" && (
          <div className="space-y-8 mt-8">
            {/* Color Selection Section */}
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <h3 className={`text-heading mb-6 ${
                darkMode ? "text-slate-100" : "text-slate-800"
              } flex items-center gap-3`}>
                <span className="text-2xl">🎨</span>
                Week Colors
              </h3>
              <MobileColorSelection
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                darkMode={darkMode}
              />
            </div>

            {/* Age Re-entry Section */}
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <h3 className={`text-heading mb-6 ${
                darkMode ? "text-slate-100" : "text-slate-800"
              } flex items-center gap-3`}>
                <span className="text-2xl">📅</span>
                Update Your Age
              </h3>
              <div className={`p-6 rounded-2xl border transition-all duration-200 ${
                darkMode
                  ? "bg-slate-800/30 border-slate-600/50"
                  : "bg-slate-50/50 border-slate-200/50"
              }`}>
                <p className={`text-sm mb-4 ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}>
                  Want to change your birth date or life expectancy? This will recalculate your entire life timeline.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-800"
                    }`}>
                      Current Age: {Math.floor((currentWeek - 1) / 52)} years
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}>
                      Week {currentWeek}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className={`block text-xs font-medium mb-1 ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}>
                        Birth Year
                      </span>
                      <span className={`text-sm font-semibold ${
                        darkMode ? "text-slate-200" : "text-slate-800"
                      }`}>
                        {birthYear || "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-xs font-medium mb-1 ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}>
                        Life Expectancy
                      </span>
                      <span className={`text-sm font-semibold ${
                        darkMode ? "text-slate-200" : "text-slate-800"
                      }`}>
                        {lifeExpectancy || "Not set"} years
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentPage("setup")}
                    className="w-full py-4 px-6 btn-gradient-accent text-white font-bold rounded-2xl interactive-element shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-lg">✏️</span>
                      Re-enter Age Information
                    </span>
                  </button>

                  <p className={`text-xs text-center mt-2 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    This will take you back to the setup screen
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Layout Settings */}
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <h3 className={`text-heading mb-6 ${
                darkMode ? "text-slate-100" : "text-slate-800"
              } flex items-center gap-3`}>
                <span className="text-2xl">🎨</span>
                Grid Layout
              </h3>
              <div className={`p-6 rounded-2xl border ${
                darkMode
                  ? "bg-slate-800/30 border-slate-600/50"
                  : "bg-slate-50/50 border-slate-200/50"
              }`}>
                <div className="space-y-3">
                  <div>
                    <span className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-slate-200" : "text-slate-800"
                    }`}>
                      Layout Style
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'standard', label: 'Standard', desc: 'Balanced view' },
                        { key: 'compact', label: 'Compact', desc: 'More weeks visible' },
                        { key: 'quarterly', label: 'Quarterly', desc: 'Quarter markers' }
                      ].map((layout) => (
                        <button
                          key={layout.key}
                          onClick={() => setGridLayout(layout.key)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                            gridLayout === layout.key
                              ? (darkMode ? "bg-cyan-500/15 border-cyan-400 text-cyan-200" : "bg-cyan-50 border-cyan-400 text-cyan-700")
                              : (darkMode ? "border-slate-600 hover:border-slate-500 text-slate-300" : "border-slate-300 hover:border-slate-400 text-slate-600")
                          }`}
                        >
                          <div className="text-sm font-medium">{layout.label}</div>
                          <div className="text-xs opacity-75">{layout.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                      Theme Preset
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'mint', label: 'Neo Mint', preview: 'from-emerald-400 to-teal-500' },
                        { key: 'indigo', label: 'Indigo', preview: 'from-indigo-500 to-violet-500' },
                        { key: 'cyan', label: 'Cyan', preview: 'from-cyan-500 to-sky-600' },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setPastWeekStyle && uiStore.setThemePreset ? uiStore.setThemePreset(t.key) : null}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                            uiStore.themePreset === t.key
                              ? darkMode ? "border-emerald-400" : "border-emerald-500"
                              : darkMode ? "border-slate-600" : "border-slate-300"
                          }`}
                        >
                          <div className={`h-6 rounded-md bg-gradient-to-r ${t.preview} mb-1`} />
                          <div className="text-sm font-medium">{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-800"
                    }`}>
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
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border ${pastWeekStyle===opt.key ? 'border-orange-500 text-orange-600' : (darkMode ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-700')}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}>
              <h3 className={`text-heading mb-6 ${
                darkMode ? "text-slate-100" : "text-slate-800"
              } flex items-center gap-3`}>
                <span className="text-2xl">⚙️</span>
                App Settings
              </h3>
              <div className={`p-6 rounded-2xl border ${
                darkMode
                  ? "bg-slate-800/30 border-slate-600/50"
                  : "bg-slate-50/50 border-slate-200/50"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-800"
                    }`}>
                      Show Week Numbers
                    </span>
                    <button
                      onClick={() => setShowWeeks(!showWeeks)}
                      className={`w-12 h-6 rounded-full transition-all duration-200 ${
                        showWeeks
                          ? "bg-orange-500"
                          : darkMode ? "bg-slate-600" : "bg-slate-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        showWeeks ? "translate-x-6" : "translate-x-0.5"
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentTab === "policy" && (
          <div className="mt-4">
            {/* Overlay not used in new selection model */}
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
