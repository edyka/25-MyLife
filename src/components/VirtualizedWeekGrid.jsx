import { memo, useCallback, useMemo, useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { lifeStages } from "../utils/constants";
import WeekBox from "./WeekBox";
import { useRenderPerformance } from "../utils/performanceMonitor";

const VirtualizedWeekGrid = memo(
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
  }) => {
    // Performance monitoring for grid rendering
    useRenderPerformance("VirtualizedWeekGrid");

    const totalYears = parseInt(lifeExpectancy) || 80;
    const COLUMNS = showWeeks ? 52 : 12;
    const ROW_HEIGHT = isMobile ? 32 : 40;
    const CONTAINER_HEIGHT = Math.min(600, totalYears * ROW_HEIGHT);

    // Modern responsive sizing for weeks
    const weekSize = isMobile ? 6 : 8; // Fixed size instead of flexible
    const weekGap = isMobile ? 1 : 2;
    const listRef = useRef(null);

    // Memoize expensive calculations
    const rowData = useMemo(() => {
      return Array.from({ length: totalYears }, (_, yearIndex) => ({
        yearIndex,
        currentAge: yearIndex,
        lifeStage: Object.values(lifeStages).find(stage =>
          yearIndex >= stage.start && yearIndex < stage.end
        ),
        rowItems: Array.from(
          { length: COLUMNS },
          (_, col) => yearIndex * COLUMNS + col + 1
        ),
      }));
    }, [totalYears, COLUMNS]);

    // Auto-scroll to current week on mount
    useEffect(() => {
      if (listRef.current && currentWeek) {
        const currentYear = Math.floor((currentWeek - 1) / COLUMNS);
        const scrollOffset = Math.max(0, currentYear * ROW_HEIGHT - CONTAINER_HEIGHT / 2);
        listRef.current.scrollTo(scrollOffset);
      }
    }, [currentWeek, COLUMNS, ROW_HEIGHT, CONTAINER_HEIGHT]);

    // Memoize props object to prevent WeekBox recreations
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

    const Row = useCallback(({ index, style }) => {
      const { yearIndex, currentAge, lifeStage, rowItems } = rowData[index];

      return (
        <div
          style={style}
          className={`flex items-center w-full justify-start sm:justify-center ${
            lifeStage ? `${darkMode ? lifeStage.darkColor : lifeStage.color}` : ''
          }`}
        >
          <div
            className={`text-xs font-medium mr-1 sm:mr-2 flex-shrink-0 text-center ${
              isMobile ? "w-5 text-[10px]" : "w-8"
            } ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            title={lifeStage ? lifeStage.label : `Age ${currentAge}`}
          >
            {yearIndex % 5 === 0 ? yearIndex : ""}
          </div>
          <div
            className="flex flex-1 select-none touch-manipulation overflow-x-auto"
            style={{
              gap: `${weekGap}px`,
              paddingRight: '8px'
            }}
          >
            {rowItems.map((itemNum) => (
              <div
                key={itemNum}
                className="flex-shrink-0"
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
            ))}
          </div>
        </div>
      );
    }, [rowData, darkMode, isMobile, weekBoxProps, COLUMNS, weekSize, weekGap]);

    const isTestEnv = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');

    // Use virtualized list only when explicitly enabled
    if (enableVirtualization && !isTestEnv && totalYears > 10) {
      return (
        <div
          className="w-full"
          data-testid="week-grid"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchEnd={handleTouchEnd}
          style={{ overflow: 'visible' }}
        >
          <List
            ref={listRef}
            height={CONTAINER_HEIGHT}
            itemCount={totalYears}
            itemSize={ROW_HEIGHT}
            overscanCount={5} // Render 5 extra rows for smoother scrolling
            style={{ overflow: 'auto' }}
          >
            {Row}
          </List>
        </div>
      );
    }

    // Fallback to non-virtualized for small grids or tests
    return (
      <div
        className="flex flex-col gap-0 items-center w-full week-grid-container"
        data-testid="week-grid"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
      >
        {rowData.map(({ yearIndex, currentAge, lifeStage, rowItems }) => (
          <div
            key={yearIndex}
            className={`flex items-center w-full justify-start sm:justify-center ${
              lifeStage ? `${darkMode ? lifeStage.darkColor : lifeStage.color}` : ''
            }`}
          >
            <div
              className={`text-xs font-medium mr-1 sm:mr-2 flex-shrink-0 text-center ${
                isMobile ? "w-5 text-[10px]" : "w-8"
              } ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              title={lifeStage ? lifeStage.label : `Age ${currentAge}`}
            >
              {yearIndex % 5 === 0 ? yearIndex : ""}
            </div>
            <div
              className="flex flex-1 select-none touch-manipulation overflow-x-auto"
              style={{
                gap: `${weekGap}px`,
                paddingRight: '8px'
              }}
            >
              {rowItems.map((itemNum) => (
                <div
                  key={itemNum}
                  className="flex-shrink-0"
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
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

VirtualizedWeekGrid.displayName = "VirtualizedWeekGrid";

export default VirtualizedWeekGrid;
