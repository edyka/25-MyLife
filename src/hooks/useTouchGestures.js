import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * useTouchGestures - Custom hook for mobile touch interactions
 *
 * Features:
 * - Swipe to paint multiple weeks
 * - Long press to select mood
 * - Pinch to zoom (optional)
 * - Touch feedback
 * - Prevent scroll jank during painting
 *
 * @param {Object} params
 * @param {Function} params.onWeekPaint - Handler for painting weeks
 * @param {Function} params.onLongPress - Handler for long press
 * @param {boolean} params.enabled - Whether touch gestures are enabled
 */
export const useTouchGestures = ({
  onWeekPaint = () => {},
  onLongPress = () => {},
  enabled = true
}) => {
  const [isPainting, setIsPainting] = useState(false);
  const [lastPaintedWeek, setLastPaintedWeek] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0, weekNumber: null });
  const longPressTimerRef = useRef(null);
  const paintedWeeksSetRef = useRef(new Set());

  // Handle touch start
  const handleTouchStart = useCallback((event, weekNumber) => {
    if (!enabled) return;

    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      weekNumber
    };

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      onLongPress(weekNumber);
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press

    setIsPainting(true);
    paintedWeeksSetRef.current = new Set([weekNumber]);
    onWeekPaint(weekNumber);

  }, [enabled, onWeekPaint, onLongPress]);

  // Handle touch move (for swipe painting)
  const handleTouchMove = useCallback((event, weekNumber) => {
    if (!enabled || !isPainting) return;

    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Paint the week if we haven't already
    if (weekNumber && !paintedWeeksSetRef.current.has(weekNumber)) {
      paintedWeeksSetRef.current.add(weekNumber);
      onWeekPaint(weekNumber);
      setLastPaintedWeek(weekNumber);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }

    // Prevent default to avoid scrolling while painting
    event.preventDefault();
  }, [enabled, isPainting, onWeekPaint]);

  // Handle touch end
  const handleTouchEnd = useCallback((event) => {
    if (!enabled) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    setIsPainting(false);
    setLastPaintedWeek(null);
    paintedWeeksSetRef.current.clear();
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    isPainting,
    lastPaintedWeek,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

/**
 * usePinchZoom - Custom hook for pinch-to-zoom on grid
 *
 * @param {Object} params
 * @param {number} params.minScale - Minimum zoom scale (default: 0.5)
 * @param {number} params.maxScale - Maximum zoom scale (default: 2)
 * @param {boolean} params.enabled - Whether pinch zoom is enabled
 */
export const usePinchZoom = ({
  minScale = 0.5,
  maxScale = 2,
  enabled = true
}) => {
  const [scale, setScale] = useState(1);
  const lastScaleRef = useRef(1);
  const lastDistanceRef = useRef(0);

  const handleTouchMove = useCallback((event) => {
    if (!enabled || event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    if (lastDistanceRef.current > 0) {
      const delta = distance - lastDistanceRef.current;
      const scaleChange = delta * 0.01;
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, lastScaleRef.current + scaleChange)
      );
      setScale(newScale);
    }

    lastDistanceRef.current = distance;
    event.preventDefault();
  }, [enabled, minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;
    lastScaleRef.current = scale;
    lastDistanceRef.current = 0;
  }, [enabled, scale]);

  return {
    scale,
    handleTouchMove,
    handleTouchEnd,
    resetZoom: () => setScale(1)
  };
};

export default useTouchGestures;
