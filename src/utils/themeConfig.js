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
    // Hex colors for inline styles
    colors: {
      primary: '#10b981',
      secondary: '#14b8a6',
    }
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
    // Hex colors for inline styles
    colors: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
    }
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
    // Hex colors for inline styles
    colors: {
      primary: '#f97316',
      secondary: '#dc2626',
    }
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
    // Hex colors for inline styles
    colors: {
      primary: '#a855f7',
      secondary: '#7c3aed',
    }
  }
};

export const getTheme = (preset = 'emerald') => {
  return themeConfig[preset] || themeConfig.emerald;
};