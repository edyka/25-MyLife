import { useState, useCallback, useRef } from "react";

export const useTouchGestures = ({
  selectedWeeks,
  getWeeksInSelection,
  paintWeeks,
  setSelectedWeeks,
  handleWeekMouseDown,
  isDragging,
  handleWeekMouseEnter,
  handleMouseUp,
  setSelectionMode,
}) => {
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [lastTap, setLastTap] = useState(null);
  
  // Use refs to avoid recreating callbacks
  const selectedWeeksRef = useRef(selectedWeeks);
  const isDraggingRef = useRef(isDragging);
  
  selectedWeeksRef.current = selectedWeeks;
  isDraggingRef.current = isDragging;

  const handleTouchStart = useCallback(
    (weekNum, event) => {
      const now = Date.now();
      setTouchStartTime(now);

      // Check for double tap
      if (lastTap && now - lastTap < 300) {
        // Double tap - extend selection or start multi-select
        event?.preventDefault?.();
        if (selectedWeeksRef.current.size > 0) {
          const lastWeek = Math.max(...selectedWeeksRef.current);
          const selectionWeeks = getWeeksInSelection(lastWeek, weekNum);
          paintWeeks(selectionWeeks);
          setSelectedWeeks((prev) => new Set([...prev, ...selectionWeeks]));
        }
        setLastTap(null);
      } else {
        setLastTap(now);
        handleWeekMouseDown(weekNum, event);
      }
    },
    [
      lastTap,
      getWeeksInSelection,
      paintWeeks,
      setSelectedWeeks,
      handleWeekMouseDown,
    ]
  );

  const handleTouchMove = useCallback(
    (weekNum) => {
      if (isDraggingRef.current) {
        handleWeekMouseEnter(weekNum);
      }
    },
    [handleWeekMouseEnter]
  );

  const handleTouchEnd = useCallback(() => {
    const touchDuration = touchStartTime ? Date.now() - touchStartTime : 0;

    // Long press detection (> 500ms)
    if (touchDuration > 500 && !isDraggingRef.current) {
      // Show context menu or multi-select mode
      setSelectionMode("add");
      // Could trigger haptic feedback here if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    handleMouseUp();
    setTouchStartTime(null);
  }, [touchStartTime, handleMouseUp, setSelectionMode]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};