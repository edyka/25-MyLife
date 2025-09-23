import { useCallback, useMemo, useEffect } from "react";
import { getTotalWeeks } from "../utils/dateUtils";
import { getAllCategories } from "../utils/constants";

export const useWeekInteractions = ({
  lifeExpectancy,
  milestones: _milestones,
  setMilestones,
  updateMilestone,
  deleteMilestone,
  customCategories,
  selectionStore,
  setShowMobileMenu = () => {}
}) => {
  // Use selection store instead of local state
  const {
    selectedWeek,
    setSelectedWeek,
    selectedColor,
    setSelectedColor,
    isDragging,
    setIsDragging,
    draggedWeeks,
    setDraggedWeeks,
    dragStartWeek,
    setDragStartWeek,
    selectedWeeks,
    setSelectedWeeks,
    selectionMode,
    setSelectionMode,
    selectionPreview,
    setSelectionPreview,
    rangeStart,
    isInRangeMode,
    pinnedWeeks,
    setPinnedWeeks,
    startRangeSelection,
    resetRangeSelection,
    clearPinnedWeeks,
    getWeeksInSelection
  } = selectionStore;

  const allCategories = useMemo(
    () => getAllCategories(customCategories),
    [customCategories]
  );

  const getLinearWeeksInSelection = useCallback(
    (startWeek, endWeek) => {
      const totalWeeks = getTotalWeeks(lifeExpectancy);
      const a = Math.max(1, Math.min(startWeek, endWeek));
      const b = Math.min(totalWeeks, Math.max(startWeek, endWeek));
      const weeks = new Set();
      for (let i = a; i <= b; i++) weeks.add(i);
      return weeks;
    },
    [lifeExpectancy]
  );

  const paintWeek = useCallback(
    (weekNum) => {
      if (!selectedColor) return;
      if (selectedColor === "none") {
        // remove single week
        if (deleteMilestone) deleteMilestone(weekNum);
        else {
          setMilestones((prev) => {
            const updated = { ...prev };
            delete updated[weekNum];
            return updated;
          });
        }
      } else {
        const entry = {
          title: `${allCategories[selectedColor]?.label || selectedColor} week`,
          category: selectedColor,
          description: `Marked as ${(allCategories[selectedColor]?.label || selectedColor).toLowerCase()}`,
          weekNum,
        };
        if (updateMilestone) updateMilestone(weekNum, entry);
        else {
          setMilestones((prev) => ({ ...prev, [weekNum]: entry }));
        }
      }
    },
    [selectedColor, setMilestones, updateMilestone, deleteMilestone, allCategories]
  );

  const paintWeeks = useCallback(
    (weeks) => {
      if (!selectedColor || weeks.size === 0) return;
      if (selectedColor === "none") {
        if (deleteMilestone) weeks.forEach((w) => deleteMilestone(w));
        else setMilestones((prev) => { const u = { ...prev }; weeks.forEach((w) => delete u[w]); return u; });
        return;
      }
      const entryFromColor = (w) => ({
        title: `${allCategories[selectedColor]?.label || selectedColor} week`,
        category: selectedColor,
        description: `Marked as ${(allCategories[selectedColor]?.label || selectedColor).toLowerCase()}`,
        weekNum: w,
      });
      if (updateMilestone) weeks.forEach((w) => updateMilestone(w, entryFromColor(w)));
      else setMilestones((prev) => { const u = { ...prev }; weeks.forEach((w) => { u[w] = entryFromColor(w); }); return u; });
    },
    [selectedColor, setMilestones, updateMilestone, deleteMilestone, allCategories]
  );

  // Simple, intuitive interactions
  const handleWeekClick = useCallback(
    (weekNum) => {
      if (selectedColor) {
        // If no range is started, paint the single week AND mark as start for an optional range
        if (rangeStart == null) {
          const startSet = new Set([weekNum]);
          setSelectedWeeks(startSet);
          setPinnedWeeks(startSet);
          paintWeek(weekNum);
          // Use store action that records start of range
          if (startRangeSelection) startRangeSelection(weekNum);
          setSelectionPreview(null);
        } else {
          // Complete range selection
          const range = getLinearWeeksInSelection(rangeStart, weekNum);
          const combined = new Set([...pinnedWeeks, ...range]);
          setSelectedWeeks(combined);
          setPinnedWeeks(combined);
          paintWeeks(range);
          if (resetRangeSelection) resetRangeSelection();
          setSelectionPreview(null);
        }
      } else {
        setSelectedWeek(weekNum);
        setShowMobileMenu(false);
      }
    },
    [selectedColor, rangeStart, getLinearWeeksInSelection, paintWeek, paintWeeks, setShowMobileMenu, pinnedWeeks, setSelectedWeeks, setPinnedWeeks, resetRangeSelection, setSelectionPreview, startRangeSelection, setSelectedWeek]
  );

  const beginDrag = useCallback((weekNum) => {
    setIsDragging(true);
    setDragStartWeek(weekNum);
    const startSet = new Set([weekNum]);
    setDraggedWeeks(startSet);
    setSelectedWeeks(startSet);
  }, [setIsDragging, setDragStartWeek, setDraggedWeeks, setSelectedWeeks]);

  // Memoized updateDrag function to prevent excessive callback recreation
  const memoizedUpdateDrag = useCallback((weekNum) => {
    if (!isDragging || dragStartWeek == null) return;
    const range = getLinearWeeksInSelection(dragStartWeek, weekNum);
    setDraggedWeeks(range);
    setSelectedWeeks(range);
    setSelectionPreview({ weekCount: range.size });
  }, [isDragging, dragStartWeek, getLinearWeeksInSelection, setDraggedWeeks, setSelectedWeeks, setSelectionPreview]);

  // Memoized endDrag function to prevent excessive event listener re-registration
  const memoizedEndDrag = useCallback(() => {
    if (isDragging && draggedWeeks.size > 0) {
      paintWeeks(draggedWeeks);
    }
    setIsDragging(false);
    setDraggedWeeks(new Set());
    setDragStartWeek(null);
    setSelectionPreview(null);
  }, [isDragging, draggedWeeks, paintWeeks, setIsDragging, setDraggedWeeks, setDragStartWeek, setSelectionPreview]);

  const handleWeekMouseDown = useCallback(
    (weekNum) => {
      if (!selectedColor) {
        setSelectedWeek(weekNum);
        setShowMobileMenu(false);
        return;
      }
      // With a color selected, start drag-to-paint interaction
      beginDrag(weekNum);
      // Paint immediately so single click without movement colors the first week
      paintWeek(weekNum);
    },
    [selectedColor, setShowMobileMenu, beginDrag, paintWeek, setSelectedWeek]
  );

  const handleWeekMouseEnter = useCallback(
    (weekNum) => {
      if (isDragging) {
        memoizedUpdateDrag(weekNum);
        return;
      }
      // Preview range while hovering after first click
      if (rangeStart != null) {
        const preview = getLinearWeeksInSelection(rangeStart, weekNum);
        const combined = new Set([...pinnedWeeks, ...preview]);
        setSelectedWeeks(combined);
        setSelectionPreview({ weekCount: preview.size });
      }
    },
    [isDragging, memoizedUpdateDrag, rangeStart, getLinearWeeksInSelection, pinnedWeeks, setSelectedWeeks, setSelectionPreview]
  );
  const handleMouseUp = useCallback(memoizedEndDrag, [memoizedEndDrag]);
  const handleMouseMove = useCallback((weekNum) => memoizedUpdateDrag(weekNum), [memoizedUpdateDrag]);

  // Touch support
  const handleTouchStart = useCallback(
    (weekNum) => {
      if (!selectedColor) {
        setSelectedWeek(weekNum);
        setShowMobileMenu(false);
        return;
      }
      beginDrag(weekNum);
      paintWeek(weekNum);
    },
    [selectedColor, setShowMobileMenu, beginDrag, paintWeek, setSelectedWeek]
  );

  const handleTouchMove = useCallback(
    (weekNum) => {
      memoizedUpdateDrag(weekNum);
    },
    [memoizedUpdateDrag]
  );

  const handleTouchEnd = useCallback(() => {
    memoizedEndDrag();
  }, [memoizedEndDrag]);

  // Global listeners to end drag when pointer leaves grid

  useEffect(() => {
    const onMouseUp = memoizedEndDrag;
    const onTouchEnd = memoizedEndDrag;
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [memoizedEndDrag]);

  // Optimized global move listeners with throttling

  useEffect(() => {
    if (!isDragging) return;

    let throttleTimeout = null;
    
    const onMouseMove = (e) => {
      if (throttleTimeout) return; // Throttle to 60fps
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 16);
      
      const target = e.target?.closest?.('[data-week-num]');
      if (target) {
        const num = parseInt(target.getAttribute('data-week-num'));
        if (!Number.isNaN(num)) memoizedUpdateDrag(num);
      }
    };

    const onTouchMove = (e) => {
      if (throttleTimeout) return; // Throttle to 60fps
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 16);

      const touch = e.touches?.[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const target = el?.closest?.('[data-week-num]');
      if (target) {
        const num = parseInt(target.getAttribute('data-week-num'));
        if (!Number.isNaN(num)) memoizedUpdateDrag(num);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [isDragging, memoizedUpdateDrag]);

  return {
    selectedWeek,
    setSelectedWeek,
    selectedColor,
    setSelectedColor,
    isDragging,
    setIsDragging,
    draggedWeeks,
    setDraggedWeeks,
    dragStartWeek,
    setDragStartWeek,
    selectedWeeks,
    setSelectedWeeks,
    pinnedWeeks,
    setPinnedWeeks,
    selectionMode,
    setSelectionMode,
    selectionPreview,
    setSelectionPreview,
    rangeStart,
    isInRangeMode,
    resetRangeSelection,
    clearPinnedWeeks,
    allCategories,
    getLinearWeeksInSelection,
    getWeeksInSelection,
    paintWeek,
    paintWeeks,
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};