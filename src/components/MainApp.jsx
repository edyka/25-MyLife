import { useEffect, useCallback, memo, useMemo, useRef, useState } from 'react'
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
import UpgradeModal from './UpgradeModal'
import ShareModal from './ShareModal'
import MilestoneModal from './MilestoneModal'
import { usePremiumStore } from '../stores/usePremiumStore'

// Import theme utilities
import { getTheme } from '../utils/themeConfig'

const MainApp = memo(({ isGuestMode = false, onGuestSaveAttempt }) => {
  // Optimized Zustand selectors
  const birthDay = useLifeStore(state => state.birthDay)
  const birthMonth = useLifeStore(state => state.birthMonth)
  const birthYear = useLifeStore(state => state.birthYear)
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy)
  const currentWeek = useLifeStore(state => state.currentWeek)

  const darkMode = useUIStore(state => state.darkMode)
  const currentTab = useUIStore(state => state.currentTab)
  const showWeeks = useUIStore(state => state.showWeeks)
  const isMobile = useUIStore(state => state.isMobile)
  const gridLayout = useUIStore(state => state.gridLayout)
  const pastWeekStyle = useUIStore(state => state.pastWeekStyle)
  const themePreset = useUIStore(state => state.themePreset)
  const setCurrentTab = useUIStore(state => state.setCurrentTab)
  const setShowWeeks = useUIStore(state => state.setShowWeeks)
  const setCurrentPage = useUIStore(state => state.setCurrentPage)
  const setIsMobile = useUIStore(state => state.setIsMobile)
  const setDarkMode = useUIStore(state => state.setDarkMode)
  const setGridLayout = useUIStore(state => state.setGridLayout)
  const setPastWeekStyle = useUIStore(state => state.setPastWeekStyle)
  const setThemePreset = useUIStore(state => state.setThemePreset)

  const milestones = useMilestoneStore(state => state.milestones)
  const customCategories = useMilestoneStore(state => state.customCategories)
  const customMoods = useMilestoneStore(state => state.customMoods)
  const goals = useMilestoneStore(state => state.goals)
  const setMilestones = useMilestoneStore(state => state.setMilestones)
  const addCustomCategory = useMilestoneStore(state => state.addCustomCategory)
  const setGoals = useMilestoneStore(state => state.setGoals)
  const getAllCategories = useMilestoneStore(state => state.getAllCategories)

  const selectedColor = useSelectionStore(state => state.selectedColor)
  const selectedWeeks = useSelectionStore(state => state.selectedWeeks)
  const pinnedWeeksFromStore = useSelectionStore(state => state.pinnedWeeks)
  const setSelectedColor = useSelectionStore(state => state.setSelectedColor)
  const setSelectedWeeks = useSelectionStore(state => state.setSelectedWeeks)

  const incrementStreak = useEngagementStore(state => state.incrementStreak)
  const checkBadges = useEngagementStore(state => state.checkBadges)
  const loadEngagementFromSupabase = useEngagementStore(state => state.loadFromSupabase)

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

  // Use modern touch gestures hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useModernTouchGestures({
    paintWeeks: weekInteractions?.paintWeeks || (() => {}),
    handleWeekMouseDown: handleWeekMouseDown || (() => {}),
    handleWeekMouseEnter: handleWeekMouseEnter || (() => {}),
    handleMouseUp: handleMouseUp || (() => {}),
    handleWeekClick: handleWeekClick || (() => {}),
  })

  // Handle custom mood creation - memoized to prevent unnecessary re-renders
  const handleAddCustomMood = useCallback(
    (moodName, moodData) => {
      addCustomCategory(moodName, moodData)
    },
    [addCustomCategory]
  )

  // Handle milestone button click - opens modal for selected week or current week
  const handleToggleMilestone = useCallback(() => {
    let weekToEdit

    if (selectedWeeks && selectedWeeks.size > 0) {
      // Use first selected week
      weekToEdit = Array.from(selectedWeeks)[0]
    } else {
      // Fall back to current week
      weekToEdit = currentWeek
    }

    if (weekToEdit) {
      handleWeekDoubleClick(weekToEdit)
    }
  }, [selectedWeeks, currentWeek, handleWeekDoubleClick])

  // theme toggle handled elsewhere

  // Memoize stats calculation
  const stats = useMemo(
    () => getStats(birthYear, birthMonth, birthDay, lifeExpectancy, milestones),
    [birthYear, birthMonth, birthDay, lifeExpectancy, milestones]
  )

  return (
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
          >
            <span className="text-xl">🏆</span>
          </button>
        </div>
      </TabNavigation>

      <AchievementPopup badge={newBadge} onClose={() => setNewBadge(null)} />
      <AchievementsPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4 pt-2 sm:pt-4 pb-20 md:pb-4">
        {/* Tabbed Navigation Content */}
        {currentTab === 'home' && (
          <div className="space-y-16">
            <Dashboard stats={stats} darkMode={darkMode} />

            {/* Life Grid Section */}
            <div className={`relative overflow-visible space-y-6 sm:space-y-8`}>
              {/* Modern Mood Palette - Sticky on mobile */}
              <div
                className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-3 sm:p-6 lg:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl interactive-element md:sticky md:top-20 sticky top-0 z-40`}
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
                />
              </div>
              <div
                className={`${
                  darkMode ? 'premium-card-dark' : 'premium-card'
                } p-3 sm:p-6 lg:p-8 mx-auto w-full max-w-5xl sm:max-w-6xl`}
              >
                {/* Weeks/Months Toggle - Mobile only (desktop has it in nav) */}
                <div className="md:hidden flex justify-center mb-4">
                  <div
                    className={`inline-flex items-center gap-1 p-1 rounded-xl ${
                      darkMode ? 'bg-slate-700/50' : 'bg-slate-200/50'
                    }`}
                  >
                    <button
                      onClick={() => setShowWeeks(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        showWeeks
                          ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                          : darkMode
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Weeks
                    </button>
                    <button
                      onClick={() => setShowWeeks(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        !showWeeks
                          ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                          : darkMode
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-600 hover:text-slate-900'
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
                  handleWeekClick={handleWeekClick}
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
                className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-4 sm:p-6 mx-auto w-full max-w-5xl sm:max-w-6xl`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3
                      className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}
                    >
                      Share Your Life Grid
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Create a beautiful poster and share on social media
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                        hasShareFeature
                          ? `bg-gradient-to-r ${theme.primary} text-white hover:opacity-90 hover:scale-105`
                          : darkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                      {!hasShareFeature && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-amber-500 text-white rounded">
                          PRO
                        </span>
                      )}
                    </button>
                    <button
                      disabled
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 opacity-50 cursor-not-allowed ${
                        darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                      }`}
                      title="Coming soon"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Order Poster
                      <span className="ml-1 text-xs px-1.5 py-0.5 bg-slate-500 text-white rounded">
                        SOON
                      </span>
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

      {/* Upgrade Modal for Premium Features */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} userName="My" />

      {/* Milestone Modal */}
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
    </main>
  )
})

MainApp.displayName = 'MainApp'

export default MainApp
