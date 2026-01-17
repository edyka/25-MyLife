import { motion } from 'framer-motion'
import { useUIStore } from '../stores/useUIStore'
import { getTheme } from '../utils/themeConfig'

const LoadingSpinner = ({ message = 'Loading...', size = 'normal' }) => {
  // Get current theme state
  const darkMode = useUIStore(state => state.darkMode)
  const themePreset = useUIStore(state => state.themePreset)

  // Get current theme configuration
  const theme = getTheme(themePreset)
  // Small inline spinner
  if (size === 'sm') {
    return (
      <motion.div
        className={`w-4 h-4 border-2 border-t-transparent rounded-full ${theme.loadingSpinner}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    )
  }
  // Use neutral background for full-screen loading to avoid jarring colored flash
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-slate-900' : 'bg-slate-50'
      }`}
    >
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated spinner */}
        <motion.div
          className={`w-8 h-8 border-3 border-t-transparent rounded-full ${theme.loadingSpinner}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Loading message */}
        <motion.p
          className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>

        {/* Concept hint */}
        <motion.div
          className={`text-xs text-center max-w-xs ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>💎 Preparing your vivid journey...</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoadingSpinner
