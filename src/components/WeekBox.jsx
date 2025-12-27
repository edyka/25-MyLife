import { memo, useMemo, useRef } from "react";
import { getYearFromWeek } from "../utils/dateUtils";
import { useRenderPerformance } from "../utils/performanceMonitor";

const WeekBox = memo(({
  weekNum,
  handleWeekClick,
  handleWeekMouseDown,
  handleWeekMouseEnter,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleDoubleClick,
  isSelected,
  isInPreview,
  // Performance optimization: pass store data as props to avoid 54,000+ subscriptions
  currentWeek,
  milestones = {},
  allCategories = {},
  selectedWeek,
  selectedColor,
  selectedWeeks = new Set(),
  isDragging,
  draggedWeeks = new Set(),
  selectionMode = "single",
  isMobile = false,
  darkMode = false,
  setTooltip
}) => {
  // Performance monitoring (only in development for performance-critical component)
  const isDev = process.env.NODE_ENV === 'development';

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (isDev) useRenderPerformance(`WeekBox-${weekNum}`);

  // Memoize expensive calculations
  const weekState = useMemo(() => {
    const isPast = weekNum < currentWeek;
    const isCurrent = weekNum === currentWeek;
    const hasMilestone = milestones && milestones[weekNum];
    const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum);
    const isWeekSelected =
      (isSelected && isSelected(weekNum)) || selectedWeeks.has(weekNum);
    const isWeekInPreview = isInPreview && isInPreview(weekNum);
    const isInMultiSelectMode = selectionMode !== "single";
    const shouldShowHoverEffect = selectedColor || !isMobile;

    return {
      isPast,
      isCurrent,
      hasMilestone,
      isBeingDragged,
      isWeekSelected,
      isWeekInPreview,
      isInMultiSelectMode,
      shouldShowHoverEffect,
    };
  }, [
    weekNum,
    currentWeek,
    milestones,
    draggedWeeks,
    selectedWeeks,
    isSelected,
    isInPreview,
    selectionMode,
    selectedColor,
    isMobile
  ]);

  const {
    isPast,
    isCurrent,
    hasMilestone,
    isBeingDragged,
    isWeekSelected,
    isWeekInPreview,
    isInMultiSelectMode,
    shouldShowHoverEffect,
  } = weekState;

  let bgColor = darkMode
    ? "bg-gray-700 border border-gray-600"
    : "bg-white border border-gray-300";
  let content = null;

  if (isCurrent) {
    bgColor = "bg-red-500 border border-red-700";
  } else if (isPast) {
    if (hasMilestone && allCategories[hasMilestone.category]) {
      bgColor = `${allCategories[hasMilestone.category].color} border ${darkMode ? "border-gray-600" : "border-gray-300"
        }`;
    } else {
      bgColor = darkMode
        ? "bg-gray-600 border border-gray-500"
        : "bg-gray-200 border border-gray-300";
    }
    content = (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-0.5 bg-black rotate-45 absolute"></div>
        <div className="w-2 h-0.5 bg-black -rotate-45 absolute"></div>
      </div>
    );
  } else if (hasMilestone && allCategories[hasMilestone.category]) {
    bgColor = `${allCategories[hasMilestone.category].color} border ${darkMode ? "border-gray-600" : "border-gray-300"
      }`;
  }

  // Modern responsive sizing for the week box
  const sizeClass = "w-full h-full rounded-sm";

  // Track if touch was used to prevent click from firing after touch
  const touchUsedRef = useRef(false);

  return (
    <div
      className={`${sizeClass} week-square cursor-pointer relative select-none ${bgColor} ${selectedWeek === weekNum ? "ring-2 ring-blue-500" : ""
        } ${isBeingDragged ? "ring-2 ring-yellow-400 shadow-lg" : ""} ${isWeekSelected && !isBeingDragged
          ? "ring-2 ring-purple-500 shadow-md"
          : ""
        } ${isWeekInPreview ? "ring-2 ring-blue-400 ring-opacity-60" : ""} ${isInMultiSelectMode ? "ring-1 ring-gray-400 ring-opacity-50" : ""
        } ${shouldShowHoverEffect ? "hover:scale-110 hover:z-10 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:ring-2 hover:ring-blue-400/50" : ""
        } active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-200`}
      style={{ touchAction: 'manipulation' }}
      onMouseDown={(e) => {
        if (!isMobile) {
          e.preventDefault();
          handleWeekMouseDown(weekNum, e);
        }
      }}
      onMouseEnter={() => {
        handleWeekMouseEnter(weekNum);
        // Show custom tooltip (only if setTooltip is provided)
        if (!setTooltip) return;
        const ageText = `Age ${getYearFromWeek(weekNum)} years`;

        if (hasMilestone) {
          const categoryLabel = allCategories[hasMilestone.category]?.label || 'Unknown';
          const milestoneTitle = hasMilestone.title || '';
          setTooltip({
            visible: true,
            label: milestoneTitle || categoryLabel,
            content: milestoneTitle ? `${categoryLabel} · Week ${weekNum} · ${ageText}` : `Week ${weekNum} · ${ageText}`,
            color: allCategories[hasMilestone.category]?.color || null
          });
        } else {
          setTooltip({
            visible: true,
            label: `Week ${weekNum}`,
            content: ageText,
            color: null
          });
        }
      }}
      onMouseLeave={() => {
        if (setTooltip) setTooltip({ visible: false });
      }}
      onClick={(e) => {
        // On mobile, touch events handle interaction - skip click to avoid double-firing
        if (isMobile && touchUsedRef.current) {
          touchUsedRef.current = false;
          return;
        }
        if (!isDragging) {
          handleWeekClick(weekNum, e);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (handleDoubleClick) {
          handleDoubleClick(weekNum, e);
        }
      }}
      onTouchStart={(e) => {
        if (isMobile && handleTouchStart) {
          touchUsedRef.current = true;
          handleTouchStart(weekNum, e);
        }
      }}
      onTouchMove={(e) => {
        if (isMobile && handleTouchMove && isDragging) {
          e.preventDefault();
          handleTouchMove(weekNum, e);
        }
      }}
      onTouchEnd={(e) => {
        if (isMobile && handleTouchEnd) {
          e.preventDefault();
          handleTouchEnd(e);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Week ${weekNum}, Age ${getYearFromWeek(weekNum)} years. ${hasMilestone
        ? `${hasMilestone.title ? hasMilestone.title + ' - ' : ''}${allCategories[hasMilestone.category]?.label || "Unknown"}`
        : "No mood set"
        }${isSelected ? ". Currently selected" : ""}`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDragging) {
            handleWeekClick(weekNum, e);
          }
        }
      }}
    >
      {content}

      {/* Flag indicator for weeks with milestones */}
      {hasMilestone && (
        <div className="absolute top-0 right-0 pointer-events-none">
          <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] ${
            hasMilestone.isMilestone ? 'border-t-yellow-400' : 'border-t-white/80'
          }`} />
        </div>
      )}

      {/* Diamond indicator for important milestones */}
      {hasMilestone?.isMilestone && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 bg-yellow-400 rotate-45 shadow-sm border-[0.5px] border-yellow-600/30" />
        </div>
      )}

      {isWeekSelected && !isBeingDragged && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-in fade-in zoom-in duration-200" />
      )}

      {isBeingDragged && (
        <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-sm border-2 border-yellow-400 border-opacity-70 animate-in fade-in zoom-in-95 duration-150" />
      )}
    </div>
  );
});

WeekBox.displayName = "WeekBox";

export default WeekBox;
