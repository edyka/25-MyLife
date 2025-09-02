import { memo } from "react";
import { motion } from "framer-motion";
import { getQuarterFromWeek, getYearFromWeek } from "../utils/dateUtils";
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from "../stores";

const WeekBox = ({
  weekNum,
  handleWeekClick,
  handleWeekMouseDown,
  handleWeekMouseEnter,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  isSelected,
  isInPreview,
}) => {
  // Get state from Zustand stores
  const lifeStore = useLifeStore();
  const currentWeek = lifeStore.currentWeek;
  const { milestones, getAllCategories } = useMilestoneStore();
  const {
    selectedWeek,
    selectedColor,
    selectedWeeks,
    isDragging,
    draggedWeeks,
    selectionMode
  } = useSelectionStore();
  const { isMobile, darkMode } = useUIStore();
  
  const allCategories = getAllCategories();
  const isPast = weekNum < currentWeek;
  const isCurrent = weekNum === currentWeek;
  const hasMilestone = milestones && milestones[weekNum];
  const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum);
  const isWeekSelected =
    (isSelected && isSelected(weekNum)) || selectedWeeks.has(weekNum);
  const isWeekInPreview = isInPreview && isInPreview(weekNum);
  const isInMultiSelectMode = selectionMode !== "single";
  const shouldShowHoverEffect = selectedColor || !isMobile;

  let bgColor = darkMode
    ? "bg-gray-700 border border-gray-600"
    : "bg-white border border-gray-300";
  let content = null;

  if (isCurrent) {
    bgColor = "bg-red-500 border border-red-700";
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
    content = (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-0.5 bg-black rotate-45 absolute"></div>
        <div className="w-2 h-0.5 bg-black -rotate-45 absolute"></div>
      </div>
    );
  } else if (hasMilestone && allCategories[hasMilestone.category]) {
    bgColor = `${allCategories[hasMilestone.category].color} border ${
      darkMode ? "border-gray-600" : "border-gray-300"
    }`;
  }

  const sizeClass = isMobile ? "flex-1 h-4 min-w-0" : "flex-1 h-6 min-w-0";

  return (
    <motion.div
      className={`${sizeClass} cursor-pointer relative select-none ${bgColor} ${
        selectedWeek === weekNum ? "ring-2 ring-blue-500" : ""
      } ${isBeingDragged ? "ring-2 ring-yellow-400 shadow-lg" : ""} ${
        isWeekSelected && !isBeingDragged
          ? "ring-2 ring-purple-500 shadow-md"
          : ""
      } ${isWeekInPreview ? "ring-2 ring-blue-400 ring-opacity-60" : ""} ${
        isInMultiSelectMode ? "ring-1 ring-gray-400 ring-opacity-50" : ""
      } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-200`}
      whileHover={
        shouldShowHoverEffect
          ? {
              scale: selectedColor ? 1.1 : 1.05,
              y: -2,
              boxShadow: darkMode
                ? "0 6px 20px rgba(59, 130, 246, 0.4)"
                : "0 6px 20px rgba(59, 130, 246, 0.25)",
              transition: { type: "spring", stiffness: 600, damping: 25 },
            }
          : {}
      }
      whileTap={{
        scale: 0.88,
        transition: { type: "spring", stiffness: 700, damping: 20 },
      }}
      initial={{ opacity: 0, scale: 0.8, y: 5 }}
      animate={{
        opacity: 1,
        scale:
          selectedWeek === weekNum || isBeingDragged || isWeekSelected
            ? 1.08
            : 1,
        y:
          selectedWeek === weekNum || isBeingDragged || isWeekSelected ? -1 : 0,
        transition: {
          opacity: { duration: 0.2, ease: "easeOut" },
          scale: { type: "spring", stiffness: 500, damping: 25 },
          y: { type: "spring", stiffness: 500, damping: 25 },
        },
      }}
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
        if (isMobile && handleTouchStart) {
          handleTouchStart(weekNum, e);
        }
      }}
      onTouchMove={(e) => {
        if (isMobile && handleTouchMove && isDragging) {
          e.preventDefault();
          handleTouchMove(weekNum);
        }
      }}
      onTouchEnd={(e) => {
        if (isMobile && handleTouchEnd) {
          e.preventDefault();
          handleTouchEnd();
        }
      }}
      title={`Week ${weekNum} - Age ${getYearFromWeek(
        weekNum
      )} years, ${getQuarterFromWeek(weekNum)}${
        hasMilestone
          ? ` | Mood: ${
              allCategories[hasMilestone.category]?.label || "Unknown"
            }`
          : ""
      }${isSelected ? " (Selected)" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Week ${weekNum}, Age ${getYearFromWeek(
        weekNum
      )} years, ${getQuarterFromWeek(weekNum)}. ${
        hasMilestone
          ? `Mood: ${
              allCategories[hasMilestone.category]?.label || "Unknown"
            } - ${hasMilestone.title}`
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

      {isWeekSelected && !isBeingDragged && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-lg"
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 90 }}
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 20,
            delay: 0.05,
          }}
        />
      )}

      {isBeingDragged && (
        <motion.div
          className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-sm border-2 border-yellow-400 border-opacity-70"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 800, damping: 25 }}
        />
      )}
    </motion.div>
  );
};

export default memo(WeekBox);
