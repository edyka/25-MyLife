import type { CapacitorConfig } from '@capacitor/cli'

// Capacitor wraps the existing Vite/React PWA (built to dist/) as a native iOS
// app. We reuse 100% of the web code; native concerns (OAuth deep-linking,
// status bar, splash) are handled by the plugins configured below.
const config: CapacitorConfig = {
  appId: 'com.viventiva.app',
  appName: 'Viventiva',
  webDir: 'dist',
  ios: {
    // The app manages its own safe-area insets via CSS env(safe-area-inset-*),
    // so don't let iOS inject automatic scroll insets on top.
    contentInset: 'never',
    backgroundColor: '#111827',
  },
  plugins: {
    SplashScreen: {
      // Keep the native splash brief; the web app hides it once mounted.
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: '#111827',
      showSpinner: false,
    },
    StatusBar: {
      // Light glyphs for the dark default theme. Updated at runtime to follow
      // the active light/dark theme (see src/native/initNative.js).
      style: 'DARK',
    },
  },
}

export default config
