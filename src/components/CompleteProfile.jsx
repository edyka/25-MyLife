import { motion } from "framer-motion";
import { User, Cake, Hourglass, Sparkles } from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useLifeStore } from "../stores/useLifeStore";
import { useState } from "react";
import { auth, database } from "../lib/supabase";

const CompleteProfile = ({ darkMode, onComplete }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  const [name, setName] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("80");
  const [showStats, setShowStats] = useState(false);
  const [calculatedStats, setCalculatedStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();

    // Calculate stats
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    const today = new Date();
    const ageInMs = today - birthDate;
    const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
    const weeksLived = Math.floor(ageInMs / (7 * 24 * 60 * 60 * 1000));
    const totalWeeks = lifeExpectancy * 52;
    const weeksRemaining = totalWeeks - weeksLived;
    const percentageLived = ((weeksLived / totalWeeks) * 100).toFixed(1);

    setCalculatedStats({
      age: ageInYears,
      weeksLived,
      weeksRemaining,
      totalWeeks,
      percentageLived
    });

    // Show stats
    setShowStats(true);
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // Get the authenticated user
      const { user, error: userError } = await auth.getCurrentUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        alert("Authentication error. Please try logging in again.");
        setLoading(false);
        return;
      }

      // Save to Zustand store (local state)
      const store = useLifeStore.getState();
      store.setBirthData(parseInt(birthDay), parseInt(birthMonth), parseInt(birthYear));
      store.setLifeExpectancy(parseInt(lifeExpectancy));
      if (name) {
        store.setUserName(name);
      }

      // Save to Supabase (remote database)
      await database.saveUserProfile(user.id, {
        name: name || 'User',
        birthDay: parseInt(birthDay),
        birthMonth: parseInt(birthMonth),
        birthYear: parseInt(birthYear),
        lifeExpectancy: parseInt(lifeExpectancy)
      });

      // Migrate anonymous painted weeks to Supabase
      const anonymousWeeks = localStorage.getItem('viventiva_anonymous_weeks');
      if (anonymousWeeks) {
        try {
          const parsed = JSON.parse(anonymousWeeks);
          console.log('[Viventiva] Migrating anonymous weeks to Supabase:', Object.keys(parsed).length, 'weeks');

          // Save milestones to Supabase
          await database.saveMilestones(user.id, parsed);

          // Also update Zustand store so MainApp shows them immediately
          const { useMilestoneStore } = await import('../stores/useMilestoneStore');
          const milestoneStore = useMilestoneStore.getState();
          milestoneStore.setMilestones(parsed);

          // Clean up anonymous storage
          localStorage.removeItem('viventiva_anonymous_weeks');
          localStorage.removeItem('viventiva_extended_limit');
          localStorage.removeItem('viventiva_soft_prompt_shown');
          sessionStorage.removeItem('viventiva_modal_dismissed');

          console.log('[Viventiva] Successfully migrated anonymous weeks');
        } catch (e) {
          console.error('[Viventiva] Failed to migrate anonymous weeks:', e);
          // Don't fail the whole signup if migration fails
        }
      }

      // Mark profile as complete
      localStorage.setItem('viventiva_profile_complete', 'true');

      // Track profile completion
      try {
        const { trackUserAction } = await import('../utils/analytics');
        trackUserAction('profile_completed', {
          hasName: !!name,
          lifeExpectancy: parseInt(lifeExpectancy),
        });
      } catch (err) {
        // Analytics not critical, continue silently
      }

      setLoading(false);
      
      // Show success toast
      try {
        const { toast } = await import('../utils/toast');
        toast.success('Profile saved successfully!');
      } catch (err) {
        // Toast not critical, continue silently
      }
      
      onComplete();
    } catch (err) {
      console.error("Error saving user data:", err);
      
      // Show user-friendly error
      try {
        const { toast } = await import('../utils/toast');
        const { getUserFriendlyError } = await import('../utils/errorMessages');
        toast.error(getUserFriendlyError(err));
      } catch {
        alert("Error saving profile. Please try again.");
      }
      
      setLoading(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex mb-6"
        >
          <div className={`w-16 h-16 bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-xl flex items-center justify-center`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <h1 className={`text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          Complete Your Profile
        </h1>
        <p className={`text-lg md:text-xl ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          Let's set up your life visualization
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={`max-w-2xl w-full p-8 md:p-12 rounded-3xl backdrop-blur-xl border shadow-2xl ${
          darkMode
            ? "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/50"
            : "bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 border-blue-300/50"
        }`}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {/* Name */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              <User className="w-4 h-4" />
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                darkMode
                  ? "bg-slate-700/50 text-white border-slate-600"
                  : "bg-white text-slate-900 border-slate-300"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder="Enter your name"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              <Cake className="w-4 h-4" />
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  required
                  className={`w-full px-3 py-3 rounded-xl text-center ${
                    darkMode
                      ? "bg-slate-700/50 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Day"
                />
              </div>
              <div>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  required
                  className={`w-full px-3 py-3 rounded-xl ${
                    darkMode
                      ? "bg-slate-700/50 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Month</option>
                  {monthNames.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  required
                  className={`w-full px-3 py-3 rounded-xl text-center ${
                    darkMode
                      ? "bg-slate-700/50 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Year"
                />
              </div>
            </div>
          </div>

          {/* Life Expectancy */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              <Hourglass className="w-4 h-4" />
              Life Expectancy (years)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                darkMode
                  ? "bg-slate-700/50 text-white border-slate-600"
                  : "bg-white text-slate-900 border-slate-300"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder="80"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-6`}
          >
            Calculate My Life Journey
          </motion.button>
        </form>

        {/* Stats Preview */}
        {showStats && calculatedStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <div className={`text-center py-4 px-6 rounded-xl ${darkMode ? "bg-slate-700/30" : "bg-slate-100/50"}`}>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Hello, {name}! 👋
              </h3>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Here's your life at a glance
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-slate-700/30" : "bg-slate-100/50"}`}>
                <div className={`text-3xl font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent mb-2`}>
                  {calculatedStats.age}
                </div>
                <div className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Years Old
                </div>
              </div>

              <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-slate-700/30" : "bg-slate-100/50"}`}>
                <div className={`text-3xl font-black bg-gradient-to-r ${theme.secondary} bg-clip-text text-transparent mb-2`}>
                  {calculatedStats.weeksLived}
                </div>
                <div className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Weeks Lived
                </div>
              </div>

              <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-slate-700/30" : "bg-slate-100/50"}`}>
                <div className={`text-3xl font-black bg-gradient-to-r ${theme.tertiary} bg-clip-text text-transparent mb-2`}>
                  {calculatedStats.weeksRemaining}
                </div>
                <div className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Weeks Remaining
                </div>
              </div>

              <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-slate-700/30" : "bg-slate-100/50"}`}>
                <div className={`text-3xl font-black bg-gradient-to-r ${theme.quaternary} bg-clip-text text-transparent mb-2`}>
                  {calculatedStats.percentageLived}%
                </div>
                <div className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Life Lived
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Saving..." : "Continue to My Life Grid"}
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`mt-12 max-w-3xl text-center italic ${darkMode ? "text-slate-500" : "text-slate-600"}`}
      >
        <p className="text-lg">
          "The trouble is, you think you have time."
        </p>
        <p className="text-sm mt-2">— Buddha</p>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
