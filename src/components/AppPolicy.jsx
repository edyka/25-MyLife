// This file was renamed from PrivacyPolicy.jsx to AppPolicy.jsx to avoid browser extension blocking issues.
// ...existing PrivacyPolicy.jsx code will be moved here...
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import { getTheme } from "../utils/themeConfig";

const AppPolicy = ({ darkMode, onBack }) => {
  // Get current theme state
  const themePreset = useUIStore(state => state.themePreset);

  // Get current theme configuration
  const theme = getTheme(themePreset);
  const lastUpdated = "January 2025";

  // sections content removed for now; will be added when this component is wired in

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : `bg-gradient-to-br ${theme.onboardingLight.replace('bg-gradient-to-r', '').replace('from-', 'from-').replace(' to-', '-50 to-')}-50 text-gray-900`
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-xl ${
                darkMode ? "bg-purple-500/20" : "bg-purple-100"
              }`}
            >
              <Shield
                className={`w-8 h-8 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                App Privacy Policy
              </h1>
              <div className="text-xs font-medium opacity-70">
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>
        </motion.div>
        {/* ...rest of the component remains unchanged... */}
      </div>
    </div>
  );
};

export default AppPolicy;
