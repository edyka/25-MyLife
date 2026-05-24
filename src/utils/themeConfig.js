// Theme configuration for different color variants
export const themeConfig = {
  emerald: {
    name: 'Emerald',
    // Stat cards gradients
    primary: 'from-emerald-500 to-teal-600',
    secondary: 'from-blue-500 to-cyan-600',
    tertiary: 'from-purple-500 to-pink-600',
    quaternary: 'from-rose-500 to-red-600',
    // Main accent colors
    accent: 'text-emerald-500',
    accentDark: 'text-emerald-400',
    // Progress bar
    progress: 'from-emerald-500 via-teal-500 to-cyan-500',
    progressGlow: 'from-emerald-400',
    // Icons & UI elements
    iconBg: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    // Onboarding & Setup pages
    onboarding: 'from-emerald-500 to-teal-600',
    onboardingLight: 'from-emerald-400 to-teal-500',
    onboardingBorder: 'border-emerald-400 focus:border-emerald-500',
    // State colors
    error: 'from-red-500 to-red-600',
    errorBg: 'bg-red-50 border-red-200',
    errorText: 'text-red-600',
    loading: 'from-emerald-400 to-teal-500',
    loadingSpinner: 'border-emerald-500',
    success: 'from-emerald-600 to-green-600',
    successBg: 'bg-emerald-50 border-emerald-200',
    successText: 'text-emerald-600',
    warning: 'from-amber-500 to-orange-500',
    warningBg: 'bg-amber-50 border-amber-200',
    warningText: 'text-amber-600',
    // Form elements
    formFocus: 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20',
    formError: 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
    formSuccess: 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20',
    inputBg: 'bg-white focus:bg-emerald-50/30',
    buttonPrimary:
      'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
    buttonSecondary: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    // Hex colors for inline styles
    colors: {
      primary: '#10b981',
      secondary: '#14b8a6',
      error: '#ef4444',
      success: '#059669',
      warning: '#f59e0b',
      loading: '#6ee7b7',
    },
    // Accent UI utilities (static class strings safe from Tailwind purge)
    accentBg: 'bg-emerald-100',
    accentBgDark: 'bg-emerald-500/20',
    accentBgMuted: 'bg-emerald-500/10',
    accentBgDeep: 'bg-emerald-900/30',
    accentText300: 'text-emerald-300',
    accentText600: 'text-emerald-600',
    accentBorder200: 'border-emerald-200',
    accentBorder300: 'border-emerald-300',
    accentBorder200_40: 'border-emerald-200/40',
    accentBorder300_20: 'border-emerald-300/20',
    accentBorder500_20: 'border-emerald-500/20',
    accentBorder500_30: 'border-emerald-500/30',
    accentBorder500_50: 'border-emerald-500/50',
    accentShadowSm: 'shadow-emerald-500/5',
    accentShadowMd: 'shadow-emerald-500/10',
    accentShadowLg: 'shadow-emerald-500/20',
    accentRingLight: 'ring-emerald-400/30',
    accentRing: 'ring-emerald-500/20',
    focusRing: 'focus:ring-emerald-500',
    primaryFaded: 'from-emerald-500/10 to-teal-500/10',
    primaryLight: 'from-emerald-100 to-teal-100',
    primaryPastel: 'from-emerald-50 to-teal-50',
    primarySuperFaded: 'from-emerald-500/5 to-teal-600/5',
    primaryMuted: 'from-emerald-500 to-teal-600/20',
    tertiaryFaded: 'from-purple-500/10 to-pink-500/10',
    tertiaryLight: 'from-purple-100 to-pink-100',
  },
  ocean: {
    name: 'Ocean',
    // Stat cards gradients - blue theme
    primary: 'from-blue-500 to-cyan-600',
    secondary: 'from-cyan-500 to-teal-600',
    tertiary: 'from-sky-500 to-blue-600',
    quaternary: 'from-indigo-500 to-blue-600',
    // Main accent colors
    accent: 'text-blue-500',
    accentDark: 'text-blue-400',
    // Progress bar
    progress: 'from-blue-500 via-cyan-500 to-teal-500',
    progressGlow: 'from-blue-400',
    // Icons & UI elements
    iconBg: 'from-blue-500 to-cyan-600',
    shadow: 'shadow-blue-500/30',
    // Onboarding & Setup pages
    onboarding: 'from-blue-500 to-cyan-600',
    onboardingLight: 'from-blue-400 to-cyan-500',
    onboardingBorder: 'border-blue-400 focus:border-blue-500',
    // State colors
    error: 'from-red-500 to-red-600',
    errorBg: 'bg-red-50 border-red-200',
    errorText: 'text-red-600',
    loading: 'from-blue-400 to-cyan-500',
    loadingSpinner: 'border-blue-500',
    success: 'from-blue-600 to-cyan-600',
    successBg: 'bg-blue-50 border-blue-200',
    successText: 'text-blue-600',
    warning: 'from-amber-500 to-orange-500',
    warningBg: 'bg-amber-50 border-amber-200',
    warningText: 'text-amber-600',
    // Form elements
    formFocus: 'border-blue-400 focus:border-blue-500 focus:ring-blue-500/20',
    formError: 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
    formSuccess: 'border-blue-400 focus:border-blue-500 focus:ring-blue-500/20',
    inputBg: 'bg-white focus:bg-blue-50/30',
    buttonPrimary:
      'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    buttonSecondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    // Hex colors for inline styles
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      error: '#ef4444',
      success: '#0ea5e9',
      warning: '#f59e0b',
      loading: '#60a5fa',
    },
    // Accent UI utilities (static class strings safe from Tailwind purge)
    accentBg: 'bg-blue-100',
    accentBgDark: 'bg-blue-500/20',
    accentBgMuted: 'bg-blue-500/10',
    accentBgDeep: 'bg-blue-900/30',
    accentText300: 'text-blue-300',
    accentText600: 'text-blue-600',
    accentBorder200: 'border-blue-200',
    accentBorder300: 'border-blue-300',
    accentBorder200_40: 'border-blue-200/40',
    accentBorder300_20: 'border-blue-300/20',
    accentBorder500_20: 'border-blue-500/20',
    accentBorder500_30: 'border-blue-500/30',
    accentBorder500_50: 'border-blue-500/50',
    accentShadowSm: 'shadow-blue-500/5',
    accentShadowMd: 'shadow-blue-500/10',
    accentShadowLg: 'shadow-blue-500/20',
    accentRingLight: 'ring-blue-400/30',
    accentRing: 'ring-blue-500/20',
    focusRing: 'focus:ring-blue-500',
    primaryFaded: 'from-blue-500/10 to-cyan-500/10',
    primaryLight: 'from-blue-100 to-cyan-100',
    primaryPastel: 'from-blue-50 to-cyan-50',
    primarySuperFaded: 'from-blue-500/5 to-cyan-600/5',
    primaryMuted: 'from-blue-500 to-cyan-600/20',
    tertiaryFaded: 'from-sky-500/10 to-blue-500/10',
    tertiaryLight: 'from-sky-100 to-blue-100',
  },
  sunset: {
    name: 'Sunset',
    // Stat cards gradients - warm theme
    primary: 'from-orange-500 to-red-600',
    secondary: 'from-rose-500 to-pink-600',
    tertiary: 'from-amber-500 to-orange-600',
    quaternary: 'from-red-500 to-rose-600',
    // Main accent colors
    accent: 'text-orange-500',
    accentDark: 'text-orange-400',
    // Progress bar
    progress: 'from-orange-500 via-rose-500 to-pink-500',
    progressGlow: 'from-orange-400',
    // Icons & UI elements
    iconBg: 'from-orange-500 to-red-600',
    shadow: 'shadow-orange-500/30',
    // Onboarding & Setup pages
    onboarding: 'from-orange-500 to-red-600',
    onboardingLight: 'from-orange-400 to-red-500',
    onboardingBorder: 'border-orange-400 focus:border-orange-500',
    // State colors
    error: 'from-red-500 to-red-600',
    errorBg: 'bg-red-50 border-red-200',
    errorText: 'text-red-600',
    loading: 'from-orange-400 to-red-500',
    loadingSpinner: 'border-orange-500',
    success: 'from-orange-600 to-amber-600',
    successBg: 'bg-orange-50 border-orange-200',
    successText: 'text-orange-600',
    warning: 'from-amber-500 to-yellow-500',
    warningBg: 'bg-amber-50 border-amber-200',
    warningText: 'text-amber-600',
    // Form elements
    formFocus: 'border-orange-400 focus:border-orange-500 focus:ring-orange-500/20',
    formError: 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
    formSuccess: 'border-orange-400 focus:border-orange-500 focus:ring-orange-500/20',
    inputBg: 'bg-white focus:bg-orange-50/30',
    buttonPrimary:
      'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
    buttonSecondary: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    // Hex colors for inline styles
    colors: {
      primary: '#f97316',
      secondary: '#dc2626',
      error: '#ef4444',
      success: '#ea580c',
      warning: '#f59e0b',
      loading: '#fb923c',
    },
    // Accent UI utilities (static class strings safe from Tailwind purge)
    accentBg: 'bg-orange-100',
    accentBgDark: 'bg-orange-500/20',
    accentBgMuted: 'bg-orange-500/10',
    accentBgDeep: 'bg-orange-900/30',
    accentText300: 'text-orange-300',
    accentText600: 'text-orange-600',
    accentBorder200: 'border-orange-200',
    accentBorder300: 'border-orange-300',
    accentBorder200_40: 'border-orange-200/40',
    accentBorder300_20: 'border-orange-300/20',
    accentBorder500_20: 'border-orange-500/20',
    accentBorder500_30: 'border-orange-500/30',
    accentBorder500_50: 'border-orange-500/50',
    accentShadowSm: 'shadow-orange-500/5',
    accentShadowMd: 'shadow-orange-500/10',
    accentShadowLg: 'shadow-orange-500/20',
    accentRingLight: 'ring-orange-400/30',
    accentRing: 'ring-orange-500/20',
    focusRing: 'focus:ring-orange-500',
    primaryFaded: 'from-orange-500/10 to-red-500/10',
    primaryLight: 'from-orange-100 to-red-100',
    primaryPastel: 'from-orange-50 to-red-50',
    primarySuperFaded: 'from-orange-500/5 to-red-600/5',
    primaryMuted: 'from-orange-500 to-red-600/20',
    tertiaryFaded: 'from-amber-500/10 to-orange-500/10',
    tertiaryLight: 'from-amber-100 to-orange-100',
  },
  purple: {
    name: 'Purple',
    // Stat cards gradients - purple theme
    primary: 'from-purple-500 to-violet-600',
    secondary: 'from-fuchsia-500 to-pink-600',
    tertiary: 'from-violet-500 to-purple-600',
    quaternary: 'from-indigo-500 to-purple-600',
    // Main accent colors
    accent: 'text-purple-500',
    accentDark: 'text-purple-400',
    // Progress bar
    progress: 'from-purple-500 via-fuchsia-500 to-pink-500',
    progressGlow: 'from-purple-400',
    // Icons & UI elements
    iconBg: 'from-purple-500 to-violet-600',
    shadow: 'shadow-purple-500/30',
    // Onboarding & Setup pages
    onboarding: 'from-purple-500 to-violet-600',
    onboardingLight: 'from-purple-400 to-violet-500',
    onboardingBorder: 'border-purple-400 focus:border-purple-500',
    // State colors
    error: 'from-red-500 to-red-600',
    errorBg: 'bg-red-50 border-red-200',
    errorText: 'text-red-600',
    loading: 'from-purple-400 to-violet-500',
    loadingSpinner: 'border-purple-500',
    success: 'from-purple-600 to-violet-600',
    successBg: 'bg-purple-50 border-purple-200',
    successText: 'text-purple-600',
    warning: 'from-amber-500 to-orange-500',
    warningBg: 'bg-amber-50 border-amber-200',
    warningText: 'text-amber-600',
    // Form elements
    formFocus: 'border-purple-400 focus:border-purple-500 focus:ring-purple-500/20',
    formError: 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
    formSuccess: 'border-purple-400 focus:border-purple-500 focus:ring-purple-500/20',
    inputBg: 'bg-white focus:bg-purple-50/30',
    buttonPrimary:
      'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    buttonSecondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    // Hex colors for inline styles
    colors: {
      primary: '#a855f7',
      secondary: '#7c3aed',
      error: '#ef4444',
      success: '#9333ea',
      warning: '#f59e0b',
      loading: '#c084fc',
    },
    // Accent UI utilities (static class strings safe from Tailwind purge)
    accentBg: 'bg-purple-100',
    accentBgDark: 'bg-purple-500/20',
    accentBgMuted: 'bg-purple-500/10',
    accentBgDeep: 'bg-purple-900/30',
    accentText300: 'text-purple-300',
    accentText600: 'text-purple-600',
    accentBorder200: 'border-purple-200',
    accentBorder300: 'border-purple-300',
    accentBorder200_40: 'border-purple-200/40',
    accentBorder300_20: 'border-purple-300/20',
    accentBorder500_20: 'border-purple-500/20',
    accentBorder500_30: 'border-purple-500/30',
    accentBorder500_50: 'border-purple-500/50',
    accentShadowSm: 'shadow-purple-500/5',
    accentShadowMd: 'shadow-purple-500/10',
    accentShadowLg: 'shadow-purple-500/20',
    accentRingLight: 'ring-purple-400/30',
    accentRing: 'ring-purple-500/20',
    focusRing: 'focus:ring-purple-500',
    primaryFaded: 'from-purple-500/10 to-violet-500/10',
    primaryLight: 'from-purple-100 to-violet-100',
    primaryPastel: 'from-purple-50 to-violet-50',
    primarySuperFaded: 'from-purple-500/5 to-violet-600/5',
    primaryMuted: 'from-purple-500 to-violet-600/20',
    tertiaryFaded: 'from-violet-500/10 to-purple-500/10',
    tertiaryLight: 'from-violet-100 to-purple-100',
  },
}

export const getTheme = (preset = 'emerald') => {
  return themeConfig[preset] || themeConfig.emerald
}

// Utility functions for consistent theme application
export const getThemeColors = (preset = 'emerald') => {
  const theme = getTheme(preset)
  return {
    // Primary brand colors
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    // State colors
    error: theme.colors.error,
    success: theme.colors.success,
    warning: theme.colors.warning,
    loading: theme.colors.loading,
  }
}

// Form utility functions
export const getFormClasses = (preset = 'emerald', state = 'normal') => {
  const theme = getTheme(preset)
  const baseClasses = 'w-full px-4 py-3 rounded-xl border transition-all duration-200'

  switch (state) {
    case 'error':
      return `${baseClasses} ${theme.formError} ${theme.inputBg}`
    case 'success':
      return `${baseClasses} ${theme.formSuccess} ${theme.inputBg}`
    default:
      return `${baseClasses} ${theme.formFocus} ${theme.inputBg}`
  }
}

// Button utility functions
export const getButtonClasses = (preset = 'emerald', variant = 'primary') => {
  const theme = getTheme(preset)
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg'

  switch (variant) {
    case 'secondary':
      return `${baseClasses} ${theme.buttonSecondary}`
    default:
      return `${baseClasses} ${theme.buttonPrimary} text-white hover:scale-105`
  }
}

// State message utility functions
export const getStateClasses = (preset = 'emerald', state = 'success') => {
  const theme = getTheme(preset)
  const baseClasses = 'p-4 rounded-lg border'

  switch (state) {
    case 'error':
      return `${baseClasses} ${theme.errorBg} ${theme.errorText}`
    case 'warning':
      return `${baseClasses} ${theme.warningBg} ${theme.warningText}`
    default:
      return `${baseClasses} ${theme.successBg} ${theme.successText}`
  }
}

// Loading spinner utility
export const getLoadingSpinnerClasses = (preset = 'emerald') => {
  const theme = getTheme(preset)
  return `animate-spin rounded-full h-8 w-8 border-b-2 ${theme.loadingSpinner}`
}

// Onboarding page utilities
export const getOnboardingClasses = (preset = 'emerald', variant = 'main') => {
  const theme = getTheme(preset)

  switch (variant) {
    case 'light':
      return `bg-gradient-to-r ${theme.onboardingLight}`
    case 'border':
      return theme.onboardingBorder
    default:
      return `bg-gradient-to-r ${theme.onboarding}`
  }
}
