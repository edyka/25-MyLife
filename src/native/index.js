// Native (Capacitor) integration.
//
// Everything here is a no-op on the web build: isNativeApp() returns false in a
// browser, so all existing web/PWA behavior is untouched. The heavier Capacitor
// plugins (@capacitor/app, @capacitor/browser) are imported dynamically inside
// native-only paths so they never land in the web bundle. Only the tiny
// @capacitor/core platform shim is imported statically.
import { Capacitor } from '@capacitor/core'

// Custom URL scheme registered in ios/App/App/Info.plist (CFBundleURLTypes).
// Supabase must whitelist this EXACT value under Auth → URL Configuration →
// Redirect URLs, otherwise native OAuth can't complete. See docs/IOS_LAUNCH.md.
export const NATIVE_OAUTH_REDIRECT = 'viventiva://auth/callback'
const OAUTH_SCHEME = 'viventiva://'

export const isNativeApp = () => {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

export const getNativePlatform = () => {
  try {
    return Capacitor.getPlatform() // 'ios' | 'android' | 'web'
  } catch {
    return 'web'
  }
}

// Open an OAuth provider URL in the system in-app browser (SFSafariViewController
// on iOS). The provider redirects back to NATIVE_OAUTH_REDIRECT, which iOS routes
// to the app via the appUrlOpen listener registered in initNative().
export const openOAuthUrl = async url => {
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url })
}

// One-time native setup. Currently: completing the OAuth round-trip via deep
// link. StatusBar style and SplashScreen are configured declaratively in
// capacitor.config.ts, so they need no runtime calls here. Safe to call on web.
let initialized = false
export const initNative = async ({ onOAuthCode } = {}) => {
  if (initialized || !isNativeApp()) return
  initialized = true

  const [{ App }, { Browser }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/browser'),
  ])

  // Native OAuth completes here: the provider redirects to
  // viventiva://auth/callback?code=…, which iOS delivers as an appUrlOpen event.
  // The PKCE code_verifier is still in the WebView's storage from signInWithOAuth,
  // so the injected onOAuthCode handler can finish the login. The handler is
  // injected (from main.jsx) so this native module never imports the Supabase
  // client — that would create a static/dynamic import cycle on supabase.js.
  App.addListener('appUrlOpen', async ({ url }) => {
    if (!url || !url.startsWith(OAUTH_SCHEME)) return
    try {
      const code = new URL(url).searchParams.get('code')
      if (code && onOAuthCode) await onOAuthCode(code)
    } catch (error) {
      console.error('[Viventiva native] OAuth callback failed:', error)
    } finally {
      // Dismiss the in-app browser whether or not the exchange succeeded.
      try {
        await Browser.close()
      } catch {
        /* browser may already be closed */
      }
    }
  })
}
