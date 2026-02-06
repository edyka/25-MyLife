import { motion, AnimatePresence } from 'framer-motion'
import { User, Cake, Hourglass, Sparkles, ArrowRight, Check } from 'lucide-react'
import { getTheme } from '../utils/themeConfig'
import { useUIStore } from '../stores/useUIStore'
import { useLifeStore } from '../stores/useLifeStore'
import { useState, memo } from 'react'
import { auth, database } from '../lib/supabase'

// Static data - defined outside component to avoid recreation on every render
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const AGE_PRESETS = [70, 80, 90, 100]

const OnboardingWizard = memo(({ darkMode, onComplete }) => {
  const themePreset = useUIStore(state => state.themePreset)
  const theme = getTheme(themePreset)

  const [step, setStep] = useState(1)
  const [name, setName] = useState(useLifeStore(state => state.userName) || '')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [lifeExpectancy, setLifeExpectancy] = useState('80')
  const [loading, setLoading] = useState(false)
  const [showDayPicker, setShowDayPicker] = useState(false)
  const [calculatedStats, setCalculatedStats] = useState(null)
  const [birthDateError, setBirthDateError] = useState('')

  const totalSteps = 4

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const calculateStats = () => {
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
    const today = new Date()
    const ageInMs = today - birthDate
    const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000))
    const weeksLived = Math.floor(ageInMs / (7 * 24 * 60 * 60 * 1000))
    const totalWeeks = lifeExpectancy * 52
    const weeksRemaining = totalWeeks - weeksLived
    const percentageLived = ((weeksLived / totalWeeks) * 100).toFixed(1)

    return {
      age: ageInYears,
      weeksLived,
      weeksRemaining,
      totalWeeks,
      percentageLived,
    }
  }

  // Validate birth date
  const validateBirthDate = () => {
    const day = parseInt(birthDay)
    const month = parseInt(birthMonth)
    const year = parseInt(birthYear)
    const currentYear = new Date().getFullYear()

    // Check if values are numbers
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return 'Please enter valid numbers for your birth date'
    }

    // Check year range (reasonable: 1900 to current year)
    if (year < 1900 || year > currentYear) {
      return `Year must be between 1900 and ${currentYear}`
    }

    // Check month range
    if (month < 1 || month > 12) {
      return 'Month must be between 1 and 12'
    }

    // Check days in month (accounting for leap years)
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      return `Day must be between 1 and ${daysInMonth} for ${monthNames[month - 1]}`
    }

    // Check if date is in the future
    const birthDate = new Date(year, month - 1, day)
    const today = new Date()
    if (birthDate > today) {
      return 'Birth date cannot be in the future'
    }

    // Check minimum age (at least 5 years old)
    const ageInYears = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
    if (ageInYears < 5) {
      return 'You must be at least 5 years old to use this app'
    }

    // Check maximum age (reasonable: 120 years)
    if (ageInYears > 120) {
      return 'Please enter a valid birth year'
    }

    return '' // No error
  }

  const handleFinish = async () => {
    try {
      setLoading(true)

      // Get the authenticated user
      const { user, error: userError } = await auth.getCurrentUser()

      if (userError || !user) {
        console.error('Error getting user:', userError)
        alert('Authentication error. Please try logging in again.')
        setLoading(false)
        return
      }

      // Save to Zustand store (local state)
      const store = useLifeStore.getState()
      store.setBirthData(parseInt(birthDay), parseInt(birthMonth), parseInt(birthYear))
      store.setLifeExpectancy(parseInt(lifeExpectancy))
      if (name) {
        store.setUserName(name)
      }

      // Save to Supabase (remote database)
      const { error: saveProfileError } = await database.saveUserProfile(user.id, {
        name: name || 'User',
        birthDay: parseInt(birthDay),
        birthMonth: parseInt(birthMonth),
        birthYear: parseInt(birthYear),
        lifeExpectancy: parseInt(lifeExpectancy),
      })

      // IMPORTANT: don't let onboarding "complete" if the profile didn't actually persist
      if (saveProfileError) {
        throw saveProfileError
      }

      // Migrate anonymous painted weeks to Supabase
      const anonymousWeeks = localStorage.getItem('viventiva_anonymous_weeks')
      if (anonymousWeeks) {
        try {
          const parsed = JSON.parse(anonymousWeeks)
          const { error: saveMilestonesError } = await database.saveMilestones(user.id, parsed)
          if (saveMilestonesError) throw saveMilestonesError

          const { useMilestoneStore } = await import('../stores/useMilestoneStore')
          const milestoneStore = useMilestoneStore.getState()
          milestoneStore.setMilestones(parsed)

          localStorage.removeItem('viventiva_anonymous_weeks')
          localStorage.removeItem('viventiva_extended_limit')
          localStorage.removeItem('viventiva_soft_prompt_shown')
          sessionStorage.removeItem('viventiva_modal_dismissed')
        } catch (e) {
          console.error('[Viventiva] Failed to migrate anonymous weeks:', e)
        }
      }

      // Mark profile as complete
      localStorage.setItem('viventiva_profile_complete', 'true')

      // Track profile completion
      try {
        const { trackUserAction } = await import('../utils/analytics')
        trackUserAction('profile_completed', {
          hasName: !!name,
          lifeExpectancy: parseInt(lifeExpectancy),
        })
      } catch {
        /* Analytics not critical */
      }

      setLoading(false)

      try {
        const { toast } = await import('../utils/toast')
        toast.success('Profile saved successfully!')
      } catch {
        /* Toast not critical */
      }

      onComplete()
    } catch (err) {
      console.error('Error saving user data:', err)
      try {
        const { toast } = await import('../utils/toast')
        const { getUserFriendlyError } = await import('../utils/errorMessages')
        toast.error(getUserFriendlyError(err))
      } catch {
        alert('Error saving profile. Please try again.')
      }
      setLoading(false)
    }
  }

  const monthNames = MONTH_NAMES

  // Determine if current step is valid
  const isStepValid = () => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) {
      // Basic check first
      if (!birthDay || !birthMonth || !birthYear || birthYear.length !== 4) {
        return false
      }
      // Full validation
      const error = validateBirthDate()
      return error === ''
    }
    if (step === 3) return lifeExpectancy > 0 && lifeExpectancy <= 120
    return true
  }

  const handleNext = () => {
    // Validate birth date on step 2 before proceeding
    if (step === 2) {
      const error = validateBirthDate()
      if (error) {
        setBirthDateError(error)
        return
      }
      setBirthDateError('')
    }
    if (step === 3) {
      setCalculatedStats(calculateStats())
    }
    nextStep()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div
        className={`absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none`}
      >
        <div
          className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-20 bg-gradient-to-br ${theme.primary}`}
        />
        <div
          className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${theme.secondary}`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-xl w-full p-8 md:p-12 rounded-3xl backdrop-blur-xl border shadow-2xl ${
          darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
        }`}
      >
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${theme.primary}`}
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-lg flex items-center justify-center mb-6`}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  Welcome! What's your name?
                </h2>
                <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                  Let's start your journey.
                </p>
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full px-6 py-4 text-lg text-center rounded-xl ${
                  darkMode
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                } border-2 focus:outline-none focus:border-blue-500 transition-all`}
                placeholder="Type your name..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && isStepValid() && handleNext()}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-lg flex items-center justify-center mb-6`}
                >
                  <Cake className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  When did your story begin?
                </h2>
                <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                  We'll visualize your life from this date.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Day Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDayPicker(!showDayPicker)}
                    className={`w-full px-4 py-4 text-lg text-center rounded-xl font-semibold cursor-pointer ${
                      darkMode
                        ? 'bg-slate-800 text-white border-slate-700 hover:border-slate-600'
                        : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
                    } border-2 ${showDayPicker ? 'border-blue-500' : ''}`}
                  >
                    {birthDay || 'Day'}
                  </button>
                  {showDayPicker && (
                    <div
                      className={`absolute bottom-full left-0 mb-2 p-3 rounded-2xl shadow-2xl z-50 w-64 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}
                    >
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 31 }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setBirthDay(String(i + 1))
                              setShowDayPicker(false)
                              setBirthDateError('')
                            }}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              birthDay === String(i + 1)
                                ? 'bg-blue-500 text-white'
                                : darkMode
                                  ? 'text-slate-300 hover:bg-slate-700'
                                  : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Month Select */}
                <select
                  value={birthMonth}
                  onChange={e => {
                    setBirthMonth(e.target.value)
                    setBirthDateError('')
                  }}
                  className={`w-full px-4 py-4 text-lg rounded-xl cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 text-white border-slate-700 hover:border-slate-600'
                      : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
                  } border-2 focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Month</option>
                  {monthNames.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                {/* Year Select */}
                <select
                  value={birthYear}
                  onChange={e => {
                    setBirthYear(e.target.value)
                    setBirthDateError('') // Clear error on change
                  }}
                  className={`w-full px-4 py-4 text-lg rounded-xl cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 text-white border-slate-700 hover:border-slate-600'
                      : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
                  } border-2 focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Year</option>
                  {Array.from({ length: new Date().getFullYear() - 1919 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
              {/* Error Message */}
              {birthDateError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center mt-2 font-medium"
                >
                  {birthDateError}
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-lg flex items-center justify-center mb-6`}
                >
                  <Hourglass className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  What is your target age?
                </h2>
                <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                  This sets the canvas size. You can change it anytime.
                </p>
              </div>
              <div className="max-w-sm mx-auto">
                {/* Age selector with buttons */}
                <div
                  className={`flex items-center justify-center gap-4 p-4 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}
                >
                  <button
                    type="button"
                    onClick={() => setLifeExpectancy(prev => Math.max(50, parseInt(prev) - 5))}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 ${
                      darkMode
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-white text-slate-700 hover:bg-slate-50 shadow-md'
                    }`}
                  >
                    −
                  </button>
                  <div className="text-center min-w-[120px]">
                    <div
                      className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                      {lifeExpectancy}
                    </div>
                    <div
                      className={`text-sm font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      years
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLifeExpectancy(prev => Math.min(120, parseInt(prev) + 5))}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 ${
                      darkMode
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-white text-slate-700 hover:bg-slate-50 shadow-md'
                    }`}
                  >
                    +
                  </button>
                </div>
                {/* Quick select presets */}
                <div className="flex justify-center gap-2 mt-4">
                  {AGE_PRESETS.map(age => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setLifeExpectancy(age.toString())}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        parseInt(lifeExpectancy) === age
                          ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                          : darkMode
                            ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && calculatedStats && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              <div>
                <div
                  className={`w-20 h-20 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-full shadow-xl flex items-center justify-center mb-6 animate-bounce-slow`}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2
                  className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  Your Canvas is Ready
                </h2>
                <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                  Here is your life so far, {name}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div
                    className={`text-2xl font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
                  >
                    {calculatedStats.weeksLived.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    Weeks Lived
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div
                    className={`text-2xl font-black bg-gradient-to-r ${theme.secondary} bg-clip-text text-transparent`}
                  >
                    {calculatedStats.weeksRemaining.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    Weeks Left
                  </div>
                </div>
              </div>

              <div
                className={`p-6 rounded-2xl border ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'}`}
              >
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                    Life Progress
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-slate-900'}>
                    {calculatedStats.percentageLived}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calculatedStats.percentageLived}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full bg-gradient-to-r ${theme.primary}`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex justify-between items-center">
          {step > 1 && (
            <button
              onClick={prevStep}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Back
            </button>
          )}

          <div className="ml-auto">
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  isStepValid()
                    ? `bg-gradient-to-r ${theme.primary} hover:shadow-xl hover:scale-105`
                    : 'bg-slate-400 cursor-not-allowed opacity-50'
                }`}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  loading
                    ? 'bg-slate-500 cursor-wait'
                    : `bg-gradient-to-r ${theme.primary} hover:shadow-xl hover:scale-105`
                }`}
              >
                {loading ? 'Creating...' : 'Start My Journey'} <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
})

OnboardingWizard.displayName = 'OnboardingWizard'

export default OnboardingWizard
