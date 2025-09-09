/** @type {import('tailwindcss').Config} */
export default {
  // Optimize content scanning for better performance
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Extract classes from dynamic content
    extract: {
      extensions: ['html', 'js', 'ts', 'jsx', 'tsx'],
    },
    // Optimize safelist for dynamic classes
    safelist: [
      // Common dynamic classes used in the app
      'bg-red-500', 'border-red-700',
      'bg-gray-600', 'border-gray-500',
      'bg-gray-700', 'border-gray-600',
      'bg-white', 'border-gray-300',
      'text-gray-400', 'text-gray-600',
      'ring-blue-500', 'ring-purple-500',
      'ring-yellow-400', 'ring-blue-400',
      // Theme classes
      'dark:bg-gray-700', 'dark:border-gray-600',
      'dark:bg-gray-600', 'dark:border-gray-500',
      'dark:text-gray-400', 'dark:text-gray-600',
      // Grid layouts
      'grid-cols-12', 'grid-cols-52',
      // Mobile responsive classes
      'sm:mr-2', 'sm:mr-1', 'sm:w-8', 'sm:w-5',
      'sm:text-[10px]',
    ],
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '52': 'repeat(52, minmax(0, 1fr))', // For weekly grid
      },
      // Optimize spacing for performance
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Optimize font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    // Disable unused core plugins to reduce bundle size
    preflight: true,
    container: false,
    accessibility: true,
    pointerEvents: true,
    visibility: true,
    position: true,
    inset: true,
    isolation: false,
    zIndex: true,
    order: true,
    gridColumn: true,
    gridColumnStart: true,
    gridColumnEnd: true,
    gridRow: true,
    gridRowStart: true,
    gridRowEnd: true,
    float: false,
    clear: false,
    objectFit: false,
    objectPosition: false,
    overflow: true,
    overscrollBehavior: false,
    scrollBehavior: false,
    scrollMargin: false,
    scrollPadding: false,
    listStyleType: false,
    appearance: false,
    columns: false,
    breakBefore: false,
    breakInside: false,
    breakAfter: false,
    gridAutoColumns: false,
    gridAutoFlow: false,
    gridAutoRows: false,
    gridTemplateColumns: true,
    gridTemplateRows: false,
    flexDirection: true,
    flexWrap: true,
    placeContent: false,
    placeItems: false,
    alignContent: false,
    alignItems: true,
    justifyContent: true,
    justifyItems: false,
    gap: true,
    space: false,
    divideWidth: false,
    divideColor: false,
    divideStyle: false,
    divideOpacity: false,
    placeSelf: false,
    alignSelf: true,
    justifySelf: false,
    fontFamily: true,
    fontSize: true,
    fontWeight: true,
    lineHeight: true,
    letterSpacing: false,
    textAlign: true,
    textDecoration: true,
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textUnderlineOffset: false,
    fontStyle: false,
    textTransform: false,
    textOverflow: false,
    verticalAlign: false,
    whiteSpace: false,
    wordBreak: false,
    hyphens: false,
    content: false,
  },
  // Experimental features for better performance
  experimental: {
    optimizeUniversalDefaults: true,
  },
}