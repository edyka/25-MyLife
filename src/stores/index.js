/**
 * Memento Vivere - Store Index
 * Centralized exports for all Zustand stores
 */

export { useLifeStore } from './useLifeStore';
export { useMilestoneStore } from './useMilestoneStore';
export { useSelectionStore } from './useSelectionStore';
export { useUIStore } from './useUIStore';

// Note: Selector wrapper functions removed for better performance
// Use direct store subscriptions instead: useStore(state => state.property)

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

// For better performance, import stores directly and use individual selectors:
// Example: const birthYear = useLifeStore(state => state.birthYear);