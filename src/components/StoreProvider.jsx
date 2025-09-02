import { useEffect } from "react";
import { useLifeStore, useMilestoneStore, useUIStore } from "../stores";
import { loadFromLocalStorage } from "../utils/storageUtils";
import { loadTheme } from "../utils/themeUtils";

/**
 * StoreProvider - Initializes Zustand stores from localStorage
 * Provides a bridge between old localStorage format and new store structure
 */
const StoreProvider = ({ children }) => {
  const { setBirthData, setLifeExpectancy } = useLifeStore();
  const { setMilestones, setCustomCategories, setGoals } = useMilestoneStore();
  const { setDarkMode, setCurrentPage } = useUIStore();

  useEffect(() => {
    // Load existing data from localStorage
    const data = loadFromLocalStorage();
    
    if (data) {
      // Initialize Life Store
      if (data.birthDay && data.birthMonth && data.birthYear) {
        setBirthData(data.birthDay, data.birthMonth, data.birthYear);
      }
      if (data.lifeExpectancy) {
        setLifeExpectancy(data.lifeExpectancy);
      }

      // Initialize Milestone Store
      if (data.milestones) {
        setMilestones(data.milestones);
      }
      if (data.customCategories) {
        setCustomCategories(data.customCategories);
      }
      if (data.goals) {
        setGoals(data.goals);
      }

      // Initialize UI Store
      const savedTheme = loadTheme();
      if (savedTheme !== null) {
        setDarkMode(savedTheme);
      }

      // Set current page based on whether setup is complete
      const hasRequiredData = data.birthDay && data.birthMonth && data.birthYear && data.lifeExpectancy;
      setCurrentPage(hasRequiredData ? "main" : "setup");
    } else {
      // No saved data, start with setup
      setCurrentPage("setup");
      
      // Use system theme preference as default
      if (typeof window !== 'undefined') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
      }
    }
  }, [setBirthData, setLifeExpectancy, setMilestones, setCustomCategories, setGoals, setDarkMode, setCurrentPage]);

  return children;
};

export default StoreProvider;