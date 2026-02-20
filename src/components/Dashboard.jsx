import React, { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Check, X } from 'lucide-react'
import { getTheme } from '../utils/themeConfig'
import { useUIStore } from '../stores/useUIStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useProfileEditor } from '../hooks/useProfileEditor'
import StatsSection from './StatsSection'
import PremiumBadge from './PremiumBadge'
const UpgradeModal = React.lazy(() => import('./UpgradeModal'))

const Dashboard = ({ stats, darkMode }) => {
  const themePreset = useUIStore(state => state.themePreset)
  const theme = getTheme(themePreset)
  const hasAdvancedStats = usePremiumStore(state => state.hasFeature('advancedStats'))
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const {
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    editDay,
    setEditDay,
    editMonth,
    setEditMonth,
    editYear,
    setEditYear,
    editExpectancy,
    setEditExpectancy,
    saveProfile,
    cancelEdit,
    userName,
    birthDay,
    birthMonth,
    birthYear,
    lifeExpectancy,
  } = useProfileEditor()

  const monthNames = [
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

  const inputClasses = `w-full px-3 py-2 rounded-lg ${
    darkMode
      ? 'bg-slate-700 text-white border-slate-600'
      : 'bg-white text-slate-900 border-slate-300'
  } border focus:outline-none focus:ring-2 focus:ring-blue-500`

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-5">
      {/* Compact header with inline life info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl p-4 sm:p-5 ${
          darkMode
            ? 'bg-white/[0.04] border border-white/[0.06]'
            : 'bg-black/[0.02] border border-black/[0.04]'
        }`}
      >
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h1
                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {userName ? `${userName}'s Life` : 'Your Life'}
              </h1>
              <div
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <span>
                  Born {monthNames[birthMonth - 1]} {birthDay}, {birthYear}
                </span>
                <span
                  className={`hidden sm:inline ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}
                >
                  |
                </span>
                <span>{lifeExpectancy} year expectancy</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-black/[0.04]'
              }`}
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
        ) : (
          /* Edit mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Edit Profile
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 hover:bg-green-600 text-white transition-all"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your Name"
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-day"
                  className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Day
                </label>
                <input
                  id="edit-day"
                  type="number"
                  min="1"
                  max="31"
                  value={editDay}
                  onChange={e => setEditDay(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-month"
                  className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Month
                </label>
                <select
                  id="edit-month"
                  value={editMonth}
                  onChange={e => setEditMonth(parseInt(e.target.value))}
                  className={inputClasses}
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="edit-year"
                    className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    Year
                  </label>
                  <input
                    id="edit-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={editYear}
                    onChange={e =>
                      setEditYear(e.target.value === '' ? '' : parseInt(e.target.value))
                    }
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-life-expectancy"
                    className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    Expectancy
                  </label>
                  <input
                    id="edit-life-expectancy"
                    type="number"
                    min="1"
                    max="120"
                    value={editExpectancy}
                    onChange={e => {
                      const val = e.target.value
                      setEditExpectancy(val === '' ? '' : parseInt(val) || '')
                    }}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative"
      >
        <StatsSection stats={stats} darkMode={darkMode} />

        {/* Premium Overlay */}
        {!hasAdvancedStats && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-2xl flex items-center justify-center">
            <div
              className={`text-center p-4 sm:p-6 rounded-2xl ${darkMode ? 'bg-slate-900/90' : 'bg-white/90'} shadow-2xl max-w-sm mx-4`}
            >
              <div className="mb-3">
                <PremiumBadge size="md" onClick={() => setShowUpgradeModal(true)} />
              </div>
              <h3
                className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}
              >
                Advanced Analytics
              </h3>
              <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Unlock detailed insights and trend analysis.
              </p>
              <motion.button
                onClick={() => setShowUpgradeModal(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all`}
              >
                Upgrade to Premium
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Advanced Analytics"
      />
    </div>
  )
}

export default memo(Dashboard)
