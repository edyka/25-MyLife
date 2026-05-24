import { useEffect, useCallback, memo, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { useShallow } from 'zustand/shallow'
import { getStats } from '../utils/dateUtils'
import TabNavigation from './TabNavigation'
import Footer from './Footer'
import OnboardingTour from './OnboardingTour'
import ClearLifeGrid from './ClearLifeGrid'
import ModernMoodPalette from './ModernMoodPalette'

// Import optimized components
import GoalTracker from './GoalTracker'
import Dashboard from './Dashboard'
import PricingPage from './PricingPage'
import SettingsTab from './SettingsTab'
import PrivacyPolicyTab from './PrivacyPolicyTab'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useModernTouchGestures } from '../hooks/useModernTouchGestures'
import { useWeekInteractionsZustand } from '../hooks/useWeekInteractionsZustand'
import { useSupabaseSync } from '../hooks/useSupabaseSync'
import { useEngagement } from '../hooks/useEngagement'

// Import optimized Zustand stores
import { useLifeStore } from '../stores/useLifeStore'
import { useUIStore } from '../stores/useUIStore'
import { useMilestoneStore } from '../stores/useMilestoneStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { useEngagementStore } from '../stores/useEngagementStore'
import StreakDisplay from './StreakDisplay'
import AchievementPopup from './AchievementPopup'
import AchievementsPanel from './AchievementsPanel'
import { usePremiumStore } from '../stores/usePremiumStore'

// Lazy load modals for better performance
const UpgradeModal = lazy(() => import('./UpgradeModal'))
const ShareModal = lazy(() => import('./ShareModal'))
const MilestoneModal = lazy(() => import('./MilestoneModal'))

// Import theme utilities
import { getTheme } from '../utils/themeConfig'

const MainApp = memo(({ isGuestMode = false, onGuestSaveAttempt, isLoading = false }) => {
  // Optimized Zustand selectors - grouped with useShallow for reduced subscriptions
  const { birthDay, birthMonth, birthYear, lifeExpectancy, currentWeek } = useLifeStore(
    useShallow(state => ({
      birthDay: state.birthDay,
      birthMonth: state.birthMonth,
      birthYear: state.birthYear,
      lifeExpectancy: state.lifeExpectancy,
      currentWeek: state.currentWeek,
    }))
  )

  const {
    darkMode,
    currentTab,
    showWeeks,
    isMobile,
    gridLayout,
    pastWeekStyle,
    themePreset,
    setCurrentTab,
    setShowWeeks,
    setCurrentPage,
    setIsMobile,
    setDarkMode,
    setGridLayout,
    setPastWeekStyle,
    setThemePreset,
  } = useUIStore(
    useShallow(state => ({
      darkMode: state.darkMode,
      currentTab: state.currentTab,
      showWeeks: state.showWeeks,
      isMobile: state.isMobile,
      gridLayout: state.gridLayout,
      pastWeekStyle: state.pastWeekStyle,
      themePreset: state.themePreset,
      setCurrentTab: state.setCurrentTab,
      setShowWeeks: state.setShowWeeks,
      setCurrentPage: state.setCurrentPage,
      setIsMobile: state.setIsMobile,
      setDarkMode: state.setDarkMode,
      setGridLayout: state.setGridLayout,
      setPastWeekStyle: state.setPastWeekStyle,
      setThemePreset: state.setThemePreset,
    }))
  )

  const {
    milestones,
    customCategories,
    customMoods,
    goals,
    setMilestones,
    addCustomCategory,
    setGoals,
    getAllCategories,
  } = useMilestoneStore(
    useShallow(state => ({
      milestones: state.milestones,
      customCategories: state.customCategories,
      customMoods: state.customMoods,
      goals: state.goals,
      setMilestones: state.setMilestones,
      addCustomCategory: state.addCustomCategory,
      setGoals: state.setGoals,
      getAllCategories: state.getAllCategories,
    }))
  )

  const {
    selectedColor,
    selectedWeeks,
    pinnedWeeksFromStore,
    setSelectedColor,
    setSelectedWeeks,
    isMilestoneMode,
    toggleMilestoneMode,
  } = useSelectionStore(
    useShallow(state => ({
      selectedColor: state.selectedColor,
      selectedWeeks: state.selectedWeeks,
      pinnedWeeksFromStore: state.pinnedWeeks,
      setSelectedColor: state.setSelectedColor,
      setSelectedWeeks: state.setSelectedWeeks,
      isMilestoneMode: state.isMilestoneMode,
      toggleMilestoneMode: state.toggleMilestoneMode,
    }))
  )

  const { incrementStreak, checkBadges, loadEngagementFromSupabase } = useEngagementStore(
    useShallow(state => ({
      incrementStreak: state.incrementStreak,
      checkBadges: state.checkBadges,
      loadEngagementFromSupabase: state.loadFromSupabase,
    }))
  )

  const allCategories = useMemo(() => getAllCategories(), [getAllCategories])
  const theme = useMemo(() => getTheme(themePreset), [themePreset])
  const weekInteractions = useWeekInteractionsZustand() || {}

  // Premium feature: Share/Export
  const hasShareFeature = usePremiumStore(state => state.hasFeature('pngExport'))
  const hasMilestonesFeature = usePremiumStore(state => state.hasFeature('milestones'))
  const [showShareModal, setShowShareModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState('')

  // Milestone modal state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingMilestoneWeek, setEditingMilestoneWeek] = useState(null)

  // Share button handler
  const handleShare = useCallback(() => {
    if (!hasShareFeature) {
      setUpgradeFeature('Share & Export')
      setShowUpgradeModal(true)
      return
    }
    setShowShareModal(true)
  }, [hasShareFeature])

  // Double-click on week to open milestone modal
  const handleWeekDoubleClick = useCallback(
    weekNum => {
      if (!hasMilestonesFeature) {
        setUpgradeFeature('Milestones')
        setShowUpgradeModal(true)
        return
      }
      setEditingMilestoneWeek(weekNum)
      setShowMilestoneModal(true)
    },
    [hasMilestonesFeature]
  )

  // Save milestone from modal
  const handleSaveMilestone = useCallback(
    milestoneData => {
      setMilestones(prev => ({
        ...prev,
        [milestoneData.weekNum]: milestoneData,
      }))
    },
    [setMilestones]
  )

  // Delete milestone from modal
  const handleDeleteMilestone = useCallback(
    weekNum => {
      setMilestones(prev => {
        const newMilestones = { ...prev }
        delete newMilestones[weekNum]
        return newMilestones
      })
    },
    [setMilestones]
  )

  // Custom hooks for sync and engagement
  useSupabaseSync(
    milestones,
    customMoods,
    customCategories,
    selectedWeeks,
    pinnedWeeksFromStore,
    selectedColor,
    goals
  )

  const { newBadge, setNewBadge, showAchievements, setShowAchievements } = useEngagement(
    milestones,
    goals,
    selectedWeeks,
    incrementStreak,
    checkBadges,
    loadEngagementFromSupabase
  )

  // Profile update function
  const handleUpdateProfile = useCallback(async () => {
    try {
      const lifeStore = useLifeStore.getState()
      if (!lifeStore.birthYear || !lifeStore.birthMonth || !lifeStore.birthDay) {
        alert('Please set your birth information first in the Setup page.')
        return
      }
      lifeStore.initialize()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred while refreshing data. Please try again.')
    }
  }, [])

  const {
    isDragging,
    setIsDragging,
    draggedWeeks,
    setDraggedWeeks,
    setDragStartWeek,
    pinnedWeeks,
    handleWeekClick,
    handleWeekMouseDown,
    handleWeekMouseEnter,
    handleMouseUp,
    rangeStart,
    isInRangeMode,
    resetRangeSelection,
    clearPinnedWeeks,
  } = weekInteractions

  // Wrapper for week click that handles milestone mode
  const handleWeekClickWithMilestone = useCallback(
    (weekNum, event) => {
      // Check if milestone mode is active
      const currentMilestoneMode = useSelectionStore.getState().isMilestoneMode

      if (currentMilestoneMode) {
        // In milestone mode, open the milestone modal for this week
        if (!hasMilestonesFeature) {
          setUpgradeFeature('Milestones')
          setShowUpgradeModal(true)
          return
        }
        setEditingMilestoneWeek(weekNum)
        setShowMilestoneModal(true)
        return
      }

      // Check if clicking on a week that already has a milestone - open editor
      const currentMilestones = useMilestoneStore.getState().milestones
      if (currentMilestones[weekNum]?.isMilestone) {
        if (!hasMilestonesFeature) {
          setUpgradeFeature('Milestones')
          setShowUpgradeModal(true)
          return
        }
        setEditingMilestoneWeek(weekNum)
        setShowMilestoneModal(true)
        return
      }

      // Otherwise, use normal week click (painting)
      handleWeekClick(weekNum, event)
    },
    [handleWeekClick, hasMilestonesFeature]
  )

  // currentWeek is now provided by the lifeStore

  // Track if we've already set initial mobile view mode
  const hasSetInitialViewMode = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Auto-switch to months view on mobile (only on first detection)
      if (mobile && !hasSetInitialViewMode.current) {
        setShowWeeks(false) // Switch to months for better mobile UX
        hasSetInitialViewMode.current = true
      }
    }
    checkMobile()

    // Throttle resize events to prevent excessive re-renders
    let resizeTimeout
    const throttledCheckMobile = () => {
      if (resizeTimeout) return
      resizeTimeout = setTimeout(() => {
        checkMobile()
        resizeTimeout = null
      }, 100) // 100ms throttle
    }

    window.addEventListener('resize', throttledCheckMobile, { passive: true })
    return () => {
      window.removeEventListener('resize', throttledCheckMobile)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [setIsMobile, setShowWeeks])

  // Memoize keyboard shortcuts dependencies
  const keyboardShortcutDeps = useMemo(
    () => ({
      selectedColor: selectedColor || null,
      selectedWeeks: selectedWeeks || new Set(),
      setSelectedWeeks: setSelectedWeeks || (() => {}),
      setSelectedColor: setSelectedColor || (() => {}),
      setIsDragging: setIsDragging || (() => {}),
      setDraggedWeeks: setDraggedWeeks || (() => {}),
      setDragStartWeek: setDragStartWeek || (() => {}),
      milestones: milestones || {},
      setMilestones: setMilestones || (() => {}),
    }),
    [
      selectedColor,
      selectedWeeks,
      setSelectedWeeks,
      setSelectedColor,
      setIsDragging,
      setDraggedWeeks,
      setDragStartWeek,
      milestones,
      setMilestones,
    ]
  )

  // Use keyboard shortcuts hook
  useKeyboardShortcuts(keyboardShortcutDeps)

  // Removed unused resetZoom and zoom/pan code

  // Use modern touch gestures hook with milestone-aware click handler
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useModernTouchGestures({
    paintWeeks: weekInteractions?.paintWeeks || (() => {}),
    handleWeekMouseDown: handleWeekMouseDown || (() => {}),
    handleWeekMouseEnter: handleWeekMouseEnter || (() => {}),
    handleMouseUp: handleMouseUp || (() => {}),
    handleWeekClick: handleWeekClickWithMilestone || (() => {}),
  })

  // Handle custom mood creation - memoized to prevent unnecessary re-renders
  const handleAddCustomMood = useCallback(
    (moodName, moodData) => {
      addCustomCategory(moodName, moodData)
    },
    [addCustomCategory]
  )

  // Handle milestone button click - toggles milestone mode
  const handleToggleMilestone = useCallback(() => {
    toggleMilestoneMode()
  }, [toggleMilestoneMode])

  // theme toggle handled elsewhere

  // Memoize stats calculation
  const stats = useMemo(
    () => getStats(birthYear, birthMonth, birthDay, lifeExpectancy, milestones),
    [birthYear, birthMonth, birthDay, lifeExpectancy, milestones]
  )

  return (
    <>
      {/* Subtle loading overlay - shows while data loads in background */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
          >
            <div
              className={`h-full bg-gradient-to-r ${theme.primary} animate-pulse`}
              style={{ width: '60%', animation: 'loading-bar 1.5s ease-in-out infinite' }}
            />
          </div>
          <div
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium ${
              darkMode ? 'bg-slate-800/90 text-slate-300' : 'bg-white/90 text-slate-600'
            } shadow-lg backdrop-blur-sm`}
          >
            Loading your data...
          </div>
        </div>
      )}

      {/* Skip link for accessibility - keyboard users can skip navigation */}
      <a
        href="#life-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to life grid
      </a>

      {/* Aria-live region for screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedColor && selectedColor !== 'none'
          ? `${selectedColor} mood selected. Click or drag on weeks to paint.`
          : selectedColor === 'none'
            ? 'Eraser selected. Click or drag on weeks to clear.'
            : ''}
      </div>

      <main
        id="main-content"
        role="main"
        aria-label="Life grid visualization"
        className={`min-h-screen flex flex-col transition-all duration-500 ${
          darkMode ? 'modern-bg-dark' : 'modern-bg'
        }`}
      >
        <TabNavigation
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          darkMode={darkMode}
          showWeeks={showWeeks}
          setShowWeeks={setShowWeeks}
          setDarkMode={setDarkMode}
        >
          <div className="flex items-center gap-4">
            <StreakDisplay />
            <button
              onClick={() => setShowAchievements(true)}
              className={`p-2 rounded-full hover:bg-black/5 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              title="Achievements"
              aria-label="View achievements"
            >
              <span className="text-xl" aria-hidden="true">
                🏆
              </span>
            </button>
          </div>
        </TabNavigation>

        <AchievementPopup badge={newBadge} onClose={() => setNewBadge(null)} />
        <AchievementsPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4 pt-2 sm:pt-4 pb-20 md:pb-4">
          {/* Tabbed Navigation Content */}
          {currentTab === 'home' && (
            <div className="space-y-4 sm:space-y-6">
              <Dashboard stats={stats} darkMode={darkMode} />

              {/* Life Grid Section */}
              <div id="life-grid" className="relative overflow-visible space-y-3 sm:space-y-4">
                {/* Mood Palette */}
                <div
                  className={`${
                    darkMode
                      ? 'bg-white/[0.04] border border-white/[0.06]'
                      : 'bg-black/[0.02] border border-black/[0.04]'
                  } rounded-2xl p-3 sm:p-5 mx-auto w-full max-w-5xl sm:max-w-6xl sticky top-0 md:top-24 z-40 backdrop-blur-xl`}
                >
                  <ModernMoodPalette
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedWeeks={selectedWeeks}
                    pinnedWeeks={pinnedWeeks}
                    rangeStart={rangeStart}
                    isInRangeMode={isInRangeMode}
                    resetRangeSelection={resetRangeSelection}
                    clearPinnedWeeks={clearPinnedWeeks}
                    onAddCustomMood={handleAddCustomMood}
                    onToggleMilestone={handleToggleMilestone}
                    isMilestoneMode={isMilestoneMode}
                  />
                </div>
                <div
                  className={`${
                    darkMode
                      ? 'bg-white/[0.04] border border-white/[0.06]'
                      : 'bg-black/[0.02] border border-black/[0.04]'
                  } rounded-2xl p-3 sm:p-5 lg:p-6 mx-auto w-full max-w-5xl sm:max-w-6xl`}
                >
                  {/* Weeks/Months Toggle - Mobile only */}
                  <div className="md:hidden flex justify-center mb-3">
                    <div
                      className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg ${
                        darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                      }`}
                    >
                      <button
                        onClick={() => setShowWeeks(true)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          showWeeks
                            ? darkMode
                              ? 'bg-white/[0.1] text-white'
                              : 'bg-white text-slate-900 shadow-sm'
                            : darkMode
                              ? 'text-slate-500 hover:text-slate-300'
                              : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Weeks
                      </button>
                      <button
                        onClick={() => setShowWeeks(false)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          !showWeeks
                            ? darkMode
                              ? 'bg-white/[0.1] text-white'
                              : 'bg-white text-slate-900 shadow-sm'
                            : darkMode
                              ? 'text-slate-500 hover:text-slate-300'
                              : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Months
                      </button>
                    </div>
                  </div>
                  <ClearLifeGrid
                    lifeExpectancy={lifeExpectancy}
                    currentWeek={currentWeek}
                    milestones={milestones}
                    selectedColor={selectedColor}
                    selectedWeeks={selectedWeeks}
                    handleWeekClick={handleWeekClickWithMilestone}
                    handleWeekMouseDown={handleWeekMouseDown}
                    handleWeekMouseEnter={handleWeekMouseEnter}
                    handleMouseUp={handleMouseUp}
                    handleTouchStart={handleTouchStart}
                    handleTouchMove={handleTouchMove}
                    handleTouchEnd={handleTouchEnd}
                    handleDoubleClick={handleWeekDoubleClick}
                    isDragging={isDragging}
                    draggedWeeks={draggedWeeks}
                    isMobile={isMobile}
                    darkMode={darkMode}
                    allCategories={allCategories}
                    showWeeks={showWeeks}
                    rangeStart={rangeStart}
                    isInRangeMode={isInRangeMode}
                    enableVirtualization={true}
                  />
                </div>

                {/* Share Section */}
                <div
                  className={`${
                    darkMode
                      ? 'bg-white/[0.04] border border-white/[0.06]'
                      : 'bg-black/[0.02] border border-black/[0.04]'
                  } rounded-2xl p-3 sm:p-4 mx-auto w-full max-w-5xl sm:max-w-6xl`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      Share your life grid
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleShare}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                          hasShareFeature
                            ? darkMode
                              ? 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
                              : 'bg-black/[0.06] text-slate-700 hover:bg-black/[0.1]'
                            : darkMode
                              ? 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.08]'
                              : 'bg-black/[0.03] text-slate-500 hover:bg-black/[0.06]'
                        }`}
                      >
                        Share
                        {!hasShareFeature && (
                          <span className="text-[10px] px-1 py-0.5 bg-amber-500/80 text-white rounded">
                            PRO
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'goals' && (
            <div className="mt-8">
              <div
                className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-6 sm:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element`}
              >
                <GoalTracker goals={goals} setGoals={setGoals} darkMode={darkMode} />
              </div>
            </div>
          )}

          {currentTab === 'premium' && <PricingPage darkMode={darkMode} />}

          {currentTab === 'settings' && (
            <SettingsTab
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              themePreset={themePreset}
              gridLayout={gridLayout}
              pastWeekStyle={pastWeekStyle}
              currentWeek={currentWeek}
              setGridLayout={setGridLayout}
              setPastWeekStyle={setPastWeekStyle}
              setThemePreset={setThemePreset}
              setCurrentPage={setCurrentPage}
              handleUpdateProfile={handleUpdateProfile}
            />
          )}
          {currentTab === 'policy' && (
            <PrivacyPolicyTab darkMode={darkMode} themePreset={themePreset} theme={theme} />
          )}
        </main>

        {/* Guest Mode - Floating Save Button */}
        {isGuestMode && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={onGuestSaveAttempt}
              className={`group px-8 py-4 bg-gradient-to-r ${theme.primary} text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center gap-3 animate-pulse`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              <span>Save Your Life</span>
              <span className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-bounce">
                Free!
              </span>
            </button>

            {/* Hint */}
            <div
              className={`mt-2 text-xs text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
            >
              <p className="bg-white/90 dark:bg-slate-800/90 px-3 py-1 rounded-lg shadow-lg backdrop-blur-sm">
                💡 You're in demo mode. Save to keep your changes!
              </p>
            </div>
          </div>
        )}

        {/* Removed duplicate bottom grid to avoid duplicate week testids */}
        <Footer darkMode={darkMode} isAuthenticated={true} onNavigate={setCurrentPage} />
        <OnboardingTour />

        {/* Lazy loaded modals with Suspense */}
        <Suspense fallback={null}>
          {showUpgradeModal && (
            <UpgradeModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              feature={upgradeFeature}
            />
          )}

          {showShareModal && (
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              userName="My"
            />
          )}

          {showMilestoneModal && (
            <MilestoneModal
              isOpen={showMilestoneModal}
              onClose={() => {
                setShowMilestoneModal(false)
                setEditingMilestoneWeek(null)
              }}
              weekNum={editingMilestoneWeek}
              milestone={editingMilestoneWeek ? milestones[editingMilestoneWeek] : null}
              onSave={handleSaveMilestone}
              onDelete={handleDeleteMilestone}
              allCategories={allCategories}
            />
          )}
        </Suspense>
      </main>
    </>
  )
})

MainApp.displayName = 'MainApp'

export default MainApp
