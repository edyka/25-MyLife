import { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import ClearWeekBox from './ClearWeekBox'
import { useUIStore } from '../stores/useUIStore'

const ClearLifeGrid = memo(
  ({
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
    showWeeks = true,
  }) => {
    // Get setTooltip once at parent level, pass down to all ClearWeekBox children
    const setTooltip = useUIStore(state => state.setTooltip)
    const totalYears = parseInt(lifeExpectancy) || 80

    // On mobile with weeks: use bi-weekly (26 columns) for larger, more tappable cells
    // Desktop: full 52 weeks, Months: 12 months
    const getColumns = () => {
      if (!showWeeks) return 12 // Months
      if (isMobile) return 26 // Bi-weekly on mobile (2 weeks per cell)
      return 52 // Full weeks on desktop
    }
    const columns = getColumns()
    const isBiWeekly = isMobile && showWeeks // Whether we're grouping 2 weeks per cell

    // Responsive week size based on viewport width for mobile
    const [viewportWidth, setViewportWidth] = useState(
      typeof window !== 'undefined' ? window.innerWidth : 375
    )
    const resizeTimeoutRef = useRef(null)

    // Throttled resize handler to prevent excessive re-renders
    const handleResize = useCallback(() => {
      if (resizeTimeoutRef.current) return // Throttle: skip if pending
      resizeTimeoutRef.current = setTimeout(() => {
        setViewportWidth(window.innerWidth)
        resizeTimeoutRef.current = null
      }, 150) // 150ms throttle
    }, [])

    useEffect(() => {
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      }
    }, [handleResize])

    // Calculate optimal week size to ALWAYS fit within viewport (no horizontal scroll)
    const getOptimalWeekSize = () => {
      if (!isMobile) return showWeeks ? 12 : 20 // Desktop sizes

      const containerPadding = 24
      const safetyMargin = 4 // Extra margin to ensure no overflow
      // No ageLabel space needed - labels now overlay on grid
      const availableWidth = viewportWidth - containerPadding - safetyMargin
      const gapSize = 2 // Reduced gap for mobile
      const gapTotal = (columns - 1) * gapSize
      const boxSize = Math.floor((availableWidth - gapTotal) / columns)

      // Ensure minimum visible size but NEVER exceed what fits
      return Math.max(6, boxSize)
    }

    const weekSize = getOptimalWeekSize()
    const colGap = isMobile ? 2 : showWeeks ? 4 : 6 // Reduced gap on mobile

    // For bi-weekly mode, generate pairs of weeks; for regular mode, generate individual weeks
    const rows = useMemo(() => {
      return Array.from({ length: totalYears }, (_, yearIndex) => {
        if (isBiWeekly) {
          // Bi-weekly: each cell represents 2 weeks
          return Array.from({ length: columns }, (_, col) => {
            const baseWeek = yearIndex * 52 + col * 2 + 1
            return { startWeek: baseWeek, endWeek: baseWeek + 1 }
          })
        } else if (showWeeks) {
          // Full weeks
          return Array.from({ length: columns }, (_, col) => yearIndex * columns + col + 1)
        } else {
          // Months
          return Array.from({ length: columns }, (_, col) => yearIndex * columns + col + 1)
        }
      })
    }, [totalYears, columns, isBiWeekly, showWeeks])

    return (
      <div className="relative" data-life-grid>
        <div
          className="w-full overflow-hidden"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              touchAction: isDragging ? 'none' : 'pan-y',
            }}
          >
            {rows.map((rowItems, yearIndex) => {
              // Add extra spacing every 10 years for visual decades
              const isDecadeStart = yearIndex > 0 && yearIndex % 10 === 0
              const rowGap = isMobile ? 2 : 4 // Consistent row gap
              const decadeGap = isMobile ? 6 : 10 // Extra gap at decades

              return (
                <div
                  key={yearIndex}
                  className="relative flex items-center w-full justify-center"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    marginTop: isDecadeStart ? `${decadeGap}px` : '0px',
                    marginBottom: `${rowGap}px`,
                    minHeight: `${weekSize + 2}px`,
                  }}
                >
                  {/* Year label - overlays on grid for mobile, separate column for desktop */}
                  {yearIndex % 5 === 0 && (
                    <div
                      className={`absolute left-0 z-10 font-bold ${isMobile ? 'text-[9px]' : 'text-xs'}`}
                      style={{
                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                        textShadow: darkMode
                          ? '0 1px 2px rgba(0,0,0,0.8)'
                          : '0 1px 2px rgba(255,255,255,0.8)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        paddingLeft: isMobile ? '2px' : '4px',
                      }}
                    >
                      {yearIndex}
                    </div>
                  )}
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
                      const isBiWeeklyCell = typeof weekData === 'object'
                      const weekNum = isBiWeeklyCell ? weekData.startWeek : weekData
                      const weekNum2 = isBiWeeklyCell ? weekData.endWeek : null
                      const key = isBiWeeklyCell
                        ? `${weekData.startWeek}-${weekData.endWeek}`
                        : weekNum

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
                            setTooltip={setTooltip}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
)

ClearLifeGrid.displayName = 'ClearLifeGrid'

export default ClearLifeGrid
