import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Menu, X, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { usePinch } from '@use-gesture/react';
import { saveTheme } from '../utils/themeUtils';
import { getColorOptions, getAllCategories } from '../utils/constants';
import { getStats, getTotalWeeks, getQuarterFromWeek, getYearFromWeek } from '../utils/dateUtils';
import WeekBox from './WeekBox';
import MilestonePanel from './MilestonePanel';
import GoalTracker from './GoalTracker';
import PhilosophicalReflection from './PhilosophicalReflection';
import CustomMoodCreator from './CustomMoodCreator';

const MainApp = ({ 
  birthDay, 
  birthMonth, 
  birthYear, 
  lifeExpectancy, 
  milestones, 
  setMilestones, 
  setCurrentPage,
  darkMode,
  setDarkMode,
  customCategories,
  setCustomCategories, // eslint-disable-line no-unused-vars
  goals = [],
  setGoals = () => {}
}) => {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [editingWeek, setEditingWeek] = useState(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', category: 'happy', description: '' });
  const [showStats, setShowStats] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  // const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWeeks, setDraggedWeeks] = useState(new Set());
  const [dragStartWeek, setDragStartWeek] = useState(null);
  
  // Zoom and pan state
  const [{ scale, x, y }, api] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
    config: { tension: 300, friction: 30 }
  }));

  // Get combined categories and color options
  const allCategories = useMemo(() => getAllCategories(customCategories), [customCategories]);
  const colorOptions = useMemo(() => getColorOptions(customCategories), [customCategories]);
  
  // Pre-calculate current week to avoid recalculating for every WeekBox
  const currentWeek = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return 1;
    const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1; // Add 1 to start from week 1
  }, [birthYear, birthMonth, birthDay]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const paintWeek = useCallback((weekNum) => {
    if (!selectedColor) return;
    
    if (selectedColor === 'none') {
      setMilestones(prev => {
        const updated = { ...prev };
        delete updated[weekNum];
        return updated;
      });
    } else {
      const newMilestone = {
        title: `${allCategories[selectedColor].label} week`,
        category: selectedColor,
        description: `Marked as ${allCategories[selectedColor].label.toLowerCase()}`,
        weekNum: weekNum
      };
      setMilestones(prev => ({
        ...prev,
        [weekNum]: newMilestone
      }));
    }
  }, [selectedColor, setMilestones, allCategories]);

  const handleWeekClick = useCallback((weekNum) => {
    if (selectedColor) {
      paintWeek(weekNum);
    } else {
      setSelectedWeek(weekNum);
      setShowMobileMenu(false);
    }
  }, [selectedColor, paintWeek]);

  const handleWeekMouseDown = useCallback((weekNum) => {
    if (selectedColor) {
      setIsDragging(true);
      setDragStartWeek(weekNum);
      setDraggedWeeks(new Set([weekNum]));
      paintWeek(weekNum);
    } else {
      setSelectedWeek(weekNum);
      setShowMobileMenu(false);
    }
  }, [selectedColor, paintWeek]);

  const handleWeekMouseEnter = useCallback((weekNum) => {
    if (isDragging && selectedColor && dragStartWeek !== null) {
      // Calculate all weeks in the rectangle between start and current week
      const startYear = Math.floor((dragStartWeek - 1) / 52);
      const startWeekInYear = (dragStartWeek - 1) % 52;
      const endYear = Math.floor((weekNum - 1) / 52);
      const endWeekInYear = (weekNum - 1) % 52;
      
      const minYear = Math.min(startYear, endYear);
      const maxYear = Math.max(startYear, endYear);
      const minWeekInYear = Math.min(startWeekInYear, endWeekInYear);
      const maxWeekInYear = Math.max(startWeekInYear, endWeekInYear);
      
      const newDraggedWeeks = new Set();
      
      // Paint all weeks in the rectangular selection
      for (let year = minYear; year <= maxYear; year++) {
        for (let weekInYear = minWeekInYear; weekInYear <= maxWeekInYear; weekInYear++) {
          const calculatedWeekNum = year * 52 + weekInYear + 1;
          newDraggedWeeks.add(calculatedWeekNum);
          if (!draggedWeeks.has(calculatedWeekNum)) {
            paintWeek(calculatedWeekNum);
          }
        }
      }
      
      setDraggedWeeks(newDraggedWeeks);
    }
  }, [isDragging, selectedColor, dragStartWeek, draggedWeeks, paintWeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedWeeks(new Set());
    setDragStartWeek(null);
  }, []);

  // Zoom and pan gesture handlers
  const bind = usePinch(({ offset: [d, a], origin, memo = { x, y } }) => {
    const scale = Math.max(0.5, Math.min(3, 1 + d / 1000));
    api.start({ 
      scale,
      x: memo.x + (origin[0] - memo.x) * (scale - 1),
      y: memo.y + (origin[1] - memo.y) * (scale - 1)
    });
    return memo;
  });

  // Reset zoom
  const resetZoom = useCallback(() => {
    api.start({ scale: 1, x: 0, y: 0 });
  }, [api]);

  // Handle custom mood creation
  const handleAddCustomMood = useCallback((moodName, moodData) => {
    setCustomCategories(prev => ({
      ...prev,
      [moodName]: moodData
    }));
  }, [setCustomCategories]);


  // const getVisibleWeeks = () => {
  //   const totalWeeks = getTotalWeeks(lifeExpectancy);
  //   return { start: 0, end: totalWeeks };
  // };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    saveTheme(newTheme ? 'dark' : 'light');
  };

  // Memoize stats calculation
  const stats = useMemo(() => 
    getStats(birthYear, birthMonth, birthDay, lifeExpectancy, milestones),
    [birthYear, birthMonth, birthDay, lifeExpectancy, milestones]
  );

  // const generateYearMarkers = () => {
  //   const totalYears = parseInt(lifeExpectancy) || 80;
  //   const markers = [];
  //   for (let year = 1; year <= totalYears; year++) {
  //     markers.push(
  //       <div key={year} className="text-xs text-gray-500 dark:text-gray-400 w-full text-center border-r border-gray-200 dark:border-gray-600 pr-1">
  //         {year}
  //       </div>
  //     );
  //   }
  //   return markers;
  // };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Mobile Header - Fixed position */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 shadow-sm border-b p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Memento Vivere</h1>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Age: {stats.currentAge} | {getTotalWeeks(lifeExpectancy)} weeks
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Menu className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile spacer for fixed header */}
      <div className="md:hidden h-20"></div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={() => setShowMobileMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className={`w-80 h-full p-4 overflow-y-auto pt-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`} 
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Menu</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
            
            {/* Mobile Color Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Paint Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(colorOptions).map(([key, option]) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedColor === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedColor(selectedColor === key ? null : key);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`w-3 h-3 ${key === 'none' ? 'bg-white border border-gray-400' : option.color}`}>
                        {key === 'none' && <X className="w-2 h-2 text-gray-600" />}
                      </div>
                      <IconComponent className="w-3 h-3" />
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Life Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Weeks Lived:</span>
                  <span className="font-medium">{stats.currentWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weeks Remaining:</span>
                  <span className="font-medium">{stats.remainingWeeks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Life Lived:</span>
                  <span className="font-medium">{stats.livedPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Milestones:</span>
                  <span className="font-medium">{stats.milestoneCount}</span>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => {
                setCurrentPage('settings');
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-2 md:p-4 md:max-w-7xl md:mx-auto">
        {/* Philosophical Reflection */}
        <PhilosophicalReflection 
          darkMode={darkMode} 
          currentWeek={currentWeek} 
        />

        {/* Goal Tracker */}
        <GoalTracker 
          goals={goals} 
          setGoals={setGoals} 
          darkMode={darkMode} 
        />

        {/* Desktop Header */}
        <div className={`hidden md:block rounded-2xl shadow-xl p-6 mb-6 transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800 shadow-gray-900/50' 
            : 'bg-white shadow-xl'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Memento Vivere</h1>
              <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remember to Live - A Tool for Conscious Time</p>
              <span className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Born: {birthDay}/{birthMonth}/{birthYear} | Age: {stats.currentAge}
              </span>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} theme`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light' : 'Dark'}
              </motion.button>
              <motion.button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={showStats ? 'Hide statistics' : 'Show statistics'}
              >
                <BarChart3 className="w-4 h-4" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage('settings')}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
                Settings
              </motion.button>
              <motion.button
                onClick={resetZoom}
                className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Reset zoom"
              >
                🔍 Reset Zoom
              </motion.button>
            </div>
          </div>

          {/* Desktop Paint Tool */}
          <div className={`border-b pb-4 mb-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Paint Tool</h3>
              <div className={`text-sm px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Total: {getTotalWeeks(lifeExpectancy)} weeks ({lifeExpectancy} years)
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(colorOptions).map(([key, option]) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedColor === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedColor(selectedColor === key ? null : key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-100 transform scale-105 shadow-lg' 
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 flex items-center justify-center ${
                          key === 'none' ? 'bg-white border-2 border-gray-400' : option.color
                        }`}>
                        {key === 'none' && <X className="w-3 h-3 text-gray-600" />}
                      </div>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                      {isSelected && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Selected</span>}
                    </button>
                  );
                })}
              </div>
              
              {/* Custom Mood Creator */}
              <div className="mt-3">
                <CustomMoodCreator 
                  darkMode={darkMode} 
                  onAddCustomMood={handleAddCustomMood}
                />
              </div>

              {selectedColor && (
                <div className={`p-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <p className="text-sm font-medium">
                    🎨 <strong>{colorOptions[selectedColor].label}</strong> selected! 
                    {selectedColor === 'none' ? ' Click and drag to remove colors.' : ' Click and drag to paint weeks.'}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    💡 <strong>Tip:</strong> Drag diagonally to paint rectangular areas quickly!
                  </p>
                </div>
              )}
            </div>
          </div>

          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.currentWeek}</div>
                <div className="text-sm text-gray-600">Weeks Lived</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.remainingWeeks}</div>
                <div className="text-sm text-gray-600">Weeks Remaining</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.livedPercent}%</div>
                <div className="text-sm text-gray-600">Life Lived</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.currentAge}</div>
                <div className="text-sm text-gray-600">Current Age</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.milestoneCount}</div>
                <div className="text-sm text-gray-600">Milestones</div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Info */}
        {selectedColor && (
          <div className={`md:hidden rounded-lg shadow p-2 mb-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <span className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                🎨 {colorOptions[selectedColor].label} - Touch & drag to paint
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Life Grid */}
          <div className={`flex-1 rounded-2xl shadow-xl p-2 md:p-6 transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 shadow-gray-900/50' 
              : 'bg-white shadow-xl'
          }`}>
            <div className="mb-4">
              <h2 className={`text-lg md:text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Your Complete Life Timeline ({lifeExpectancy} years)
              </h2>
              <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Each square is one week. {isMobile ? 'Use menu for colors. Touch and drag to paint.' : 'Select a color above, then click and drag to paint weeks.'}
              </p>
            </div>
            
            {/* Quarter headers at the top - only show once */}
            <div className={`mb-4 ${isMobile ? 'ml-6' : 'ml-10'}`}>
              <div className="grid grid-cols-4 gap-2 w-full">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
                  <div key={quarter} className={`text-center border-b-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'} pb-2`}>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {quarter}
                    </span>
                    {!isMobile && (
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Weeks {index * 13 + 1}-{Math.min((index + 1) * 13, 52)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Zoomable Grid Container */}
            <div 
              className={`rounded-lg border ${
                darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`} 
              style={{ 
                height: isMobile ? '70vh' : Math.min(800, Math.max(400, parseInt(lifeExpectancy) * 8 + 100)) + 'px',
                overflow: 'auto',
                touchAction: 'manipulation',
                position: 'relative'
              }}
              {...bind()}
            >
              <animated.div 
                className="p-2 md:p-3 w-full" 
                style={{ 
                  transform: scale.to(s => `scale(${s}) translate(${x.get()}px, ${y.get()}px)`),
                  transformOrigin: 'center center'
                }}
              >
                {/* Render each year as a row - grouped by 5 years */}
                {Array.from({length: parseInt(lifeExpectancy) || 80}, (_, yearIndex) => {
                  return (
                    <React.Fragment key={yearIndex}>
                      {/* Add section break and header every 5 years */}
                      {yearIndex > 0 && yearIndex % 5 === 0 && (
                        <div className="my-4">
                          <div className={`h-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} mb-2`}></div>
                          <div className={`text-center text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Years {yearIndex + 1} - {Math.min(yearIndex + 5, parseInt(lifeExpectancy) || 80)}
                          </div>
                        </div>
                      )}
                      
                      {/* Special header for the first group (0-5 years) */}
                      {yearIndex === 0 && (
                        <div className={`text-center text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Years 1 - 5
                        </div>
                      )}
                      
                      <div className="flex items-center mb-1">
                        {/* Year marker on Y-axis - show all years now since we have sections */}
                        <div className={`text-xs font-medium mr-2 flex-shrink-0 text-center ${isMobile ? 'w-6' : 'w-8'} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {yearIndex + 1}
                        </div>
                      
                        {/* 52 weeks for this year - in 4 quarter columns without labels */}
                        <div 
                          className={`grid grid-cols-4 gap-2 w-full select-none touch-manipulation`}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                        >
                          {/* Create 4 quarters with 13 weeks each */}
                          {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, quarterIndex) => (
                            <div key={quarter} className={`${isMobile ? 'grid grid-cols-13 gap-px' : 'flex flex-wrap gap-px justify-center'} min-h-0`}>
                              {Array.from({length: 13}, (_, weekInQuarter) => {
                                const weekInYear = quarterIndex * 13 + weekInQuarter;
                                if (weekInYear >= 52) return null; // Don't go over 52 weeks
                                const weekNum = yearIndex * 52 + weekInYear + 1; // Start weeks from 1
                                return (
                                  <WeekBox
                                    key={weekNum}
                                    weekNum={weekNum}
                                    currentWeek={currentWeek}
                                    milestones={milestones}
                                    selectedWeek={selectedWeek}
                                    selectedColor={selectedColor}
                                    handleWeekClick={handleWeekClick}
                                    handleWeekMouseDown={handleWeekMouseDown}
                                    handleWeekMouseEnter={handleWeekMouseEnter}
                                    isDragging={isDragging}
                                    draggedWeeks={draggedWeeks}
                                    isMobile={isMobile}
                                    darkMode={darkMode}
                                    allCategories={allCategories}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </animated.div>
            </div>
          </div>

          {/* Milestone Panel */}
          <MilestonePanel
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            milestones={milestones}
            setMilestones={setMilestones}
            editingWeek={editingWeek}
            setEditingWeek={setEditingWeek}
            newMilestone={newMilestone}
            setNewMilestone={setNewMilestone}
            isMobile={isMobile}
            darkMode={darkMode}
            allCategories={allCategories}
          />
        </div>
      </div>
    </div>
  );
};

export default MainApp;