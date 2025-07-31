import React, { memo } from 'react'; // eslint-disable-line no-unused-vars
import { motion } from 'framer-motion';
import { getQuarterFromWeek, getYearFromWeek } from '../utils/dateUtils';

const WeekBox = ({ 
  weekNum, 
  currentWeek,
  milestones, 
  selectedWeek, 
  selectedColor, 
  handleWeekClick,
  handleWeekMouseDown,
  handleWeekMouseEnter,
  isDragging,
  draggedWeeks,
  isMobile,
  darkMode,
  allCategories
}) => {
  const isPast = weekNum < currentWeek;
  const isCurrent = weekNum === currentWeek;
  const hasMilestone = milestones[weekNum];
  const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum);
  
  let bgColor = darkMode ? 'bg-gray-700 border-2 border-gray-600' : 'bg-white border-2 border-gray-300';
  let content = null;
  
  if (isCurrent) {
    bgColor = 'bg-red-500 border-2 border-red-700';
  } else if (isPast) {
    if (hasMilestone && allCategories[hasMilestone.category]) {
      bgColor = `${allCategories[hasMilestone.category].color} border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`;
    } else {
      // Enhanced styling for lived weeks - more visible with gradient and subtle pattern
      bgColor = darkMode 
        ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500 shadow-sm' 
        : 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 shadow-sm';
    }
    content = (
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Enhanced cross pattern for lived weeks */}
        <div className={`w-full h-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rotate-45 absolute opacity-60 rounded-full`}></div>
        <div className={`w-full h-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} -rotate-45 absolute opacity-60 rounded-full`}></div>
        {/* Add a small dot in the center for extra visibility */}
        <div className={`w-1.5 h-1.5 ${darkMode ? 'bg-blue-300' : 'bg-blue-600'} rounded-full absolute z-10`}></div>
      </div>
    );
  } else if (hasMilestone && allCategories[hasMilestone.category]) {
    bgColor = `${allCategories[hasMilestone.category].color} border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`;
  }

  // Responsive sizing - smaller on mobile, better spacing for quarter layout
  const sizeClass = isMobile ? 'w-2 h-4' : 'w-3 h-6'; 

  return (
    <motion.div
      className={`${sizeClass} cursor-pointer relative select-none ${bgColor} ${
        selectedWeek === weekNum ? 'ring-2 ring-blue-500' : ''
      } ${isBeingDragged ? 'ring-2 ring-yellow-400 transform scale-105' : ''} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1`}
      whileHover={{ 
        scale: selectedColor ? 1.05 : 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: selectedWeek === weekNum || isBeingDragged ? 1.1 : 1 
      }}
      transition={{ 
        opacity: { duration: 0.2 },
        scale: { type: "spring", stiffness: 300, damping: 30 }
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        handleWeekMouseDown(weekNum);
      }}
      onMouseEnter={() => handleWeekMouseEnter(weekNum)}
      onClick={() => {
        if (!isDragging) {
          handleWeekClick(weekNum);
        }
      }}
      title={`Week ${weekNum} - Age ${getYearFromWeek(weekNum)} years, ${getQuarterFromWeek(weekNum)}${hasMilestone ? ` | Mood: ${allCategories[hasMilestone.category]?.label || 'Unknown'}` : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Week ${weekNum}, Age ${getYearFromWeek(weekNum)} years, ${getQuarterFromWeek(weekNum)}. ${hasMilestone ? `Mood: ${allCategories[hasMilestone.category]?.label || 'Unknown'} - ${hasMilestone.title}` : 'No mood set'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isDragging) {
            handleWeekClick(weekNum);
          }
        }
      }}
    >
      {content}
    </motion.div>
  );
};

export default memo(WeekBox);