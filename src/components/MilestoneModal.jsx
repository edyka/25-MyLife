import { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Save, Trash2, Calendar } from 'lucide-react';
import { getYearFromWeek } from '../utils/dateUtils';
import { useUIStore } from '../stores/useUIStore';
import { usePremiumStore } from '../stores/usePremiumStore';
import { getTheme } from '../utils/themeConfig';

const MilestoneModal = memo(({
  isOpen,
  onClose,
  weekNum,
  milestone,
  onSave,
  onDelete,
  allCategories = {}
}) => {
  const darkMode = useUIStore((state) => state.darkMode);
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);
  const hasMilestones = usePremiumStore((state) => state.hasFeature('milestones'));

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [description, setDescription] = useState('');
  const [isMilestoneFlag, setIsMilestoneFlag] = useState(false);

  // Reset form when opening with new data
  useEffect(() => {
    if (isOpen && milestone) {
      setTitle(milestone.title || '');
      setCategory(milestone.category || 'personal');
      setDescription(milestone.description || '');
      setIsMilestoneFlag(milestone.isMilestone || false);
    } else if (isOpen) {
      setTitle('');
      setCategory('personal');
      setDescription('');
      setIsMilestoneFlag(false);
    }
  }, [isOpen, milestone]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      category,
      description: description.trim(),
      isMilestone: isMilestoneFlag,
      weekNum
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(weekNum);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  const ageYears = Math.floor(weekNum / 52);
  const ageWeeks = weekNum % 52;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.primary}`}>
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {milestone ? 'Edit Milestone' : 'Add Milestone'}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Week {weekNum} · Age {ageYears} years, {ageWeeks} weeks
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Title Input */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What happened this week?"
                autoFocus
                className={`w-full px-3 py-2.5 rounded-xl border transition-all ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
            </div>

            {/* Category Select */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Mood / Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(allCategories).slice(0, 8).map(([key, cat]) => {
                  const isSelected = category === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? `${cat.color} border-white shadow-lg scale-105`
                          : darkMode
                            ? 'bg-slate-700 border-slate-600 hover:border-slate-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${cat.color}`} />
                      <span className={`text-[10px] font-medium truncate w-full text-center ${
                        isSelected ? 'text-white' : darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this moment..."
                rows={3}
                className={`w-full px-3 py-2.5 rounded-xl border transition-all resize-none ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
            </div>

            {/* Milestone Flag Toggle */}
            {hasMilestones && (
              <div className={`flex items-center justify-between p-3 rounded-xl ${
                darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Mark as important milestone
                  </span>
                </div>
                <button
                  onClick={() => setIsMilestoneFlag(!isMilestoneFlag)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isMilestoneFlag
                      ? `bg-gradient-to-r ${theme.primary}`
                      : darkMode ? 'bg-slate-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isMilestoneFlag ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between p-4 border-t ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            {milestone ? (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-white transition-all ${
                  title.trim()
                    ? `bg-gradient-to-r ${theme.primary} hover:shadow-lg`
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
});

MilestoneModal.displayName = 'MilestoneModal';

export default MilestoneModal;
