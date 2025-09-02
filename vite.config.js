import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          // UI and animation libraries
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Utility libraries
          'utils-vendor': ['crypto-js', 'zod'],
          // Custom hooks (group together for better caching)
          'hooks': [
            './src/hooks/useWeekInteractions.js',
            './src/hooks/useKeyboardShortcuts.js',
            './src/hooks/useTouchGestures.js',
            './src/hooks/useAdvancedSelection.js',
            './src/hooks/useSelectionState.js'
          ],
          // Utilities (group together for better caching)
          'app-utils': [
            './src/utils/constants.js',
            './src/utils/dateUtils.js',
            './src/utils/storageUtils.js',
            './src/utils/validation.js',
            './src/utils/performanceMonitor.js',
            './src/utils/secureStorage.js'
          ]
        }
      }
    },
    // Enable minification with better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      }
    },
    // Generate source maps for debugging (but not in production)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Optimize chunk size
    chunkSizeWarningLimit: 300
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'react-window',
      'crypto-js',
      'zod'
    ],
    // Exclude large dependencies from pre-bundling to reduce initial bundle size
    exclude: ['@testing-library/jest-dom', '@testing-library/react']
  },
  // Enable CSS code splitting for better caching
  css: {
    devSourcemap: true
  },
  // Optimize asset handling
  assetsInclude: ['**/*.woff2', '**/*.png', '**/*.jpg', '**/*.svg']
})