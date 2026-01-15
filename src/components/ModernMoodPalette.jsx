import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import * as Icons from './icons'
import { Lock } from 'lucide-react'
import CustomMoodCreator from './CustomMoodCreator'
import UpgradeModal from './UpgradeModal'
import { usePremiumStore } from '../stores/usePremiumStore'

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
  { name: 'Palette', component: Icons.Palette },
]

// Available colors for moods
const AVAILABLE_COLORS = [
  {
    name: 'Emerald',
    hex: '#10b981',
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    dark: 'bg-emerald-950',
  },
  { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500', light: 'bg-pink-50', dark: 'bg-pink-950' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500', light: 'bg-blue-50', dark: 'bg-blue-950' },
  {
    name: 'Indigo',
    hex: '#6366f1',
    bg: 'bg-indigo-500',
    light: 'bg-indigo-50',
    dark: 'bg-indigo-950',
  },
  { name: 'Teal', hex: '#14b8a6', bg: 'bg-teal-500', light: 'bg-teal-50', dark: 'bg-teal-950' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500', light: 'bg-amber-50', dark: 'bg-amber-950' },
  {
    name: 'Purple',
    hex: '#a855f7',
    bg: 'bg-purple-500',
    light: 'bg-purple-50',
    dark: 'bg-purple-950',
  },
  {
    name: 'Orange',
    hex: '#f97316',
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
    dark: 'bg-orange-950',
  },
  { name: 'Red', hex: '#ef4444', bg: 'bg-red-500', light: 'bg-red-50', dark: 'bg-red-950' },
  { name: 'Green', hex: '#22c55e', bg: 'bg-green-500', light: 'bg-green-50', dark: 'bg-green-950' },
  {
    name: 'Yellow',
    hex: '#eab308',
    bg: 'bg-yellow-500',
    light: 'bg-yellow-50',
    dark: 'bg-yellow-950',
  },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500', light: 'bg-cyan-50', dark: 'bg-cyan-950' },
]

import { useUIStore } from '../stores/useUIStore'
import { useMilestoneStore } from '../stores/useMilestoneStore'

// Free tier moods (4 basic moods available to all users)
const FREE_MOODS = ['happy', 'inlove', 'sad', 'focused']

// Initial predefined core moods
const INITIAL_MOODS = [
  {
    key: 'happy',
    label: 'Happy',
    icon: Icons.Smile,
    color: '#10b981',
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    darkBg: 'bg-emerald-950',
    description: 'Joyful moments',
  },
  {
    key: 'inlove',
    label: 'In Love',
    icon: Icons.Heart,
    color: '#ec4899',
    bg: 'bg-pink-500',
    lightBg: 'bg-pink-50',
    darkBg: 'bg-pink-950',
    description: 'Romantic feelings',
  },
  {
    key: 'focused',
    label: 'Focused',
    icon: Icons.Target,
    color: '#3b82f6',
    bg: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    darkBg: 'bg-blue-950',
    description: 'Deep concentration',
  },
  {
    key: 'sad',
    label: 'Sad',
    icon: Icons.Frown,
    color: '#6366f1',
    bg: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    darkBg: 'bg-indigo-950',
    description: 'Difficult times',
  },
  {
    key: 'peaceful',
    label: 'Peaceful',
    icon: Icons.Flower2,
    color: '#14b8a6',
    bg: 'bg-teal-500',
    lightBg: 'bg-teal-50',
    darkBg: 'bg-teal-950',
    description: 'Calm & serene',
  },
  {
    key: 'energetic',
    label: 'Energetic',
    icon: Icons.Zap,
    color: '#f59e0b',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    darkBg: 'bg-amber-950',
    description: 'Full of energy',
  },
  {
    key: 'creative',
    label: 'Creative',
    icon: Icons.Sparkles,
    color: '#a855f7',
    bg: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    darkBg: 'bg-purple-950',
    description: 'Inspired & artistic',
  },
  {
    key: 'grateful',
    label: 'Grateful',
    icon: Icons.Wind,
    color: '#f97316',
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    darkBg: 'bg-orange-950',
    description: 'Thankful moments',
  },
]

// Story Circle Component - Instagram style
const StoryCircle = ({ mood, isActive, isLocked, darkMode, onClick, onLongPress }) => {
  const Icon = mood.icon
  const longPressTimer = useRef(null)
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    setIsPressed(true)
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) onLongPress()
    }, 500)
  }

  const handleTouchEnd = e => {
    setIsPressed(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      // If released before long press, treat as click
      onClick()
    }
    e.preventDefault()
  }

  const handleTouchCancel = () => {
    setIsPressed(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  return (
    <div
      className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer select-none"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Gradient Ring Container */}
      <div
        className={`relative p-[2px] rounded-full transition-all duration-300 ${
          isPressed ? 'scale-95' : isActive ? 'scale-105' : 'hover:scale-105'
        }`}
        style={{
          background: isActive
            ? `linear-gradient(45deg, ${mood.color}, ${mood.color}cc, ${mood.color})`
            : `linear-gradient(45deg, ${mood.color}60, ${mood.color}30, ${mood.color}60)`,
        }}
      >
        {/* Inner Circle */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
            darkMode ? 'bg-slate-900' : 'bg-white'
          }`}
          style={{
            boxShadow: isActive ? `0 0 12px ${mood.color}50` : 'none',
          }}
        >
          {/* Icon Background */}
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300`}
            style={{
              backgroundColor: isActive ? mood.color : `${mood.color}25`,
            }}
          >
            <Icon
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors duration-300"
              style={{
                color: isActive ? '#fff' : mood.color,
              }}
            />
          </div>
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className={`p-1.5 rounded-full ${darkMode ? 'bg-slate-800/90' : 'bg-white/90'}`}>
              <Lock className={`w-3 h-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          </div>
        )}

        {/* Active checkmark */}
        {isActive && !isLocked && (
          <div
            className="absolute -bottom-0 -right-0 w-4 h-4 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: mood.color,
              borderColor: darkMode ? '#0f172a' : '#fff',
            }}
          >
            <Icons.Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={`text-[10px] sm:text-xs font-medium text-center max-w-[60px] sm:max-w-[70px] truncate ${
          isActive
            ? darkMode
              ? 'text-white'
              : 'text-slate-900'
            : darkMode
              ? 'text-slate-400'
              : 'text-slate-600'
        }`}
      >
        {mood.label}
      </span>
    </div>
  )
}

// Special action circle (Add, Mark, Erase)
const ActionCircle = ({
  icon: IconComponent,
  label,
  isActive,
  darkMode,
  onClick,
  gradientColors,
}) => {
  return (
    <div
      className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer select-none"
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className={`relative p-[2px] rounded-full transition-all duration-300 ${
          isActive ? 'scale-105' : 'hover:scale-105'
        }`}
        style={{
          background: isActive
            ? `linear-gradient(45deg, ${gradientColors})`
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
              isActive
                ? 'border-slate-400 bg-slate-600'
                : darkMode
                  ? 'border-slate-600 bg-slate-800'
                  : 'border-slate-300 bg-slate-100'
            }`}
          >
            {IconComponent}
          </div>
        </div>
      </div>
      <span
        className={`text-[10px] sm:text-xs font-medium ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

const ModernMoodPalette = ({
  selectedColor,
  setSelectedColor,
  _selectedWeeks,
  _pinnedWeeks = new Set(),
  isInRangeMode = false,
  rangeStart = null,
  resetRangeSelection = () => {},
  _clearPinnedWeeks = () => {},
  onAddCustomMood = () => {},
  onToggleMilestone = () => {},
  isMilestoneMode = false,
}) => {
  const darkMode = useUIStore(state => state.darkMode)
  const scrollContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Premium state for mood gating
  const hasUnlimitedMoods = usePremiumStore(state => state.hasFeature('customMoods'))
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Get custom moods and categories from store
  const customMoods = useMilestoneStore(state => state.customMoods)
  const customCategories = useMilestoneStore(state => state.customCategories)
  const updateCustomMood = useMilestoneStore(state => state.updateCustomMood)
  const deleteMood = useMilestoneStore(state => state.deleteMood)
  const deletedMoods = useMilestoneStore(state => state.deletedMoods || [])

  // Process predefined moods
  const predefinedMoods = INITIAL_MOODS.map(mood => {
    const customMood = customMoods[mood.key]
    if (customMood) {
      const iconMatch = AVAILABLE_ICONS.find(i => i.name === customMood.iconName)
      return {
        ...mood,
        label: customMood.label,
        description: customMood.description,
        color: customMood.color,
        bg: customMood.bg,
        lightBg: customMood.lightBg,
        darkBg: customMood.darkBg,
        icon: iconMatch ? iconMatch.component : mood.icon,
      }
    }
    return mood
  })

  // Helper to get hex from tailwind class
  const getHexFromClass = className => {
    if (!className) return '#a855f7'
    const colorMap = {
      'bg-purple-400': '#a855f7',
      'bg-pink-400': '#f472b6',
      'bg-rose-400': '#fb7185',
      'bg-red-400': '#f87171',
      'bg-orange-400': '#fb923c',
      'bg-amber-400': '#fbbf24',
      'bg-yellow-400': '#facc15',
      'bg-lime-400': '#a3e635',
      'bg-green-400': '#4ade80',
      'bg-emerald-400': '#34d399',
      'bg-teal-400': '#2dd4bf',
      'bg-cyan-400': '#22d3ee',
      'bg-sky-400': '#38bdf8',
      'bg-blue-400': '#60a5fa',
      'bg-indigo-400': '#818cf8',
      'bg-violet-400': '#a78bfa',
    }
    return colorMap[className] || '#a855f7'
  }

  // Process custom categories
  const newCustomMoods = Object.values(customCategories || {})
    .filter(cat => !INITIAL_MOODS.some(m => m.key === cat.name))
    .map(cat => {
      const iconMatch = AVAILABLE_ICONS.find(i => i.name === cat.iconName)
      const IconComp = iconMatch ? iconMatch.component : Icons.Star
      const colorHex = cat.hex || getHexFromClass(cat.color)
      return {
        key: cat.name,
        label: cat.label,
        description: 'Custom Mood',
        color: colorHex,
        bg: cat.color,
        icon: IconComp,
      }
    })

  const moods = [...predefinedMoods, ...newCustomMoods].filter(
    mood => !deletedMoods.includes(mood.key)
  )

  const [editingMood, setEditingMood] = useState(null)
  const [deletingMood, setDeletingMood] = useState(null)
  const [showMenu, setShowMenu] = useState(null)
  const [editForm, setEditForm] = useState({ label: '', description: '', color: '', icon: null })

  const isMoodLocked = moodKey => {
    if (hasUnlimitedMoods) return false
    return !FREE_MOODS.includes(moodKey)
  }

  const handleMoodSelect = moodKey => {
    if (isMoodLocked(moodKey)) {
      setShowUpgradeModal(true)
      return
    }
    resetRangeSelection()
    setSelectedColor(selectedColor === moodKey ? null : moodKey)
  }

  // Mouse drag scrolling for desktop
  const handleMouseDown = e => {
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = e => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleSaveEdit = e => {
    if (e) e.stopPropagation()
    if (!editForm.label.trim()) return
    updateCustomMood(editingMood, {
      label: editForm.label.trim(),
      description: editForm.description.trim(),
      color: editForm.color.hex,
      bg: editForm.color.bg,
      lightBg: editForm.color.light,
      darkBg: editForm.color.dark,
      iconName: editForm.icon.name,
    })
    setEditingMood(null)
    setEditForm({ label: '', description: '', color: '', icon: null })
  }

  const handleCancelEdit = e => {
    if (e) e.stopPropagation()
    setEditingMood(null)
    setEditForm({ label: '', description: '', color: '', icon: null })
  }

  const confirmDelete = () => {
    if (deletingMood) {
      deleteMood(deletingMood)
      setDeletingMood(null)
    }
  }

  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(null)
    }
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  useEffect(() => {
    const handleEscKey = e => {
      if (e.key === 'Escape' && editingMood) handleCancelEdit()
    }
    if (editingMood) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [editingMood])

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2
          className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}
        >
          Paint Your Life
        </h2>
        <div className="flex items-center gap-2">
          {/* Range mode indicator */}
          {isInRangeMode && rangeStart !== null && (
            <button
              onClick={resetRangeSelection}
              className={`px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <span>Click 2nd square</span>
              <Icons.X className="w-3 h-3" />
            </button>
          )}
          {/* Milestone mode indicator */}
          {isMilestoneMode && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              <div className="w-2 h-2 bg-yellow-400 rotate-45 animate-pulse" />
              <span>Click square to mark</span>
            </div>
          )}
          {/* Selected color indicator */}
          {selectedColor && !isMilestoneMode && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {selectedColor === 'none' ? (
                <>
                  <Icons.Eraser className="w-3 h-3" />
                  <span>Erasing</span>
                </>
              ) : (
                <>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: moods.find(m => m.key === selectedColor)?.color }}
                  />
                  <span>{moods.find(m => m.key === selectedColor)?.label}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stories-style horizontal scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-1 scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Add New */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <CustomMoodCreator
            darkMode={darkMode}
            onAddCustomMood={onAddCustomMood}
            customMoodsCount={Object.keys(customCategories || {}).length}
            storyStyle={true}
          />
          <span
            className={`text-[10px] sm:text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Add
          </span>
        </div>

        {/* Mark Milestone */}
        <ActionCircle
          icon={<div className={`w-2.5 h-2.5 ${isMilestoneMode ? 'bg-yellow-300' : 'bg-yellow-400'} rotate-45 shadow-sm`} />}
          label="Mark"
          isActive={isMilestoneMode}
          darkMode={darkMode}
          onClick={onToggleMilestone}
          gradientColors="#fbbf24, #f59e0b, #fbbf24"
        />

        {/* Eraser */}
        <ActionCircle
          icon={
            <Icons.Eraser
              className={`w-4 h-4 ${selectedColor === 'none' ? 'text-white' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
            />
          }
          label="Erase"
          isActive={selectedColor === 'none'}
          darkMode={darkMode}
          onClick={() => handleMoodSelect('none')}
          gradientColors="#64748b, #475569, #64748b"
        />

        {/* Divider */}
        <div
          className={`w-px h-12 sm:h-14 self-center flex-shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
        />

        {/* Mood Stories */}
        {moods.map(mood => (
          <StoryCircle
            key={mood.key}
            mood={mood}
            isActive={selectedColor === mood.key}
            isLocked={isMoodLocked(mood.key)}
            darkMode={darkMode}
            onClick={() => handleMoodSelect(mood.key)}
            onLongPress={() => {
              if (!isMoodLocked(mood.key)) {
                setEditingMood(mood.key)
                setEditForm({
                  label: mood.label,
                  description: mood.description || '',
                  color: mood.color,
                  bg: mood.bg,
                  iconName: mood.icon.displayName || 'Star',
                })
              }
            }}
          />
        ))}
      </div>

      {/* Scroll hint for mobile */}
      <p
        className={`text-[10px] text-center sm:hidden ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
      >
        ← Swipe to see more →
      </p>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Additional moods"
      />

      {/* Edit Modal */}
      {editingMood &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999 }}
            onMouseDown={e => {
              if (e.target === e.currentTarget) handleCancelEdit(e)
            }}
          >
            <div
              className={`relative w-full max-w-lg my-8 rounded-xl shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              style={{ zIndex: 100000 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Edit Mood
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                  >
                    <Icons.X
                      className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                    />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Mood Name
                  </label>
                  <input
                    type="text"
                    value={editForm.label}
                    onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 text-slate-900 border-slate-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g., Happy, Focused..."
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 text-slate-900 border-slate-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g., Joyful moments..."
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Color
                  </label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {AVAILABLE_COLORS.map(color => (
                      <button
                        key={color.hex}
                        onClick={() => setEditForm({ ...editForm, color })}
                        className={`relative w-full aspect-square rounded-full transition-all ${color.bg} ${editForm.color?.hex === color.hex ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:scale-105'} ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-white'}`}
                        title={color.name}
                      >
                        {editForm.color?.hex === color.hex && (
                          <Icons.Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Icon
                  </label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {AVAILABLE_ICONS.map(iconItem => {
                      const IconComp = iconItem.component
                      return (
                        <button
                          key={iconItem.name}
                          onClick={() => setEditForm({ ...editForm, icon: iconItem })}
                          className={`relative w-full aspect-square rounded-full transition-all flex items-center justify-center ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} ${editForm.icon?.name === iconItem.name ? 'ring-2 ring-blue-500' : 'hover:scale-105'}`}
                          title={iconItem.name}
                        >
                          <IconComp
                            className={`w-3.5 h-3.5 ${editForm.icon?.name === iconItem.name ? 'text-blue-500' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Preview
                  </label>
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="p-[3px] rounded-full"
                        style={{
                          background: `linear-gradient(45deg, ${editForm.color?.hex || '#a855f7'}, ${editForm.color?.hex || '#a855f7'}cc)`,
                        }}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
                        >
                          <div
                            className="w-13 h-13 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: editForm.color?.hex || '#a855f7' }}
                          >
                            {editForm.icon &&
                              React.createElement(editForm.icon.component, {
                                className: 'w-6 h-6 text-white',
                              })}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}
                      >
                        {editForm.label || 'Mood Name'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 border-t flex gap-2 justify-end ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <button
                  onClick={handleCancelEdit}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editForm.label.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editForm.label.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {deletingMood &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[99999]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onMouseDown={e => {
              if (e.target === e.currentTarget) setDeletingMood(null)
            }}
          >
            <div
              className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Delete Mood?
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Are you sure you want to delete this custom mood? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeletingMood(null)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
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

export default ModernMoodPalette
