import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BarChart3, Settings, Moon, Sun } from "lucide-react";

const FloatingMenuBar = ({
  darkMode,
  toggleTheme,
  showStats,
  setShowStats,
  setCurrentPage,
  stats,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Floating Menu Bar */}
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          darkMode
            ? "bg-gray-900/90 border-gray-700/50 shadow-2xl shadow-black/30"
            : "bg-white/90 border-gray-200/50 shadow-2xl shadow-gray-200/60"
        } backdrop-blur-xl border rounded-2xl`}
      >
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center px-6 py-3 gap-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-6 rounded-full ${
                darkMode
                  ? "bg-gradient-to-b from-purple-400 to-blue-500"
                  : "bg-gradient-to-b from-purple-600 to-blue-600"
              }`}
            ></div>
            <div>
              <h1
                className={`text-lg font-black tracking-tight ${
                  darkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700"
                }`}
              >
                Viventiva
              </h1>
            </div>
          </div>

          {/* Divider */}
          <div
            className={`w-px h-6 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}
          ></div>

          {/* Stats Badge */}
          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              darkMode
                ? "bg-gray-800/50 text-gray-300 border border-gray-700/50"
                : "bg-gray-100/50 text-gray-700 border border-gray-200/50"
            }`}
          >
            Age {stats.currentAge} • {stats.currentWeek}/{stats.totalWeeks}{" "}
            weeks
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                darkMode
                  ? "bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300"
                  : "bg-gray-700/10 hover:bg-gray-700/20 border border-gray-300/50 text-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.button>

            <motion.button
              onClick={() => setShowStats(!showStats)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                showStats
                  ? darkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
                    : "bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-600"
                  : darkMode
                  ? "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400"
                  : "bg-gray-100/50 hover:bg-gray-200/50 border border-gray-200/50 text-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={showStats ? "Hide statistics" : "Show statistics"}
            >
              <BarChart3 className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => setCurrentPage("settings")}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400"
                  : "bg-gray-100/50 hover:bg-gray-200/50 border border-gray-200/50 text-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-6 rounded-full ${
                darkMode
                  ? "bg-gradient-to-b from-purple-400 to-blue-500"
                  : "bg-gradient-to-b from-purple-600 to-blue-600"
              }`}
            ></div>
            <div>
              <h1
                className={`text-lg font-black tracking-tight ${
                  darkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700"
                }`}
              >
                Viventiva
              </h1>
              <div
                className={`text-xs font-medium ${
                  darkMode ? "text-purple-300/80" : "text-purple-600/80"
                }`}
              >
                Age {stats.currentAge} • Week {stats.currentWeek}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode
                  ? "bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30"
                  : "bg-gray-700/90 hover:bg-gray-600/90 border border-gray-600/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-yellow-300" />
              ) : (
                <Moon className="w-4 h-4 text-white" />
              )}
            </motion.button>

            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode
                  ? "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
                  : "bg-blue-600/90 hover:bg-blue-500/90 border border-blue-500/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMobileMenu ? (
                <X
                  className={`w-4 h-4 ${
                    darkMode ? "text-blue-300" : "text-white"
                  }`}
                />
              ) : (
                <Menu
                  className={`w-4 h-4 ${
                    darkMode ? "text-blue-300" : "text-white"
                  }`}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`w-80 h-full p-4 overflow-y-auto pt-24 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Menu
                </h2>
              </div>

              {/* Mobile Stats */}
              <div className="mb-6">
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Life Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Weeks Lived:
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.currentWeek}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Weeks Remaining:
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.remainingWeeks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Life Lived:
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.livedPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Milestones:
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.milestoneCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-3">
                <motion.button
                  onClick={() => {
                    setShowStats(!showStats);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="w-4 h-4" />
                  {showStats ? "Hide Statistics" : "Show Statistics"}
                </motion.button>

                <motion.button
                  onClick={() => {
                    setCurrentPage("settings");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to push content below floating menu */}
      <div className="h-20"></div>
    </>
  );
};

export default FloatingMenuBar;
