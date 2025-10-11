import { motion } from "framer-motion";
import { Cake, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useLifeStore } from "../stores/useLifeStore";
import StatsSection from "./StatsSection";

const Dashboard = ({ stats, darkMode }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  // Get birth data from store
  const birthDay = useLifeStore(state => state.birthDay);
  const birthMonth = useLifeStore(state => state.birthMonth);
  const birthYear = useLifeStore(state => state.birthYear);
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy);
  const userName = useLifeStore(state => state.userName);
  const setBirthData = useLifeStore(state => state.setBirthData);
  const setLifeExpectancy = useLifeStore(state => state.setLifeExpectancy);

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editDay, setEditDay] = useState(birthDay || 1);
  const [editMonth, setEditMonth] = useState(birthMonth || 1);
  const [editYear, setEditYear] = useState(birthYear || 2000);
  const [editExpectancy, setEditExpectancy] = useState(lifeExpectancy || 80);

  const handleSave = () => {
    const day = editDay || 1;
    const month = editMonth || 1;
    const year = editYear || 2000;
    const expectancy = editExpectancy || 80;

    // Use store directly to ensure methods are available
    const store = useLifeStore.getState();

    if (store.setBirthData && store.setLifeExpectancy) {
      store.setBirthData(day, month, year);
      store.setLifeExpectancy(expectancy);
      setIsEditing(false);
    } else {
      console.error('Store methods not available:', store);
    }
  };

  const handleCancel = () => {
    setEditDay(birthDay);
    setEditMonth(birthMonth);
    setEditYear(birthYear);
    setEditExpectancy(lifeExpectancy);
    setIsEditing(false);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className={`text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          Welcome to Your Life{userName ? `, ${userName}` : ''}
        </h1>
        <p className={`text-lg ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Track your journey, celebrate your moments, live vividly
        </p>
      </motion.div>

      {/* Birth Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 md:p-8 ${
          darkMode ? "premium-card-dark" : "premium-card"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primary} shadow-lg`}>
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Life Information
              </h2>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Your life's starting point
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode
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
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-all"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  darkMode
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Date of Birth
              </label>
              <div className={`px-4 py-3 rounded-lg ${
                darkMode ? "bg-slate-700/50" : "bg-slate-100"
              }`}>
                <p className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}>
                  {monthNames[birthMonth - 1]} {birthDay}, {birthYear}
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Life Expectancy
              </label>
              <div className={`px-4 py-3 rounded-lg ${
                darkMode ? "bg-slate-700/50" : "bg-slate-100"
              }`}>
                <p className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}>
                  {lifeExpectancy} years
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
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
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? "bg-slate-700 text-white border-slate-600"
                        : "bg-white text-slate-900 border-slate-300"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Month
                  </label>
                  <select
                    value={editMonth}
                    onChange={(e) => setEditMonth(parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
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
                  <label className={`block text-xs mb-1 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
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
                    className={`w-full px-3 py-2 rounded-lg ${
                      darkMode
                        ? "bg-slate-700 text-white border-slate-600"
                        : "bg-white text-slate-900 border-slate-300"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-slate-300" : "text-slate-700"
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
                className={`w-full px-4 py-3 rounded-lg ${
                  darkMode
                    ? "bg-slate-700 text-white border-slate-600"
                    : "bg-white text-slate-900 border-slate-300"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatsSection stats={stats} darkMode={darkMode} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
