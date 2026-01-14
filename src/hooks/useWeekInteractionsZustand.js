import { useCallback } from 'react'
import { useMilestoneStore, useSelectionStore, useUIStore } from '../stores'

/**
 * Modern week interactions hook using Zustand stores
 * Replaces the old useWeekInteractions with store-based state management
 */
export const useWeekInteractionsZustand = () => {
  const { setMilestones, getAllCategories } = useMilestoneStore()
  const {
    selectedColor,
    setSelectedWeek,
    isDragging,
    setIsDragging,
    draggedWeeks,
    setDraggedWeeks,
    setDragStartWeek,
    selectedWeeks,
    pinnedWeeks,
    selectionMode,
    rangeStart,
    isInRangeMode,
    startRangeSelection,
    completeRangeSelection,
    resetRangeSelection,
    clearPinnedWeeks,
    selectRectangularArea,
    toggleWeekSelection,
    getWeeksInSelection,
  } = useSelectionStore()
  const { isMobile } = useUIStore()

  const allCategories = getAllCategories()

  // Helper to get all weeks between two week numbers (inclusive)
  const getWeeksInRange = useCallback((start, end) => {
    const weeks = new Set()
    const min = Math.min(start, end)
    const max = Math.max(start, end)
    for (let i = min; i <= max; i++) {
      weeks.add(i)
    }
    return weeks
  }, [])

  const paintWeek = useCallback(
    weekNum => {
      if (!selectedColor) return

      if (selectedColor === 'none') {
        setMilestones(prev => {
          const updated = { ...prev }
          delete updated[weekNum]
          return updated
        })
      } else {
        setMilestones(prev => ({
          ...prev,
          [weekNum]: {
            title: '',
            category: selectedColor,
          },
        }))
      }
    },
    [selectedColor, setMilestones]
  )

  const paintWeeks = useCallback(
    weeks => {
      weeks.forEach(paintWeek)
    },
    [paintWeek]
  )

  const handleWeekClick = useCallback(
    (weekNum, event) => {
      setSelectedWeek(weekNum)

      // Handle shift+click for rectangular selection (power user feature)
      if (selectionMode === 'rectangular' && event?.shiftKey && rangeStart) {
        const newSelection = selectRectangularArea(rangeStart, weekNum)
        if (selectedColor) {
          paintWeeks(newSelection)
        }
        resetRangeSelection()
        return
      }

      // If no color selected, just select the week
      if (!selectedColor) {
        return
      }

      // Range selection: if we already have a range start, complete the range
      if (isInRangeMode && rangeStart !== null) {
        // Get all weeks in the range and paint them
        const rangeWeeks = getWeeksInRange(rangeStart, weekNum)
        paintWeeks(rangeWeeks)
        // Complete range selection (resets rangeStart)
        completeRangeSelection(weekNum)
        return
      }

      // First click: start range selection and paint the first week
      startRangeSelection(weekNum)
      paintWeek(weekNum)
    },
    [
      setSelectedWeek,
      selectionMode,
      rangeStart,
      isInRangeMode,
      selectedColor,
      selectRectangularArea,
      getWeeksInRange,
      startRangeSelection,
      completeRangeSelection,
      resetRangeSelection,
      paintWeek,
      paintWeeks,
    ]
  )

  const handleWeekMouseDown = useCallback(
    (weekNum, event) => {
      if (isMobile || !selectedColor) return

      event.preventDefault()
      setIsDragging(true)
      setDragStartWeek(weekNum)
      setDraggedWeeks(new Set([weekNum]))

      if (selectedColor) {
        paintWeek(weekNum)
      }
    },
    [isMobile, selectedColor, setIsDragging, setDragStartWeek, setDraggedWeeks, paintWeek]
  )

  const handleWeekMouseEnter = useCallback(
    weekNum => {
      if (isDragging && selectedColor) {
        const newDraggedWeeks = new Set([...draggedWeeks, weekNum])
        setDraggedWeeks(newDraggedWeeks)
        paintWeek(weekNum)
      }
    },
    [isDragging, draggedWeeks, selectedColor, setDraggedWeeks, paintWeek]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDraggedWeeks(new Set())
      setDragStartWeek(null)
    }
  }, [isDragging, setIsDragging, setDraggedWeeks, setDragStartWeek])

  // Touch handlers for mobile - enable drag coloring
  const handleTouchStart = useCallback(
    (weekNum, event) => {
      if (!isMobile) return

      event.preventDefault()
      // Start dragging mode for continuous coloring
      setIsDragging(true)
      setDragStartWeek(weekNum)
      setDraggedWeeks(new Set([weekNum]))

      // Paint the initial week
      if (selectedColor) {
        paintWeek(weekNum)
      }
    },
    [isMobile, selectedColor, setIsDragging, setDragStartWeek, setDraggedWeeks, paintWeek]
  )

  const handleTouchMove = useCallback(
    weekNum => {
      if (!isMobile) return

      const { isDragging } = useSelectionStore.getState()
      if (isDragging && selectedColor) {
        // Add to dragged weeks and paint
        const newDraggedWeeks = new Set([...draggedWeeks, weekNum])
        setDraggedWeeks(newDraggedWeeks)
        paintWeek(weekNum)
      }
    },
    [isMobile, selectedColor, draggedWeeks, setDraggedWeeks, paintWeek]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return

    const { isDragging } = useSelectionStore.getState()
    if (isDragging) {
      setIsDragging(false)
      setDraggedWeeks(new Set())
      setDragStartWeek(null)
    }
  }, [isMobile, setIsDragging, setDraggedWeeks, setDragStartWeek])

  return {
    // State from stores
    selectedWeeks,
    pinnedWeeks,
    allCategories,
    rangeStart,
    isInRangeMode,

    // Event handlers
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Utility functions
    getWeeksInSelection,
    paintWeek,
    paintWeeks,

    // Actions
    clearPinnedWeeks,
    toggleWeekSelection,
    resetRangeSelection,
  }
}
