import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { getQuarterFromWeek, getYearFromWeek } from "../utils/dateUtils";
import { useLifeSelectors, useMilestoneSelectors, useSelectionSelectors, useUISelectors } from "../stores";

const ClearWeekBox = memo(({
  weekNum,
  handleWeekClick,
  handleWeekMouseDown,
  handleWeekMouseEnter,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  isDragging,
}) => {
  const { currentWeek } = useLifeSelectors();
  const { milestones, allCategories } = useMilestoneSelectors();
  const {
    selectedWeek,
    selectedColor,
    selectedWeeks,
    draggedWeeks,
    selectionMode,
  } = useSelectionSelectors();
  const { isMobile, darkMode } = useUISelectors();

  const weekState = useMemo(() => {
    const isPast = weekNum < currentWeek;
    const isCurrent = weekNum === currentWeek;
    const hasMilestone = milestones && milestones[weekNum];
    const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum);
    const isWeekSelected = selectedWeeks && selectedWeeks.has(weekNum);

    return {
      isPast,
      isCurrent,
      hasMilestone,
      isBeingDragged,
      isWeekSelected,
    };
  }, [weekNum, currentWeek, milestones, draggedWeeks, selectedWeeks]);

  const { isPast, isCurrent, hasMilestone, isBeingDragged, isWeekSelected } = weekState;

  let baseBg = darkMode ? "bg-slate-800" : "bg-white";
  if (isPast) {
    baseBg = darkMode ? "bg-slate-600" : "bg-slate-200";
  }
  if (hasMilestone && allCategories[hasMilestone.category]) {
    baseBg = allCategories[hasMilestone.category].color;
  }

  const borderClass = isCurrent
    ? "border-2 border-red-500"
    : darkMode
    ? "border border-slate-500"
    : "border border-slate-300";

  return (
    <motion.div
      data-week-num={weekNum}
      className={`w-full h-full ${baseBg} ${borderClass} ${
        isWeekSelected ? "ring-2 ring-blue-400" : ""
      } ${isBeingDragged ? "ring-2 ring-yellow-400" : ""} rounded-sm`} 
      whileHover={selectedColor ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.96 }}
      onMouseDown={(e) => { e.preventDefault(); handleWeekMouseDown(weekNum); }}
      onMouseEnter={() => handleWeekMouseEnter(weekNum)}
      onClick={() => { if (!isDragging) handleWeekClick(weekNum); }}
      onTouchStart={(e) => { if (isMobile && handleTouchStart) handleTouchStart(weekNum, e); }}
      onTouchMove={(e) => { if (isMobile && handleTouchMove && isDragging) { e.preventDefault(); handleTouchMove(weekNum); } }}
      onTouchEnd={(e) => { if (isMobile && handleTouchEnd) { e.preventDefault(); handleTouchEnd(); } }}
      title={`Week ${weekNum} - Age ${getYearFromWeek(weekNum)} years, ${getQuarterFromWeek(weekNum)}`}
      role="button"
      tabIndex={0}
    />
  );
});

ClearWeekBox.displayName = "ClearWeekBox";

export default ClearWeekBox;


