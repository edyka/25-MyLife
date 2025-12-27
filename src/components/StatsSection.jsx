import { motion } from "framer-motion";
import { Clock, TrendingUp, Calendar, Heart, Target, Sparkles } from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";

const StatCard = ({ icon: Icon, value, label, subtitle, gradient, darkMode }) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-all duration-300 hover:scale-105 ${darkMode
        ? "premium-card-dark"
        : "premium-card"
      }`}
    whileHover={{ y: -4 }}
  >
    <div className="flex items-start justify-between mb-2 sm:mb-4">
      <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
      </div>
    </div>
    <div className={`text-2xl sm:text-4xl font-black mb-1 sm:mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      {value}
    </div>
    <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
      {label}
    </div>
    {subtitle && (
      <div className={`text-[10px] sm:text-xs hidden sm:block ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
        {subtitle}
      </div>
    )}
  </motion.div>
);

const StatsSection = ({ stats, darkMode }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  const statCards = [
    {
      icon: Calendar,
      value: stats.currentWeek,
      label: "Weeks Lived",
      subtitle: `${stats.currentAge} years on Earth`,
      gradient: theme.primary
    },
    {
      icon: Clock,
      value: stats.remainingWeeks,
      label: "Weeks Remaining",
      subtitle: "Make them count",
      gradient: theme.secondary
    },
    {
      icon: TrendingUp,
      value: `${stats.livedPercent}%`,
      label: "Life Progress",
      subtitle: `${100 - stats.livedPercent}% to go`,
      gradient: theme.tertiary
    },
    {
      icon: Heart,
      value: stats.milestoneCount,
      label: "Life Moments",
      subtitle: "Memories captured",
      gradient: theme.quaternary
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header - Compact on mobile */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4"
        >
          <Target className={`w-5 h-5 sm:w-8 sm:h-8 ${darkMode ? theme.accentDark : theme.accent}`} />
          <h2 className={`text-xl sm:text-3xl font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
            Your Life Stats
          </h2>
          <Sparkles className={`w-5 h-5 sm:w-8 sm:h-8 ${darkMode ? theme.accentDark : theme.accent}`} />
        </motion.div>
        <p className={`text-xs sm:text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          A snapshot of your life's journey
        </p>
      </div>

      {/* Stats Grid - 2 columns on mobile */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, staggerChildren: 0.1 }}
      >
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <StatCard {...card} darkMode={darkMode} />
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Bar - Compact on mobile */}
      <motion.div
        className={`p-3 sm:p-6 rounded-xl sm:rounded-2xl mt-4 sm:mt-8 ${darkMode ? "premium-card-dark" : "premium-card"
          }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className={`text-sm sm:text-lg font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
            Life Timeline
          </h3>
          <span className={`text-xs sm:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            {stats.currentWeek} of {stats.totalWeeks} weeks
          </span>
        </div>
        <div className={`relative h-2 sm:h-4 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-200"
          }`}>
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme.progress} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${stats.livedPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme.progressGlow} to-transparent opacity-50 rounded-full blur-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${stats.livedPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default StatsSection;