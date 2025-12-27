import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth, database } from '../lib/supabase';

/**
 * Debounce utility for Supabase syncs
 */
let syncTimeoutId = null;
const debouncedSync = (fn, delay = 2000) => {
  if (syncTimeoutId) clearTimeout(syncTimeoutId);
  syncTimeoutId = setTimeout(fn, delay);
};

/**
 * UI Store - Manages user interface state
 * Handles theme, layout, navigation, and device-specific settings
 */
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme and appearance
      darkMode: false,

      // Layout and navigation
      currentTab: 'home',
      currentPage: 'main',
      showWeeks: true,

      // Device and responsive state
      isMobile: false,

      // Modal and overlay state
      showMobileColorSelection: false,
      showLifeInsights: false,
      showSettingsModal: false,
      showGoalModal: false,

      // Performance and animation preferences
      enableAnimations: true,
      enableVirtualization: true,

      // Grid display preferences
      gridLayout: 'standard', // 'standard', 'compact', 'quarterly'
      // Past weeks visualization: 'hatch' | 'corner' | 'none'
      pastWeekStyle: 'hatch',

      // Theme preset for accent gradients: 'emerald' | 'ocean' | 'sunset' | 'purple'
      themePreset: 'sunset',
      showCurrentWeekIndicator: true,
      showMilestoneIndicators: true,
      showAgeLabels: true,

      // Tooltip state
      tooltip: { visible: false, content: null, label: null, color: null },

      // Actions for theme
      setDarkMode: (darkMode) => {
        set({ darkMode });
        // Debounced sync to Supabase if user is logged in
        debouncedSync(() => get().syncSettingsToSupabase());
      },
      toggleDarkMode: () => {
        const { darkMode } = get();
        const newDarkMode = !darkMode;
        set({ darkMode: newDarkMode });
        // Debounced sync to Supabase if user is logged in
        debouncedSync(() => get().syncSettingsToSupabase());
      },

      // Actions for navigation
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setShowWeeks: (show) => set({ showWeeks: show }),

      // Actions for device state
      setIsMobile: (isMobile) => set({ isMobile }),

      // Actions for modals and overlays
      setShowMobileColorSelection: (show) => set({ showMobileColorSelection: show }),
      setShowLifeInsights: (show) => set({ showLifeInsights: show }),
      setShowSettingsModal: (show) => set({ showSettingsModal: show }),
      setShowGoalModal: (show) => set({ showGoalModal: show }),
      setTooltip: (tooltipData) => set({ tooltip: { ...get().tooltip, ...tooltipData } }),

      // Actions for preferences
      setEnableAnimations: (enable) => set({ enableAnimations: enable }),
      setEnableVirtualization: (enable) => set({ enableVirtualization: enable }),

      // Actions for grid display
      setGridLayout: (layout) => set({ gridLayout: layout }),
      setShowCurrentWeekIndicator: (show) => set({ showCurrentWeekIndicator: show }),
      setShowMilestoneIndicators: (show) => set({ showMilestoneIndicators: show }),
      setShowAgeLabels: (show) => set({ showAgeLabels: show }),
      setPastWeekStyle: (style) => set({ pastWeekStyle: style }),
      setThemePreset: (preset) => {
        set({ themePreset: preset });
        // Debounced sync to Supabase if user is logged in
        debouncedSync(() => get().syncSettingsToSupabase());
      },

      // Computed getters
      getThemeClasses: () => {
        const { darkMode } = get();
        return {
          bg: darkMode ? 'bg-gray-900' : 'bg-white',
          text: darkMode ? 'text-white' : 'text-gray-900',
          border: darkMode ? 'border-gray-700' : 'border-gray-200',
          hover: darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
        };
      },

      getLayoutClasses: () => {
        const { isMobile } = get();
        return {
          container: isMobile ? 'px-2 py-4' : 'px-6 py-8',
          grid: isMobile ? 'gap-1' : 'gap-2',
          text: isMobile ? 'text-sm' : 'text-base'
        };
      },

      // Accent helpers
      getAccentGradient: () => {
        const { themePreset } = get();
        if (themePreset === 'indigo') return 'from-indigo-500 to-violet-500';
        if (themePreset === 'cyan') return 'from-cyan-500 to-sky-600';
        return 'from-emerald-400 to-teal-500'; // mint default
      },
      getLightBgGradient: () => {
        const { themePreset } = get();
        if (themePreset === 'indigo') return 'from-indigo-50 via-violet-50 to-purple-50';
        if (themePreset === 'cyan') return 'from-sky-300 via-sky-400 to-blue-500';
        return 'from-emerald-50 via-teal-50 to-green-50';
      },

      // Initialize device detection
      initializeDeviceDetection: () => {
        if (typeof window !== 'undefined') {
          const checkMobile = () => {
            get().setIsMobile(window.innerWidth < 768);
          };

          checkMobile();
          window.addEventListener('resize', checkMobile);

          return () => window.removeEventListener('resize', checkMobile);
        }
      },

      // Auto-detect system theme preference
      initializeTheme: () => {
        if (typeof window !== 'undefined' && window.matchMedia) {
          const { darkMode } = get();

          // If no preference is stored, use system preference
          if (darkMode === null || darkMode === undefined) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            set({ darkMode: systemPrefersDark });
          }

          // Listen for system theme changes
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = (e) => {
            // Only auto-update if user hasn't explicitly set a preference
            // This could be enhanced with a separate "auto" setting
            set({ darkMode: e.matches });
          };

          if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
          } else if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
          }
        }
      },

      // Close all modals
      closeAllModals: () => {
        set({
          showMobileColorSelection: false,
          showLifeInsights: false,
          showSettingsModal: false,
          showGoalModal: false
        });
      },

      // Sync settings to Supabase
      syncSettingsToSupabase: async () => {
        try {
          const { user } = await auth.getCurrentUser();

          if (user) {
            const state = get();
            const settings = {
              darkMode: state.darkMode,
              themePreset: state.themePreset,
              gridLayout: state.gridLayout,
              pastWeekStyle: state.pastWeekStyle,
              showCurrentWeekIndicator: state.showCurrentWeekIndicator,
              showMilestoneIndicators: state.showMilestoneIndicators,
              showAgeLabels: state.showAgeLabels,
              enableAnimations: state.enableAnimations,
              enableVirtualization: state.enableVirtualization
            };

            await database.saveUserSettings(user.id, settings);
            console.log('[Viventiva] Settings synced to Supabase');
          }
        } catch (error) {
          console.error('[Viventiva] Error syncing settings to Supabase:', error);
        }
      },

      // Load settings from Supabase
      loadSettingsFromSupabase: async () => {
        try {
          const { user } = await auth.getCurrentUser();

          if (user) {
            const { data, error } = await database.getUserSettings(user.id);

            if (data && data.settings_data && !error) {
              const settings = data.settings_data;

              // Update store with settings from Supabase
              set({
                darkMode: settings.darkMode ?? get().darkMode,
                themePreset: settings.themePreset ?? get().themePreset,
                gridLayout: settings.gridLayout ?? get().gridLayout,
                pastWeekStyle: settings.pastWeekStyle ?? get().pastWeekStyle,
                showCurrentWeekIndicator: settings.showCurrentWeekIndicator ?? get().showCurrentWeekIndicator,
                showMilestoneIndicators: settings.showMilestoneIndicators ?? get().showMilestoneIndicators,
                showAgeLabels: settings.showAgeLabels ?? get().showAgeLabels,
                enableAnimations: settings.enableAnimations ?? get().enableAnimations,
                enableVirtualization: settings.enableVirtualization ?? get().enableVirtualization
              });

              console.log('[Viventiva] Settings loaded from Supabase');
            }
          }
        } catch (error) {
          console.error('[Viventiva] Error loading settings from Supabase:', error);
        }
      }
    }),
    {
      name: 'memento-vivere-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        currentPage: state.currentPage,
        currentTab: state.currentTab,
        showWeeks: state.showWeeks,
        enableAnimations: state.enableAnimations,
        enableVirtualization: state.enableVirtualization,
        gridLayout: state.gridLayout,
        pastWeekStyle: state.pastWeekStyle,
        themePreset: state.themePreset,
        showCurrentWeekIndicator: state.showCurrentWeekIndicator,
        showMilestoneIndicators: state.showMilestoneIndicators,
        showAgeLabels: state.showAgeLabels
      })
    }
  )
);

// Optimized individual selectors for fine-grained subscriptions
// Use direct selectors instead of useUISelectors to prevent unnecessary re-renders
// Example: const darkMode = useUIStore(state => state.darkMode);

// Initialize theme and device detection on store creation
if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !/jsdom/i.test(navigator.userAgent || '')) {
  useUIStore.getState().initializeTheme();
  useUIStore.getState().initializeDeviceDetection();
}