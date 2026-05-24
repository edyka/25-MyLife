import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: '0.0.0.0',
    },
    build: {
      outDir: 'dist',
      // Optimize chunk size for better caching
      rollupOptions: {
        output: {
          manualChunks: id => {
            // Vendor chunks for better caching
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              // Zustand and state management
              if (id.includes('zustand')) {
                return 'zustand-vendor'
              }
              // UI libraries
              // Heavy single-purpose vendors get their own chunks so the main vendor stays small
              if (id.includes('framer-motion')) return 'framer-motion-vendor'
              if (id.includes('@supabase')) return 'supabase-vendor'
              if (id.includes('@sentry')) return 'sentry-vendor'
              if (id.includes('html-to-image')) return 'html-to-image-vendor'
              // @stripe/stripe-js is loaded lazily — let Vite chunk it dynamically
              if (id.includes('lucide-react')) {
                return 'ui-vendor'
              }
              // Utility libraries
              if (id.includes('crypto-js') || id.includes('zod')) {
                return 'utils-vendor'
              }
              // Other node_modules
              return 'vendor'
            }

            // Application chunks
            if (id.includes('/src/hooks/')) return 'app-hooks'
            if (id.includes('/src/stores/')) return 'app-stores'
            if (id.includes('/src/utils/')) return 'app-utils'

            if (id.includes('/src/components/')) {
              // Split large components into separate chunks
              if (id.includes('MainApp') || id.includes('VirtualizedWeekGrid'))
                return 'main-components'
              if (id.includes('SetupPage') || id.includes('SettingsPage')) return 'page-components'
              return 'ui-components'
            }
          },
          // Optimize chunk file names for better caching
          chunkFileNames: chunkInfo => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop().replace('.js', '')
              : 'chunk'
            return `assets/${facadeModuleId}-[hash].js`
          },
          assetFileNames: assetInfo => {
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          // Optimize entry file names
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      // Use esbuild for faster builds and better tree-shaking
      minify: 'esbuild',
      // Enable source maps only for development
      sourcemap: !isProd,
      // Target modern browsers for optimal performance and smaller bundles
      target: 'es2020',
      // Increase chunk size warning limit for better performance
      chunkSizeWarningLimit: 1000,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize assets - inline small assets, externalize large ones
      assetsInlineLimit: 8192, // 8kb
      // Enable build optimizations
      reportCompressedSize: false, // Faster builds
      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        extensions: ['.js', '.cjs'],
      },
    },
    optimizeDeps: {
      // Pre-bundle critical dependencies for faster dev server startup
      include: [
        'react',
        'react-dom',
        'zustand',
        'framer-motion',
        'lucide-react',
        'crypto-js',
        'zod',
      ],
      // Exclude testing and very heavy tooling from pre-bundling
      exclude: [
        '@testing-library/jest-dom',
        '@testing-library/react',
        '@testing-library/user-event',
        'jest-axe',
        'puppeteer',
        'jsdom',
        'vitest',
      ],
    },
    // Modern browser optimizations
    esbuild: {
      // Enable modern syntax for better performance and smaller bundles
      target: 'es2020',
      // Avoid minifying during dev to keep HMR/snackiness
      minify: isProd,
      // Enable tree shaking
      treeShaking: true,
      // Remove unused code
      drop: isProd ? ['console', 'debugger'] : [],
      // Optimize for production
      pure: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
    },
    // Optimize asset handling
    assetsInclude: ['**/*.woff2', '**/*.png', '**/*.jpg', '**/*.svg'],
    // Performance optimizations
    define: {
      // Define environment variables for better tree shaking
      __DEV__: !isProd,
      __PROD__: isProd,
    },
  }
})
