import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { getTotalWeeks } from "../utils/dateUtils";
import { getEmotionalCategories, getRelationshipCategories, getExperienceCategories } from "../utils/constants";
import CustomMoodCreator from "./CustomMoodCreator";
import { useUIStore } from "../stores/useUIStore";
import { getTheme } from "../utils/themeConfig";

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
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  const handleColorSelect = (colorKey) => {
    resetRangeSelection();
    setSelectedColor(selectedColor === colorKey ? null : colorKey);
  };

  // Combine all categories including custom ones
  const allCats = useMemo(() => {
    const emotionalCategories = getEmotionalCategories();
    const relationshipCategories = getRelationshipCategories();
    const experienceCategories = getExperienceCategories();

    const combined = {
      ...emotionalCategories,
      ...relationshipCategories,
      ...experienceCategories,
      ...customCategories
    };
    return combined;
  }, [customCategories]);


  const hasActiveSelection = selectedColor || pinnedWeeks.size > 0 || selectedWeeks.size > 0;

  return (
    <div className="space-y-8">
      {/* Ultra-Minimal Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Paint Your Life
        </h3>

        {/* Show selection badge only when actively selecting */}
        {selectedColor && colorOptions && (
          <div
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2"
            style={{
              background: darkMode ? `${theme.colors.primary}15` : `${theme.colors.primary}10`,
              color: theme.colors.primary,
              border: `1px solid ${darkMode ? theme.colors.primary + '25' : theme.colors.primary + '20'}`
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            {colorOptions?.[selectedColor]?.label || "None"}
          </div>
        )}
      </div>


      {/* Ultra-Clean Color Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5">
        {/* Clear button */}
        <button
          onClick={() => handleColorSelect("none")}
          className={`group relative aspect-square rounded-lg transition-all duration-200 ${
            selectedColor === "none"
              ? darkMode
                ? 'bg-red-500/20 scale-95 ring-1 ring-red-500/50'
                : 'bg-red-50 scale-95 ring-1 ring-red-200'
              : darkMode
                ? 'bg-white/5 hover:bg-white/10 hover:scale-95'
                : 'bg-slate-100/50 hover:bg-slate-200/50 hover:scale-95'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <X
              className={`w-4 h-4 transition-colors ${
                selectedColor === "none"
                  ? 'text-red-500'
                  : darkMode
                    ? 'text-slate-500 group-hover:text-slate-300'
                    : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </div>
          {/* Tooltip on hover */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className={`text-xs whitespace-nowrap px-2 py-1 rounded-md ${
              darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-white'
            }`}>
              Clear
            </span>
          </div>
        </button>

        {Object.entries(allCats).map(([key, option]) => {
          const IconComponent = option?.icon;
          if (!IconComponent) return null;
          const isActive = selectedColor === key;

          return (
            <button
              key={key}
              onClick={() => handleColorSelect(key)}
              className={`${option.color} group relative aspect-square rounded-lg transition-all duration-200 overflow-hidden ${
                isActive ? 'scale-95 ring-2 ring-offset-2' : 'hover:scale-95'
              } ${darkMode ? 'ring-offset-slate-900' : 'ring-offset-white'}`}
              style={{
                ringColor: isActive ? theme.colors.primary : undefined,
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <IconComponent className="w-4 h-4 text-white drop-shadow-md" />
                <span className="text-[10px] font-semibold text-white drop-shadow-md leading-none">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Creator - Minimal */}
      <CustomMoodCreator
        darkMode={darkMode}
        onAddCustomMood={onAddCustomMood}
      />

      {/* Selection Info - Only show when needed, ultra-subtle */}
      {hasActiveSelection && (
        <div
          className={`p-3 rounded-xl flex items-center justify-between border ${
            darkMode
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-50 border-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedColor && colorOptions?.[selectedColor]?.icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: selectedColor === 'none'
                    ? darkMode ? '#ef444420' : '#fef2f2'
                    : `${theme.colors.primary}20`
                }}
              >
                {(() => {
                  const IconComponent = selectedColor === 'none' ? X : colorOptions[selectedColor].icon;
                  return <IconComponent
                    className="w-4 h-4"
                    style={{
                      color: selectedColor === 'none' ? '#ef4444' : theme.colors.primary
                    }}
                  />;
                })()}
              </div>
            )}
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {isInRangeMode
                  ? `Week ${rangeStart} → ?`
                  : selectedColor === "none"
                  ? "Clear mode"
                  : "Paint mode"}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {isInRangeMode
                  ? "Click end week"
                  : selectedColor === "none"
                  ? "Click to erase"
                  : "Click start & end"}
              </p>
            </div>
          </div>

          {(pinnedWeeks.size > 0 || selectedWeeks.size > 0) && (
            <button
              onClick={() => { clearPinnedWeeks(); resetRangeSelection(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                darkMode
                  ? "bg-white/10 hover:bg-white/15 text-slate-300"
                  : "bg-slate-900/5 hover:bg-slate-900/10 text-slate-700"
              }`}
            >
              Clear ({pinnedWeeks.size || selectedWeeks.size})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodPalette;