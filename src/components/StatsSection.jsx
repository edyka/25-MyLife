import { motion } from 'framer-motion'
import { getTheme } from '../utils/themeConfig'
import { useUIStore } from '../stores/useUIStore'

const StatsSection = ({ stats, darkMode }) => {
  const themePreset = useUIStore(state => state.themePreset)
  const theme = getTheme(themePreset)

  const items = [
    {
      value: stats.currentWeek.toLocaleString(),
      label: 'Weeks Lived',
      sub: `${stats.currentAge}y`,
    },
    { value: stats.remainingWeeks.toLocaleString(), label: 'Remaining', sub: 'left' },
    { value: `${stats.livedPercent}%`, label: 'Progress', sub: `of 100%` },
    { value: stats.milestoneCount.toLocaleString(), label: 'Moments', sub: 'captured' },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Row - Single unified container */}
      <motion.div
        className={`rounded-2xl overflow-hidden ${
          darkMode
            ? 'bg-white/[0.04] border border-white/[0.06]'
            : 'bg-black/[0.02] border border-black/[0.04]'
        }`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.label}
              className={`relative p-4 sm:p-6 ${
                i < items.length - 1
                  ? darkMode
                    ? 'border-b lg:border-b-0 lg:border-r border-white/[0.06]'
                    : 'border-b lg:border-b-0 lg:border-r border-black/[0.06]'
                  : ''
              } ${
                i === 1
                  ? darkMode
                    ? 'border-r border-white/[0.06] lg:border-r'
                    : 'border-r border-black/[0.06] lg:border-r'
                  : ''
              }`}
            >
              <div
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight tabular-nums ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {item.value}
              </div>
              <div
                className={`text-xs sm:text-sm font-medium mt-1 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {item.label}
                <span className={`ml-1.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Life Timeline - Minimal */}
      <motion.div
        className={`rounded-2xl p-4 sm:p-5 ${
          darkMode
            ? 'bg-white/[0.04] border border-white/[0.06]'
            : 'bg-black/[0.02] border border-black/[0.04]'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Life Timeline
          </span>
          <span
            className={`text-xs font-medium tabular-nums ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
          >
            {stats.livedPercent}%
          </span>
        </div>
        <div
          className={`relative h-1.5 sm:h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.06]'
          }`}
        >
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme.progress} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${stats.livedPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <div
          className={`flex justify-between mt-2 text-[10px] sm:text-xs ${
            darkMode ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          <span>Born</span>
          <span className="tabular-nums">
            {stats.currentWeek.toLocaleString()} / {stats.totalWeeks.toLocaleString()} weeks
          </span>
          <span>{stats.totalWeeks / 52}y</span>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsSection
