/**
 * Memento Vivere - Store Index
 * Centralized exports for all Zustand stores
 */

export { useLifeStore } from './useLifeStore';
export { useMilestoneStore } from './useMilestoneStore';
export { useSelectionStore } from './useSelectionStore';
export { useUIStore } from './useUIStore';

// Export optimized selectors
export { useLifeSelectors } from './useLifeStore';
export { useMilestoneSelectors } from './useMilestoneStore';
export { useSelectionSelectors } from './useSelectionStore';
export { useUISelectors } from './useUIStore';

/**
 * Store Documentation:
 * 
 * useLifeStore:
 * - Manages birth data, life expectancy, current week calculations
 * - Persisted to localStorage
 * - Contains computed helpers for age, quarters, total weeks
 * 
 * useMilestoneStore:
 * - Manages milestones, custom categories, and goals
 * - Persisted to localStorage  
 * - Provides category management and milestone filtering
 * 
 * useSelectionStore:
 * - Manages week selection, painting, dragging interactions
 * - Non-persistent (resets on page refresh)
 * - Handles range selection, rectangular selection, pinning
 * 
 * useUIStore:
 * - Manages theme, layout, navigation, device state
 * - Partially persisted (some UI state, not modals/device state)
 * - Auto-detects system theme and device capabilities
 */

// Convenience hook for commonly used store combinations
import { useLifeStore } from './useLifeStore';
import { useMilestoneStore } from './useMilestoneStore';
import { useSelectionStore } from './useSelectionStore';
import { useUIStore } from './useUIStore';

export const useMainAppStores = () => {
  const lifeStore = useLifeStore();
  const milestoneStore = useMilestoneStore();
  const selectionStore = useSelectionStore();
  const uiStore = useUIStore();
  
  return {
    life: lifeStore,
    milestones: milestoneStore,
    selection: selectionStore,
    ui: uiStore
  };
};