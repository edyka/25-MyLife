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
    <div className="mb-3">
      {showTitle && (
        <h4 className={`hidden sm:block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          {title}
        </h4>
      )}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
        {Object.entries(categories).map(([key, option]) => {
          const IconComponent = option?.icon;
          const isSelected = selectedColor === key;

          // Skip rendering if icon is invalid
          if (!IconComponent) {
            console.warn(`Missing icon for category ${key}`);
            return null;
          }

          return (
            <button
              key={key}
              onClick={() => handleColorSelect(key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? darkMode
                    ? "border-orange-400 bg-gradient-to-r from-orange-500/15 to-red-500/15 text-orange-300 shadow-md shadow-orange-500/15"
                    : "border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 shadow"
                  : darkMode
                  ? "border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-md flex items-center justify-center ${
                  key === "none"
                    ? darkMode
                      ? "bg-slate-600 border-2 border-slate-500"
                      : "bg-white border-2 border-slate-300"
                    : option.color
                }`}
              >
                {key === "none" && <X className="w-2.5 h-2.5 text-slate-500" />}
              </div>
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3
          className={`text-base sm:text-lg font-bold ${
            darkMode ? "text-slate-100" : "text-slate-800"
          }`}
        >
          Paint
        </h3>
        <span
          className={`text-xs font-semibold ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {getTotalWeeks(lifeExpectancy)} weeks total
        </span>
      </div>

      {/* Clear Option */}
      <div className="mb-3">
        {renderCategoryGroup("", { none: colorOptions.none }, false)}
      </div>

      {/* Organized Category Groups */}
      {renderCategoryGroup("🎭 Moods & Feelings", emotionalCategories)}
      {renderCategoryGroup("👥 Relationships", relationshipCategories)}
      {renderCategoryGroup("🌟 Experiences", experienceCategories)}
      
      {/* Custom categories from user */}
      {Object.keys(customCategories || {}).length > 0 && 
        renderCategoryGroup("✨ Custom", customCategories)
      }

      {/* Custom Mood Creator */}
      <div className="mt-3">
        <CustomMoodCreator
          darkMode={darkMode}
          onAddCustomMood={onAddCustomMood}
        />
      </div>

      {selectedColor && (
        <div
          className={`p-3 rounded-xl border ${
            darkMode
              ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30 text-orange-200"
              : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 text-orange-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">
              <span className="text-orange-500">●</span>{" "}
              {colorOptions[selectedColor].label} selected
            </p>
            {(pinnedWeeks.size > 0 || selectedWeeks.size > 0) && (
              <button
                onClick={() => { clearPinnedWeeks(); resetRangeSelection(); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:scale-105"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700 hover:scale-105"
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
