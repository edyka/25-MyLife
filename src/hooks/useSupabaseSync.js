import { useEffect, useRef } from "react";
import { auth, database } from "../lib/supabase";

export const useSupabaseSync = (milestones, customMoods, customCategories, selectedWeeks, pinnedWeeks, selectedColor, goals) => {
  // Use refs to track timeouts for proper cleanup
  const milestonesTimeoutRef = useRef(null);
  const selectionsTimeoutRef = useRef(null);
  const goalsTimeoutRef = useRef(null);

  // Sync milestones, customMoods, and customCategories
  useEffect(() => {
    // Clear any pending timeout
    if (milestonesTimeoutRef.current) {
      clearTimeout(milestonesTimeoutRef.current);
    }

    const authStatus = localStorage.getItem('viventiva_authenticated');
    if (authStatus !== 'true') return;

    milestonesTimeoutRef.current = setTimeout(async () => {
      try {
        const { user } = await auth.getCurrentUser();
        if (!user) return;

        const milestoneData = {
          milestones: milestones || {},
          customMoods: customMoods || {},
          customCategories: customCategories || {}
        };

        const { error } = await database.saveMilestones(user.id, milestoneData);
        if (error) {
          console.error('[Viventiva Sync] Error saving milestones:', error);
          try {
            const { toast } = await import('../utils/toast');
            const { getUserFriendlyError } = await import('../utils/errorMessages');
            toast.error(`Failed to save: ${getUserFriendlyError(error)}`);
          } catch { /* ignore toast errors */ }
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing milestones:', error);
      }
    }, 500);

    // Cleanup function - this now properly clears the timeout
    return () => {
      if (milestonesTimeoutRef.current) {
        clearTimeout(milestonesTimeoutRef.current);
      }
    };
  }, [milestones, customMoods, customCategories]);

  // Sync selections
  useEffect(() => {
    // Clear any pending timeout
    if (selectionsTimeoutRef.current) {
      clearTimeout(selectionsTimeoutRef.current);
    }

    const authStatus = localStorage.getItem('viventiva_authenticated');
    if (authStatus !== 'true') return;

    selectionsTimeoutRef.current = setTimeout(async () => {
      try {
        const { user } = await auth.getCurrentUser();
        if (!user) return;

        const selectionsData = {
          selectedWeeks: Array.from(selectedWeeks || new Set()),
          pinnedWeeks: Array.from(pinnedWeeks || new Set()),
          selectedColor: selectedColor
        };

        const { error } = await database.saveSelections(user.id, selectionsData);
        if (error) {
          console.error('[Viventiva Sync] Error saving selections:', error);
          try {
            const { toast } = await import('../utils/toast');
            const { getUserFriendlyError } = await import('../utils/errorMessages');
            toast.error(`Failed to save selections: ${getUserFriendlyError(error)}`);
          } catch { /* ignore toast errors */ }
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing selections:', error);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (selectionsTimeoutRef.current) {
        clearTimeout(selectionsTimeoutRef.current);
      }
    };
  }, [selectedWeeks, pinnedWeeks, selectedColor]);

  // Sync goals
  useEffect(() => {
    // Clear any pending timeout
    if (goalsTimeoutRef.current) {
      clearTimeout(goalsTimeoutRef.current);
    }

    const authStatus = localStorage.getItem('viventiva_authenticated');
    if (authStatus !== 'true') return;

    goalsTimeoutRef.current = setTimeout(async () => {
      try {
        const { user } = await auth.getCurrentUser();
        if (!user) return;

        const { error } = await database.saveGoals(user.id, goals);
        if (error) {
          console.error('[Viventiva Sync] Error saving goals:', error);
          try {
            const { toast } = await import('../utils/toast');
            const { getUserFriendlyError } = await import('../utils/errorMessages');
            toast.error(`Failed to save goals: ${getUserFriendlyError(error)}`);
          } catch { /* ignore toast errors */ }
        }
      } catch (error) {
        console.error('[Viventiva Sync] Error syncing goals:', error);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (goalsTimeoutRef.current) {
        clearTimeout(goalsTimeoutRef.current);
      }
    };
  }, [goals]);
};
