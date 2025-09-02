import { useState, useCallback, useMemo, useEffect } from "react";
import { getTotalWeeks } from "../utils/dateUtils";
import { getAllCategories } from "../utils/constants";

export const useWeekInteractions = ({ 
  lifeExpectancy, 
  setMilestones, 
  customCategories,
  setShowMobileMenu = () => {} 
}) => {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWeeks, setDraggedWeeks] = useState(new Set());
  const [dragStartWeek, setDragStartWeek] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState("single");
  const [selectionPreview, setSelectionPreview] = useState(null);
  // Click-click range selection state
  const [rangeStart, setRangeStart] = useState(null);
  const [isInRangeMode, setIsInRangeMode] = useState(false);
  // Persistent selection that should not disappear
  const [pinnedWeeks, setPinnedWeeks] = useState(new Set());

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
        setMilestones((prev) => {
          const updated = { ...prev };
          delete updated[weekNum];
          return updated;
        });
      } else {
        setMilestones((prev) => ({
          ...prev,
          [weekNum]: {
            title: `${allCategories[selectedColor].label} week`,
            category: selectedColor,
            description: `Marked as ${allCategories[selectedColor].label.toLowerCase()}`,
            weekNum,
          },
        }));
      }
    },
    [selectedColor, setMilestones, allCategories]
  );

  const paintWeeks = useCallback(
    (weeks) => {
      if (!selectedColor || weeks.size === 0) return;
      setMilestones((prev) => {
        const updated = { ...prev };
        weeks.forEach((weekNum) => {
          if (selectedColor === "none") delete updated[weekNum];
          else
            updated[weekNum] = {
              title: `${allCategories[selectedColor].label} week`,
              category: selectedColor,
              description: `Marked as ${allCategories[selectedColor].label.toLowerCase()}`,
              weekNum,
            };
        });
        return updated;
      });
    },
    [selectedColor, setMilestones, allCategories]
  );

  // Simple, intuitive interactions
  const handleWeekClick = useCallback(
    (weekNum) => {
      if (selectedColor) {
        // Click-click range selection when a color is chosen
        if (rangeStart == null) {
          setRangeStart(weekNum);
          setIsInRangeMode(true);
          setSelectedWeeks(new Set([...pinnedWeeks, weekNum]));
        } else {
          const range = getLinearWeeksInSelection(rangeStart, weekNum);
          // Accumulate with pinned weeks so they don't disappear
          const combined = new Set([...pinnedWeeks, ...range]);
          setSelectedWeeks(combined);
          setPinnedWeeks(combined);
          paintWeeks(range);
          setRangeStart(null);
          setIsInRangeMode(false);
          setSelectionPreview(null);
        }
      } else {
        setSelectedWeek(weekNum);
        setShowMobileMenu(false);
      }
    },
    [selectedColor, rangeStart, getLinearWeeksInSelection, paintWeeks, setShowMobileMenu, pinnedWeeks]
  );

  const beginDrag = useCallback((weekNum) => {
    setIsDragging(true);
    setDragStartWeek(weekNum);
    const startSet = new Set([weekNum]);
    setDraggedWeeks(startSet);
    setSelectedWeeks(startSet);
  }, []);

  // Memoized updateDrag function to prevent excessive callback recreation
  const memoizedUpdateDrag = useCallback((weekNum) => {
    if (!isDragging || dragStartWeek == null) return;
    const range = getLinearWeeksInSelection(dragStartWeek, weekNum);
    setDraggedWeeks(range);
    setSelectedWeeks(range);
    setSelectionPreview({ weekCount: range.size });
  }, [isDragging, dragStartWeek, getLinearWeeksInSelection]);

  // Memoized endDrag function to prevent excessive event listener re-registration
  const memoizedEndDrag = useCallback(() => {
    if (isDragging && draggedWeeks.size > 0) {
      paintWeeks(draggedWeeks);
    }
    setIsDragging(false);
    setDraggedWeeks(new Set());
    setDragStartWeek(null);
    setSelectionPreview(null);
  }, [isDragging, draggedWeeks, paintWeeks]);

  const handleWeekMouseDown = useCallback(
    (weekNum) => {
      if (!selectedColor) {
        setSelectedWeek(weekNum);
        setShowMobileMenu(false);
        return;
      }
      // In click-to-range mode, do not start a drag at all when a color is selected
      return;
    },
    [selectedColor, setShowMobileMenu]
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
    [isDragging, memoizedUpdateDrag, rangeStart, getLinearWeeksInSelection, pinnedWeeks]
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
    },
    [selectedColor, setShowMobileMenu, beginDrag]
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
    resetRangeSelection: () => { setRangeStart(null); setIsInRangeMode(false); setSelectionPreview(null); },
    clearPinnedWeeks: () => { setPinnedWeeks(new Set()); setSelectedWeeks(new Set()); },
    allCategories,
    getLinearWeeksInSelection,
    getWeeksInSelection: getLinearWeeksInSelection,
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