import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as Icons from './icons';

// Available icons for mood selection
const AVAILABLE_ICONS = [
  { name: 'Smile', component: Icons.Smile },
  { name: 'Heart', component: Icons.Heart },
  { name: 'Frown', component: Icons.Frown },
  { name: 'Target', component: Icons.Target },
  { name: 'Sparkles', component: Icons.Sparkles },
  { name: 'Wind', component: Icons.Wind },
  { name: 'Zap', component: Icons.Zap },
  { name: 'Flower', component: Icons.Flower2 },
  { name: 'Sun', component: Icons.Sun },
  { name: 'Moon', component: Icons.Moon },
  { name: 'Star', component: Icons.Star },
  { name: 'Coffee', component: Icons.Coffee },
  { name: 'Music', component: Icons.Music },
  { name: 'Book', component: Icons.Book },
  { name: 'Dumbbell', component: Icons.Dumbbell },
  { name: 'Palette', component: Icons.Palette }
];

// Available colors for moods
const AVAILABLE_COLORS = [
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-50', dark: 'bg-emerald-950' },
  { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500', light: 'bg-pink-50', dark: 'bg-pink-950' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500', light: 'bg-blue-50', dark: 'bg-blue-950' },
  { name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-500', light: 'bg-indigo-50', dark: 'bg-indigo-950' },
  { name: 'Teal', hex: '#14b8a6', bg: 'bg-teal-500', light: 'bg-teal-50', dark: 'bg-teal-950' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500', light: 'bg-amber-50', dark: 'bg-amber-950' },
  { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-500', light: 'bg-purple-50', dark: 'bg-purple-950' },
  { name: 'Orange', hex: '#f97316', bg: 'bg-orange-500', light: 'bg-orange-50', dark: 'bg-orange-950' },
  { name: 'Red', hex: '#ef4444', bg: 'bg-red-500', light: 'bg-red-50', dark: 'bg-red-950' },
  { name: 'Green', hex: '#22c55e', bg: 'bg-green-500', light: 'bg-green-50', dark: 'bg-green-950' },
  { name: 'Yellow', hex: '#eab308', bg: 'bg-yellow-500', light: 'bg-yellow-50', dark: 'bg-yellow-950' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500', light: 'bg-cyan-50', dark: 'bg-cyan-950' }
];
import { useUIStore } from "../stores/useUIStore";
import { useMilestoneStore } from "../stores/useMilestoneStore";
import { getTheme } from "../utils/themeConfig";

// Initial predefined core moods
const INITIAL_MOODS = [
  {
    key: 'happy',
    label: 'Happy',
    icon: Icons.Smile,
    color: '#10b981', // emerald-500
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    darkBg: 'bg-emerald-950',
    description: 'Joyful moments'
  },
  {
    key: 'inlove',
    label: 'In Love',
    icon: Icons.Heart,
    color: '#ec4899', // pink-500
    bg: 'bg-pink-500',
    lightBg: 'bg-pink-50',
    darkBg: 'bg-pink-950',
    description: 'Romantic feelings'
  },
  {
    key: 'focused',
    label: 'Focused',
    icon: Icons.Target,
    color: '#3b82f6', // blue-500
    bg: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    darkBg: 'bg-blue-950',
    description: 'Deep concentration'
  },
  {
    key: 'sad',
    label: 'Sad',
    icon: Icons.Frown,
    color: '#6366f1', // indigo-500
    bg: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    darkBg: 'bg-indigo-950',
    description: 'Difficult times'
  },
  {
    key: 'peaceful',
    label: 'Peaceful',
    icon: Icons.Flower2,
    color: '#14b8a6', // teal-500
    bg: 'bg-teal-500',
    lightBg: 'bg-teal-50',
    darkBg: 'bg-teal-950',
    description: 'Calm & serene'
  },
  {
    key: 'energetic',
    label: 'Energetic',
    icon: Icons.Zap,
    color: '#f59e0b', // amber-500
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    darkBg: 'bg-amber-950',
    description: 'Full of energy'
  },
  {
    key: 'creative',
    label: 'Creative',
    icon: Icons.Sparkles,
    color: '#a855f7', // purple-500
    bg: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    darkBg: 'bg-purple-950',
    description: 'Inspired & artistic'
  },
  {
    key: 'grateful',
    label: 'Grateful',
    icon: Icons.Wind,
    color: '#f97316', // orange-500
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    darkBg: 'bg-orange-950',
    description: 'Thankful moments'
  }
];

const ModernMoodPalette = ({
  selectedColor,
  setSelectedColor,
  selectedWeeks,
  pinnedWeeks = new Set(),
  isInRangeMode = false,
  rangeStart = null,
  resetRangeSelection = () => {},
  clearPinnedWeeks = () => {},
}) => {
  const darkMode = useUIStore((state) => state.darkMode);
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  // Get custom moods from store
  const customMoods = useMilestoneStore((state) => state.customMoods);
  const setCustomMoods = useMilestoneStore((state) => state.setCustomMoods);
  const updateCustomMood = useMilestoneStore((state) => state.updateCustomMood);

  // Merge INITIAL_MOODS with customMoods from store
  const moods = INITIAL_MOODS.map(mood => {
    const customMood = customMoods[mood.key];
    if (customMood) {
      // Find the icon component from AVAILABLE_ICONS
      const iconMatch = AVAILABLE_ICONS.find(i => i.name === customMood.iconName);
      return {
        ...mood,
        label: customMood.label,
        description: customMood.description,
        color: customMood.color,
        bg: customMood.bg,
        lightBg: customMood.lightBg,
        darkBg: customMood.darkBg,
        icon: iconMatch ? iconMatch.component : mood.icon
      };
    }
    return mood;
  });
  const [hoveredMood, setHoveredMood] = useState(null);
  const [editingMood, setEditingMood] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [editForm, setEditForm] = useState({
    label: '',
    description: '',
    color: '',
    icon: null
  });

  const handleMoodSelect = (moodKey) => {
    resetRangeSelection();
    setSelectedColor(selectedColor === moodKey ? null : moodKey);
  };

  const handleClear = () => {
    resetRangeSelection();
    setSelectedColor("none");
  };

  const handleMenuToggle = (moodKey, e) => {
    e.stopPropagation();
    setShowMenu(showMenu === moodKey ? null : moodKey);
  };

  const handleEditClick = (mood, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(null);
    // Use setTimeout to ensure menu closes before modal opens
    setTimeout(() => {
      setEditingMood(mood.key);
      setEditForm({
        label: mood.label,
        description: mood.description,
        color: AVAILABLE_COLORS.find(c => c.hex === mood.color) || AVAILABLE_COLORS[0],
        icon: AVAILABLE_ICONS.find(i => i.component === mood.icon) || AVAILABLE_ICONS[0]
      });
    }, 0);
  };

  const handleSaveEdit = (e) => {
    if (e) e.stopPropagation();
    if (!editForm.label.trim()) return;

    // Save to store (which persists to localStorage and will sync to Supabase)
    updateCustomMood(editingMood, {
      label: editForm.label.trim(),
      description: editForm.description.trim(),
      color: editForm.color.hex,
      bg: editForm.color.bg,
      lightBg: editForm.color.light,
      darkBg: editForm.color.dark,
      iconName: editForm.icon.name
    });

    setEditingMood(null);
    setEditForm({ label: '', description: '', color: '', icon: null });
  };

  const handleCancelEdit = (e) => {
    if (e) e.stopPropagation();
    setEditingMood(null);
    setEditForm({ label: '', description: '', color: '', icon: null });
  };

  const hasActiveSelection = selectedColor || pinnedWeeks.size > 0 || selectedWeeks.size > 0;
  const totalSelected = pinnedWeeks.size || selectedWeeks.size;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(null);
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && editingMood) {
        handleCancelEdit();
      }
    };

    if (editingMood) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [editingMood]);

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Paint Your Life
          </h2>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Color your weeks with emotions
          </p>
        </div>

        {/* Active Selection Badge */}
        {selectedColor && (
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
            darkMode ? 'bg-white/10' : 'bg-slate-100'
          }`}>
            {selectedColor === 'none' ? (
              <>
                <Icons.Eraser className={`w-4 h-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Eraser Active
                </span>
              </>
            ) : (() => {
              const mood = moods.find(m => m.key === selectedColor);
              if (!mood) return null;
              const Icon = mood.icon;
              return (
                <>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: mood.color }}
                  />
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {mood.label}
                  </span>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modern Mood Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {/* Clear/Eraser Tool */}
        <div
          className={`group relative p-3 rounded-xl transition-all duration-300 overflow-visible cursor-pointer ${
            selectedColor === 'none'
              ? 'scale-105 shadow-xl ring-2 ring-slate-500'
              : 'hover:scale-105 hover:shadow-lg'
          } ${
            darkMode
              ? 'bg-slate-800/50 hover:bg-slate-700/50'
              : 'bg-slate-100 hover:bg-slate-200'
          }`}
          style={{
            borderWidth: '1px',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }}
          onClick={() => handleMoodSelect('none')}
        >
          {/* Content */}
          <div className="relative flex flex-col items-center gap-2">
            {/* Icon Container */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                selectedColor === 'none' ? 'scale-110' : ''
              } ${
                darkMode ? 'bg-slate-700' : 'bg-white'
              }`}
            >
              <Icons.Eraser
                className={`w-4 h-4 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <p className={`text-xs font-semibold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Clear
              </p>
              <p className={`text-[10px] mt-0.5 ${
                darkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Remove mood
              </p>
            </div>
          </div>
        </div>

        {moods.map((mood) => {
          const Icon = mood.icon;
          const isActive = selectedColor === mood.key;
          const isHovered = hoveredMood === mood.key;

          return (
            <div
              key={mood.key}
              className={`group relative p-3 rounded-xl transition-all duration-300 overflow-visible ${
                isActive
                  ? 'scale-105 shadow-xl ring-2'
                  : 'hover:scale-105 hover:shadow-lg'
              } ${
                darkMode
                  ? mood.darkBg + '/20 hover:' + mood.darkBg + '/30'
                  : mood.lightBg + ' hover:' + mood.lightBg
              }`}
              style={{
                ringColor: isActive ? mood.color : undefined,
                borderWidth: isActive ? '0' : '1px',
                borderColor: darkMode
                  ? isActive ? mood.color : 'rgba(255,255,255,0.1)'
                  : isActive ? mood.color : 'rgba(0,0,0,0.05)'
              }}
              onClick={() => handleMoodSelect(mood.key)}
              onMouseEnter={() => setHoveredMood(mood.key)}
              onMouseLeave={() => setHoveredMood(null)}
            >
              {/* Background Gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${mood.color}10 0%, ${mood.color}05 100%)`
                }}
              />

              {/* Content */}
              <div className="relative flex flex-col items-center gap-2">
                {/* Icon Container */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive || isHovered ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? mood.color : `${mood.color}20`
                  }}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isActive ? 'text-white' : ''
                    }`}
                    style={{
                      color: isActive ? '#fff' : mood.color
                    }}
                  />
                </div>

                {/* Label and Description */}
                <div className="text-center">
                  <p className={`text-xs font-semibold ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {mood.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${
                    darkMode ? 'text-slate-500' : 'text-slate-500'
                  }`}>
                    {mood.description}
                  </p>
                </div>

                {/* Three-dot Menu Button */}
                <button
                  onClick={(e) => handleMenuToggle(mood.key, e)}
                  className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  <Icons.MoreVertical className={`w-3 h-3 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {showMenu === mood.key && (
                  <div
                    className={`absolute top-10 right-2 z-50 rounded-lg shadow-xl border ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-200'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleEditClick(mood, e)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm w-full rounded-t-lg transition-colors ${
                        darkMode
                          ? 'hover:bg-slate-700 text-white'
                          : 'hover:bg-slate-100 text-slate-900'
                      }`}
                    >
                      <Icons.Edit2 className="w-4 h-4" />
                      Rename
                    </button>
                  </div>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-2 left-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: mood.color }}
                    >
                      <Icons.Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* Selection Status */}
      {hasActiveSelection && (
        <div className={`p-4 rounded-xl transition-all duration-300 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700'
            : 'bg-gradient-to-r from-slate-50 to-white border border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            {/* Status Text */}
            <div className="flex items-center gap-3">
              {(() => {
                if (selectedColor === 'none') {
                  return (
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Icons.X className="w-5 h-5 text-red-500" />
                    </div>
                  );
                }
                const mood = moods.find(m => m.key === selectedColor);
                if (!mood) return null;
                const Icon = mood.icon;
                return (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${mood.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: mood.color }} />
                  </div>
                );
              })()}

              <div>
                <p className={`text-sm font-semibold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {isInRangeMode
                    ? `Selecting from week ${rangeStart}...`
                    : selectedColor === "none"
                    ? "Clear mode active"
                    : "Paint mode active"}
                </p>
                <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {isInRangeMode
                    ? "Click to select end week"
                    : "Click start week → Click end week"}
                  <Icons.ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </div>

            {/* Clear Selection Button */}
            {totalSelected > 0 && (
              <button
                onClick={() => { clearPinnedWeeks(); resetRangeSelection(); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                Clear Selection ({totalSelected})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Helper Hint */}
      {!hasActiveSelection && (
        <div className={`text-center py-6 px-4 rounded-xl ${
          darkMode
            ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/30'
            : 'bg-gradient-to-br from-slate-50 to-white'
        }`}>
          <p className={`text-sm ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Select a mood above, then click weeks on your life grid to color them
          </p>
        </div>
      )}

      {/* Edit Modal - Rendered via Portal */}
      {editingMood && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99999
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelEdit(e);
            }
          }}
        >
          <div
            className={`relative w-full max-w-lg my-8 rounded-xl shadow-2xl ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            }`}
            style={{ zIndex: 100000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Edit Mood
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                  }`}
                >
                  <Icons.X className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Mood Name
                </label>
                <input
                  type="text"
                  value={editForm.label}
                  onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-semibold ${
                    darkMode
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-50 text-slate-900 border-slate-300'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Happy, Focused..."
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${
                    darkMode
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-50 text-slate-900 border-slate-300'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Joyful moments..."
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Color
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setEditForm({...editForm, color})}
                      className={`relative w-full aspect-square rounded-md transition-all ${
                        color.bg
                      } ${
                        editForm.color?.hex === color.hex
                          ? 'ring-2 ring-offset-1 ring-blue-500'
                          : 'hover:scale-105'
                      } ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-white'}`}
                      title={color.name}
                    >
                      {editForm.color?.hex === color.hex && (
                        <Icons.Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Icon
                </label>
                <div className="grid grid-cols-10 gap-1.5">
                  {AVAILABLE_ICONS.map((iconItem) => {
                    const IconComp = iconItem.component;
                    return (
                      <button
                        key={iconItem.name}
                        onClick={() => setEditForm({...editForm, icon: iconItem})}
                        className={`relative w-full aspect-square rounded-md transition-all flex items-center justify-center ${
                          darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                        } ${
                          editForm.icon?.name === iconItem.name
                            ? 'ring-2 ring-blue-500'
                            : 'hover:scale-105'
                        }`}
                        title={iconItem.name}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${
                          editForm.icon?.name === iconItem.name
                            ? 'text-blue-500'
                            : darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Preview
                </label>
                <div
                  className={`p-3 rounded-lg ${
                    darkMode
                      ? editForm.color?.dark + '/20'
                      : editForm.color?.light
                  }`}
                  style={{ borderWidth: '2px', borderColor: editForm.color?.hex }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: editForm.color?.hex }}
                    >
                      {editForm.icon && (
                        React.createElement(editForm.icon.component, {
                          className: 'w-5 h-5 text-white'
                        })
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {editForm.label || 'Mood Name'}
                      </p>
                      <p className={`text-xs truncate ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {editForm.description || 'Description'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-3 border-t flex gap-2 justify-end ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                onClick={handleCancelEdit}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.label.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  editForm.label.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ModernMoodPalette;
