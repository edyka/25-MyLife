import { memo, useCallback, useMemo, useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { motion, AnimatePresence } from "framer-motion";
import { lifeStages } from "../utils/constants";
import Web3WeekBox from "./Web3WeekBox";
import { useRenderPerformance } from "../utils/performanceMonitor";

/**
 * Web3LifeGrid - A stunning modern Web3-inspired life calendar
 * Features glassmorphism, neon glows, and futuristic aesthetics
 */
const Web3LifeGrid = memo(
  ({
    lifeExpectancy,
    currentWeek,
    milestones,
    selectedWeek,
    selectedColor,
    selectedWeeks,
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
    draggedWeeks,
    isMobile,
    darkMode,
    allCategories,
    selectionMode,
    showWeeks = true,
    rangeStart = null,
    isInRangeMode = false,
    enableVirtualization = false,
    gridLayout = 'standard',
  }) => {
    // Performance monitoring
    useRenderPerformance("Web3LifeGrid");

    const totalYears = parseInt(lifeExpectancy) || 80;
    const COLUMNS = showWeeks ? 52 : 12;

    // Web3-inspired responsive sizing
    const getWeb3Sizing = useCallback(() => {
      const baseSize = isMobile ? 6 : 9;

      switch (gridLayout) {
        case 'compact':
          return {
            weekSize: Math.max(5, baseSize - 2),
            weekGap: isMobile ? 2 : 3,
            rowHeight: isMobile ? 28 : 34,
            containerHeight: Math.min(550, totalYears * (isMobile ? 28 : 34))
          };
        case 'quarterly':
          return {
            weekSize: baseSize + 1,
            weekGap: isMobile ? 3 : 4,
            rowHeight: isMobile ? 36 : 42,
            containerHeight: Math.min(650, totalYears * (isMobile ? 36 : 42))
          };
        default: // standard
          return {
            weekSize: baseSize,
            weekGap: isMobile ? 2 : 3,
            rowHeight: isMobile ? 32 : 38,
            containerHeight: Math.min(600, totalYears * (isMobile ? 32 : 38))
          };
      }
    }, [isMobile, gridLayout, totalYears]);

    const { weekSize, weekGap, rowHeight, containerHeight } = getWeb3Sizing();
    const listRef = useRef(null);

    // Enhanced row data with Web3 visual properties
    const rowData = useMemo(() => {
      return Array.from({ length: totalYears }, (_, yearIndex) => {
        const lifeStage = Object.values(lifeStages).find(stage =>
          yearIndex >= stage.start && yearIndex < stage.end
        );

        // Web3-inspired visual enhancements
        const intensity = Math.sin((yearIndex / totalYears) * Math.PI * 2) * 0.5 + 0.5;

        return {
          yearIndex,
          currentAge: yearIndex,
          lifeStage,
          rowItems: Array.from(
            { length: COLUMNS },
            (_, col) => yearIndex * COLUMNS + col + 1
          ),
          // Web3 visual properties
          isDecadeMarker: yearIndex % 10 === 0,
          isQuinquennialMarker: yearIndex % 5 === 0,
          isQuarterStart: gridLayout === 'quarterly',
          glowIntensity: intensity,
          isMilestoneRow: milestones && Object.keys(milestones).some(week =>
            Math.floor((parseInt(week) - 1) / COLUMNS) === yearIndex
          )
        };
      });
    }, [totalYears, COLUMNS, gridLayout, milestones]);

    // Auto-scroll to current week with smooth animation
    useEffect(() => {
      if (listRef.current && currentWeek) {
        const currentYear = Math.floor((currentWeek - 1) / COLUMNS);
        const scrollOffset = Math.max(0, currentYear * rowHeight - containerHeight / 2);
        listRef.current.scrollTo(scrollOffset);
      }
    }, [currentWeek, COLUMNS, rowHeight, containerHeight]);

    // Enhanced week box props with Web3 aesthetics
    const weekBoxProps = useMemo(() => ({
      currentWeek,
      milestones,
      selectedWeek,
      selectedColor,
      selectedWeeks,
      handleWeekClick,
      handleWeekMouseDown,
      handleWeekMouseEnter,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      isDragging,
      draggedWeeks,
      isMobile,
      darkMode,
      allCategories,
      selectionMode,
      showWeeks,
      rangeStart,
      isInRangeMode,
    }), [
      currentWeek, milestones, selectedWeek, selectedColor, selectedWeeks,
      handleWeekClick, handleWeekMouseDown, handleWeekMouseEnter,
      handleTouchStart, handleTouchMove, handleTouchEnd,
      isDragging, draggedWeeks, isMobile, darkMode, allCategories,
      selectionMode, showWeeks, rangeStart, isInRangeMode
    ]);

    // Web3-inspired Row component
    const Web3Row = useCallback(({ index, style }) => {
      const {
        yearIndex,
        currentAge,
        lifeStage,
        rowItems,
        isDecadeMarker,
        isQuinquennialMarker,
        glowIntensity,
        isMilestoneRow
      } = rowData[index];

      // Modern Web3 color schemes based on life stage and age
      const getWeb3Colors = () => {
        if (lifeStage) {
          return {
            bg: darkMode ? lifeStage.darkColor : lifeStage.color,
            accent: lifeStage.accent || '#8b5cf6',
            glow: lifeStage.glow || '#a855f7'
          };
        }

        // Age-based modern Web3 colors with vibrant gradients
        const ageRatio = yearIndex / totalYears;
        if (ageRatio < 0.2) return {
          bg: 'from-purple-500/15 via-violet-500/10 to-fuchsia-500/15',
          accent: '#a855f7',
          glow: '#c084fc',
          border: 'border-purple-400/30'
        };
        if (ageRatio < 0.4) return {
          bg: 'from-blue-500/15 via-cyan-400/12 to-teal-400/15',
          accent: '#06b6d4',
          glow: '#22d3ee',
          border: 'border-cyan-400/30'
        };
        if (ageRatio < 0.6) return {
          bg: 'from-emerald-500/15 via-green-400/12 to-teal-400/15',
          accent: '#10b981',
          glow: '#34d399',
          border: 'border-emerald-400/30'
        };
        if (ageRatio < 0.8) return {
          bg: 'from-amber-500/15 via-yellow-400/12 to-orange-400/15',
          accent: '#f59e0b',
          glow: '#fbbf24',
          border: 'border-amber-400/30'
        };
        return {
          bg: 'from-rose-500/15 via-pink-400/12 to-purple-400/15',
          accent: '#ec4899',
          glow: '#f472b6',
          border: 'border-rose-400/30'
        };
      };

      const web3Colors = getWeb3Colors();

      return (
        <motion.div
          style={style}
          className={`flex items-center w-full justify-start sm:justify-center relative group transition-all duration-500 ${
            isDecadeMarker ? 'py-2' : 'py-1'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.02 }}
        >
          {/* Web3 Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${web3Colors.bg} rounded-xl blur-sm opacity-20 group-hover:opacity-35 transition-all duration-500`} />

          {/* Neon Border Glow */}
          {isDecadeMarker && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md animate-pulse" />
          )}

          {/* Content Container */}
          <div className={`relative z-10 flex items-center w-full backdrop-blur-sm rounded-xl p-3 border ${web3Colors.border || 'border-white/10'} shadow-lg`}>

            {/* Enhanced Age Labels with Web3 Styling */}
            <div className="flex flex-col items-center mr-3 sm:mr-4">
              <motion.div
                className={`font-bold text-lg sm:text-xl transition-all duration-300 ${
                  isDecadeMarker
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 drop-shadow-lg'
                    : isQuinquennialMarker
                    ? 'text-cyan-400 drop-shadow-md'
                    : darkMode
                    ? 'text-slate-300'
                    : 'text-slate-700'
                } ${isMilestoneRow ? 'animate-pulse' : ''}`}
                whileHover={{ scale: 1.1 }}
                title={lifeStage ? `${lifeStage.label} - Age ${currentAge}` : `Age ${currentAge}`}
              >
                {isQuinquennialMarker ? yearIndex : ""}
              </motion.div>

              {/* Life Stage Indicator */}
              {lifeStage && (
                <motion.div
                  className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {lifeStage.label}
                </motion.div>
              )}
            </div>

            {/* Web3 Week Grid - true CSS grid with 52 columns */}
            <div
              className="flex-1 select-none touch-manipulation"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${showWeeks ? 52 : 12}, ${weekSize}px)`,
                gap: gridLayout === 'quarterly' ? '6px' : '4px',
                alignItems: 'center'
              }}
            >
              {rowItems.map((itemNum, colIndex) => {
                const isQuarterBoundary = gridLayout === 'quarterly' && colIndex % 13 === 0 && colIndex > 0;
                const isCurrentWeek = itemNum === currentWeek;
                const hasMilestone = milestones && milestones[itemNum];

                return (
                  <motion.div
                    key={itemNum}
                    style={{ width: `${weekSize}px`, height: `${weekSize}px`, marginLeft: isQuarterBoundary ? '8px' : '0px' }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Web3WeekBox
                      weekNum={itemNum}
                      {...weekBoxProps}
                      glowIntensity={glowIntensity}
                      isCurrentWeek={isCurrentWeek}
                      hasMilestone={hasMilestone}
                      web3Colors={web3Colors}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Milestone Indicator */}
            {isMilestoneRow && (
              <motion.div
                className="ml-2 w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {/* Decade Separator */}
          {isDecadeMarker && yearIndex > 0 && (
            <motion.div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          )}
        </motion.div>
      );
    }, [rowData, darkMode, isMobile, weekBoxProps, weekSize, gridLayout, totalYears]);

    const isTestEnv = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');

    // Virtualized version for performance
    if (enableVirtualization && !isTestEnv && totalYears > 10) {
      return (
        <div className="w-full relative">
          {/* Web3 Header */}
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
              <h2 className={`text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent ${
                darkMode ? 'drop-shadow-lg' : ''
              }`}>
                Your Life in {showWeeks ? 'Weeks' : 'Months'}
              </h2>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
            </div>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Each square represents a week of your precious life
            </p>
          </motion.div>

          {/* Grid Container with Web3 Effects */}
          <div
            className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/10 via-purple-900/5 to-cyan-900/5 border border-white/20 dark:border-white/10 shadow-2xl"
            data-testid="web3-life-grid"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleTouchEnd}
          >
            <List
              ref={listRef}
              height={containerHeight}
              itemCount={totalYears}
              itemSize={rowHeight}
              overscanCount={5}
              className="web3-grid-scroll"
            >
              {Web3Row}
            </List>

            {/* Web3 Grid Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            </div>
          </div>

          {/* Web3 Legend */}
          <motion.div
            className="mt-6 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg animate-pulse" />
              <span className="text-sm font-medium text-white">Current Week</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg" />
              <span className="text-sm font-medium text-white">Milestones</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/20">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-400" />
              <span className="text-sm font-medium text-white">Past Weeks</span>
            </div>
          </motion.div>
        </div>
      );
    }

    // Fallback non-virtualized version
    return (
      <div className="flex flex-col gap-2 items-center w-full web3-week-grid-container">
        {/* Web3 Header */}
        <motion.div
          className="mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={`text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${
            darkMode ? 'drop-shadow-lg' : ''
          }`}>
            Life Calendar - {gridLayout} View
          </h3>
        </motion.div>

        {/* Grid Container */}
        <div
          className="w-full max-w-6xl rounded-xl overflow-hidden backdrop-blur-lg bg-gradient-to-br from-black/5 to-purple-900/5 border border-white/10 shadow-xl"
          data-testid="web3-life-grid"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchEnd={handleTouchEnd}
        >
          {rowData.map(({ yearIndex, currentAge, lifeStage, rowItems, isDecadeMarker, isQuinquennialMarker, glowIntensity, isMilestoneRow }) => {
            // Use the same modern Web3 color logic as virtualized version
            const ageRatio = yearIndex / totalYears;
            const web3Colors = lifeStage ? {
              bg: darkMode ? lifeStage.darkColor : lifeStage.color,
              accent: lifeStage.accent || '#8b5cf6',
              glow: lifeStage.glow || '#a855f7',
              border: 'border-purple-400/30'
            } : (() => {
              if (ageRatio < 0.2) return {
                bg: 'from-purple-500/15 via-violet-500/10 to-fuchsia-500/15',
                accent: '#a855f7', glow: '#c084fc', border: 'border-purple-400/30'
              };
              if (ageRatio < 0.4) return {
                bg: 'from-blue-500/15 via-cyan-400/12 to-teal-400/15',
                accent: '#06b6d4', glow: '#22d3ee', border: 'border-cyan-400/30'
              };
              if (ageRatio < 0.6) return {
                bg: 'from-emerald-500/15 via-green-400/12 to-teal-400/15',
                accent: '#10b981', glow: '#34d399', border: 'border-emerald-400/30'
              };
              if (ageRatio < 0.8) return {
                bg: 'from-amber-500/15 via-yellow-400/12 to-orange-400/15',
                accent: '#f59e0b', glow: '#fbbf24', border: 'border-amber-400/30'
              };
              return {
                bg: 'from-rose-500/15 via-pink-400/12 to-purple-400/15',
                accent: '#ec4899', glow: '#f472b6', border: 'border-rose-400/30'
              };
            })();

            return (
              <motion.div
                key={yearIndex}
                className={`flex items-center w-full justify-start sm:justify-center relative group transition-all duration-300 ${
                  isDecadeMarker ? 'py-1' : 'py-0.5'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: yearIndex * 0.01 }}
              >
                {/* Web3 Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${web3Colors.bg} rounded-lg opacity-20 group-hover:opacity-35 transition-all duration-500`} />

                {/* Neon Border Glow */}
                {isDecadeMarker && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md animate-pulse" />
                )}

                <div className={`relative z-10 flex items-center w-full backdrop-blur-sm rounded-lg p-2 border ${web3Colors.border || 'border-white/10'} shadow-lg`}>

                  {/* Age Label */}
                  <div className="flex flex-col items-center mr-2 sm:mr-3">
                    <motion.span
                      className={`font-semibold text-sm transition-all duration-300 ${
                        isDecadeMarker
                          ? 'text-purple-400 drop-shadow-sm'
                          : isQuinquennialMarker
                          ? darkMode
                            ? 'text-cyan-300 drop-shadow-sm'
                            : 'text-cyan-700 drop-shadow-sm'
                          : darkMode
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isQuinquennialMarker ? yearIndex : ""}
                    </motion.span>
                  </div>

                  {/* Week Grid */}
                  <div className={`flex flex-1 select-none touch-manipulation overflow-x-auto gap-1 ${gridLayout === 'quarterly' ? 'gap-1.5' : 'gap-1'}`}>
                    {rowItems.map((itemNum, colIndex) => {
                      const isQuarterBoundary = gridLayout === 'quarterly' && colIndex % 13 === 0 && colIndex > 0;
                      const isCurrentWeek = itemNum === currentWeek;
                      const hasMilestone = milestones && milestones[itemNum];

                      return (
                        <motion.div
                          key={itemNum}
                          className={`flex-shrink-0 ${isQuarterBoundary ? 'ml-2' : ''} ${isCurrentWeek ? 'z-20' : ''}`}
                          style={{
                            width: `${weekSize}px`,
                            height: `${weekSize}px`,
                            marginRight: isQuarterBoundary ? '8px' : '0px'
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Web3WeekBox
                            weekNum={itemNum}
                            {...weekBoxProps}
                            glowIntensity={glowIntensity}
                            isCurrentWeek={isCurrentWeek}
                            hasMilestone={hasMilestone}
                            web3Colors={web3Colors}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }
);

Web3LifeGrid.displayName = "Web3LifeGrid";

export default Web3LifeGrid;
