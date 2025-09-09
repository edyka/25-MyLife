import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getColorOptions, getAllCategories } from '../utils/constants';

/**
 * Milestone Store - Manages milestones, categories, and goals
 * Handles all milestone-related state and custom categories
 */
export const useMilestoneStore = create(
  persist(
    (set, get) => ({
      // Core milestone data
      milestones: {},
      customCategories: {},
      goals: [],
      
      // Actions for milestones
      setMilestones: (milestones) => set({ milestones }),
      
      updateMilestone: (weekNumber, milestone) => {
        const { milestones } = get();
        set({
          milestones: {
            ...milestones,
            [weekNumber]: milestone
          }
        });
      },
      
      deleteMilestone: (weekNumber) => {
        const { milestones } = get();
        const newMilestones = { ...milestones };
        delete newMilestones[weekNumber];
        set({ milestones: newMilestones });
      },
      
      clearMilestones: () => set({ milestones: {} }),
      
      // Actions for custom categories
      setCustomCategories: (categories) => set({ customCategories: categories }),
      
      addCustomCategory: (key, category) => {
        const { customCategories } = get();
        set({
          customCategories: {
            ...customCategories,
            [key]: category
          }
        });
      },
      
      removeCustomCategory: (key) => {
        const { customCategories } = get();
        const newCategories = { ...customCategories };
        delete newCategories[key];
        set({ customCategories: newCategories });
      },
      
      // Actions for goals
      setGoals: (goals) => set({ goals }),
      
      addGoal: (goal) => {
        const { goals } = get();
        set({ goals: [...goals, goal] });
      },
      
      updateGoal: (index, updatedGoal) => {
        const { goals } = get();
        const newGoals = [...goals];
        newGoals[index] = updatedGoal;
        set({ goals: newGoals });
      },
      
      deleteGoal: (index) => {
        const { goals } = get();
        set({ goals: goals.filter((_, i) => i !== index) });
      },
      
      // Computed getters
      getColorOptions: () => {
        const { customCategories } = get();
        return getColorOptions(customCategories);
      },
      
      getAllCategories: () => {
        const { customCategories } = get();
        return getAllCategories(customCategories);
      },
      
      getMilestoneByWeek: (weekNumber) => {
        const { milestones } = get();
        return milestones[weekNumber] || null;
      },
      
      getMilestonesByCategory: (category) => {
        const { milestones } = get();
        return Object.entries(milestones)
          .filter(([_, milestone]) => milestone?.category === category)
          .reduce((acc, [week, milestone]) => {
            acc[week] = milestone;
            return acc;
          }, {});
      },
      
      getMilestonesInRange: (startWeek, endWeek) => {
        const { milestones } = get();
        return Object.entries(milestones)
          .filter(([week]) => {
            const weekNum = parseInt(week);
            return weekNum >= startWeek && weekNum <= endWeek;
          })
          .reduce((acc, [week, milestone]) => {
            acc[week] = milestone;
            return acc;
          }, {});
      }
    }),
    {
      name: 'memento-vivere-milestones',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        milestones: state.milestones,
        customCategories: state.customCategories,
        goals: state.goals
      })
    }
  )
);

// Optimized selectors to prevent unnecessary re-renders
export const useMilestoneSelectors = () => {
  const store = useMilestoneStore();

  return {
    // Core data selectors
    milestones: store.milestones,
    customCategories: store.customCategories,
    goals: store.goals,

    // Computed selectors
    colorOptions: store.getColorOptions(),
    allCategories: store.getAllCategories(),

    // Actions
    setMilestones: store.setMilestones,
    updateMilestone: store.updateMilestone,
    deleteMilestone: store.deleteMilestone,
    clearMilestones: store.clearMilestones,
    setCustomCategories: store.setCustomCategories,
    addCustomCategory: store.addCustomCategory,
    removeCustomCategory: store.removeCustomCategory,
    setGoals: store.setGoals,
    addGoal: store.addGoal,
    updateGoal: store.updateGoal,
    deleteGoal: store.deleteGoal,
    getMilestoneByWeek: store.getMilestoneByWeek,
    getMilestonesByCategory: store.getMilestonesByCategory,
    getMilestonesInRange: store.getMilestonesInRange,
  };
};