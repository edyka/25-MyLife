import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { getTheme } from '../utils/themeConfig';

const LoadingOverlay = ({ message = 'Loading...', showSpinner = true }) => {
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const theme = getTheme(themePreset);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`rounded-2xl p-8 shadow-2xl ${
          darkMode
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white border border-slate-200'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {showSpinner && (
            <Loader2 className={`w-8 h-8 animate-spin bg-gradient-to-r ${theme.primary} text-transparent bg-clip-text`} />
          )}
          <p className={`text-sm font-medium ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>
            {message}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;

