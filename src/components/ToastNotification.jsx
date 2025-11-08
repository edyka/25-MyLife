import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { getTheme } from '../utils/themeConfig';

const ToastNotification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const theme = getTheme(themePreset);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: darkMode ? 'bg-green-900/30 border-green-500/50' : 'bg-green-50 border-green-200',
      text: darkMode ? 'text-green-300' : 'text-green-800',
      icon: 'text-green-500',
    },
    error: {
      bg: darkMode ? 'bg-red-900/30 border-red-500/50' : 'bg-red-50 border-red-200',
      text: darkMode ? 'text-red-300' : 'text-red-800',
      icon: 'text-red-500',
    },
    warning: {
      bg: darkMode ? 'bg-amber-900/30 border-amber-500/50' : 'bg-amber-50 border-amber-200',
      text: darkMode ? 'text-amber-300' : 'text-amber-800',
      icon: 'text-amber-500',
    },
    info: {
      bg: darkMode ? `bg-gradient-to-r ${theme.primary} bg-opacity-10 border-${themePreset}-500/50` : `bg-blue-50 border-blue-200`,
      text: darkMode ? `text-${themePreset}-300` : 'text-blue-800',
      icon: `text-${themePreset}-500`,
    },
  };

  const IconComponent = icons[type] || Info;
  const colorScheme = colors[type] || colors.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 p-4 rounded-xl border-2 shadow-2xl ${colorScheme.bg} ${colorScheme.text}`}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${colorScheme.text} hover:opacity-70`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ToastNotification;

