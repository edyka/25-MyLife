import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useEffect } from "react";
import { useUIStore } from "../stores/useUIStore";

const AchievementPopup = ({ badge, onClose }) => {
    const darkMode = useUIStore((state) => state.darkMode);

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!badge) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl shadow-2xl border ${darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } flex items-start gap-4`}
        >
            <div className={`p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg`}>
                <Trophy className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Achievement Unlocked!
                </h4>
                <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {badge.title}
                </h3>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {badge.description}
                </p>
            </div>

            <button
                onClick={onClose}
                className={`p-1 rounded-full hover:bg-black/5 transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
            >
                <X className="w-4 h-4" />
            </button>

            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
            </div>
        </motion.div>
    );
};

export default AchievementPopup;
