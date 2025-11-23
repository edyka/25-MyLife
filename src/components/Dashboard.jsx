import { motion } from "framer-motion";
import { Cake, Edit2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useLifeStore } from "../stores/useLifeStore";
import { usePremiumStore } from "../stores/usePremiumStore";
import StatsSection from "./StatsSection";
import PremiumBadge from "./PremiumBadge";
import UpgradeModal from "./UpgradeModal";

const Dashboard = ({ stats, darkMode }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);
  const hasAdvancedStats = usePremiumStore((state) => state.hasFeature('advancedStats'));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
  const [editName, setEditName] = useState(userName || '');
  const [editDay, setEditDay] = useState(birthDay || 1);
  const [editMonth, setEditMonth] = useState(birthMonth || 1);
  const [editYear, setEditYear] = useState(birthYear || 2000);
  const [editExpectancy, setEditExpectancy] = useState(lifeExpectancy || 80);

  // Sync editName with userName when it loads
  useEffect(() => {
    setEditName(userName || '');
  }, [userName]);

  const handleSave = async () => {
    const day = editDay || 1;
    const month = editMonth || 1;
    const year = editYear || 2000;
    const expectancy = editExpectancy || 80;
    const name = editName || '';

    // Use store directly to ensure methods are available
    const store = useLifeStore.getState();

    if (store.setBirthData && store.setLifeExpectancy && store.setUserName) {
      store.setBirthData(day, month, year);
      store.setLifeExpectancy(expectancy);
      store.setUserName(name);
      setIsEditing(false);

      // Sync to Supabase if authenticated
      try {
        const { auth, database } = await import('../lib/supabase');
        const { user } = await auth.getCurrentUser();
        if (user) {
          await database.saveUserProfile(user.id, {
            name: name,
            birthDay: day,
            birthMonth: month,
            birthYear: year,
            lifeExpectancy: expectancy
          });
          console.log('Profile saved to Supabase');
        }
      } catch (error) {
        console.error('Error syncing profile to Supabase:', error);
      }
    } else {
      console.error('Store methods not available:', store);
    }
  };

  const handleCancel = () => {
    setEditName(userName);
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
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
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
        className={`rounded-2xl p-6 md:p-8 ${darkMode ? "premium-card-dark" : "premium-card"
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
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-all"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
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

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mt-16"
      >
        <StatsSection stats={stats} darkMode={darkMode} />

        {/* Premium Overlay for Free Users */}
        {!hasAdvancedStats && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-2xl flex items-center justify-center">
            <div className={`text-center p-8 rounded-2xl ${darkMode ? "bg-slate-900/90" : "bg-white/90"} shadow-2xl max-w-md`}>
              <div className="mb-4">
                <PremiumBadge size="lg" onClick={() => setShowUpgradeModal(true)} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Advanced Analytics
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Unlock detailed insights, charts, and trend analysis to understand your life's patterns.
              </p>
              <motion.button
                onClick={() => setShowUpgradeModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-bold bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all`}
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
