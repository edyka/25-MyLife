import { useCallback } from "react";
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from "../stores";

/**
 * Modern week interactions hook using Zustand stores
 * Replaces the old useWeekInteractions with store-based state management
 */
export const useWeekInteractionsZustand = () => {
  const { getTotalWeeks } = useLifeStore();
  const { setMilestones, getAllCategories } = useMilestoneStore();
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
    getWeeksInSelection
  } = useSelectionStore();
  const { isMobile, setShowMobileColorSelection } = useUIStore();

  const allCategories = getAllCategories();

  const getLinearWeeksInSelection = useCallback((startWeek, endWeek) => {
    const totalWeeks = getTotalWeeks();
    const a = Math.max(1, Math.min(startWeek, endWeek));
    const b = Math.min(totalWeeks, Math.max(startWeek, endWeek));
    const weeks = new Set();
    for (let i = a; i <= b; i++) weeks.add(i);
    return weeks;
  }, [getTotalWeeks]);

  const paintWeek = useCallback((weekNum) => {
    if (!selectedColor) return;

    if (selectedColor === "none") {
      setMilestones((prev) => {
        const updated = { ...prev };
        delete updated[weekNum];
        return updated;
      });
    } else {
      setMilestones((prev) => ({
        ...prev,
        [weekNum]: {
          title: "",
          category: selectedColor,
        },
      }));
    }
  }, [selectedColor, setMilestones]);

  const paintWeeks = useCallback((weeks) => {
    weeks.forEach(paintWeek);
  }, [paintWeek]);

  const handleWeekClick = useCallback((weekNum, event) => {
    setSelectedWeek(weekNum);

    // Handle different selection modes
    if (selectionMode === "rectangular" && event?.shiftKey) {
      const dragStart = rangeStart || weekNum;
      const newSelection = selectRectangularArea(dragStart, weekNum);
      if (selectedColor) {
        paintWeeks(newSelection);
      }
      return;
    }

    // Handle range selection (click-click mode)
    if (isInRangeMode) {
      completeRangeSelection(weekNum);
      if (selectedColor) {
        const rangeWeeks = getLinearWeeksInSelection(rangeStart, weekNum);
        paintWeeks(rangeWeeks);
      }
      return;
    }

    // Start range selection if we have a selected color
    if (selectedColor && !rangeStart) {
      startRangeSelection(weekNum);
      if (selectedColor) {
        paintWeek(weekNum);
      }
      return;
    }

    // Single week interaction
    if (selectedColor) {
      paintWeek(weekNum);
    }

    // Show mobile color selection if no color is selected
    if (!selectedColor && isMobile) {
      setShowMobileColorSelection(true);
    }
  }, [
    setSelectedWeek,
    selectionMode,
    isInRangeMode,
    rangeStart,
    selectedColor,
    completeRangeSelection,
    startRangeSelection,
    selectRectangularArea,
    getLinearWeeksInSelection,
    paintWeek,
    paintWeeks,
    isMobile,
    setShowMobileColorSelection
  ]);

  const handleWeekMouseDown = useCallback((weekNum, event) => {
    if (isMobile || !selectedColor) return;

    event.preventDefault();
    setIsDragging(true);
    setDragStartWeek(weekNum);
    setDraggedWeeks(new Set([weekNum]));

    if (selectedColor) {
      paintWeek(weekNum);
    }
  }, [isMobile, selectedColor, setIsDragging, setDragStartWeek, setDraggedWeeks, paintWeek]);

  const handleWeekMouseEnter = useCallback((weekNum) => {
    if (isDragging && selectedColor) {
      const newDraggedWeeks = new Set([...draggedWeeks, weekNum]);
      setDraggedWeeks(newDraggedWeeks);
      paintWeek(weekNum);
    }
  }, [isDragging, draggedWeeks, selectedColor, setDraggedWeeks, paintWeek]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedWeeks(new Set());
      setDragStartWeek(null);
    }
  }, [isDragging, setIsDragging, setDraggedWeeks, setDragStartWeek]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((weekNum, event) => {
    if (!isMobile) return;
    
    event.preventDefault();
    handleWeekClick(weekNum, event);
  }, [isMobile, handleWeekClick]);

  const handleTouchMove = useCallback((weekNum) => {
    if (!isMobile) return;
    
    const { isDragging } = useSelectionStore.getState();
    if (isDragging && selectedColor) {
      paintWeek(weekNum);
    }
  }, [isMobile, selectedColor, paintWeek]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    
    const { isDragging } = useSelectionStore.getState();
    if (isDragging) {
      setIsDragging(false);
      setDraggedWeeks(new Set());
    }
  }, [isMobile, setIsDragging, setDraggedWeeks]);

  return {
    // State from stores
    selectedWeeks,
    pinnedWeeks,
    selectionMode,
    rangeStart,
    isInRangeMode,
    allCategories,
    
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
    getLinearWeeksInSelection,
    paintWeek,
    paintWeeks,
    
    // Actions
    resetRangeSelection,
    clearPinnedWeeks,
    toggleWeekSelection,
  };
};