import { motion } from "framer-motion";

const StatCard = ({ value, label, colorClass }) => (
  <div className={`p-4 rounded-lg text-center bg-white/70 dark:bg-gray-700/30`}>
    <div className={`text-2xl font-bold mb-1 ${colorClass}`}>{value}</div>
    <div className={`text-xs text-gray-600 dark:text-gray-400`}>{label}</div>
  </div>
);

const StatsSection = ({ stats, showStats, darkMode }) => {
  if (!showStats) return null;

  return (
    <div
      className={`rounded-2xl shadow-lg mb-8 overflow-hidden transition-all duration-300 ${
        darkMode
          ? "bg-gray-800/90 backdrop-blur-xl border border-gray-700/50"
          : "bg-white/90 backdrop-blur-xl border border-gray-200/50"
      }`}
    >
      <div className="p-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatCard value={stats.currentWeek} label="Weeks Lived" colorClass="text-emerald-600 dark:text-emerald-400" />
          <StatCard value={stats.remainingWeeks} label="Weeks Remaining" colorClass="text-blue-600 dark:text-blue-400" />
          <StatCard value={`${stats.livedPercent}%`} label="Life Lived" colorClass="text-purple-600 dark:text-purple-400" />
          <StatCard value={stats.currentAge} label="Current Age" colorClass="text-orange-600 dark:text-orange-400" />
          <StatCard value={stats.milestoneCount} label="Milestones" colorClass="text-indigo-600 dark:text-indigo-400" />
        </motion.div>
      </div>
    </div>
  );
};

export default StatsSection;