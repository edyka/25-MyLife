import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Calendar } from 'lucide-react';

const GoalTracker = ({ goals = [], setGoals, darkMode }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetWeek: '',
    category: 'personal'
  });

  const addGoal = () => {
    if (newGoal.title && newGoal.targetWeek) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        targetWeek: parseInt(newGoal.targetWeek),
        created: new Date().toISOString(),
        completed: false
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '', targetWeek: '', category: 'personal' });
      setShowAddGoal(false);
    }
  };

  const toggleGoal = (goalId) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  return (
    <div className={`rounded-2xl shadow-xl p-6 mb-6 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 shadow-gray-900/50' 
        : 'bg-white shadow-xl'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Target className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Life Goals
          </h2>
        </div>
        <motion.button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className={`p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder="Target week number"
                value={newGoal.targetWeek}
                onChange={(e) => setNewGoal({ ...newGoal, targetWeek: e.target.value })}
                className={`p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <textarea
              placeholder="Goal description (optional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className={`w-full mt-2 p-2 rounded border ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              rows={2}
            />
            <div className="flex gap-2 mt-3">
              <motion.button
                onClick={addGoal}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save Goal
              </motion.button>
              <motion.button
                onClick={() => setShowAddGoal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {goals.length === 0 ? (
          <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No goals set yet. Add your first life goal to get started!
          </p>
        ) : (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                goal.completed
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <h3 className={`font-medium ${
                      goal.completed 
                        ? 'line-through text-gray-500' 
                        : darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {goal.title}
                    </h3>
                  </div>
                  {goal.description && (
                    <p className={`text-sm mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {goal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Target: Week {goal.targetWeek} (Age {Math.floor((goal.targetWeek - 1) / 52)} years)
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalTracker;