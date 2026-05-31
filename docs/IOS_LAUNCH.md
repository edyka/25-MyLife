# Viventiva iOS App — Launch Guide

Viventiva ships to the App Store as a **Capacitor** wrapper around the existing
Vite/React web app. ~100% of the code is shared with the website; only native
concerns (OAuth deep-linking, status bar, splash, purchase gating) are
iOS-specific. This doc covers what's already wired and the steps **you** must do
(developer account, signing, store listing) that can't be automated.

---

## What's already done (in this repo)

- **Capacitor 8** added; native project at `ios/` (Swift Package Manager, no CocoaPods Podfile).
- `capacitor.config.ts` — appId `com.viventiva.app`, appName `Viventiva`, `webDir: dist`.
- **OAuth deep-linking** — Google/Facebook/Apple work inside the app: the provider
  opens in an in-app browser and redirects back to `viventiva://auth/callback`,
  which `src/native/index.js` exchanges for a session. Custom URL scheme
  `viventiva` is registered in `ios/App/App/Info.plist`.
- **Free-tier gating** — on native, the in-app Stripe checkout buttons are replaced
  with an "Available on the web" label (Apple/Google forbid external payment for
  digital goods). Premium is bought on viventiva.com and unlocks in the app
  automatically because subscription tier is read from the server.
- **Icons + splash** — generated into `ios/App/App/Assets.xcassets` from `assets/`.
- **Orientation** — iPhone is portrait-only (matches the PWA).
- Build scripts: `npm run build:ios`, `npm run cap:sync`, `npm run ios`.

### Build & open in Xcode

```bash
npm run build:ios   # vite build + cap sync ios
npm run ios         # opens ios/App/App.xcodeproj in Xcode
```

In Xcode: pick a Simulator (or a connected device) and press Run.

---

## YOU must do these (one-time)

### 1. Apple Developer Program — $99/year

Enroll at https://developer.apple.com/programs/ . Required to run on a real
device, use TestFlight, and submit to the App Store.

### 2. Signing in Xcode

Open the project (`npm run ios`) → select the **App** target → **Signing &
Capabilities** → check _Automatically manage signing_ → select your **Team**.
The bundle identifier is `com.viventiva.app` (change it here + in
`capacitor.config.ts` if you want a different one — it must be globally unique
and match your App Store Connect record).

### 3. ⚠️ Whitelist the native redirect URL in Supabase (REQUIRED for login)

Supabase Dashboard → **Authentication → URL Configuration → Redirect URLs** →
add exactly:

```
viventiva://auth/callback
```

Without this, Google/Facebook/Apple login will fail in the app (the web app is
unaffected). Project: `jnzwuknbqpihuhbdbhhv`.

### 4. ⚠️ Sign in with Apple

App Review Guideline 4.8 requires Sign in with Apple when you offer other social
logins (Google/Facebook) — which we do. The current Apple login uses Supabase's
web OAuth via the in-app browser, which satisfies the _offering_ requirement. For
the best UX (and to avoid review friction) consider also adding the native
**Sign in with Apple** capability in Xcode (Signing & Capabilities → + Capability)
and verifying your Apple Services ID covers the app. Test Apple login on a real
device before submitting.

### 5. App Store Connect

Create the app at https://appstoreconnect.apple.com :

- **Bundle ID** `com.viventiva.app`, **Name** "Viventiva", category **Lifestyle**.
- **Screenshots** — 6.7"/6.9" and 6.5" iPhone (portrait). Capture from a Simulator.
- **App Privacy** ("nutrition labels") — declare what's collected: email/account
  (Supabase auth), product usage/analytics (GA + Meta Pixel if enabled), and that
  data is linked to identity. Match your privacy policy (viventiva.com/privacy).
- **Age rating**, **support URL**, **privacy policy URL**.

### 6. App Review notes (paste into the review submission)

> Viventiva is free to use. Premium plans (Pro/Lifetime) are purchased on our
> website; the app reads the user's subscription status from our server and
> unlocks features accordingly. No digital goods are sold inside the app, so
> In-App Purchase is not used. Test account: <provide a login>.

This pre-empts a 3.1.1 (IAP) rejection given the "Available on the web" labels.

### 7. TestFlight → Submit

Xcode → Product → **Archive** → Distribute → App Store Connect → upload. Test via
TestFlight, then submit for review in App Store Connect.

---

## Updating the app after web changes

The native app bundles the web build. After any web change:

```bash
npm run build:ios   # rebuild web + copy into iOS
```

Then in Xcode bump the build number (Target → General → Version/Build) and Archive.

- **Version** (`CFBundleShortVersionString`) — user-facing, e.g. 1.0.0.
- **Build** (`CFBundleVersion`) — must increase for every upload.

---

## Notes / not included (intentionally minimal)

- **Android** — not set up yet (iOS-first). Adding it later: install a JDK +
  Android Studio, then `npx cap add android`. The web code, OAuth handler, and
  purchase gating are already platform-agnostic.
- **Push notifications** — not included.
- **Native In-App Purchase** — not included (free-tier-on-mobile decision). If you
  later want in-app upgrades, add `@revenuecat/purchases-capacitor` and reconcile
  with the server-side entitlements.
- **Status bar style** — defaults to light glyphs (dark theme). Verify on device
  across light/dark themes; tune in `capacitor.config.ts` (`plugins.StatusBar.style`)
  if needed.
