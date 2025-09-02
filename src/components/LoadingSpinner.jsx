import { motion } from "framer-motion";

const LoadingSpinner = ({ darkMode = false, message = "Loading...", size = "normal" }) => {
  // Small inline spinner
  if (size === "sm") {
    return (
      <motion.div
        className={`w-4 h-4 border-2 border-t-transparent rounded-full ${
          darkMode 
            ? "border-slate-400" 
            : "border-slate-600"
        }`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    );
  }
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
    }`}>
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated spinner */}
        <motion.div
          className={`w-8 h-8 border-3 border-t-transparent rounded-full ${
            darkMode 
              ? "border-orange-400" 
              : "border-orange-500"
          }`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Loading message */}
        <motion.p
          className={`text-sm font-medium ${
            darkMode ? "text-slate-300" : "text-slate-700"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
        
        {/* Life weeks concept hint */}
        <motion.div
          className={`text-xs text-center max-w-xs ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>💎 Preparing your life weeks visualization...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;