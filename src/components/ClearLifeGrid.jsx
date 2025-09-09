import { memo, useMemo } from "react";
import ClearWeekBox from "./ClearWeekBox";

const ClearLifeGrid = memo(({ 
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
  isMobile,
  darkMode,
  allCategories,
  selectionMode,
  showWeeks = true
}) => {
  const totalYears = parseInt(lifeExpectancy) || 80;
  const columns = showWeeks ? 52 : 12;
  const weekSize = isMobile ? 10 : 12;
  const rowGap = 6;
  const colGap = 4;

  const rows = useMemo(() => {
    return Array.from({ length: totalYears }, (_, yearIndex) => {
      return Array.from({ length: columns }, (_, col) => yearIndex * columns + col + 1);
    });
  }, [totalYears, columns]);

  return (
    <div className="w-full" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchEnd={handleTouchEnd}>
      {rows.map((rowItems, yearIndex) => (
        <div key={yearIndex} className="flex items-center w-full justify-start sm:justify-center" style={{ marginBottom: `${rowGap}px` }}>
          <div className="text-xs w-8 text-center" style={{ color: darkMode ? '#94a3b8' : '#475569' }}>
            {yearIndex % 5 === 0 ? yearIndex : ''}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, ${weekSize}px)`,
              gap: `${colGap}px`,
            }}
          >
            {rowItems.map((weekNum) => (
              <div key={weekNum} style={{ width: `${weekSize}px`, height: `${weekSize}px` }}>
                <ClearWeekBox
                  weekNum={weekNum}
                  handleWeekClick={handleWeekClick}
                  handleWeekMouseDown={handleWeekMouseDown}
                  handleWeekMouseEnter={handleWeekMouseEnter}
                  handleTouchStart={handleTouchStart}
                  handleTouchMove={handleTouchMove}
                  handleTouchEnd={handleTouchEnd}
                  isDragging={isDragging}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

ClearLifeGrid.displayName = "ClearLifeGrid";

export default ClearLifeGrid;


