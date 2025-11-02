import { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import OptimizedWeekSquare from './OptimizedWeekSquare';

/**
 * VirtualizedLifeGrid - High-performance grid using react-window
 *
 * Benefits:
 * - Only renders visible rows (viewport rendering)
 * - Dramatically reduces initial render time
 * - Smooth scrolling even with 4000+ weeks
 * - Automatic cleanup of off-screen elements
 * - Maintains 60fps on mobile devices
 *
 * Usage: Drop-in replacement for the grid section in HomePage
 */

const VirtualizedRow = memo(({ index, style, data }) => {
  const {
    yearIndex,
    currentWeek,
    milestones,
    selectedMood,
    darkMode,
    theme,
    onWeekClick
  } = data[index];

  const age = yearIndex;
  const isCurrentYear = currentWeek >= yearIndex * 52 && currentWeek < (yearIndex + 1) * 52;

  // Memoize weeks for this row
  const weeks = useMemo(() => {
    return Array.from({ length: 52 }, (_, weekInYear) => {
      const weekNumber = yearIndex * 52 + weekInYear;
      return {
        weekNumber,
        milestone: milestones[weekNumber],
        isLived: weekNumber < currentWeek,
        isCurrent: weekNumber === currentWeek
      };
    });
  }, [yearIndex, currentWeek, milestones]);

  return (
    <div style={style} className="flex items-center gap-3 px-4">
      {/* Year Label */}
      <div className="flex-shrink-0 w-12 text-right">
        {yearIndex % 5 === 0 && (
          <span className={`text-sm font-bold ${
            isCurrentYear
              ? `bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`
              : darkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            {age}
          </span>
        )}
      </div>

      {/* 52 weeks */}
      <div className="flex gap-1">
        {weeks.map((week) => (
          <OptimizedWeekSquare
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            milestone={week.milestone}
            isLived={week.isLived}
            isCurrent={week.isCurrent}
            hasSelectedMood={!!selectedMood}
            darkMode={darkMode}
            onClick={() => onWeekClick(week.weekNumber)}
          />
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if data reference changes
  return prevProps.data === nextProps.data && prevProps.index === nextProps.index;
});

VirtualizedRow.displayName = 'VirtualizedRow';

/**
 * Main VirtualizedLifeGrid component
 */
const VirtualizedLifeGrid = memo(({
  lifeExpectancy,
  currentWeek,
  milestones,
  selectedMood,
  darkMode,
  theme,
  onWeekClick
}) => {
  const listRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Calculate row height based on device
  const ROW_HEIGHT = 28; // Compact height for each year row
  const totalYears = Math.ceil((lifeExpectancy * 52) / 52);

  // Adjust container height based on available space
  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const maxHeight = Math.min(viewportHeight * 0.6, 800);
      setContainerHeight(maxHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Scroll to current week on mount
  useEffect(() => {
    if (listRef.current && currentWeek) {
      const currentYear = Math.floor(currentWeek / 52);
      // Scroll to current year minus a few rows for context
      const scrollToYear = Math.max(0, currentYear - 3);
      listRef.current.scrollToItem(scrollToYear, 'center');
    }
  }, [currentWeek]);

  // Prepare row data
  const rowData = useMemo(() => {
    return Array.from({ length: totalYears }, (_, yearIndex) => ({
      yearIndex,
      currentWeek,
      milestones,
      selectedMood,
      darkMode,
      theme,
      onWeekClick
    }));
  }, [totalYears, currentWeek, milestones, selectedMood, darkMode, theme, onWeekClick]);

  return (
    <div className="w-full">
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={totalYears}
        itemSize={ROW_HEIGHT}
        itemData={rowData}
        overscanCount={5} // Render 5 extra rows above/below viewport
        className="virtualized-grid-scroll"
        style={{
          overflowX: 'auto',
          overflowY: 'scroll'
        }}
      >
        {VirtualizedRow}
      </List>
    </div>
  );
});

VirtualizedLifeGrid.displayName = 'VirtualizedLifeGrid';

export default VirtualizedLifeGrid;
