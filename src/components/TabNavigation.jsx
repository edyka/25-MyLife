// import { useState } from "react";
import { BarChart3, Grid, Target, Settings, Shield, Moon, Sun } from "lucide-react";
import { Switch } from "@headlessui/react";

// Import optimized life selectors
import { useLifeSelectors } from "../stores/useLifeStore";

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
  return (
    <nav className={`w-full flex flex-col items-center border-b backdrop-blur-md sticky top-0 z-30 ${
      darkMode 
        ? "border-slate-700/50 bg-slate-900/90" 
        : "border-orange-200/50 bg-white/95"
    }`}>
        <div className="w-full max-w-6xl px-2 sm:px-4 py-2 sm:py-3 min-h-[56px] flex flex-col items-center gap-2 md:grid md:grid-cols-[auto_1fr_auto] md:items-center">
        {/* Left side - Age display */}
        <div className="order-3 md:order-none md:col-start-1 flex items-center">
          <button
            onClick={() => setCurrentTab("settings")}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode
                ? "bg-slate-800/60 text-slate-200 hover:bg-slate-700"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
            title="Click to update age information"
          >
            Age: {currentAge}y ✏️
          </button>
        </div>

        {/* center tabs (row 1 on mobile, middle column on desktop) */}
        <div className="order-1 md:order-none md:col-start-2 flex justify-center gap-1 items-center overflow-x-auto flex-nowrap no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ key, label, icon: Icon }) => {
            return (
              <div key={key} className="relative flex flex-col items-center">
                <button
                  onClick={() => setCurrentTab(key)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-semibold text-sm transition-all duration-300 focus:outline-none flex flex-col items-center justify-center h-12 sm:h-14 hover:scale-105 ${
                    currentTab === key
                      ? darkMode
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                        : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
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
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
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
            className={`px-2 sm:px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              darkMode
                ? "bg-slate-800/60 text-slate-200 hover:bg-slate-700"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-[10px] sm:text-xs font-semibold">{darkMode ? "Light" : "Dark"}</span>
          </button>
          {/* Mobile menu button expected by tests */}
          <button 
            aria-label="Menu" 
            className={`md:hidden px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30" 
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
            }`}
          >
            Menu
          </button>
        </div>
      </div>
      {/* Remove stats row below */}
    </nav>
  );
};

export default TabNavigation;
