import { memo } from "react";
import { motion } from "framer-motion";
import { getQuarterFromWeek, getYearFromWeek } from "../utils/dateUtils";
import { useLifeStore, useMilestoneStore, useSelectionStore, useUIStore } from "../stores";

/**
 * Web3WeekBox - A stunning Web3-inspired week component
 * Features glassmorphism, neon glows, and futuristic aesthetics
 */
const Web3WeekBox = memo(({
  weekNum,
  glowIntensity: _glowIntensity = 0.5,
  isCurrentWeek = false,
  hasMilestone = false,
  web3Colors = { accent: '#8b5cf6', glow: '#a855f7' }
}) => {
  // Get state from stores
  const currentWeek = useLifeStore(state => state.currentWeek);
  const { milestones, allCategories } = useMilestoneStore();
  const {
    selectedWeek,
    selectedColor,
    isDragging,
    draggedWeeks,
    isWeekSelected
  } = useSelectionStore();
  const { isMobile, darkMode, enableAnimations } = useUIStore();

  // Computed state
  const isPast = weekNum < currentWeek;
  const isCurrent = weekNum === currentWeek;
  const weekHasMilestone = milestones && milestones[weekNum];
  const isBeingDragged = draggedWeeks && draggedWeeks.has(weekNum);
  const isWeekSelectedState = isWeekSelected(weekNum);
  const shouldShowHoverEffect = selectedColor || !isMobile;

  // Web3-inspired color logic
  const getWeb3Styling = () => {
    const baseGlow = `0 0 8px ${web3Colors.glow}40, 0 0 16px ${web3Colors.glow}20`;

    if (isCurrent) {
      return {
        bg: 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-600',
        border: 'border-red-400',
        glow: `0 0 12px #ef444440, 0 0 24px #ef444420, 0 0 36px #ef444410`,
        content: (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
          </motion.div>
        )
      };
    }

    if (isPast) {
      if (weekHasMilestone && allCategories[weekHasMilestone.category]) {
        const category = allCategories[weekHasMilestone.category];
        return {
          bg: `${category.color} border-opacity-60`,
          border: `border-${category.borderColor || 'purple'}-400/60`,
          glow: baseGlow,
          content: (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-md" />
            </motion.div>
          )
        };
      } else {
        return {
          bg: darkMode
            ? 'bg-gradient-to-br from-gray-700/80 to-gray-600/60'
            : 'bg-gradient-to-br from-gray-200/80 to-gray-300/60',
          border: 'border-gray-400/40',
          glow: baseGlow,
          content: (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'}`} />
            </div>
          )
        };
      }
    }

    if (weekHasMilestone && allCategories[weekHasMilestone.category]) {
      const category = allCategories[weekHasMilestone.category];
      return {
        bg: `${category.color} border-opacity-40`,
        border: `border-${category.borderColor || 'purple'}-400/40`,
        glow: `0 0 6px ${web3Colors.glow}30`,
        content: null
      };
    }

    // Future weeks - glassmorphism effect
    return {
      bg: darkMode
        ? 'bg-gradient-to-br from-gray-800/30 to-gray-700/20 backdrop-blur-sm'
        : 'bg-gradient-to-br from-white/40 to-gray-100/30 backdrop-blur-sm',
      border: 'border-white/30',
      glow: `0 0 4px ${web3Colors.glow}20`,
      content: null
    };
  };

  const styling = getWeb3Styling();

  // Web3 interaction effects
  const getInteractionEffects = () => {
    if (selectedWeek === weekNum) {
      return {
        ring: 'ring-2 ring-cyan-400 ring-opacity-80',
        glow: `0 0 12px #06b6d440, 0 0 24px #06b6d420`,
        scale: 1.05
      };
    }
    if (isBeingDragged) {
      return {
        ring: 'ring-2 ring-yellow-400 ring-opacity-80',
        glow: `0 0 12px #eab30840, 0 0 24px #eab30820`,
        scale: 1.1
      };
    }
    if (isWeekSelectedState && !isBeingDragged) {
      return {
        ring: 'ring-2 ring-purple-400 ring-opacity-80',
        glow: `0 0 10px #a855f740, 0 0 20px #a855f720`,
        scale: 1.02
      };
    }
    return { ring: '', glow: styling.glow, scale: 1 };
  };

  const interactions = getInteractionEffects();

  // Modern Web3 sizing
  const sizeClass = isMobile ? "w-5 h-5" : "w-7 h-7";

  // Web3 hover animations
  const hoverAnimation = shouldShowHoverEffect ? {
    scale: selectedColor ? 1.08 : 1.06,
    y: -1,
    boxShadow: darkMode
      ? `0 8px 25px rgba(168, 85, 247, 0.4), ${interactions.glow}`
      : `0 8px 25px rgba(168, 85, 247, 0.25), ${interactions.glow}`,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  } : {};

  const tapAnimation = {
    scale: 0.92,
    transition: { type: "spring", stiffness: 600, damping: 20 },
  };

  // Web3 base animations
  const baseAnimation = enableAnimations ? {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 3
    },
    animate: {
      opacity: 1,
      scale: interactions.scale,
      y: selectedWeek === weekNum || isBeingDragged || isWeekSelectedState ? -0.5 : 0,
      boxShadow: interactions.glow,
      transition: {
        opacity: { duration: 0.3, ease: "easeOut" },
        scale: { type: "spring", stiffness: 500, damping: 25 },
        y: { type: "spring", stiffness: 500, damping: 25 },
      },
    },
  } : {};

  const MotionComponent = enableAnimations ? motion.div : "div";
  const motionProps = enableAnimations ? {
    whileHover: hoverAnimation,
    whileTap: tapAnimation,
    ...baseAnimation,
  } : {};

  return (
    <MotionComponent
      className={`${sizeClass} cursor-pointer relative select-none rounded-lg border-2 ${styling.bg} ${styling.border} ${interactions.ring} transition-all duration-300 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-1`}
      onMouseDown={(_e) => {
        _e.preventDefault();
        // Add click handlers here if needed
      }}
      onMouseEnter={() => {
        // Add hover handlers here if needed
      }}
      onClick={(_e) => {
        if (!isDragging) {
          // Add click handlers here if needed
        }
      }}
      title={`Week ${weekNum} - Age ${getYearFromWeek(weekNum)} years, ${getQuarterFromWeek(weekNum)}${
        weekHasMilestone ? ` | ${allCategories[weekHasMilestone.category]?.label || "Event"}` : ""
      }${isWeekSelectedState ? " (Selected)" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Week ${weekNum}, Age ${getYearFromWeek(weekNum)} years, ${getQuarterFromWeek(weekNum)}. ${
        weekHasMilestone ? `Event: ${allCategories[weekHasMilestone.category]?.label || "Event"}` : "No events"
      }${isWeekSelectedState ? ". Currently selected" : ""}`}
      aria-pressed={isWeekSelectedState}
      data-week={weekNum}
      {...motionProps}
    >
      {/* Web3 Content */}
      {styling.content}

      {/* Web3 Selection Indicator */}
      {isWeekSelectedState && !isBeingDragged && enableAnimations && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full border-2 border-white shadow-lg"
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

      {/* Web3 Drag Indicator */}
      {isBeingDragged && enableAnimations && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-lg border-2 border-yellow-400/60 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 800, damping: 25 }}
        />
      )}

      {/* Static indicators for reduced motion */}
      {(!enableAnimations) && isWeekSelectedState && !isBeingDragged && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full border-2 border-white shadow-lg" />
      )}

      {(!enableAnimations) && isBeingDragged && (
        <div className="absolute inset-0 bg-yellow-400/20 rounded-lg border-2 border-yellow-400/60" />
      )}

      {/* Web3 Glow Effect */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: interactions.glow,
        }}
      />

      {/* Milestone Pulse Effect */}
      {hasMilestone && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-yellow-400/40"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Current Week Special Effect */}
      {isCurrentWeek && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </MotionComponent>
  );
});

Web3WeekBox.displayName = "Web3WeekBox";

export default Web3WeekBox;
