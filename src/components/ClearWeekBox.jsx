import { memo, useMemo, useRef } from 'react'
import { getYearFromWeek } from '../utils/dateUtils'
import { useUIStore } from '../stores/useUIStore'

const ClearWeekBox = memo(
  ({
    weekNum,
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleClick,
    isDragging,
    // Performance optimization: receive store data as props
    currentWeek,
    milestones = {},
    allCategories = {},
    selectedWeeks = new Set(),
    draggedWeeks = new Set(),
    selectedColor,
    isMobile = false,
    darkMode = false,
    _pastWeekStyle = 'faded',
  }) => {
    const weekState = useMemo(() => {
      const isPast = weekNum < currentWeek
      const isCurrent = weekNum === currentWeek
      const hasMilestone = milestones && milestones[weekNum]
      const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum)
      const isWeekSelected = selectedWeeks && selectedWeeks.has(weekNum)

      return {
        isPast,
        isCurrent,
        hasMilestone,
        isBeingDragged,
        isWeekSelected,
      }
    }, [weekNum, currentWeek, milestones, draggedWeeks, selectedWeeks])

    const { isPast, isCurrent, hasMilestone, isBeingDragged, isWeekSelected } = weekState

    let baseBg = darkMode ? 'bg-transparent' : 'bg-transparent'
    let borderColor = darkMode ? 'border-slate-600/50' : 'border-slate-300/50'
    let shadowClass = 'shadow-sm'

    if (isPast) {
      // Past weeks are transparent with border, will show red X
      baseBg = darkMode ? 'bg-transparent' : 'bg-transparent'
      borderColor = darkMode ? 'border-slate-500/60' : 'border-slate-400/60'
    }

    if (hasMilestone) {
      const category = allCategories[hasMilestone.category]
      if (category) {
        baseBg = category.color
        shadowClass = 'shadow-md'
        borderColor = 'border-white/20'
      }
    }

    if (isCurrent) {
      borderColor = 'border-2 border-red-500'
      shadowClass = 'shadow-lg shadow-red-500/30'
      baseBg = darkMode ? 'bg-red-500/10' : 'bg-red-500/10'
    } else {
      borderColor = `border ${borderColor}`
    }

    // Get tooltip setter from store
    const setTooltip = useUIStore(state => state.setTooltip)

    // Track if touch was used to prevent click from firing after touch
    const touchUsedRef = useRef(false)

    return (
      <div
        data-week-num={weekNum}
        className={`week-square relative w-full h-full ${baseBg} ${borderColor} ${shadowClass} ${
          isWeekSelected ? 'ring-2 ring-blue-400/60' : ''
        } ${
          isBeingDragged ? 'ring-2 ring-yellow-400/60' : ''
        } rounded-none overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${
          selectedColor ? 'hover:shadow-xl' : ''
        } active:scale-95`}
        style={{ touchAction: 'manipulation' }}
        onMouseDown={e => {
          if (!isMobile) {
            e.preventDefault()
            handleWeekMouseDown(weekNum)
          }
        }}
        onMouseEnter={() => {
          handleWeekMouseEnter(weekNum)
          // Show custom tooltip
          const ageText = `Age ${getYearFromWeek(weekNum)} years`

          if (hasMilestone) {
            const categoryLabel = allCategories[hasMilestone.category]?.label || 'Unknown'
            const milestoneTitle = hasMilestone.title || ''
            setTooltip({
              visible: true,
              label: milestoneTitle || categoryLabel,
              content: milestoneTitle
                ? `${categoryLabel} · Week ${weekNum} · ${ageText}`
                : `Week ${weekNum} · ${ageText}`,
              color: allCategories[hasMilestone.category]?.color || null,
            })
          } else {
            setTooltip({
              visible: true,
              label: `Week ${weekNum}`,
              content: ageText,
              color: null,
            })
          }
        }}
        onMouseLeave={() => {
          setTooltip({ visible: false })
        }}
        onClick={() => {
          // On mobile, touch events handle interaction - skip click to avoid double-firing
          if (isMobile && touchUsedRef.current) {
            touchUsedRef.current = false
            return
          }
          if (!isDragging) handleWeekClick(weekNum)
        }}
        onDoubleClick={e => {
          e.stopPropagation()
          if (handleDoubleClick) handleDoubleClick(weekNum, e)
        }}
        onTouchStart={e => {
          if (isMobile && handleTouchStart) {
            touchUsedRef.current = true
            handleTouchStart(weekNum, e)
          }
        }}
        onTouchMove={e => {
          if (isMobile && handleTouchMove && isDragging) {
            e.preventDefault()
            handleTouchMove(weekNum, e)
          }
        }}
        onTouchEnd={e => {
          if (isMobile && handleTouchEnd) {
            e.preventDefault()
            handleTouchEnd(e)
          }
        }}
        onKeyDown={e => {
          // Keyboard navigation support
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!isDragging) handleWeekClick(weekNum)
          }
        }}
        role="button"
        aria-label={`Week ${weekNum}, Age ${getYearFromWeek(weekNum)} years. ${hasMilestone ? `${hasMilestone.title ? hasMilestone.title + ' - ' : ''}${allCategories[hasMilestone.category]?.label || 'Unknown'}` : 'No mood set'}`}
        aria-pressed={isWeekSelected}
        tabIndex={0}
      >
        {/* Red X for past weeks that have been lived (only when not colored with milestone) */}
        {isPast && !hasMilestone && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-full h-[2px] ${darkMode ? 'bg-red-400/70' : 'bg-red-500/70'} rotate-45 absolute`}
            />
            <div
              className={`w-full h-[2px] ${darkMode ? 'bg-red-400/70' : 'bg-red-500/70'} -rotate-45 absolute`}
            />
          </div>
        )}

        {/* Enhanced current week indicator */}
        {isCurrent && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-none border-2 border-red-400 animate-pulse"></div>
            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-none animate-ping"></div>
          </div>
        )}

        {/* Flag indicator for weeks with milestones */}
        {hasMilestone && (
          <div className="absolute top-0 right-0 pointer-events-none">
            <div
              className={`w-0 h-0 border-l-[5px] border-l-transparent border-t-[5px] ${
                hasMilestone.isMilestone ? 'border-t-yellow-400' : 'border-t-white/80'
              }`}
            />
          </div>
        )}

        {/* Diamond Milestone Indicator for important milestones */}
        {hasMilestone?.isMilestone && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-1.5 bg-yellow-400 rotate-45 shadow-sm border-[0.5px] border-yellow-600/30" />
          </div>
        )}

        {/* Enhanced X overlay for difficult weeks */}
        {hasMilestone && hasMilestone.category === 'difficult' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-2/3 h-[3px] ${darkMode ? 'bg-red-300' : 'bg-red-600'} rotate-45 absolute rounded-none shadow-sm`}
            />
            <div
              className={`w-2/3 h-[3px] ${darkMode ? 'bg-red-300' : 'bg-red-600'} -rotate-45 absolute rounded-none shadow-sm`}
            />
          </div>
        )}

        {/* Selection highlight */}
        {isWeekSelected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-none bg-blue-400/20 border-2 border-blue-400/60"></div>
          </div>
        )}

        {/* Drag highlight */}
        {isBeingDragged && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-none bg-yellow-400/20 border-2 border-yellow-400/60"></div>
          </div>
        )}
      </div>
    )
  }
)

ClearWeekBox.displayName = 'ClearWeekBox'

export default ClearWeekBox
