import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { getTotalWeeks } from "../utils/dateUtils";
import { getEmotionalCategories, getRelationshipCategories, getExperienceCategories } from "../utils/constants";
import CustomMoodCreator from "./CustomMoodCreator";

const MoodPalette = ({
  colorOptions,
  selectedColor,
  setSelectedColor,
  selectedWeeks,
  _setSelectedWeeks,
  pinnedWeeks = new Set(),
  _setPinnedWeeks = () => {},
  lifeExpectancy,
  darkMode,
  onAddCustomMood,
  customCategories = {},
  isInRangeMode = false,
  rangeStart = null,
  resetRangeSelection = () => {},
  clearPinnedWeeks = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const handleColorSelect = (colorKey) => {
    // Reset range selection when changing colors
    resetRangeSelection();
    setSelectedColor(selectedColor === colorKey ? null : colorKey);
  };

  // Memoized category sets
  const emotionalCategories = useMemo(() => {
    try { return getEmotionalCategories(); } catch { return {}; }
  }, []);
  const relationshipCategories = useMemo(() => {
    try { return getRelationshipCategories(); } catch { return {}; }
  }, []);
  const experienceCategories = useMemo(() => {
    try { return getExperienceCategories(); } catch { return {}; }
  }, []);

  const allCats = useMemo(() => ({
    ...emotionalCategories,
    ...relationshipCategories,
    ...experienceCategories,
    ...(customCategories || {})
  }), [emotionalCategories, relationshipCategories, experienceCategories, customCategories]);

  const tabToSet = useMemo(() => ({
    all: allCats,
    moods: emotionalCategories,
    relationships: relationshipCategories,
    experiences: experienceCategories,
    custom: customCategories || {}
  }), [allCats, emotionalCategories, relationshipCategories, experienceCategories, customCategories]);

  const renderPills = (categories) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {/* Clear pill */}
      <button
        key="none"
        onClick={() => handleColorSelect("none")}
        className={`interactive-element px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 group ${
          selectedColor === "none"
            ? (darkMode ? "border-red-400 bg-red-500/15 text-red-200 shadow-lg" : "border-red-400 bg-red-50 text-red-700 shadow-lg")
            : (darkMode ? "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50" : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50")
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <X className={`w-5 h-5 transition-transform duration-300 ${selectedColor === "none" ? "scale-110" : "group-hover:scale-105"}`} />
          <span className="text-xs">Clear</span>
        </div>
      </button>

      {Object.entries(categories).map(([key, option]) => {
        const IconComponent = option?.icon;
        if (!IconComponent) return null;
        const isActive = selectedColor === key;
        return (
          <button
            key={key}
            onClick={() => handleColorSelect(key)}
            className={`interactive-element px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 group ${
              isActive
                ? (darkMode ? "border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-lg" : "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-lg")
                : (darkMode ? "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50" : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50")
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className={`w-6 h-6 rounded-xl ${option.color} shadow-md transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                <IconComponent className={`absolute inset-0 w-4 h-4 m-auto text-white drop-shadow-sm transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
              </div>
              <span className="text-xs text-center leading-tight truncate w-full">{option.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3
            className={`text-heading ${
              darkMode ? "text-slate-100" : "text-slate-800"
            }`}
          >
            Mark Your Weeks
          </h3>
          {selectedColor && colorOptions && (
            <div className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
              darkMode ? "bg-slate-800/60 text-emerald-300 border border-emerald-400/30" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-current opacity-60"></div>
                {colorOptions?.[selectedColor]?.label || "None"}
              </span>
            </div>
          )}
        </div>
        <div className={`px-3 py-2 rounded-xl text-xs font-semibold ${
          darkMode ? "bg-slate-800/40 text-slate-400" : "bg-slate-100 text-slate-600"
        }`}>
          {getTotalWeeks(lifeExpectancy)} weeks total
        </div>
      </div>

      {/* Enhanced segmented tabs */}
      <div className={`mb-6 inline-flex rounded-2xl border-2 p-1 ${darkMode ? "border-slate-700/50 bg-slate-900/60" : "border-slate-200/50 bg-white/80"} shadow-lg`}>
        {[
          { key: "all", label: "All Categories" },
          { key: "moods", label: "Moods" },
          { key: "relationships", label: "Relationships" },
          { key: "experiences", label: "Experiences" },
          ...(Object.keys(customCategories || {}).length ? [{ key: "custom", label: "Custom" }] : [])
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`interactive-element px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              activeTab === tab.key
                ? (darkMode ? "btn-gradient-primary text-white shadow-lg" : "btn-gradient-primary text-white shadow-lg")
                : (darkMode ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800/50" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/60")
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pills grid */}
      {renderPills(tabToSet[activeTab])}

      {/* Custom Mood Creator */}
      <div className="mt-4">
        <CustomMoodCreator
          darkMode={darkMode}
          onAddCustomMood={onAddCustomMood}
        />
      </div>

      {selectedColor && (
        <div
          className={`mt-6 p-6 rounded-2xl border-2 ${
            darkMode
              ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-400/30 text-emerald-200"
              : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800"
          } shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-500"} shadow-lg`}></div>
              <p className="text-sm font-bold">
                {(colorOptions && colorOptions[selectedColor] && colorOptions[selectedColor].label) || "None"} Selected
              </p>
            </div>
            {(pinnedWeeks.size > 0 || selectedWeeks.size > 0) && (
              <button
                onClick={() => { clearPinnedWeeks(); resetRangeSelection(); }}
                className={`interactive-element px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 border border-slate-600"
                    : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-300"
                } shadow-lg`}
              >
                Clear Selection ({pinnedWeeks.size || selectedWeeks.size})
              </button>
            )}
          </div>
          <div className={`text-sm font-medium ${darkMode ? "text-emerald-300/90" : "text-emerald-700/90"}`}>
            {isInRangeMode 
              ? <span>📍 Range mode: Week {rangeStart} → ? (click end week to complete range)</span>
              : selectedColor === "none"
              ? <span>🧹 Clear mode: Click or drag to erase colored weeks</span>
              : <span>💡 Tip: Click first and last week to automatically fill the entire range</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodPalette;
