import { memo } from "react";
import { getQuarterFromWeek, getYearFromWeek } from "../utils/dateUtils";
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from "../stores";
import { useWeekInteractionsZustand } from "../hooks/useWeekInteractionsZustand";
import { useAccessibility } from "../hooks/useAccessibility";

/**
 * Modern WeekBox component using Zustand stores
 * No prop drilling - gets all state from stores directly
 */
const ModernWeekBox = ({ weekNum }) => {
  // Get state from Zustand stores
  const currentWeek = useLifeStore(state => state.currentWeek);
  const { milestones, getAllCategories } = useMilestoneStore();
  const {
    selectedWeek,
    selectedColor,
    isDragging,
    draggedWeeks,
    selectionMode,
    isWeekSelected
  } = useSelectionStore();
  const { isMobile, darkMode, enableAnimations } = useUIStore();
  
  // Get interaction handlers
  const {
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useWeekInteractionsZustand();
  
  // Get accessibility helpers
  const { 
    getWeekDescription, 
    handleKeyboardNavigation,
    prefersReducedMotion
  } = useAccessibility();
  
  const allCategories = getAllCategories();
  
  // Computed state
  const isPast = weekNum < currentWeek;
  const isCurrent = weekNum === currentWeek;
  const hasMilestone = milestones && milestones[weekNum];
  const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum);
  const isWeekSelectedState = isWeekSelected(weekNum);
  const isInMultiSelectMode = selectionMode !== "single";
  const shouldShowHoverEffect = selectedColor || !isMobile;

  // Visual styling logic
  let bgColor = darkMode
    ? "bg-gray-700 border border-gray-600"
    : "bg-white border border-gray-300";
  let content = null;

  if (isCurrent) {
    bgColor = "bg-gradient-to-br from-red-500 to-red-600 border border-red-700 shadow-lg";
    // Add pulsing effect for current week
    content = enableAnimations ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    );
  } else if (isPast) {
    if (hasMilestone && allCategories[hasMilestone.category]) {
      bgColor = `${allCategories[hasMilestone.category].color} border ${
        darkMode ? "border-gray-600" : "border-gray-300"
      }`;
    } else {
      bgColor = darkMode
        ? "bg-gray-600 border border-gray-500"
        : "bg-gray-200 border border-gray-300";
    }
    // Modern dot design for past weeks - smaller inner dot
    content = (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-1.5 h-1.5 rounded-full ${
          darkMode ? 'bg-slate-400' : 'bg-slate-600'
        }`} />
      </div>
    );
  } else if (hasMilestone && allCategories[hasMilestone.category]) {
    bgColor = `${allCategories[hasMilestone.category].color} border ${
      darkMode ? "border-gray-600" : "border-gray-300"
    }`;
  }

  // Modern responsive sizing with circular/dot design
  const sizeClass = isMobile ? "w-3 h-3" : "w-4 h-4";
  const isCircular = true; // Modern circular design
  
  // Modern ring styling with better colors
  let ringClass = "";
  if (selectedWeek === weekNum) {
    ringClass = "ring-2 ring-blue-500 shadow-md";
  } else if (isBeingDragged) {
    ringClass = "ring-2 ring-yellow-400 shadow-lg";
  } else if (isWeekSelectedState && !isBeingDragged) {
    ringClass = "ring-2 ring-purple-500 shadow-md";
  } else if (isInMultiSelectMode) {
    ringClass = "ring-1 ring-gray-400 ring-opacity-50";
  }

  // Add selected/dragged state to base classes
  const selectedStateScale = selectedWeek === weekNum || isBeingDragged || isWeekSelectedState ? "scale-108 -translate-y-0.5" : "";

  const baseClasses = [
    sizeClass,
    "cursor-pointer relative select-none",
    isCircular ? "rounded-full" : "rounded-sm",
    bgColor,
    ringClass,
    "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1",
    "transition-all duration-200",
    shouldShowHoverEffect ? (selectedColor ? "hover:scale-110 hover:-translate-y-0.5" : "hover:scale-105 hover:-translate-y-0.5") : "",
    "hover:shadow-md",
    "active:scale-90",
    selectedStateScale
  ].join(" ");

  // Enhanced accessibility description
  const ariaLabel = getWeekDescription(weekNum, hasMilestone);

  return (
    <div
      className={baseClasses}
      onMouseDown={(e) => {
        e.preventDefault();
        handleWeekMouseDown(weekNum, e);
      }}
      onMouseEnter={() => handleWeekMouseEnter(weekNum)}
      onClick={(e) => {
        if (!isDragging) {
          handleWeekClick(weekNum, e);
        }
      }}
      onTouchStart={(e) => {
        if (isMobile) {
          handleTouchStart(weekNum, e);
        }
      }}
      onTouchMove={(e) => {
        if (isMobile && isDragging) {
          e.preventDefault();
          handleTouchMove(weekNum);
        }
      }}
      onTouchEnd={(e) => {
        if (isMobile) {
          e.preventDefault();
          handleTouchEnd();
        }
      }}
      title={`Week ${weekNum} - Age ${getYearFromWeek(weekNum)} years, ${getQuarterFromWeek(weekNum)}${
        hasMilestone ? ` | ${allCategories[hasMilestone.category]?.label || "Unknown"}` : ""
      }${isWeekSelectedState ? " (Selected)" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isWeekSelectedState}
      aria-describedby={`week-${weekNum}-description`}
      data-week={weekNum}
      onKeyDown={(e) => {
        // First handle general navigation
        handleKeyboardNavigation(e);

        // Then handle week-specific actions
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDragging) {
            handleWeekClick(weekNum, e);
          }
        }
      }}
    >
      {content}

      {/* Modern selection indicator */}
      {isWeekSelectedState && !isBeingDragged && enableAnimations && !prefersReducedMotion && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-in fade-in zoom-in duration-200" />
      )}

      {/* Drag indicator with improved styling */}
      {isBeingDragged && enableAnimations && !prefersReducedMotion && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full border-2 border-yellow-400/70 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150" />
      )}

      {/* Static indicators for reduced motion or disabled animations */}
      {(!enableAnimations || prefersReducedMotion) && isWeekSelectedState && !isBeingDragged && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-lg" />
      )}

      {(!enableAnimations || prefersReducedMotion) && isBeingDragged && (
        <div className="absolute inset-0 bg-yellow-400/30 rounded-full border-2 border-yellow-400/70" />
      )}

      {/* Hidden description for screen readers */}
      <div id={`week-${weekNum}-description`} className="sr-only">
        {ariaLabel}
      </div>
    </div>
  );
};

export default memo(ModernWeekBox);