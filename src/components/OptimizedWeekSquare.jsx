import { memo } from 'react';

/**
 * Highly optimized WeekSquare component
 * - Memoized to prevent unnecessary re-renders
 * - Minimal props to reduce comparison overhead
 * - CSS-only animations instead of Framer Motion
 * - Simplified conditional rendering
 */
const OptimizedWeekSquare = memo(({
  weekNumber,
  milestone,
  isLived,
  isCurrent,
  hasSelectedMood,
  darkMode,
  onClick
}) => {
  // Determine background classes based on state
  const getBackgroundClass = () => {
    if (milestone) {
      return milestone.bgColor || 'bg-blue-500';
    }
    if (isLived) {
      return darkMode ? 'bg-slate-700' : 'bg-slate-200';
    }
    return darkMode ? 'bg-slate-900' : 'bg-slate-100';
  };

  // Determine hover classes
  const getHoverClass = () => {
    if (!hasSelectedMood) return '';

    if (milestone) {
      return darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-300';
    }
    if (isLived) {
      return darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-300';
    }
    return darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200';
  };

  const bgClass = getBackgroundClass();
  const hoverClass = getHoverClass();
  const cursorClass = hasSelectedMood ? 'cursor-pointer' : 'cursor-default';
  const ringClass = isCurrent ? `ring-2 ring-offset-2 ${darkMode ? 'ring-blue-500' : 'ring-blue-600'}` : '';

  return (
    <div
      onClick={onClick}
      className={`
        w-3 h-3 rounded-sm
        transition-all duration-200
        ${bgClass}
        ${hoverClass}
        ${cursorClass}
        ${ringClass}
        ${hasSelectedMood ? 'hover:scale-125' : ''}
        ${milestone ? 'shadow-md' : ''}
      `}
      title={`Week ${weekNumber}${milestone ? ` - ${milestone.mood}` : ''}`}
      aria-label={`Week ${weekNumber}${milestone ? `, ${milestone.mood}` : ''}${isCurrent ? ', current week' : ''}`}
      role="button"
      tabIndex={hasSelectedMood ? 0 : -1}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-render prevention
  // Only re-render if these specific props change
  return (
    prevProps.weekNumber === nextProps.weekNumber &&
    prevProps.milestone === nextProps.milestone &&
    prevProps.isLived === nextProps.isLived &&
    prevProps.isCurrent === nextProps.isCurrent &&
    prevProps.hasSelectedMood === nextProps.hasSelectedMood &&
    prevProps.darkMode === nextProps.darkMode
  );
});

OptimizedWeekSquare.displayName = 'OptimizedWeekSquare';

export default OptimizedWeekSquare;
