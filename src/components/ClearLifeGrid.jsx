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

    // Measure actual container width instead of guessing padding values
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(
      typeof window !== 'undefined' ? window.innerWidth - 44 : 330
    )
    const resizeTimeoutRef = useRef(null)

    const measureContainer = useCallback(() => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }, [])

    // Throttled resize handler
    const handleResize = useCallback(() => {
      if (resizeTimeoutRef.current) return
      resizeTimeoutRef.current = setTimeout(() => {
        measureContainer()
        resizeTimeoutRef.current = null
      }, 150)
    }, [measureContainer])

    useEffect(() => {
      // Measure on mount (after layout)
      measureContainer()
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      }
    }, [handleResize, measureContainer])

    // Gutter width for year labels (dedicated column, no overlap)
    const gutterWidth = isMobile ? 24 : 28

    // Calculate optimal week size to ALWAYS fit within container (no overflow)
    const getOptimalWeekSize = () => {
      if (!isMobile) return showWeeks ? 12 : 20 // Desktop sizes

      const availableWidth = containerWidth - gutterWidth - 2 // 2px safety
      const gapSize = 2
      const gapTotal = (columns - 1) * gapSize
      const boxSize = Math.floor((availableWidth - gapTotal) / columns)

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
      <div className="relative" data-life-grid ref={containerRef}>
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
              const isDecadeStart = yearIndex > 0 && yearIndex % 10 === 0
              const showLabel = yearIndex % 5 === 0
              const rowGap = isMobile ? 2 : 4
              const decadeGap = isMobile ? 6 : 10

              return (
                <div key={yearIndex}>
                  {/* Decade separator line */}
                  {isDecadeStart && (
                    <div
                      style={{
                        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}`,
                        marginTop: `${decadeGap + 2}px`,
                        marginBottom: `${Math.floor(decadeGap / 2) + 1}px`,
                      }}
                    />
                  )}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      alignItems: 'center',
                      marginBottom: `${rowGap}px`,
                      minHeight: `${weekSize + 2}px`,
                    }}
                  >
                    {/* Year label gutter — fixed width, always present for alignment */}
                    <div
                      style={{
                        width: `${gutterWidth}px`,
                        flexShrink: 0,
                        textAlign: 'right',
                        paddingRight: isMobile ? 4 : 6,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 700,
                        color: showLabel
                          ? darkMode
                            ? 'rgba(255,255,255,0.9)'
                            : 'rgba(0,0,0,0.65)'
                          : 'transparent',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        userSelect: 'none',
                      }}
                    >
                      {showLabel ? yearIndex : ''}
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
                        const isBiWeeklyCell = typeof weekData === 'object'
                        const weekNum = isBiWeeklyCell ? weekData.startWeek : weekData
                        const weekNum2 = isBiWeeklyCell ? weekData.endWeek : null
                        const key = isBiWeeklyCell
                          ? `${weekData.startWeek}-${weekData.endWeek}`
                          : weekNum

                        return (
                          <div
                            key={key}
                            style={{ width: `${weekSize}px`, height: `${weekSize}px` }}
                          >
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
