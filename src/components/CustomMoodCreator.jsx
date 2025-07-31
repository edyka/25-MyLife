import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Palette, Save, X, Heart, Smile, Sun, Star, Target, Zap } from 'lucide-react';

const CustomMoodCreator = ({ darkMode, onAddCustomMood }) => {
  const [showCreator, setShowCreator] = useState(false);
  const [newMood, setNewMood] = useState({
    name: '',
    label: '',
    color: 'bg-purple-400',
    icon: 'Heart'
  });

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
    { value: 'bg-violet-400', name: 'Violet', preview: '#a78bfa' }
  ];

  // Available icons
  const availableIcons = {
    Heart: { component: Heart, name: 'Heart' },
    Smile: { component: Smile, name: 'Smile' },
    Sun: { component: Sun, name: 'Sun' },
    Star: { component: Star, name: 'Star' },
    Target: { component: Target, name: 'Target' },
    Zap: { component: Zap, name: 'Zap' }
  };

  const handleSave = () => {
    if (newMood.name && newMood.label) {
      const customMood = {
        ...newMood,
        icon: availableIcons[newMood.icon].component
      };
      onAddCustomMood(newMood.name, customMood);
      setNewMood({ name: '', label: '', color: 'bg-purple-400', icon: 'Heart' });
      setShowCreator(false);
    }
  };

  const SelectedIcon = availableIcons[newMood.icon].component;

  return (
    <div>
      {/* Add Custom Mood Button */}
      <motion.button
        onClick={() => setShowCreator(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
          darkMode 
            ? 'border-gray-500 bg-gray-700 hover:border-gray-400 hover:bg-gray-600 text-gray-300' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 text-gray-600'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Add Custom Mood</span>
      </motion.button>

      {/* Custom Mood Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreator(false)}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl p-6 w-full max-w-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Palette className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
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
                {/* Mood Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mood Name (internal identifier)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., peaceful, inspired, grateful"
                    value={newMood.name}
                    onChange={(e) => setNewMood({ ...newMood, name: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Display Label */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Display Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Peaceful, Inspired, Grateful"
                    value={newMood.label}
                    onChange={(e) => setNewMood({ ...newMood, label: e.target.value })}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Choose Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {availableColors.map((color) => (
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(availableIcons).map(([key, iconData]) => {
                      const IconComp = iconData.component;
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
                          <IconComp className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Preview
                  </label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border-2 ${newMood.color} border-gray-300`}>
                    <SelectedIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {newMood.label || 'Your Custom Mood'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={handleSave}
                  disabled={!newMood.name || !newMood.label}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    !newMood.name || !newMood.label
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  whileHover={{ scale: (!newMood.name || !newMood.label) ? 1 : 1.02 }}
                  whileTap={{ scale: (!newMood.name || !newMood.label) ? 1 : 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Create Mood
                </motion.button>
                <motion.button
                  onClick={() => setShowCreator(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomMoodCreator;