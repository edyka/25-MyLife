import { motion } from "framer-motion";
import { Trophy, Lock, X } from "lucide-react";
import { useEngagementStore } from "../stores/useEngagementStore";
import { useUIStore } from "../stores/useUIStore";
import { getTheme } from "../utils/themeConfig";

const BADGES = {
    first_paint: {
        id: "first_paint",
        title: "First Steps",
        description: "Paint your first week on the grid.",
        icon: "🎨"
    },
    time_traveler: {
        id: "time_traveler",
        title: "Time Traveler",
        description: "Fill in 10 weeks from the past.",
        icon: "⏳"
    },
    goal_setter: {
        id: "goal_setter",
        title: "Goal Setter",
        description: "Set your first life goal.",
        icon: "🎯"
    },
    streak_master: {
        id: "streak_master",
        title: "Consistency is Key",
        description: "Reach a 4-week streak.",
        icon: "🔥"
    },
    rainbow_life: {
        id: "rainbow_life",
        title: "Rainbow Life",
        description: "Use 5 different colors on your grid.",
        icon: "🌈"
    }
};

const AchievementsPanel = ({ isOpen, onClose }) => {
    const unlockedBadges = useEngagementStore((state) => state.unlockedBadges);
    const darkMode = useUIStore((state) => state.darkMode);
    const themePreset = useUIStore((state) => state.themePreset);
    const theme = getTheme(themePreset);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl border ${darkMode
                        ? "bg-slate-900 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
            >
                {/* Header */}
                <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? "border-slate-800 bg-slate-900/95" : "border-slate-100 bg-white/95"} backdrop-blur-md flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.iconBg}`}>
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                                Achievements
                            </h2>
                            <p className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                {unlockedBadges.length} / {Object.keys(BADGES).length} Unlocked
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full hover:bg-black/5 transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="p-6 space-y-4">
                    {Object.values(BADGES).map((badge) => {
                        const isUnlocked = unlockedBadges.includes(badge.id);

                        return (
                            <motion.div
                                key={badge.id}
                                initial={false}
                                animate={{ opacity: isUnlocked ? 1 : 0.6 }}
                                className={`relative p-4 rounded-2xl border transition-all ${isUnlocked
                                        ? darkMode
                                            ? "bg-slate-800/50 border-slate-700"
                                            : "bg-slate-50 border-slate-200"
                                        : darkMode
                                            ? "bg-slate-900 border-slate-800 border-dashed"
                                            : "bg-white border-slate-200 border-dashed"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isUnlocked
                                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                                            : darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400"
                                        }`}>
                                        {isUnlocked ? badge.icon : <Lock className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={`font-bold mb-1 ${isUnlocked
                                                ? darkMode ? "text-white" : "text-slate-900"
                                                : darkMode ? "text-slate-500" : "text-slate-400"
                                            }`}>
                                            {badge.title}
                                        </h3>
                                        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                            {badge.description}
                                        </p>
                                    </div>
                                </div>

                                {isUnlocked && (
                                    <div className="absolute top-4 right-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default AchievementsPanel;
