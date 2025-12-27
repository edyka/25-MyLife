import { memo } from 'react';
import { Plus, Edit3, X, Save, Lock } from 'lucide-react';
import { usePremiumStore } from '../stores/usePremiumStore';

const MilestonePanel = ({ 
  selectedWeek, 
  setSelectedWeek, 
  milestones, 
  setMilestones, 
  editingWeek, 
  setEditingWeek, 
  newMilestone, 
  setNewMilestone, 
  isMobile,
  darkMode,
  allCategories
}) => {
  const hasMilestones = usePremiumStore((state) => state.hasFeature('milestones'));
  const setShowUpgradeModal = usePremiumStore((state) => state.setShowUpgradeModal);

  const addMilestone = () => {
    if (selectedWeek !== null && newMilestone.title.trim()) {
      setMilestones(prev => ({
        ...prev,
        [selectedWeek]: { ...newMilestone, weekNum: selectedWeek }
      }));
      setNewMilestone({ title: '', category: 'personal', description: '' });
      setEditingWeek(null);
    }
  };

  const deleteMilestone = (weekNum) => {
    const updated = { ...milestones };
    delete updated[weekNum];
    setMilestones(updated);
    setSelectedWeek(null);
  };

  if (!isMobile && selectedWeek === null) {
    return (
      <div className={`w-full md:w-80 rounded-2xl shadow-xl p-4 md:p-6 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 shadow-gray-900/50' 
          : 'bg-white shadow-xl'
      }`}>
        <h3 className={`text-lg md:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Select a Week
        </h3>
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-sm">Click on any week to add milestones or view details</p>
        </div>
      </div>
    );
  }

  if ((!isMobile || selectedWeek !== null)) {
    return (
      <div className={`w-full md:w-80 rounded-2xl shadow-xl p-4 md:p-6 transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 shadow-gray-900/50' 
          : 'bg-white shadow-xl'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {selectedWeek !== null ? `Week ${selectedWeek}` : 'Select a Week'}
          </h3>
          {isMobile && selectedWeek !== null && (
            <button
              onClick={() => setSelectedWeek(null)}
              className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          )}
        </div>

        {selectedWeek !== null && (
          <div className="space-y-4">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Age: {Math.floor(selectedWeek / 52)} years, {selectedWeek % 52} weeks
            </div>

            {milestones[selectedWeek] ? (
              <div className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {milestones[selectedWeek].title}
                  </h4>
                  <div className="flex gap-2">
                    {hasMilestones && (
                      <button
                        onClick={() => setEditingWeek(selectedWeek)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMilestone(selectedWeek)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const category = allCategories[milestones[selectedWeek].category];
                    if (!category) return null;
                    const IconComponent = category.icon;
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {allCategories[milestones[selectedWeek].category]?.label || 'Unknown Category'}
                  </span>
                </div>
                
                {milestones[selectedWeek].description && (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {milestones[selectedWeek].description}
                  </p>
                )}
              </div>
            ) : hasMilestones ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Plus className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                <p className="text-sm">No milestone set</p>
                <button
                  onClick={() => setEditingWeek(selectedWeek)}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                >
                  Add Milestone
                </button>
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Lock className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                <p className="text-sm mb-2">Milestones are a Pro feature</p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}

            {editingWeek === selectedWeek && (
              <div className={`border-t pt-4 space-y-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                
                <select
                  value={newMilestone.category}
                  onChange={(e) => setNewMilestone({ ...newMilestone, category: e.target.value })}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {Object.entries(allCategories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
                
                <textarea
                  placeholder="Description (optional)"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  rows="3"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={addMilestone}
                    className="flex-1 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingWeek(null)}
                    className={`px-4 py-2 border rounded-lg transition-colors text-sm ${
                      darkMode 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default memo(MilestonePanel);