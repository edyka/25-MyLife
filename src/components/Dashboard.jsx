import { motion } from "framer-motion";
import { Cake, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { usePremiumStore } from "../stores/usePremiumStore";
import { useProfileEditor } from "../hooks/useProfileEditor";
import StatsSection from "./StatsSection";
import PremiumBadge from "./PremiumBadge";
import UpgradeModal from "./UpgradeModal";

const Dashboard = ({ stats, darkMode }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);
  const hasAdvancedStats = usePremiumStore((state) => state.hasFeature('advancedStats'));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    lifeExpectancy
  } = useProfileEditor();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 sm:space-y-12 max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
      {/* Welcome Header - Compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-16"
      >
        <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          Welcome{userName ? `, ${userName}` : ' to Your Life'}
        </h1>
        <p className={`text-sm sm:text-lg ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Track your journey, celebrate your moments
        </p>
      </motion.div>

      {/* Birth Information Card - Hidden on mobile, simplified */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`hidden sm:block rounded-2xl p-4 sm:p-6 md:p-8 ${darkMode ? "premium-card-dark" : "premium-card"
          }`}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${theme.primary} shadow-lg`}>
              <Cake className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Life Information
              </h2>
              <p className={`text-xs sm:text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Your life's starting point
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${darkMode
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-all"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={cancelEdit}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${darkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                Name
              </label>
              <div className={`px-4 py-3 rounded-lg ${darkMode ? "bg-slate-700/50" : "bg-slate-100"
                }`}>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"
                  }`}>
                  {userName || 'Not set'}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                Date of Birth
              </label>
              <div className={`px-4 py-3 rounded-lg ${darkMode ? "bg-slate-700/50" : "bg-slate-100"
                }`}>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"
                  }`}>
                  {monthNames[birthMonth - 1]} {birthDay}, {birthYear}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                Life Expectancy
              </label>
              <div className={`px-4 py-3 rounded-lg ${darkMode ? "bg-slate-700/50" : "bg-slate-100"
                }`}>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-900"
                  }`}>
                  {lifeExpectancy} years
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your Name"
                className={`w-full px-4 py-3 rounded-lg ${darkMode
                  ? "bg-slate-700 text-white border-slate-600"
                  : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"
                    }`}>
                    Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editDay}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditDay(val === '' ? '' : parseInt(val));
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"
                    }`}>
                    Month
                  </label>
                  <select
                    value={editMonth}
                    onChange={(e) => setEditMonth(parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"
                    }`}>
                    Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={editYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditYear(val === '' ? '' : parseInt(val));
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                Life Expectancy (years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={editExpectancy}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setEditExpectancy('');
                  } else {
                    setEditExpectancy(parseInt(val) || '');
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg ${darkMode
                  ? "bg-slate-700 text-white border-slate-600"
                  : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Section - Compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mt-8 sm:mt-16"
      >
        <StatsSection stats={stats} darkMode={darkMode} />

        {/* Premium Overlay for Free Users - Compact on mobile */}
        {!hasAdvancedStats && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-2xl flex items-center justify-center">
            <div className={`text-center p-4 sm:p-8 rounded-xl sm:rounded-2xl ${darkMode ? "bg-slate-900/90" : "bg-white/90"} shadow-2xl max-w-sm sm:max-w-md mx-4`}>
              <div className="mb-2 sm:mb-4">
                <PremiumBadge size="md" onClick={() => setShowUpgradeModal(true)} />
              </div>
              <h3 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Advanced Analytics
              </h3>
              <p className={`text-xs sm:text-sm mb-3 sm:mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Unlock detailed insights, charts, and trend analysis to understand your life's patterns.
              </p>
              <motion.button
                onClick={() => setShowUpgradeModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all`}
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
  );
};

export default Dashboard;
