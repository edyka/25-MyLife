import { useMemo, useRef, useCallback, lazy, Suspense, useEffect } from "react";
import { getStats } from "../utils/dateUtils";
import TabNavigation from "./TabNavigation";
import Footer from "./Footer";
import VirtualizedWeekGrid from "./VirtualizedWeekGrid";
import MoodPalette from "./MoodPalette";
import LoadingSpinner from "./LoadingSpinner";
import { useState } from "react";

// Lazy load heavy components that are not immediately visible
const GoalTracker = lazy(() => import("./GoalTracker"));
const StatsSection = lazy(() => import("./StatsSection"));
const LifeInsights = lazy(() => import("./LifeInsights"));
const LifeStageLegend = lazy(() => import("./LifeStageLegend"));
const MobileColorSelection = lazy(() => import("./MobileColorSelection"));

// Modern hooks using Zustand stores
import { useWeekInteractionsZustand } from "../hooks/useWeekInteractionsZustand";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTouchGestures } from "../hooks/useTouchGestures";
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from "../stores";

/**
 * Modern MainApp component using Zustand stores
 * Eliminates prop drilling and provides cleaner state management
 */
const ModernMainApp = () => {
  const gridRef = useRef(null);
  const [scale, setScale] = useState(1);

  const zoomIn = useCallback(() => setScale((s) => Math.min(2, parseFloat((s + 0.1).toFixed(2)))), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, parseFloat((s - 0.1).toFixed(2)))), []);
  const resetZoom = useCallback(() => setScale(1), []);

  const handleSavePng = useCallback(async () => {
    if (!gridRef.current) return;
    try {
      // Dynamically import html-to-image only when needed (saves ~15KB from initial bundle)
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(gridRef.current, {
        cacheBust: true,
        pixelRatio: Math.min(2, window.devicePixelRatio || 1),
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "life-grid.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export image. Please try again.');
    }
  }, []);

  // Get state from Zustand stores
  const {
    birthDay,
    birthMonth,
    birthYear,
    lifeExpectancy,
    currentWeek
  } = useLifeStore();

  const {
    milestones,
    customCategories,
    goals,
    setMilestones,
    setCustomCategories,
    setGoals,
    getColorOptions,
    getAllCategories
  } = useMilestoneStore();

  const {
    selectedWeek,
    selectedColor,
    selectedWeeks,
    pinnedWeeks,
    selectionMode,
    isDragging,
    draggedWeeks,
    rangeStart,
    isInRangeMode,
    setSelectedColor,
    resetRangeSelection,
    clearPinnedWeeks
  } = useSelectionStore();

  const {
    darkMode,
    isMobile,
    currentTab,
    showWeeks,
    enableAnimations,
    setDarkMode,
    setCurrentTab,
    setCurrentPage,
    setShowWeeks,
    initializeDeviceDetection
  } = useUIStore();

  // Initialize device detection on mount
  useEffect(() => {
    const cleanup = initializeDeviceDetection();
    return cleanup;
  }, [initializeDeviceDetection]);

  // Computed values
  const colorOptions = useMemo(() => getColorOptions(), [getColorOptions]);
  const allCategories = useMemo(() => getAllCategories(), [getAllCategories]);

  // Get modern week interactions
  const weekInteractions = useWeekInteractionsZustand();

  // Use keyboard shortcuts hook with Zustand state
  useKeyboardShortcuts({
    selectedColor,
    selectedWeeks,
    setSelectedColor,
    milestones,
    setMilestones,
  });

  // Use touch gestures hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    selectedWeeks,
    getWeeksInSelection: weekInteractions.getWeeksInSelection,
    paintWeeks: weekInteractions.paintWeeks,
    handleWeekMouseDown: weekInteractions.handleWeekMouseDown,
    isDragging,
    handleWeekMouseEnter: weekInteractions.handleWeekMouseEnter,
    handleMouseUp: weekInteractions.handleMouseUp,
    setSelectionMode: useSelectionStore.getState().setSelectionMode,
  });

  // Handle custom mood creation
  const handleAddCustomMood = useCallback((moodName, moodData) => {
    setCustomCategories({
      ...customCategories,
      [moodName]: moodData,
    });
  }, [customCategories, setCustomCategories]);

  // Calculate stats
  const stats = useMemo(
    () => getStats(birthYear, birthMonth, birthDay, lifeExpectancy, milestones),
    [birthYear, birthMonth, birthDay, lifeExpectancy, milestones]
  );

  // Modern loading component
  const LoadingFallback = ({ message }) => (
    <div className="h-16 flex items-center justify-center">
      <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"} flex items-center gap-2`}>
        {enableAnimations && <LoadingSpinner size="sm" />}
        {message}
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ${
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
        setDarkMode={setDarkMode}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 pt-16 sm:pt-20 overflow-hidden">
        {/* Grid Tab */}
        {currentTab === "grid" && (
          <>
            <MoodPalette
              colorOptions={colorOptions}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedWeeks={selectedWeeks}
              setSelectedWeeks={useSelectionStore.getState().setSelectedWeeks}
              pinnedWeeks={pinnedWeeks}
              setPinnedWeeks={useSelectionStore.getState().setPinnedWeeks}
              lifeExpectancy={lifeExpectancy}
              darkMode={darkMode}
              onAddCustomMood={handleAddCustomMood}
              customCategories={customCategories}
              rangeStart={rangeStart}
              isInRangeMode={isInRangeMode}
              resetRangeSelection={resetRangeSelection}
              clearPinnedWeeks={clearPinnedWeeks}
            />
            <Suspense fallback={<LoadingFallback message="Loading life stages..." />}>
              <LifeStageLegend darkMode={darkMode} />
            </Suspense>
          </>
        )}

        {/* Stats Tab */}
        {currentTab === "stats" && (
          <>
            <div className="mb-6">
              <Suspense fallback={
                <div className="h-32 flex items-center justify-center">
                  <LoadingFallback message="Loading statistics..." />
                </div>
              }>
                <StatsSection stats={stats} showStats={true} darkMode={darkMode} />
              </Suspense>
            </div>
            <div className="mb-6">
              <Suspense fallback={
                <div className="h-48 flex items-center justify-center">
                  <LoadingFallback message="Loading life insights..." />
                </div>
              }>
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

        {/* Life Grid (shown on both grid and stats tabs) */}
        {(currentTab === "grid" || currentTab === "stats") && (
          <div className={`relative ${currentTab === "stats" ? "mt-2" : "mt-6"}`}>
            <div
              ref={gridRef}
              style={{ transform: `scale(${scale})`, transformOrigin: "center top" }}
            >
              <VirtualizedWeekGrid
                lifeExpectancy={lifeExpectancy}
                currentWeek={currentWeek}
                milestones={milestones}
                selectedWeek={selectedWeek}
                selectedColor={selectedColor}
                selectedWeeks={selectedWeeks}
                handleWeekClick={weekInteractions.handleWeekClick}
                handleWeekMouseDown={weekInteractions.handleWeekMouseDown}
                handleWeekMouseEnter={weekInteractions.handleWeekMouseEnter}
                handleMouseUp={weekInteractions.handleMouseUp}
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

            {/* Floating controls */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <div className={`flex items-center rounded-md shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-700"}`} role="group" aria-label="Zoom controls">
                <button onClick={zoomOut} className="px-2 py-1 text-sm hover:opacity-80" aria-label="Zoom out">−</button>
                <button onClick={resetZoom} className="px-2 py-1 text-sm min-w-[56px]" aria-label="Reset zoom">{Math.round(scale * 100)}%</button>
                <button onClick={zoomIn} className="px-2 py-1 text-sm hover:opacity-80" aria-label="Zoom in">+</button>
              </div>
              <button onClick={handleSavePng} className={`px-3 py-1 text-sm rounded-md shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-700"}`} aria-label="Save as PNG">Save PNG</button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {currentTab === "goals" && (
          <Suspense fallback={
            <div className="h-64 flex items-center justify-center">
              <LoadingFallback message="Loading goal tracker..." />
            </div>
          }>
            <GoalTracker goals={goals} setGoals={setGoals} darkMode={darkMode} />
          </Suspense>
        )}

        {/* Settings Tab */}
        {currentTab === "settings" && (
          <Suspense fallback={
            <div className="h-48 flex items-center justify-center">
              <LoadingFallback message="Loading color settings..." />
            </div>
          }>
            <MobileColorSelection
              colorOptions={colorOptions}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              darkMode={darkMode}
            />
          </Suspense>
        )}

        {/* Policy Tab */}
        {currentTab === "policy" && (
          <div className="mt-4">
            {/* Policy content would go here */}
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} onNavigate={setCurrentPage} />
    </div>
  );
};

export default ModernMainApp;