import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelectionState } from './useSelectionState';

const SELECTION_MODES = {
  SINGLE: 'single',
  RECTANGLE: 'rectangle',
  MULTI: 'multi',
  PAINT: 'paint'
};

export const useAdvancedSelection = (maxWeeks = 4160) => {
  const selection = useSelectionState(maxWeeks);
  const [selectionMode, setSelectionMode] = useState(SELECTION_MODES.SINGLE);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  
  // Gesture recognition state
  const gestureRef = useRef({
    startTime: 0,
    startPosition: null,
    totalDistance: 0,
    isTouch: false
  });

  // Debounced selection preview
  const previewSelectionRef = useRef(new Set());
  const updateTimeoutRef = useRef(null);

  const updatePreview = useCallback((startWeek, endWeek, immediate = false) => {
    const update = () => {
      if (selectionMode === SELECTION_MODES.RECTANGLE && startWeek && endWeek) {
        const newPreview = new Set();
        const startYear = Math.floor((startWeek - 1) / 52);
        const startWeekInYear = (startWeek - 1) % 52;
        const endYear = Math.floor((endWeek - 1) / 52);
        const endWeekInYear = (endWeek - 1) % 52;
        
        const minYear = Math.min(startYear, endYear);
        const maxYear = Math.max(startYear, endYear);
        const minWeekInYear = Math.min(startWeekInYear, endWeekInYear);
        const maxWeekInYear = Math.max(startWeekInYear, endWeekInYear);
        
        for (let year = minYear; year <= maxYear; year++) {
          for (let weekInYear = minWeekInYear; weekInYear <= maxWeekInYear; weekInYear++) {
            newPreview.add(year * 52 + weekInYear + 1);
          }
        }
        previewSelectionRef.current = newPreview;
      }
    };

    if (immediate) {
      update();
    } else {
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = requestAnimationFrame(update);
    }
  }, [selectionMode]);

  const handleMouseDown = useCallback((weekNum, event) => {
    event.preventDefault();
    
    const isTouch = event.type.startsWith('touch');
    const position = isTouch 
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: event.clientX, y: event.clientY };

    gestureRef.current = {
      startTime: Date.now(),
      startPosition: position,
      totalDistance: 0,
      isTouch
    };

    setDragStart(weekNum);
    setDragEnd(weekNum);
    setIsDragging(true);

    // Handle modifier keys for different selection modes
    if (event.ctrlKey || event.metaKey) {
      setSelectionMode(SELECTION_MODES.MULTI);
      selection.toggleWeek(weekNum);
    } else if (event.shiftKey && selection.selectedWeeks.length > 0) {
      setSelectionMode(SELECTION_MODES.RECTANGLE);
      const lastSelected = selection.selectedWeeks[selection.selectedWeeks.length - 1];
      selection.selectRectangle(lastSelected, weekNum);
    } else {
      setSelectionMode(SELECTION_MODES.RECTANGLE);
      selection.clearSelection();
      selection.selectWeek(weekNum);
    }

    updatePreview(weekNum, weekNum, true);
  }, [selection, updatePreview]);

  const handleMouseEnter = useCallback((weekNum, event) => {
    if (!isDragging) return;

    const isTouch = event?.type?.startsWith('touch');
    if (isTouch && event.touches?.length > 0) {
      const position = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      const distance = Math.sqrt(
        Math.pow(position.x - gestureRef.current.startPosition.x, 2) +
        Math.pow(position.y - gestureRef.current.startPosition.y, 2)
      );
      gestureRef.current.totalDistance += distance;
    }

    setDragEnd(weekNum);
    
    if (selectionMode === SELECTION_MODES.RECTANGLE) {
      updatePreview(dragStart, weekNum);
    } else if (selectionMode === SELECTION_MODES.PAINT) {
      selection.selectWeek(weekNum);
    }
  }, [isDragging, dragStart, selectionMode, selection, updatePreview]);

  const handleMouseUp = useCallback((_event) => {
    if (!isDragging) return;

    const gestureTime = Date.now() - gestureRef.current.startTime;
    const isClick = gestureTime < 200 && gestureRef.current.totalDistance < 10;

    if (selectionMode === SELECTION_MODES.RECTANGLE && dragStart && dragEnd && !isClick) {
      selection.selectRectangle(dragStart, dragEnd);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    previewSelectionRef.current.clear();
    
    // Reset to single selection mode
    setSelectionMode(SELECTION_MODES.SINGLE);
  }, [isDragging, selectionMode, dragStart, dragEnd, selection]);

  // Global mouse up handler
  useEffect(() => {
    const globalMouseUp = (event) => {
      if (isDragging) {
        handleMouseUp(event);
      }
    };

    document.addEventListener('mouseup', globalMouseUp);
    document.addEventListener('touchend', globalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', globalMouseUp);
      document.removeEventListener('touchend', globalMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  const isInPreview = useCallback((weekNum) => {
    return previewSelectionRef.current.has(weekNum);
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    ...selection,
    selectionMode,
    setSelectionMode,
    isDragging,
    dragStart,
    dragEnd,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isInPreview,
    SELECTION_MODES
  };
};