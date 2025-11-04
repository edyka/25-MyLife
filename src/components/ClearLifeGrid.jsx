import { memo, useMemo } from "react";
import ClearWeekBox from "./ClearWeekBox";

const ClearLifeGrid = memo(({
  lifeExpectancy,
  currentWeek,
  milestones,
  _selectedWeek,
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
  _selectionMode,
  pastWeekStyle,
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
    <div 
      className="w-full overflow-x-auto" 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp} 
      onTouchEnd={handleTouchEnd}
      style={{ display: 'block' }}
    >
      {rows.map((rowItems, yearIndex) => (
        <div 
          key={yearIndex} 
          className="flex items-center w-full justify-start sm:justify-center mb-1.5" 
          style={{ 
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            minHeight: `${weekSize + 4}px`
          }}
        >
          <div 
            className="text-xs flex-shrink-0 text-center mr-2" 
            style={{ 
              color: darkMode ? '#94a3b8' : '#475569',
              width: '32px',
              minWidth: '32px'
            }}
          >
            {yearIndex % 5 === 0 ? yearIndex : ''}
          </div>
          <div
            className="flex-shrink-0"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, ${weekSize}px)`,
              gap: `${colGap}px`,
              minWidth: `${columns * (weekSize + colGap)}px`
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
                  currentWeek={currentWeek}
                  milestones={milestones}
                  allCategories={allCategories}
                  selectedWeeks={selectedWeeks}
                  draggedWeeks={draggedWeeks}
                  selectedColor={selectedColor}
                  isMobile={isMobile}
                  darkMode={darkMode}
                  pastWeekStyle={pastWeekStyle}
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


