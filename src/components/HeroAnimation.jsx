import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";

const HeroAnimation = () => {
    const themePreset = useUIStore((state) => state.themePreset);
    const theme = getTheme(themePreset);
    const darkMode = useUIStore((state) => state.darkMode);

    // Create a grid of 10x10 squares
    const rows = 8;
    const cols = 8;
    const totalSquares = rows * cols;

    return (
        <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Background Glow - Subtle */}
            <div className={`absolute inset-0 blur-3xl opacity-20 bg-gradient-to-br ${theme.primary} rounded-full`} />

            {/* The Grid - Static & Minimalist */}
            <div
                className={`relative z-10 grid grid-cols-8 gap-1.5 p-4 rounded-2xl shadow-xl backdrop-blur-sm border ${darkMode
                    ? "bg-slate-900/50 border-slate-700/50"
                    : "bg-white/50 border-slate-200/50"
                    }`}
            >
                {[...Array(totalSquares)].map((_, i) => {
                    // Determine if this square should be "filled" (simulating past weeks)
                    // We'll fill about 40% of them to look like a "mid-life" state
                    const isFilled = i < totalSquares * 0.4;

                    // Some random "special" squares (milestones)
                    const isMilestone = isFilled && (i === 5 || i === 12 || i === 28);

                    return (
                        <div
                            key={i}
                            className={`aspect-square rounded-sm transition-colors duration-300 ${isMilestone
                                ? "bg-yellow-400/80"
                                : isFilled
                                    ? `bg-gradient-to-br ${theme.primary} opacity-80`
                                    : darkMode
                                        ? "bg-slate-800"
                                        : "bg-slate-200"
                                }`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default HeroAnimation;
