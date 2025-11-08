import { motion } from 'framer-motion';
import { useUIStore } from '../stores/useUIStore';
import { getTheme } from '../utils/themeConfig';
import { Loader2 } from 'lucide-react';

const LoadingProgress = ({ stage = 'auth', message }) => {
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const theme = getTheme(themePreset);

  const stages = {
    auth: { 
      message: message || 'Checking authentication...', 
      progress: 25,
      hint: 'Verifying your session'
    },
    profile: { 
      message: message || 'Loading your profile...', 
      progress: 50,
      hint: 'Fetching your data'
    },
    data: { 
      message: message || 'Loading your life grid...', 
      progress: 75,
      hint: 'Preparing your journey'
    },
    ready: { 
      message: message || 'Almost ready...', 
      progress: 95,
      hint: 'Final touches'
    },
  };

  const current = stages[stage] || stages.auth;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : `bg-gradient-to-br ${theme.onboardingLight.replace('bg-gradient-to-r', '').trim()}`
    }`}>
      <motion.div
        className="flex flex-col items-center space-y-6 max-w-md w-full px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Spinner */}
        <Loader2 className={`w-12 h-12 animate-spin bg-gradient-to-r ${theme.primary} text-transparent bg-clip-text`} />

        {/* Progress Bar */}
        <div className="w-full">
          <div className={`h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}>
            <motion.div
              className={`h-full bg-gradient-to-r ${theme.primary} transition-all duration-500`}
              initial={{ width: 0 }}
              animate={{ width: `${current.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Message */}
        <motion.p
          className={`text-base font-medium text-center ${
            darkMode ? "text-slate-200" : "text-slate-700"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {current.message}
        </motion.p>

        {/* Hint */}
        <motion.div
          className={`text-xs text-center ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>💎 {current.hint}...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingProgress;

