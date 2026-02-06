import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Palette,
  Save,
  X,
  Heart,
  Smile,
  Sun,
  Star,
  Target,
  Zap,
  Sparkles,
  Trophy,
  Book,
  Plane,
  Music,
  Camera,
  Lock,
} from 'lucide-react'
import { usePremiumStore } from '../stores/usePremiumStore'
const UpgradeModal = React.lazy(() => import('./UpgradeModal'))

const CustomMoodCreator = ({
  darkMode,
  onAddCustomMood,
  customMoodsCount = 0,
  storyStyle = false,
}) => {
  const [showCreator, setShowCreator] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [newMood, setNewMood] = useState({
    name: '',
    label: '',
    color: 'bg-purple-400',
    icon: 'Heart',
  })

  // Feature gating
  const customMoodLimit = usePremiumStore(state => state.getFeatureLimit('customMoodLimit'))
  const hasUnlimitedMoods = customMoodLimit === Infinity
  const isAtLimit = !hasUnlimitedMoods && customMoodsCount >= customMoodLimit

  const handleOpenCreator = () => {
    if (isAtLimit) {
      setShowUpgradeModal(true)
    } else {
      setShowCreator(true)
    }
  }

  // Preset custom mood suggestions
  const presetMoods = [
    { label: 'Grateful', color: 'bg-amber-400', icon: 'Sparkles' },
    { label: 'Inspired', color: 'bg-indigo-400', icon: 'Zap' },
    { label: 'Accomplished', color: 'bg-emerald-500', icon: 'Trophy' },
    { label: 'Learning', color: 'bg-cyan-400', icon: 'Book' },
    { label: 'Adventure', color: 'bg-orange-500', icon: 'Plane' },
    { label: 'Relaxed', color: 'bg-teal-300', icon: 'Sun' },
    { label: 'Focused', color: 'bg-blue-500', icon: 'Target' },
    { label: 'Creative', color: 'bg-purple-500', icon: 'Palette' },
  ]

  // Available colors for custom moods
  const availableColors = [
    { value: 'bg-purple-400', name: 'Purple', preview: '#a855f7' },
    { value: 'bg-pink-400', name: 'Pink', preview: '#f472b6' },
    { value: 'bg-rose-400', name: 'Rose', preview: '#fb7185' },
    { value: 'bg-red-400', name: 'Red', preview: '#f87171' },
    { value: 'bg-orange-400', name: 'Orange', preview: '#fb923c' },
    { value: 'bg-amber-400', name: 'Amber', preview: '#fbbf24' },
    { value: 'bg-yellow-400', name: 'Yellow', preview: '#facc15' },
    { value: 'bg-lime-400', name: 'Lime', preview: '#a3e635' },
    { value: 'bg-green-400', name: 'Green', preview: '#4ade80' },
    { value: 'bg-emerald-400', name: 'Emerald', preview: '#34d399' },
    { value: 'bg-teal-400', name: 'Teal', preview: '#2dd4bf' },
    { value: 'bg-cyan-400', name: 'Cyan', preview: '#22d3ee' },
    { value: 'bg-sky-400', name: 'Sky', preview: '#38bdf8' },
    { value: 'bg-blue-400', name: 'Blue', preview: '#60a5fa' },
    { value: 'bg-indigo-400', name: 'Indigo', preview: '#818cf8' },
    { value: 'bg-violet-400', name: 'Violet', preview: '#a78bfa' },
  ]

  // Available icons
  const availableIcons = {
    Heart: { component: Heart, name: 'Heart' },
    Smile: { component: Smile, name: 'Smile' },
    Sun: { component: Sun, name: 'Sun' },
    Star: { component: Star, name: 'Star' },
    Target: { component: Target, name: 'Target' },
    Zap: { component: Zap, name: 'Zap' },
    Sparkles: { component: Sparkles, name: 'Sparkles' },
    Trophy: { component: Trophy, name: 'Trophy' },
    Book: { component: Book, name: 'Book' },
    Plane: { component: Plane, name: 'Plane' },
    Music: { component: Music, name: 'Music' },
    Camera: { component: Camera, name: 'Camera' },
    Palette: { component: Palette, name: 'Palette' },
  }

  const handleSave = () => {
    if (newMood.name && newMood.label) {
      // Find the selected color object to get both hex and class
      const colorObj = availableColors.find(c => c.value === newMood.color) || availableColors[0]

      const customMood = {
        ...newMood,
        color: colorObj.value, // For WeekBox (Tailwind class)
        hex: colorObj.preview, // For Palette (Hex code)
        icon: availableIcons[newMood.icon].component,
        iconName: newMood.icon, // Save icon name for persistence
      }
      onAddCustomMood(newMood.name, customMood)
      setNewMood({
        name: '',
        label: '',
        color: 'bg-purple-400',
        icon: 'Heart',
      })
      setShowCreator(false)
    }
  }

  const handlePresetClick = preset => {
    const name = preset.label.toLowerCase().replace(/\s+/g, '')

    setNewMood({
      name,
      label: preset.label,
      color: preset.color,
      icon: preset.icon,
    })
  }

  const SelectedIcon = availableIcons[newMood.icon].component

  return (
    <div>
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Unlimited Custom Moods"
      />

      {/* Add Custom Color Button */}
      {storyStyle ? (
        // Instagram Stories style circular button
        <div
          onClick={handleOpenCreator}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer select-none"
          style={{ touchAction: 'manipulation' }}
        >
          <div
            className={`relative p-[2px] rounded-full transition-all duration-300 hover:scale-105`}
            style={{
              background: isAtLimit
                ? 'linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24)'
                : darkMode
                  ? 'linear-gradient(45deg, #475569, #334155, #475569)'
                  : 'linear-gradient(45deg, #cbd5e1, #94a3b8, #cbd5e1)',
            }}
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                darkMode ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 border-dashed transition-all duration-300 ${
                  isAtLimit
                    ? 'border-amber-400 bg-amber-500/20'
                    : darkMode
                      ? 'border-slate-600 bg-slate-800'
                      : 'border-slate-300 bg-slate-100'
                }`}
              >
                {isAtLimit ? (
                  <Lock className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                ) : (
                  <Plus className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Original square button style
        <button
          onClick={handleOpenCreator}
          className={`group relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 overflow-visible cursor-pointer hover:scale-105 hover:shadow-xl flex flex-col items-center gap-1 sm:gap-2 ${
            isAtLimit
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/50'
              : darkMode
                ? 'bg-slate-800 border border-slate-700 border-dashed hover:border-slate-500'
                : 'bg-slate-50 border border-slate-200 border-dashed hover:border-slate-400'
          }`}
          style={{ height: '100%' }}
        >
          <div
            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-300 shadow-md ${
              isAtLimit
                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                : darkMode
                  ? 'bg-slate-700'
                  : 'bg-white'
            }`}
          >
            {isAtLimit ? (
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <Plus
                className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
              />
            )}
          </div>
          <div className="text-center">
            <p
              className={`text-[10px] sm:text-sm font-bold ${isAtLimit ? 'text-amber-500' : darkMode ? 'text-white' : 'text-slate-900'}`}
            >
              {isAtLimit ? 'Upgrade' : 'New'}
            </p>
            {!isAtLimit && (
              <p
                className={`text-[8px] sm:text-xs mt-0 sm:mt-0.5 font-medium hidden sm:block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Custom
              </p>
            )}
            {!hasUnlimitedMoods && (
              <p
                className={`text-[8px] sm:text-[9px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
              >
                {customMoodsCount}/{customMoodLimit}
              </p>
            )}
          </div>
        </button>
      )}

      {/* Custom Mood Creator - Modal via Portal */}
      {showCreator &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[99999]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onMouseDown={e => {
              if (e.target === e.currentTarget) setShowCreator(false)
            }}
          >
            <div
              className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 border-2 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Palette
                    className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}
                  />
                  <h3
                    className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                  >
                    Create Custom Mood
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreator(false)}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Preset Suggestions */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Quick Suggestions
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetMoods.map(preset => {
                      const PresetIcon = availableIcons[preset.icon].component
                      return (
                        <button
                          key={preset.label}
                          onClick={() => handlePresetClick(preset)}
                          className={`${preset.color} p-3 rounded-lg transition-all duration-200 hover:scale-105 group relative`}
                          title={preset.label}
                        >
                          <PresetIcon className="w-5 h-5 text-white mx-auto mb-1" />
                          <span className="text-[10px] font-semibold text-white leading-none">
                            {preset.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Click a suggestion or create your own below
                  </p>
                </div>

                {/* Label Field */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Peaceful, Inspired, Grateful"
                    value={newMood.label}
                    onChange={e => {
                      const label = e.target.value
                      const name = label.toLowerCase().replace(/\s+/g, '')
                      setNewMood({ ...newMood, label, name })
                    }}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Choose Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewMood({ ...newMood, color: color.value })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          newMood.color === color.value
                            ? 'border-gray-800 scale-110 shadow-lg'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.preview }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(availableIcons).map(([key, iconData]) => {
                      const IconComp = iconData.component
                      return (
                        <button
                          key={key}
                          onClick={() => setNewMood({ ...newMood, icon: key })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            newMood.icon === key
                              ? darkMode
                                ? 'border-blue-400 bg-blue-900/30'
                                : 'border-blue-500 bg-blue-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-300 hover:border-gray-400'
                          }`}
                          title={iconData.name}
                        >
                          <IconComp
                            className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Preview
                  </label>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 ${newMood.color} border-gray-300`}
                  >
                    <SelectedIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {newMood.label || 'Your Custom Color'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={!newMood.label}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !newMood.label
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Create Color
                </button>
                <button
                  onClick={() => setShowCreator(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default CustomMoodCreator
