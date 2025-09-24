// import { useState } from "react";
import { BarChart3, Grid, Target, Settings, Shield, Moon, Sun } from "lucide-react";
import { Switch } from "@headlessui/react";

// Import optimized life selectors
import { useLifeSelectors } from "../stores/useLifeStore";
import { useUIStore } from "../stores/useUIStore";
import { getTheme } from "../utils/themeConfig";

const TABS = [
  { key: "grid", label: "Life Grid", icon: Grid },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "goals", label: "Goals", icon: Target },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "policy", label: "Policy", icon: Shield },
];

const TabNavigation = ({
  currentTab,
  setCurrentTab,
  darkMode,
  showWeeks,
  setShowWeeks,
  setDarkMode,
}) => {
  // Get current age from optimized selectors
  const { currentWeek } = useLifeSelectors();
  const currentAge = Math.floor((currentWeek - 1) / 52);

  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  return (
    <nav className={`w-full flex flex-col items-center border-b-2 transition-all duration-500 sticky top-0 z-30 ${
      darkMode
        ? "premium-card-dark border-slate-700/30 backdrop-blur-lg"
        : "premium-card border-slate-200/30 backdrop-blur-lg"
    }`}>
        <div className="w-full max-w-7xl px-4 sm:px-6 py-3 sm:py-4 min-h-[64px] flex flex-col items-center gap-3 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
        {/* Left side - Brand Logo */}
        <div className="order-3 md:order-none md:col-start-1 flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-lg ${theme.shadow} flex items-center justify-center group`}>
              <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"></div>
                ))}
              </div>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br ${theme.iconBg} rounded-full border-2 border-white shadow-md animate-pulse`}></div>
          </div>
          <div className="hidden sm:block">
            <h3 className={`text-lg font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Viventiva
            </h3>
            <p className={`text-[10px] font-medium leading-none ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Age: {currentAge}y
            </p>
          </div>
        </div>

        {/* center tabs (row 1 on mobile, middle column on desktop) */}
        <div className="order-1 md:order-none md:col-start-2 flex justify-center gap-1.5 items-center overflow-x-auto flex-nowrap no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ key, label, icon: Icon }) => {
            return (
              <div key={key} className="relative flex flex-col items-center">
                <button
                  onClick={() => setCurrentTab(key)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-semibold text-sm transition-all duration-300 focus:outline-none flex flex-col items-center justify-center h-12 sm:h-14 hover:scale-105 ${
                    currentTab === key
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg ${theme.shadow}`
                      : darkMode
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase hidden sm:block">
                    {label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        {/* right controls (row 2 center on mobile, right on desktop) */}
        <div className="order-2 md:order-none md:col-start-3 flex items-center gap-2 sm:gap-4 justify-center md:justify-end">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${
              darkMode ? "text-slate-300" : "text-slate-600"
            }`}>
              {showWeeks ? "Weeks" : "Months"}
            </span>
            <Switch
              checked={showWeeks}
              onChange={setShowWeeks}
              className={`${
                showWeeks
                  ? `bg-gradient-to-r ${theme.primary}`
                  : darkMode
                  ? "bg-slate-600"
                  : "bg-slate-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-lg`}
            >
              <span className="sr-only">Toggle weeks/months</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  showWeeks ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </Switch>
          </div>
          {/* Dark mode toggle */}
          <button
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-md ${
              darkMode
                ? "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 hover:from-slate-600 hover:to-slate-700"
                : "bg-gradient-to-r from-white to-slate-50 text-slate-700 border border-slate-200 hover:from-slate-50 hover:to-slate-100"
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-[10px] sm:text-xs font-semibold hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>
      {/* Remove stats row below */}
    </nav>
  );
};

export default TabNavigation;
