import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Life Store - Manages core life data
 * Handles birth information, life expectancy, and current week calculations
 */
export const useLifeStore = create(
  persist(
    (set, get) => ({
      // Birth data
      birthDay: null,
      birthMonth: null, 
      birthYear: null,
      lifeExpectancy: 80,
      
      // Computed current week
      currentWeek: 1,
      
      // Actions
      setBirthData: (day, month, year) => {
        set({ birthDay: day, birthMonth: month, birthYear: year });
        // Automatically recalculate current week when birth data changes
        get().calculateCurrentWeek();
      },
      
      setLifeExpectancy: (expectancy) => set({ lifeExpectancy: expectancy }),
      
      calculateCurrentWeek: () => {
        const { birthYear, birthMonth, birthDay } = get();
        if (!birthYear || !birthMonth || !birthDay) {
          set({ currentWeek: 1 });
          return 1;
        }
        
        const birth = new Date(
          parseInt(birthYear),
          parseInt(birthMonth) - 1,
          parseInt(birthDay)
        );
        const now = new Date();
        const diffTime = Math.abs(now - birth);
        const currentWeek = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
        
        set({ currentWeek });
        return currentWeek;
      },
      
      // Computed getters
      getTotalWeeks: () => {
        const { lifeExpectancy } = get();
        return lifeExpectancy * 52;
      },
      
      getAgeFromWeek: (weekNumber) => {
        return Math.floor((weekNumber - 1) / 52);
      },
      
      getQuarterFromWeek: (weekNumber) => {
        const weekInYear = ((weekNumber - 1) % 52) + 1;
        return Math.ceil(weekInYear / 13);
      },
      
      // Initialize current week on store creation
      initialize: () => {
        get().calculateCurrentWeek();
      }
    }),
    {
      name: 'memento-vivere-life',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        birthDay: state.birthDay,
        birthMonth: state.birthMonth,
        birthYear: state.birthYear,
        lifeExpectancy: state.lifeExpectancy
      })
    }
  )
);

// Initialize current week calculation on app start
useLifeStore.getState().initialize();