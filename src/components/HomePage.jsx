import { motion } from "framer-motion";
import { Calendar, Heart, Target, Sparkles, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useState } from "react";
import LoginModal from "./LoginModal";

// Features array moved outside component to prevent recreation on every render
const FEATURES = [
  {
    icon: Calendar,
    title: "Visualize Your Life",
    description: "See your entire life laid out week by week. Each box represents one week of your journey."
  },
  {
    icon: Heart,
    title: "Paint Your Moods",
    description: "Color-code your weeks with emotions and experiences. Track patterns and celebrate moments."
  },
  {
    icon: Target,
    title: "Set Meaningful Goals",
    description: "Define what matters most and track your progress towards living intentionally."
  }
];

const HomePage = ({ darkMode, onLogin }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleLoginClick = () => {
    setIsSignUpMode(false);
    setShowLoginModal(true);
  };

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
    setShowLoginModal(true);
  };

  const handleLoginComplete = async () => {
    setShowLoginModal(false);
    onLogin();
  };

  return (
    <main 
      id="main-content"
      role="main"
      aria-label="Viventiva homepage"
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12"
    >
      {/* Auth Buttons - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-[60] flex gap-3"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLoginClick();
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/80 backdrop-blur-xl text-white hover:bg-slate-700 border border-slate-700"
              : "bg-white/80 backdrop-blur-xl text-slate-900 hover:bg-white border border-slate-200"
          } shadow-lg hover:shadow-xl`}
        >
          <LogIn className="w-4 h-4" />
          Log In
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSignUpClick();
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <UserPlus className="w-4 h-4" />
          Sign Up
        </button>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mb-16"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex mb-8"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-2xl ${theme.shadow} flex items-center justify-center group`}>
            <div className="grid grid-cols-3 gap-1 w-10 h-10">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"></div>
              ))}
            </div>
          </div>
        </motion.div>

        <h1 className={`text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          Viventiva
        </h1>
        <p className={`text-xl md:text-2xl mb-4 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          Live Vividly, Intentionally, Meaningfully
        </p>
        <p className={`text-lg md:text-xl max-w-2xl mx-auto ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Your life is finite. Make every week count. Visualize your journey, celebrate your moments, and live with purpose.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mb-16"
      >
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-8 rounded-2xl backdrop-blur-xl border ${
                darkMode
                  ? "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50"
                  : "bg-white/60 border-slate-200/50 hover:border-slate-300/50"
              } transition-all duration-300 hover:shadow-xl`}
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${theme.iconBg} mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className={`max-w-2xl w-full p-8 md:p-12 rounded-3xl backdrop-blur-xl border shadow-2xl ${
          darkMode
            ? "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/50"
            : "bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 border-blue-300/50"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className={`w-6 h-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
          <h2 className={`text-2xl md:text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
            Ready to Start?
          </h2>
        </div>
        <p className={`text-center mb-8 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          Join thousands visualizing their life journey
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignUpClick}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
          >
            <UserPlus className="w-5 h-5" />
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <div className="relative">
            <div className={`absolute inset-0 flex items-center`}>
              <div className={`w-full border-t ${darkMode ? "border-slate-600" : "border-slate-300"}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-3 ${darkMode ? "bg-gradient-to-r from-transparent via-slate-800 to-transparent text-slate-400" : "bg-gradient-to-r from-transparent via-white to-transparent text-slate-600"}`}>
                Already have an account?
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoginClick}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              darkMode
                ? "bg-slate-800/50 text-white hover:bg-slate-700 border border-slate-700"
                : "bg-white/50 text-slate-900 hover:bg-white border border-slate-300"
            } shadow-md hover:shadow-lg`}
          >
            <LogIn className="w-5 h-5" />
            Log In to Existing Account
          </motion.button>
        </div>

        <div className={`mt-8 text-center text-sm ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
          <p className="flex items-center justify-center gap-2">
            <span className="text-green-500">✓</span> Free forever • No credit card required
          </p>
        </div>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className={`mt-16 max-w-3xl text-center italic ${darkMode ? "text-slate-500" : "text-slate-600"}`}
      >
        <p className="text-lg">
          "The trouble is, you think you have time."
        </p>
        <p className="text-sm mt-2">— Buddha</p>
      </motion.div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginComplete}
        initialMode={isSignUpMode ? 'signup' : 'login'}
      />
    </main>
  );
};

export default HomePage;
