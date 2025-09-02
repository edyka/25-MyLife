import { motion, AnimatePresence } from "framer-motion";

const MobilePaintInfo = ({ 
  selectedColor, 
  selectedWeeks, 
  colorOptions, 
  darkMode 
}) => {
  if (!selectedColor) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`md:hidden rounded-xl shadow-lg p-3 mb-3 backdrop-blur-sm ${
          darkMode
            ? "bg-gray-800/90 border border-gray-700"
            : "bg-white/90 border border-gray-200"
        }`}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              🎨
            </motion.span>
            <span
              className={`text-sm font-bold ${
                darkMode ? "text-blue-300" : "text-blue-800"
              }`}
            >
              {colorOptions[selectedColor].label}
            </span>
          </div>
          {selectedWeeks.size > 0 && (
            <motion.div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-purple-100 text-purple-700"
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.1,
              }}
            >
              {selectedWeeks.size} selected
            </motion.div>
          )}
        </div>
        <h2
          className={`text-lg md:text-2xl font-extrabold tracking-tight ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
          style={{ letterSpacing: "-0.01em" }}
        >
          Viventiva
        </h2>
        <div
          className={`mt-1 text-xs md:text-base font-medium italic ${
            darkMode ? "text-blue-200" : "text-blue-700"
          }`}
        >
          A meaningful way to visualize your life's journey. Each week
          matters, each moment counts. Transform how you see time and make
          every week intentional.
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobilePaintInfo;