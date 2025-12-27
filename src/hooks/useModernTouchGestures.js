import { useState, useCallback, useRef } from "react";
import { useSelectionStore, useUIStore } from "../stores";

/**
 * Modern touch gestures hook with improved mobile interactions and accessibility
 * Supports multi-touch, haptic feedback, and better gesture recognition
 */
export const useModernTouchGestures = ({
  paintWeeks,
  handleWeekMouseDown,
  handleWeekMouseEnter,
  handleMouseUp,
}) => {
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [lastTap, setLastTap] = useState(null);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimerRef = useRef(null);
  
  // Get state from stores
  const {
    selectedWeeks,
    setSelectedWeeks,
    selectionMode,
    setSelectionMode,
    isDragging,
    getWeeksInSelection,
  } = useSelectionStore();
  const { isMobile, enableHapticFeedback = true } = useUIStore();

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback((type = 'light') => {
    if (!isMobile || !enableHapticFeedback) return;
    
    try {
      if (navigator.vibrate) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
          double: [10, 10, 10],
        };
        navigator.vibrate(patterns[type] || patterns.light);
      }
    } catch {
      // Vibration not supported or permission denied
    }
  }, [isMobile, enableHapticFeedback]);

  // Enhanced touch start with IMMEDIATE response for better mobile UX
  const handleTouchStart = useCallback((weekNum, event) => {
    if (!isMobile) return;

    const now = Date.now();
    const touch = event.touches?.[0];
    const position = touch ? { x: touch.clientX, y: touch.clientY } : null;

    setTouchStartTime(now);
    setTouchStartPosition(position);
    setIsLongPress(false);

    // Clear any existing long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // IMMEDIATE response - handle the tap right away for responsive feel
    triggerHapticFeedback('light');
    handleWeekMouseDown(weekNum, event);

    // Set up long press detection (for multi-selection mode)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      triggerHapticFeedback('medium');

      // Long press enters multi-selection mode
      if (selectionMode === 'single') {
        setSelectionMode('multi');
      }

      // Select the current week
      setSelectedWeeks(prev => new Set([...prev, weekNum]));
    }, 400); // Reduced from 500ms to 400ms

    // Track for double tap (handled separately, doesn't block single tap)
    setLastTap(now);
  }, [
    isMobile,
    selectionMode,
    isDragging,
    getWeeksInSelection,
    paintWeeks,
    setSelectedWeeks,
    setSelectionMode,
    handleWeekMouseDown,
    triggerHapticFeedback
  ]);

  // Enhanced touch move with better drag detection
  const handleTouchMove = useCallback((weekNum, event) => {
    if (!isMobile) return;

    const touch = event.touches?.[0];
    if (!touch || !touchStartPosition) return;

    const currentPosition = { x: touch.clientX, y: touch.clientY };
    const distance = Math.sqrt(
      Math.pow(currentPosition.x - touchStartPosition.x, 2) +
      Math.pow(currentPosition.y - touchStartPosition.y, 2)
    );

    // If moved more than 10px, cancel long press
    if (distance > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle dragging
    if (isDragging) {
      event.preventDefault();
      handleWeekMouseEnter(weekNum);
      
      // Light haptic feedback during drag
      if (selectedWeeks.has(weekNum)) {
        triggerHapticFeedback('light');
      }
    }
  }, [
    isMobile,
    touchStartPosition,
    isDragging,
    selectedWeeks,
    handleWeekMouseEnter,
    triggerHapticFeedback
  ]);

  // Enhanced touch end with gesture completion
  const handleTouchEnd = useCallback((event) => {
    if (!isMobile) return;

    const now = Date.now();
    const touchDuration = touchStartTime ? now - touchStartTime : 0;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle different gesture completions
    if (isLongPress) {
      // Long press completed - provide feedback
      triggerHapticFeedback('heavy');
    } else if (touchDuration < 150) {
      // Quick tap - light feedback
      triggerHapticFeedback('light');
    }

    // Reset state
    setTouchStartTime(null);
    setTouchStartPosition(null);
    setIsLongPress(false);

    // Complete mouse interaction
    if (isDragging) {
      event?.preventDefault?.();
      handleMouseUp();
      triggerHapticFeedback('medium');
    }
  }, [
    isMobile,
    touchStartTime,
    isLongPress,
    isDragging,
    handleMouseUp,
    triggerHapticFeedback
  ]);

  // Multi-touch gesture handling (pinch to zoom, etc.)
  const handleMultiTouchStart = useCallback((event) => {
    if (!isMobile || event.touches.length !== 2) return;

    // Future enhancement: handle pinch gestures for zoom
    // For now, prevent default to avoid unwanted behaviors
    event.preventDefault();
  }, [isMobile]);

  const handleMultiTouchMove = useCallback((event) => {
    if (!isMobile || event.touches.length !== 2) return;

    event.preventDefault();
    // Future enhancement: calculate pinch distance and scale
  }, [isMobile]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  return {
    // Basic touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Multi-touch handlers
    handleMultiTouchStart,
    handleMultiTouchMove,
    
    // State
    isLongPress,
    touchStartTime,
    
    // Utilities
    triggerHapticFeedback,
    cleanup,
  };
};