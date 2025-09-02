import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { getColorOptions } from "../utils/constants";
import { getStats } from "../utils/dateUtils";
import TabNavigation from "./TabNavigation";
import Footer from "./Footer";
import VirtualizedWeekGrid from "./VirtualizedWeekGrid";
import MoodPalette from "./MoodPalette";

// Lazy load heavy components that are not immediately visible
const GoalTracker = lazy(() => import("./GoalTracker"));
const StatsSection = lazy(() => import("./StatsSection"));
const LifeInsights = lazy(() => import("./LifeInsights"));
const LifeStageLegend = lazy(() => import("./LifeStageLegend"));
const MobileColorSelection = lazy(() => import("./MobileColorSelection"));
import { useWeekInteractions } from "../hooks/useWeekInteractions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTouchGestures } from "../hooks/useTouchGestures";

const MainApp = ({
  birthDay,
  birthMonth,
  birthYear,
  lifeExpectancy,
  milestones,
  setMilestones,
  setCurrentPage,
  darkMode,
  setDarkMode: _setDarkMode,
  customCategories,
  setCustomCategories,
  goals = [],
  setGoals = () => {},
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentTab, setCurrentTab] = useState("grid");
  const [showWeeks, setShowWeeks] = useState(true);
  const gridRef = useRef(null);

  const colorOptions = useMemo(
    () => getColorOptions(customCategories),
    [customCategories]
  );

  // Use custom hook for week interactions
  const weekInteractions = useWeekInteractions({
    lifeExpectancy,
    setMilestones,
    customCategories,
  });

  const {
    selectedWeek,
    selectedColor,
    setSelectedColor,
    isDragging,
    setIsDragging,
    draggedWeeks,
    setDraggedWeeks,
    setDragStartWeek,
    selectedWeeks,
    setSelectedWeeks,
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
  } = weekInteractions;

  const currentWeek = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return 1;
    const birth = new Date(
      parseInt(birthYear),
      parseInt(birthMonth) - 1,
      parseInt(birthDay)
    );
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
  }, [birthYear, birthMonth, birthDay]);

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
  }, []);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    selectedColor,
    selectedWeeks,
    setSelectedWeeks,
    setSelectedColor,
    setIsDragging,
    setDraggedWeeks,
    setDragStartWeek,
    milestones,
    setMilestones,
  });

  // Removed unused resetZoom and zoom/pan code

  // Use touch gestures hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } =
    useTouchGestures({
      selectedWeeks,
      getWeeksInSelection,
      paintWeeks: weekInteractions.paintWeeks,
      setSelectedWeeks,
      handleWeekMouseDown,
      isDragging,
      handleWeekMouseEnter,
      handleMouseUp,
      setSelectionMode,
    });

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
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
      }`}
    >
      <TabNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        showWeeks={showWeeks}
        setShowWeeks={setShowWeeks}
        setDarkMode={_setDarkMode || (()=>{})}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 pt-16 sm:pt-20 overflow-hidden">
                {/* Tabbed Navigation Content */}
        {currentTab === "grid" && (
          <>
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
            <Suspense fallback={<div className="h-16 flex items-center justify-center">
              <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Loading life stages...</div>
            </div>}>
              <LifeStageLegend darkMode={darkMode} />
            </Suspense>
          </>
        )}
        {currentTab === "stats" && (
          <>
            <div className="mb-6">
              <Suspense fallback={<div className="h-32 flex items-center justify-center">
                <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Loading statistics...</div>
              </div>}>
                <StatsSection stats={stats} showStats={true} darkMode={darkMode} />
              </Suspense>
            </div>
            <div className="mb-6">
              <Suspense fallback={<div className="h-48 flex items-center justify-center">
                <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Loading life insights...</div>
              </div>}>
                <LifeInsights
                  milestones={milestones}
                  birthYear={birthYear}
                  birthMonth={birthMonth}
                  birthDay={birthDay}
                  lifeExpectancy={lifeExpectancy}
                  darkMode={darkMode}
                />
              </Suspense>
            </div>
          </>
        )}

        {/* Render grid for both grid and stats tabs */}
        {(currentTab === "grid" || currentTab === "stats") && (
          <div className={`relative ${currentTab === "stats" ? "mt-2" : "mt-6"}`} ref={gridRef}>
            <VirtualizedWeekGrid
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
            />
          </div>
        )}
        {currentTab === "goals" && (
          <Suspense fallback={<div className="h-64 flex items-center justify-center">
            <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Loading goal tracker...</div>
          </div>}>
            <GoalTracker goals={goals} setGoals={setGoals} darkMode={darkMode} />
          </Suspense>
        )}
        {currentTab === "settings" && (
          <Suspense fallback={<div className="h-48 flex items-center justify-center">
            <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Loading color settings...</div>
          </div>}>
            <MobileColorSelection
              colorOptions={colorOptions}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              darkMode={darkMode}
            />
          </Suspense>
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
};

export default MainApp;
