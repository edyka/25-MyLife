import { useMemo, useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import {
  getEmotionalCategories,
  getRelationshipCategories,
  getExperienceCategories,
} from '../utils/constants'
import { useUIStore } from '../stores/useUIStore'
import { getTheme } from '../utils/themeConfig'

const MoodPalette = ({
  colorOptions,
  selectedColor,
  setSelectedColor,
  selectedWeeks,
  _setSelectedWeeks,
  pinnedWeeks = new Set(),
  _setPinnedWeeks = () => {},
  _lifeExpectancy,
  darkMode,
  onAddCustomMood,
  customCategories = {},
  isInRangeMode = false,
  rangeStart = null,
  resetRangeSelection = () => {},
  clearPinnedWeeks = () => {},
}) => {
  const themePreset = useUIStore(state => state.themePreset)
  const theme = getTheme(themePreset)

  const [showAddNew, setShowAddNew] = useState(false)
  const [newMoodLabel, setNewMoodLabel] = useState('')

  const handleColorSelect = colorKey => {
    resetRangeSelection()
    setSelectedColor(selectedColor === colorKey ? null : colorKey)
  }

  // Combine all categories including custom ones
  const allCats = useMemo(() => {
    const emotionalCategories = getEmotionalCategories()
    const relationshipCategories = getRelationshipCategories()
    const experienceCategories = getExperienceCategories()

    const combined = {
      ...emotionalCategories,
      ...relationshipCategories,
      ...experienceCategories,
      ...customCategories,
    }

    return combined
  }, [customCategories])

  const handleAddMood = () => {
    if (!newMoodLabel.trim()) return

    const name = newMoodLabel.toLowerCase().replace(/\s+/g, '')
    // Generate a random pastel color
    const colors = [
      'bg-purple-400',
      'bg-pink-400',
      'bg-blue-400',
      'bg-green-400',
      'bg-yellow-400',
      'bg-orange-400',
      'bg-red-400',
      'bg-teal-400',
      'bg-cyan-400',
      'bg-indigo-400',
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    onAddCustomMood(name, {
      label: newMoodLabel,
      color: randomColor,
      icon: colorOptions?.happy?.icon || (() => null), // Use a default icon
      name,
    })

    setNewMoodLabel('')
    setShowAddNew(false)
  }

  const hasActiveSelection = selectedColor || pinnedWeeks.size > 0 || selectedWeeks.size > 0

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
              border: `1px solid ${darkMode ? theme.colors.primary + '25' : theme.colors.primary + '20'}`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            {colorOptions?.[selectedColor]?.label || 'None'}
          </div>
        )}
      </div>

      {/* Ultra-Clean Color Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5">
        {/* Clear button */}
        <button
          onClick={() => handleColorSelect('none')}
          className={`group relative aspect-square rounded-lg transition-all duration-200 ${
            selectedColor === 'none'
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
                selectedColor === 'none'
                  ? 'text-red-500'
                  : darkMode
                    ? 'text-slate-500 group-hover:text-slate-300'
                    : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </div>
        </button>

        {/* All mood categories */}
        {Object.entries(allCats).map(([key, option]) => {
          const IconComponent = option?.icon
          if (!IconComponent || typeof IconComponent !== 'function') {
            return null
          }
          const isActive = selectedColor === key

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
                {IconComponent && <IconComponent className="w-4 h-4 text-white drop-shadow-md" />}
                <span className="text-[10px] font-semibold text-white drop-shadow-md leading-none">
                  {option.label}
                </span>
              </div>
            </button>
          )
        })}

        {/* Add new mood - inline */}
        {!showAddNew ? (
          <button
            onClick={() => setShowAddNew(true)}
            className={`group relative aspect-square rounded-lg border-2 border-dashed transition-all duration-200 ${
              darkMode
                ? 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Plus className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          </button>
        ) : (
          <div
            className={`col-span-full p-3 rounded-lg border-2 ${
              darkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
            }`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mood name..."
                value={newMoodLabel}
                onChange={e => setNewMoodLabel(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddMood()}
                autoFocus
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                } border focus:outline-none focus:ring-2 ${theme.focusRing}`}
              />
              <button
                onClick={handleAddMood}
                disabled={!newMoodLabel.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  newMoodLabel.trim()
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowAddNew(false)
                  setNewMoodLabel('')
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selection Info - Only show when needed, ultra-subtle */}
      {hasActiveSelection && (
        <div
          className={`p-3 rounded-xl flex items-center justify-between border ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedColor && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor:
                    selectedColor === 'none'
                      ? darkMode
                        ? '#ef444420'
                        : '#fef2f2'
                      : `${theme.colors.primary}20`,
                }}
              >
                {(() => {
                  const IconComponent =
                    selectedColor === 'none' ? X : colorOptions?.[selectedColor]?.icon || X
                  return (
                    <IconComponent
                      className="w-4 h-4"
                      style={{
                        color: selectedColor === 'none' ? '#ef4444' : theme.colors.primary,
                      }}
                    />
                  )
                })()}
              </div>
            )}
            <div>
              <p
                className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}
              >
                {isInRangeMode
                  ? `Week ${rangeStart} → ?`
                  : selectedColor === 'none'
                    ? 'Clear mode'
                    : 'Paint mode'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {isInRangeMode
                  ? 'Click end week'
                  : selectedColor === 'none'
                    ? 'Click to erase'
                    : 'Click start & end'}
              </p>
            </div>
          </div>

          {(pinnedWeeks.size > 0 || selectedWeeks.size > 0) && (
            <button
              onClick={() => {
                clearPinnedWeeks()
                resetRangeSelection()
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-white/10 hover:bg-white/15 text-slate-300'
                  : 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-700'
              }`}
            >
              Clear ({pinnedWeeks.size || selectedWeeks.size})
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MoodPalette
