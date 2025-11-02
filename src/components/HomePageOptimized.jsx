import { motion } from "framer-motion";
import { LogIn, UserPlus, Lock, CheckCircle, X } from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useLifeStore } from "../stores/useLifeStore";
import { useMilestoneStore } from "../stores/useMilestoneStore";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import LoginModal from "./LoginModal";
import ModernMoodPalette from "./ModernMoodPalette";
import OptimizedWeekSquare from "./OptimizedWeekSquare";

const FREE_WEEKS_LIMIT = 20;
const SOFT_PROMPT_AT = 12;

/**
 * Optimized YearRow component - memoized to prevent unnecessary re-renders
 */
const YearRow = memo(({
  yearIndex,
  currentWeek,
  milestones,
  selectedMood,
  darkMode,
  theme,
  onWeekClick
}) => {
  const age = yearIndex;
  const isCurrentYear = currentWeek >= yearIndex * 52 && currentWeek < (yearIndex + 1) * 52;

  // Memoize the weeks array for this row
  const weeks = useMemo(() => {
    return Array.from({ length: 52 }, (_, weekInYear) => {
      const weekNumber = yearIndex * 52 + weekInYear;
      return {
        weekNumber,
        weekInYear,
        milestone: milestones[weekNumber],
        isLived: weekNumber < currentWeek,
        isCurrent: weekNumber === currentWeek
      };
    });
  }, [yearIndex, currentWeek, milestones]);

  return (
    <div className="flex items-center gap-3">
      {/* Year Label */}
      <div className="flex-shrink-0 w-12 text-right">
        {yearIndex % 5 === 0 && (
          <span className={`text-sm font-bold ${
            isCurrentYear
              ? `bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`
              : darkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            {age}
          </span>
        )}
      </div>

      {/* 52 weeks in this year */}
      <div className="flex gap-1">
        {weeks.map((week) => (
          <OptimizedWeekSquare
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            milestone={week.milestone}
            isLived={week.isLived}
            isCurrent={week.isCurrent}
            hasSelectedMood={!!selectedMood}
            darkMode={darkMode}
            onClick={() => onWeekClick(week.weekNumber)}
          />
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  return (
    prevProps.yearIndex === nextProps.yearIndex &&
    prevProps.currentWeek === nextProps.currentWeek &&
    prevProps.milestones === nextProps.milestones &&
    prevProps.selectedMood === nextProps.selectedMood &&
    prevProps.darkMode === nextProps.darkMode
  );
});

YearRow.displayName = 'YearRow';

/**
 * Optimized HomePage with performance improvements:
 * 1. Memoized child components (YearRow, OptimizedWeekSquare)
 * 2. useCallback for event handlers
 * 3. Optimized Zustand selectors (subscribe to specific values only)
 * 4. Removed Framer Motion from grid (4160 elements)
 * 5. useMemo for expensive calculations
 * 6. Lazy loading and code splitting ready
 */
const HomePageOptimized = ({ darkMode, onLogin }) => {
  // OPTIMIZED: Use specific selectors instead of entire store
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = useMemo(() => getTheme(themePreset), [themePreset]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // OPTIMIZED: Get life data with specific selectors
  const birthDay = useLifeStore((state) => state.birthDay);
  const birthMonth = useLifeStore((state) => state.birthMonth);
  const birthYear = useLifeStore((state) => state.birthYear);
  const lifeExpectancy = useLifeStore((state) => state.lifeExpectancy);

  // OPTIMIZED: Get milestone data with specific selectors
  const milestones = useMilestoneStore((state) => state.milestones);
  const setMilestones = useMilestoneStore((state) => state.setMilestones);
  const updateMilestone = useMilestoneStore((state) => state.updateMilestone);
  const removeMilestone = useMilestoneStore((state) => state.removeMilestone);

  const setBirthData = useLifeStore((state) => state.setBirthData);
  const setLifeExpectancy = useLifeStore((state) => state.setLifeExpectancy);

  // Initialize anonymous user profile and load saved weeks
  useEffect(() => {
    // Set default birth date for anonymous users (age 25 for demo)
    if (!birthDay || !birthMonth || !birthYear) {
      const currentYear = new Date().getFullYear();
      setBirthData(1, 1, currentYear - 25);
      setLifeExpectancy(80);
    }

    // Load saved painted weeks from localStorage
    const savedWeeks = localStorage.getItem('viventiva_anonymous_weeks');
    if (savedWeeks) {
      try {
        const parsed = JSON.parse(savedWeeks);
        setMilestones(parsed);
      } catch (e) {
        console.error('Failed to load anonymous weeks:', e);
      }
    }
  }, [birthDay, birthMonth, birthYear, setBirthData, setLifeExpectancy, setMilestones]);

  // OPTIMIZED: Memoize painted weeks count
  const paintedWeeksCount = useMemo(() => {
    return Object.keys(milestones).length;
  }, [milestones]);

  // Show soft prompt at 12 weeks
  useEffect(() => {
    if (paintedWeeksCount === SOFT_PROMPT_AT && !showSoftPrompt) {
      setShowSoftPrompt(true);
      setTimeout(() => setShowSoftPrompt(false), 5000);
    }
  }, [paintedWeeksCount, showSoftPrompt]);

  // Show conversion modal at limit
  useEffect(() => {
    if (paintedWeeksCount >= FREE_WEEKS_LIMIT && !showConversionModal) {
      setShowConversionModal(true);
    }
  }, [paintedWeeksCount, showConversionModal]);

  // Save painted weeks to localStorage
  useEffect(() => {
    if (Object.keys(milestones).length > 0) {
      localStorage.setItem('viventiva_anonymous_weeks', JSON.stringify(milestones));
    }
  }, [milestones]);

  // OPTIMIZED: Memoize birth date calculation
  const birthDate = useMemo(() => {
    if (!birthDay || !birthMonth || !birthYear) return null;
    return new Date(birthYear, birthMonth - 1, birthDay);
  }, [birthDay, birthMonth, birthYear]);

  // OPTIMIZED: Memoize weeks lived calculation
  const weeksLived = useMemo(() => {
    if (!birthDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now - birthDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  }, [birthDate]);

  const totalWeeks = lifeExpectancy * 52;
  const currentWeek = weeksLived;

  // OPTIMIZED: useCallback for event handlers to prevent recreation
  const handleLoginClick = useCallback(() => {
    setIsSignUpMode(false);
    setShowLoginModal(true);
  }, []);

  const handleSignUpClick = useCallback(() => {
    setIsSignUpMode(true);
    setShowLoginModal(true);
  }, []);

  const handleLoginComplete = useCallback(async () => {
    setShowLoginModal(false);
    onLogin();
  }, [onLogin]);

  const handleContinueWithoutSaving = useCallback(() => {
    localStorage.setItem('viventiva_extended_limit', (FREE_WEEKS_LIMIT + 3).toString());
    setShowConversionModal(false);
  }, []);

  // OPTIMIZED: Memoize MOODS array (should be outside component or memoized)
  const MOODS = useMemo(() => [
    { key: 'happy', label: 'Happy', bg: 'bg-emerald-500' },
    { key: 'inlove', label: 'In Love', bg: 'bg-pink-500' },
    { key: 'focused', label: 'Focused', bg: 'bg-blue-500' },
    { key: 'sad', label: 'Sad', bg: 'bg-indigo-500' },
    { key: 'peaceful', label: 'Peaceful', bg: 'bg-teal-500' },
    { key: 'energetic', label: 'Energetic', bg: 'bg-amber-500' },
    { key: 'creative', label: 'Creative', bg: 'bg-purple-500' },
    { key: 'grateful', label: 'Grateful', bg: 'bg-orange-500' }
  ], []);

  // OPTIMIZED: useCallback for week click handler
  const handleWeekClick = useCallback((weekNumber) => {
    // Check if at limit and trying to paint a new week
    if (paintedWeeksCount >= FREE_WEEKS_LIMIT && !milestones[weekNumber]) {
      setShowConversionModal(true);
      return;
    }

    if (!selectedMood) {
      return;
    }

    if (selectedMood === 'none') {
      if (milestones[weekNumber]) {
        removeMilestone(weekNumber);
      }
    } else {
      const mood = MOODS.find(m => m.key === selectedMood);
      if (mood) {
        updateMilestone(weekNumber, {
          mood: mood.label,
          bgColor: mood.bg,
          textColor: 'text-white',
          icon: mood.icon
        });
      }
    }
  }, [paintedWeeksCount, selectedMood, milestones, removeMilestone, updateMilestone, MOODS]);

  // OPTIMIZED: Memoize year rows array
  const yearRows = useMemo(() => {
    return Array.from({ length: Math.ceil(totalWeeks / 52) }, (_, index) => index);
  }, [totalWeeks]);

  const isAtLimit = paintedWeeksCount >= FREE_WEEKS_LIMIT;
  const remainingWeeks = Math.max(0, FREE_WEEKS_LIMIT - paintedWeeksCount);

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Top Bar with Auth Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
              <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white/95 rounded-[1px]" />
                ))}
              </div>
            </div>
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                Viventiva
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your life in weeks
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLoginClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
            <button
              onClick={handleSignUpClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r ${theme.primary} text-white hover:shadow-lg transition-all duration-300`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-20 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Compact Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 mt-8"
          >
            <h2 className={`text-4xl md:text-5xl font-black mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Start Painting Your Life
            </h2>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-4 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Each square is one week. Click a mood, then click weeks to color them. See your life take shape.
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className={`px-6 py-3 rounded-xl ${
                darkMode ? "bg-slate-800/60" : "bg-white/60"
              } backdrop-blur-sm border ${
                darkMode ? "border-slate-700" : "border-slate-200"
              } shadow-lg`}>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    isAtLimit ? "text-red-500" : `bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`
                  }`}>
                    {paintedWeeksCount}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">/</span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    {FREE_WEEKS_LIMIT} weeks
                  </span>
                  {!isAtLimit && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      ({remainingWeeks} remaining)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAtLimit ? (
                <span className="text-red-500 font-semibold">Sign up to unlock unlimited weeks!</span>
              ) : paintedWeeksCount >= SOFT_PROMPT_AT ? (
                "Sign up free to save your progress & unlock unlimited weeks"
              ) : (
                "No signup required to try • Paint up to 20 weeks free"
              )}
            </p>
          </motion.div>

          {/* Mood Palette */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <ModernMoodPalette
              selectedColor={selectedMood}
              setSelectedColor={setSelectedMood}
              selectedWeeks={new Set()}
              pinnedWeeks={new Set()}
              isInRangeMode={false}
              rangeStart={null}
              resetRangeSelection={() => {}}
              clearPinnedWeeks={() => {}}
            />
          </motion.div>

          {/* OPTIMIZED: Interactive Grid - No animations on individual squares */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl p-6 ${
              darkMode ? "bg-slate-800/40" : "bg-white/40"
            } backdrop-blur-sm border ${
              darkMode ? "border-slate-700" : "border-slate-200"
            } shadow-xl`}
          >
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Year markers and grid */}
                <div className="space-y-1">
                  {yearRows.map((yearIndex) => (
                    <YearRow
                      key={yearIndex}
                      yearIndex={yearIndex}
                      currentWeek={currentWeek}
                      milestones={milestones}
                      selectedMood={selectedMood}
                      darkMode={darkMode}
                      theme={theme}
                      onWeekClick={handleWeekClick}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Legend */}
            <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                  <span className="text-slate-600 dark:text-slate-400">Lived weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-100 dark:bg-slate-900 rounded-sm" />
                  <span className="text-slate-600 dark:text-slate-400">Future weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm" />
                  <span className="text-slate-600 dark:text-slate-400">Your painted weeks</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Below Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid md:grid-cols-3 gap-6 text-center"
          >
            <div>
              <div className="text-3xl mb-2">💾</div>
              <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">Save & Sync</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sign up to save your progress across all devices
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">Custom Moods</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create unlimited mood colors & track your patterns
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">Add Milestones</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mark important life events on your calendar
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Soft Prompt at 12 weeks */}
      {showSoftPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className={`px-6 py-4 rounded-2xl ${
            darkMode ? "bg-slate-800" : "bg-white"
          } border-2 ${
            darkMode ? "border-slate-600" : "border-slate-300"
          } shadow-2xl max-w-sm`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  You're making progress!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  You've painted {paintedWeeksCount} weeks. Sign up free to save your life story.
                </p>
                <button
                  onClick={handleSignUpClick}
                  className={`w-full px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r ${theme.primary} text-white hover:shadow-lg transition-all`}
                >
                  Save My Progress
                </button>
              </div>
              <button
                onClick={() => setShowSoftPrompt(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Conversion Modal at 20 weeks */}
      {showConversionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`max-w-md w-full rounded-2xl p-8 ${
              darkMode ? "bg-slate-800" : "bg-white"
            } shadow-2xl border-2 ${
              darkMode ? "border-slate-600" : "border-slate-200"
            }`}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                You've painted {paintedWeeksCount} weeks!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Don't lose your life story. Sign up free to unlock unlimited weeks.
              </p>
            </div>

            <div className={`mb-6 p-4 rounded-xl ${
              darkMode ? "bg-slate-900/50" : "bg-slate-50"
            }`}>
              <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
                Sign up to unlock:
              </h3>
              <div className="space-y-2">
                {[
                  `Paint all ${totalWeeks} weeks of your life`,
                  "Custom colors & mood tracking",
                  "Save & sync across devices",
                  "Add milestones & life events",
                  "Share your life grid"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSignUpClick}
                className={`w-full px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r ${theme.primary} text-white hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
              >
                <UserPlus className="w-5 h-5" />
                Sign Up Free
              </button>

              <button
                onClick={handleContinueWithoutSaving}
                className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
              >
                Continue without saving (3 more weeks only)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          darkMode={darkMode}
          isSignUpMode={isSignUpMode}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginComplete}
        />
      )}
    </div>
  );
};

export default HomePageOptimized;
