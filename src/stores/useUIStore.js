import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      currentTab: 'grid',
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
      themePreset: 'emerald',
      showCurrentWeekIndicator: true,
      showMilestoneIndicators: true,
      showAgeLabels: true,
      
      // Actions for theme
      setDarkMode: (darkMode) => set({ darkMode }),
      toggleDarkMode: () => {
        const { darkMode } = get();
        set({ darkMode: !darkMode });
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
      
      // Actions for preferences
      setEnableAnimations: (enable) => set({ enableAnimations: enable }),
      setEnableVirtualization: (enable) => set({ enableVirtualization: enable }),
      
      // Actions for grid display
      setGridLayout: (layout) => set({ gridLayout: layout }),
      setShowCurrentWeekIndicator: (show) => set({ showCurrentWeekIndicator: show }),
      setShowMilestoneIndicators: (show) => set({ showMilestoneIndicators: show }),
      setShowAgeLabels: (show) => set({ showAgeLabels: show }),
      setPastWeekStyle: (style) => set({ pastWeekStyle: style }),
      setThemePreset: (preset) => set({ themePreset: preset }),
      
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