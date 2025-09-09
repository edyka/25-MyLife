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
  const handleColorSelect = (colorKey) => {
    // Reset range selection when changing colors
    resetRangeSelection();
    setSelectedColor(selectedColor === colorKey ? null : colorKey);
  };

  // Add error handling for category functions
  let emotionalCategories, relationshipCategories, experienceCategories;
  try {
    emotionalCategories = getEmotionalCategories();
    relationshipCategories = getRelationshipCategories();
    experienceCategories = getExperienceCategories();
  } catch (error) {
    console.error('Error loading categories:', error);
    emotionalCategories = {};
    relationshipCategories = {};
    experienceCategories = {};
  }

  const renderCategoryGroup = (title, categories, showTitle = true) => (
    <div className="mb-4">
      {showTitle && (
        <h4 className={`text-xs font-semibold mb-2 tracking-wide ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          {title}
        </h4>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {Object.entries(categories).map(([key, option]) => {
          const IconComponent = option?.icon;
          const isActive = selectedColor === key;
          if (!IconComponent) return null;

          return (
            <button
              key={key}
              onClick={() => handleColorSelect(key)}
              className={`group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all duration-200 hover:translate-y-[-1px] ${
                isActive
                  ? darkMode
                    ? "border-orange-400 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-200 shadow shadow-orange-500/10"
                    : "border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 shadow"
                  : darkMode
                  ? "border-slate-600 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ${
                    key === "none"
                      ? darkMode
                        ? "bg-slate-600 border-2 border-slate-500"
                        : "bg-white border-2 border-slate-300"
                      : option.color
                  }`}
                >
                  {key === "none" && <X className="w-3 h-3 text-slate-500" />}
                </div>
                <IconComponent className="w-4 h-4 opacity-90" />
                <span className="text-[12px] font-semibold truncate">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3
            className={`text-base sm:text-lg font-bold ${
              darkMode ? "text-slate-100" : "text-slate-800"
            }`}
          >
            Paint
          </h3>
          {selectedColor && colorOptions && (
            <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${
              darkMode ? "bg-slate-800/60 text-orange-300" : "bg-orange-50 text-orange-700 border border-orange-200"
            }`}>
              {colorOptions?.[selectedColor]?.label || "None"}
            </span>
          )}
        </div>
        <span
          className={`text-xs font-semibold ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {getTotalWeeks(lifeExpectancy)} weeks total
        </span>
      </div>

      {/* Clear Option */}
      <div className="mb-4">
        {renderCategoryGroup("", { none: colorOptions.none }, false)}
      </div>

      {/* Organized Category Groups with responsive grid */}
      {renderCategoryGroup("🎭 Moods & Feelings", emotionalCategories)}
      {renderCategoryGroup("👥 Relationships", relationshipCategories)}
      {renderCategoryGroup("🌟 Experiences", experienceCategories)}
      {Object.keys(customCategories || {}).length > 0 && 
        renderCategoryGroup("✨ Custom", customCategories)
      }

      {/* Custom Mood Creator */}
      <div className="mt-4">
        <CustomMoodCreator
          darkMode={darkMode}
          onAddCustomMood={onAddCustomMood}
        />
      </div>

      {selectedColor && (
        <div
          className={`mt-4 p-3 rounded-xl border ${
            darkMode
              ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30 text-orange-200"
              : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 text-orange-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">
              <span className="text-orange-500">●</span>{" "}
              {(colorOptions && colorOptions[selectedColor] && colorOptions[selectedColor].label) || "None"} selected
            </p>
            {(pinnedWeeks.size > 0 || selectedWeeks.size > 0) && (
              <button
                onClick={() => { clearPinnedWeeks(); resetRangeSelection(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 hover:translate-y-[-1px]"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700 hover:translate-y-[-1px]"
                }`}
              >
                Clear ({pinnedWeeks.size || selectedWeeks.size})
              </button>
            )}
          </div>
          <p
            className={`text-[11px] mt-2 font-medium ${
              darkMode ? "text-orange-300/80" : "text-orange-600/80"
            }`}
          >
            {isInRangeMode 
              ? `Click on another week to complete range (${rangeStart} → ?)`
              : selectedColor === "none"
              ? "Click and drag to remove colors from weeks"
              : "Click on first week, then last week to color all weeks in between"
            }
          </p>

        </div>
      )}
    </div>
  );
};

export default MoodPalette;
