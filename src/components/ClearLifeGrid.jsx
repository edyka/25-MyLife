import { memo, useMemo, useState, useEffect } from "react";
import ClearWeekBox from "./ClearWeekBox";

const ClearLifeGrid = memo(({
  lifeExpectancy,
  currentWeek,
  milestones,
  selectedColor,
  selectedWeeks,
  handleWeekClick,
  handleWeekMouseDown,
  handleWeekMouseEnter,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleDoubleClick,
  isDragging,
  draggedWeeks,
  isMobile,
  darkMode,
  allCategories,
  pastWeekStyle,
  showWeeks = true
}) => {
  const totalYears = parseInt(lifeExpectancy) || 80;

  // On mobile with weeks: use bi-weekly (26 columns) for larger, more tappable cells
  // Desktop: full 52 weeks, Months: 12 months
  const getColumns = () => {
    if (!showWeeks) return 12; // Months
    if (isMobile) return 26; // Bi-weekly on mobile (2 weeks per cell)
    return 52; // Full weeks on desktop
  };
  const columns = getColumns();
  const isBiWeekly = isMobile && showWeeks; // Whether we're grouping 2 weeks per cell

  // Responsive week size based on viewport width for mobile
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate optimal week size for mobile to fit within viewport
  const getOptimalWeekSize = () => {
    if (!isMobile) return showWeeks ? 12 : 20; // Desktop sizes

    const containerPadding = 24;
    const ageLabel = 32;
    const availableWidth = viewportWidth - containerPadding - ageLabel;
    const gapTotal = (columns - 1) * 3;
    const maxBoxSize = Math.floor((availableWidth - gapTotal) / columns);

    if (showWeeks) {
      // Bi-weekly on mobile: 26 columns, can have bigger boxes (8-14px)
      return Math.max(8, Math.min(14, maxBoxSize));
    } else {
      // Months: 12 columns, bigger boxes (16-28px)
      return Math.max(16, Math.min(28, maxBoxSize));
    }
  };

  const weekSize = getOptimalWeekSize();
  const colGap = isMobile ? 3 : (showWeeks ? 4 : 6);

  // Calculate total grid width to determine if scrolling is needed
  const gridWidth = columns * weekSize + (columns - 1) * colGap;
  const needsScroll = isMobile && gridWidth > (viewportWidth - 84);

  // For bi-weekly mode, generate pairs of weeks; for regular mode, generate individual weeks
  const rows = useMemo(() => {
    return Array.from({ length: totalYears }, (_, yearIndex) => {
      if (isBiWeekly) {
        // Bi-weekly: each cell represents 2 weeks
        return Array.from({ length: columns }, (_, col) => {
          const baseWeek = yearIndex * 52 + col * 2 + 1;
          return { startWeek: baseWeek, endWeek: baseWeek + 1 };
        });
      } else if (showWeeks) {
        // Full weeks
        return Array.from({ length: columns }, (_, col) => yearIndex * columns + col + 1);
      } else {
        // Months
        return Array.from({ length: columns }, (_, col) => yearIndex * columns + col + 1);
      }
    });
  }, [totalYears, columns, isBiWeekly, showWeeks]);

  return (
    <div className="relative" data-life-grid>
      {/* Mobile scroll hint */}
      {needsScroll && isMobile && (
        <div className={`absolute top-0 right-0 flex items-center gap-1 text-xs px-2 py-1 rounded-bl-lg z-10 ${darkMode ? 'bg-slate-800/90 text-slate-400' : 'bg-white/90 text-slate-500'
          }`}>
          <span>← Scroll →</span>
        </div>
      )}

      <div
        className={`w-full ${needsScroll ? 'overflow-x-auto' : 'overflow-hidden'}`}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'block',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }}
      >
        <div style={{
          minWidth: needsScroll ? `${gridWidth + 40}px` : 'auto',
          touchAction: isDragging ? 'none' : 'pan-x pan-y'
        }}>
          {rows.map((rowItems, yearIndex) => {
            // Add extra spacing every 10 years for visual decades
            const isDecadeStart = yearIndex > 0 && yearIndex % 10 === 0;
            const rowGap = isMobile ? 2 : 4; // Consistent row gap
            const decadeGap = isMobile ? 6 : 10; // Extra gap at decades

            return (
              <div
                key={yearIndex}
                className="flex items-center w-full justify-start sm:justify-center"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  marginTop: isDecadeStart ? `${decadeGap}px` : '0px',
                  marginBottom: `${rowGap}px`,
                  minHeight: `${weekSize + 2}px`
                }}
              >
                <div
                  className="text-xs flex-shrink-0 text-center"
                  style={{
                    color: darkMode ? '#94a3b8' : '#475569',
                    width: isMobile ? '28px' : '32px',
                    minWidth: isMobile ? '28px' : '32px',
                    marginRight: isMobile ? '4px' : '8px',
                    fontSize: isMobile ? '10px' : '12px'
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
                  }}
                >
                  {rowItems.map((weekData, _idx) => {
                    // Handle both simple weekNum (number) and biweekly objects
                    const isBiWeeklyCell = typeof weekData === 'object';
                    const weekNum = isBiWeeklyCell ? weekData.startWeek : weekData;
                    const weekNum2 = isBiWeeklyCell ? weekData.endWeek : null;
                    const key = isBiWeeklyCell ? `${weekData.startWeek}-${weekData.endWeek}` : weekNum;

                    return (
                      <div key={key} style={{ width: `${weekSize}px`, height: `${weekSize}px` }}>
                        <ClearWeekBox
                          weekNum={weekNum}
                          weekNum2={weekNum2}
                          handleWeekClick={handleWeekClick}
                          handleWeekMouseDown={handleWeekMouseDown}
                          handleWeekMouseEnter={handleWeekMouseEnter}
                          handleTouchStart={handleTouchStart}
                          handleTouchMove={handleTouchMove}
                          handleTouchEnd={handleTouchEnd}
                          handleDoubleClick={handleDoubleClick}
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
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ClearLifeGrid.displayName = "ClearLifeGrid";

export default ClearLifeGrid;
