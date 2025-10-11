import { memo, useCallback, useMemo, useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { lifeStages } from "../utils/constants";
import WeekBox from "./WeekBox";
import { useRenderPerformance } from "../utils/performanceMonitor";

/**
 * Modern Responsive Week Grid - A comprehensive solution for displaying your timeline
 * Features multiple layout modes, responsive design, and smooth performance
 */
const ModernResponsiveWeekGrid = memo(
  ({
    lifeExpectancy,
    currentWeek,
    milestones,
    selectedWeek,
    selectedColor,
    selectedWeeks,
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
    draggedWeeks,
    isMobile,
    darkMode,
    allCategories,
    selectionMode,
    showWeeks = true,
    rangeStart = null,
    isInRangeMode = false,
    enableVirtualization = false,
    gridLayout = 'standard', // 'standard', 'compact', 'quarterly'
  }) => {
    // Performance monitoring
    useRenderPerformance("ModernResponsiveWeekGrid");

    const totalYears = parseInt(lifeExpectancy) || 80;
    const COLUMNS = showWeeks ? 52 : 12;

    // Modern responsive sizing based on layout mode
    const getSizingConfig = useCallback(() => {
      const baseSize = isMobile ? 5 : 7;

      switch (gridLayout) {
        case 'compact':
          return {
            weekSize: Math.max(4, baseSize - 2),
            weekGap: isMobile ? 1 : 1,
            rowHeight: isMobile ? 24 : 28,
            containerHeight: Math.min(500, totalYears * (isMobile ? 24 : 28))
          };
        case 'quarterly':
          return {
            weekSize: baseSize,
            weekGap: isMobile ? 2 : 3,
            rowHeight: isMobile ? 32 : 36,
            containerHeight: Math.min(600, totalYears * (isMobile ? 32 : 36))
          };
        default: // standard
          return {
            weekSize: baseSize,
            weekGap: isMobile ? 1 : 2,
            rowHeight: isMobile ? 28 : 32,
            containerHeight: Math.min(600, totalYears * (isMobile ? 28 : 32))
          };
      }
    }, [isMobile, gridLayout, totalYears]);

    const { weekSize, weekGap, rowHeight, containerHeight } = getSizingConfig();
    const listRef = useRef(null);

    // Enhanced row data with better structure
    const rowData = useMemo(() => {
      return Array.from({ length: totalYears }, (_, yearIndex) => {
        const lifeStage = Object.values(lifeStages).find(stage =>
          yearIndex >= stage.start && yearIndex < stage.end
        );

        return {
          yearIndex,
          currentAge: yearIndex,
          lifeStage,
          rowItems: Array.from(
            { length: COLUMNS },
            (_, col) => yearIndex * COLUMNS + col + 1
          ),
          // Enhanced visual markers
          isDecadeMarker: yearIndex % 10 === 0,
          isQuinquennialMarker: yearIndex % 5 === 0,
          isQuarterStart: gridLayout === 'quarterly'
        };
      });
    }, [totalYears, COLUMNS, gridLayout]);

    // Auto-scroll to current week
    useEffect(() => {
      if (listRef.current && currentWeek) {
        const currentYear = Math.floor((currentWeek - 1) / COLUMNS);
        const scrollOffset = Math.max(0, currentYear * rowHeight - containerHeight / 2);
        listRef.current.scrollTo(scrollOffset);
      }
    }, [currentWeek, COLUMNS, rowHeight, containerHeight]);

    // Memoized props for performance
    const weekBoxProps = useMemo(() => ({
      currentWeek,
      milestones,
      selectedWeek,
      selectedColor,
      selectedWeeks,
      handleWeekClick,
      handleWeekMouseDown,
      handleWeekMouseEnter,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      isDragging,
      draggedWeeks,
      isMobile,
      darkMode,
      allCategories,
      selectionMode,
      showWeeks,
      rangeStart,
      isInRangeMode,
    }), [
      currentWeek, milestones, selectedWeek, selectedColor, selectedWeeks,
      handleWeekClick, handleWeekMouseDown, handleWeekMouseEnter,
      handleTouchStart, handleTouchMove, handleTouchEnd,
      isDragging, draggedWeeks, isMobile, darkMode, allCategories,
      selectionMode, showWeeks, rangeStart, isInRangeMode
    ]);

    // Modern Row component with enhanced styling
    const ModernRow = useCallback(({ index, style }) => {
      const {
        yearIndex,
        currentAge,
        lifeStage,
        rowItems,
        isDecadeMarker,
        isQuinquennialMarker
      } = rowData[index];

      return (
        <div
          style={style}
          className={`flex items-center w-full justify-start sm:justify-center transition-all duration-300 ${
            lifeStage ? `${darkMode ? lifeStage.darkColor : lifeStage.color}` : ''
          } ${isDecadeMarker ? 'border-l-2 border-orange-500/30' : ''}`}
        >
          {/* Enhanced age labels */}
          <div
            className={`font-medium mr-1 sm:mr-2 flex-shrink-0 text-center transition-all duration-200 ${
              isMobile ? "w-5 text-[10px]" : "w-8 text-xs"
            } ${
              isDecadeMarker
                ? darkMode
                  ? "text-orange-300 font-bold"
                  : "text-orange-700 font-bold"
                : isQuinquennialMarker
                ? darkMode
                  ? "text-slate-300 font-semibold"
                  : "text-slate-700 font-semibold"
                : darkMode
                ? "text-slate-500"
                : "text-slate-500"
            }`}
            title={lifeStage ? `${lifeStage.label} - Age ${currentAge}` : `Age ${currentAge}`}
          >
            {isQuinquennialMarker ? yearIndex : ""}
          </div>

          {/* Modern responsive week grid */}
          <div
            className="flex flex-1 select-none touch-manipulation overflow-x-auto"
            style={{
              gap: `${weekGap}px`,
              paddingRight: '8px'
            }}
          >
            {rowItems.map((itemNum, colIndex) => {
              const isQuarterBoundary = gridLayout === 'quarterly' && colIndex % 13 === 0 && colIndex > 0;

              return (
                <div
                  key={itemNum}
                  className={`flex-shrink-0 ${isQuarterBoundary ? 'ml-2' : ''}`}
                  style={{
                    width: `${weekSize}px`,
                    height: `${weekSize}px`
                  }}
                >
                  <WeekBox
                    weekNum={itemNum}
                    {...weekBoxProps}
                  />
                </div>
              );
            })}
          </div>

          {/* Decade marker line */}
          {isDecadeMarker && yearIndex > 0 && (
            <div className={`absolute left-0 top-0 w-full h-px ${
              darkMode ? 'bg-orange-400/20' : 'bg-orange-500/20'
            }`} />
          )}
        </div>
      );
    }, [rowData, darkMode, isMobile, weekBoxProps, weekSize, weekGap, gridLayout]);

    const isTestEnv = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');

    // Virtualized version for performance
    if (enableVirtualization && !isTestEnv && totalYears > 10) {
      return (
        <div
          className="w-full"
          data-testid="modern-week-grid"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchEnd={handleTouchEnd}
          style={{ overflow: 'visible' }}
        >
          {/* Layout indicator */}
          <div className={`mb-2 text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="flex items-center justify-center gap-2 text-xs font-medium">
              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
              <span>
                {gridLayout === 'compact' ? 'Compact' :
                 gridLayout === 'quarterly' ? 'Quarterly' : 'Standard'} View
                {showWeeks ? ' • Weeks' : ' • Months'}
              </span>
              <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
            </div>
          </div>

          <List
            ref={listRef}
            height={containerHeight}
            itemCount={totalYears}
            itemSize={rowHeight}
            overscanCount={5}
            style={{ overflow: 'auto' }}
          >
            {ModernRow}
          </List>
        </div>
      );
    }

    // Fallback non-virtualized version
    return (
      <div
        className="flex flex-col gap-0 items-center w-full modern-week-grid-container"
        data-testid="modern-week-grid"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
      >
        {/* Layout indicator */}
        <div className={`mb-2 text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <div className="flex items-center justify-center gap-2 text-xs font-medium">
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
            <span>
              {gridLayout === 'compact' ? 'Compact' :
               gridLayout === 'quarterly' ? 'Quarterly' : 'Standard'} View
              {showWeeks ? ' • Weeks' : ' • Months'}
            </span>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
          </div>
        </div>

        {rowData.map(({ yearIndex, currentAge, lifeStage, rowItems, isDecadeMarker, isQuinquennialMarker }) => (
          <div
            key={yearIndex}
            className={`flex items-center w-full justify-start sm:justify-center ${
              lifeStage ? `${darkMode ? lifeStage.darkColor : lifeStage.color}` : ''
            } ${isDecadeMarker ? 'border-l-2 border-orange-500/30' : ''}`}
          >
            <div
              className={`font-medium mr-1 sm:mr-2 flex-shrink-0 text-center transition-all duration-200 ${
                isMobile ? "w-5 text-[10px]" : "w-8 text-xs"
              } ${
                isDecadeMarker
                  ? darkMode
                    ? "text-orange-300 font-bold"
                    : "text-orange-700 font-bold"
                  : isQuinquennialMarker
                  ? darkMode
                    ? "text-slate-300 font-semibold"
                    : "text-slate-700 font-semibold"
                  : darkMode
                  ? "text-slate-500"
                  : "text-slate-500"
              }`}
              title={lifeStage ? lifeStage.label : `Age ${currentAge}`}
            >
              {isQuinquennialMarker ? yearIndex : ""}
            </div>
            <div
              className="flex flex-1 select-none touch-manipulation overflow-x-auto"
              style={{
                gap: `${weekGap}px`,
                paddingRight: '8px'
              }}
            >
              {rowItems.map((itemNum, colIndex) => {
                const isQuarterBoundary = gridLayout === 'quarterly' && colIndex % 13 === 0 && colIndex > 0;

                return (
                  <div
                    key={itemNum}
                    className={`flex-shrink-0 ${isQuarterBoundary ? 'ml-2' : ''}`}
                    style={{
                      width: `${weekSize}px`,
                      height: `${weekSize}px`
                    }}
                  >
                    <WeekBox
                      weekNum={itemNum}
                      {...weekBoxProps}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ModernResponsiveWeekGrid.displayName = "ModernResponsiveWeekGrid";

export default ModernResponsiveWeekGrid;
