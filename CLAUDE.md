# Viventiva (Memento Vivere)

A philosophical life-visualization web app: shows a user their finite weeks as a grid, with milestones, mood tracking, and goals. Premium tiers via Stripe.

## User Directives

- Append every user input to `~/.claude/projects/-Users-m4-Documents-01-Viventiva/memory/user_inputs_log.md` (newest at the bottom, `YYYY-MM-DD — "<input>" → <intent>`). This is non-negotiable per the original CLAUDE.md.

## Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Framer Motion 12, Zustand 5
- **Backend**: Supabase (Postgres + Auth + Edge Functions), Stripe payments, Sentry error tracking
- **Build target**: `es2020`, esbuild minify, console-stripped in prod
- **Deploy**: Netlify (CSP and headers in `netlify.toml`)
- **No router library** — state-based navigation via `useUIStore.currentPage`
- **PWA**: service worker at `public/sw.js` (currently v2)

## Commands

```bash
npm run dev              # Vite dev server (port 3000)
npm run build            # Production build to dist/
npm run preview          # Preview production build
npm test                 # Vitest
npm run test:e2e         # Playwright e2e
npm run test:auth        # Playwright auth flow debug
npm run lint             # ESLint (max-warnings 0)
npm run lint:fix         # ESLint --fix
npm run format           # Prettier write
```

Husky + lint-staged run ESLint --fix and Prettier on `*.{js,jsx}` at commit time.

## Key Files

- `src/App.jsx` — root, branches on auth state and `currentPage`
- `src/components/HomePage.jsx` — landing (unauthenticated, ~720 LOC)
- `src/components/LoginModal.jsx` — login/signup/reset (~830 LOC — split candidate)
- `src/components/MainApp.jsx` — authenticated shell (~710 LOC)
- `src/components/ModernMoodPalette.jsx` — mood picker (~925 LOC — largest file)
- `src/components/OnboardingWizard.jsx` — first-run flow (~645 LOC)
- `src/hooks/useAppAuth.js` — auth state hook (handles OAuth callback + Brave PKCE fallback)
- `src/lib/supabase.js` — Supabase client, auth helpers, DB helpers
- `src/services/dataService.js` — centralized data loading with caching
- `src/stores/` — Zustand stores (`useLifeStore`, `useUIStore`, `useMilestoneStore`, `usePremiumStore`)
- `src/utils/stripeConfig.js` — Stripe checkout integration (sends user JWT to Edge Function)
- `src/utils/secureStorage.js` — AES-encrypted localStorage wrapper (sync, crypto-js)
- `src/utils/errorMessages.js` — user-facing error string mapping
- `vite.config.js` — manual chunk splitting (framer-motion, supabase, sentry, html-to-image)

## Architecture Conventions

- **Lazy load all page components** — keep initial bundle small
- **`supabaseClient` (internal, null-safe) vs `supabase` (exported, can be null)** — DB methods must use `supabaseClient` with null checks, never `supabase` directly
- **Auth state** — `onAuthStateChange` + manual `getSession()`; uses `initialSessionHandled` flag to avoid race conditions causing duplicate `loadUserData` calls
- **OAuth on Brave** — Brave blocks Supabase's auto-PKCE; if `?code=` is in URL but auto-exchange doesn't fire within 1.5s, manually call `auth.exchangeCodeForSession(code)` as fallback
- **Logout** — must `await auth.signOut()` BEFORE clearing localStorage (was fire-and-forget bug); shared `useLogout` hook used by TabNavigation + SettingsPage
- **Service worker MUST skip** — supabase.co domain, OAuth callbacks (`?code=`), analytics domains (otherwise login loops)
- **Two `getUserFriendlyError` exist** — `lib/supabase.js` (broad type categorization) and `utils/errorMessages.js` (string-match for specific Supabase errors). Not yet consolidated because each has different UX behavior worth preserving.
- **State-based routing limitation** — no real URLs for `/about`, `/privacy`, `/pricing`; SEO hook patches `<title>`/meta but URL stays `/`

## Payments (Stripe)

- **Edge Function**: `create-checkout` on Supabase (currently v10, `verify_jwt=true`)
- **Flow**: client sends user JWT → Edge Function validates and extracts user from token → creates Stripe Checkout session → redirects
- **Tiers**: Free, Pro ($4.99/mo or $39.99/yr), Life ($99 one-time)
- **Subscription validation**: server-side via RPC `get_current_user_tier`, fallback to direct query on `user_subscriptions`
- **`FEATURE_GATES`** in `usePremiumStore` maps tier → boolean features
- **Env vars**: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_STRIPE_PRO_MONTHLY_PRICE_ID`, `VITE_STRIPE_PRO_YEARLY_PRICE_ID`, `VITE_STRIPE_LIFE_PRICE_ID`
- **`usePremiumStore` does NOT use persist middleware** — tier must be re-fetched from server, never trusted from localStorage

## Analytics & Conversion Tracking

- **`src/utils/analytics.js`** supports three providers, all **consent-gated** (`viventiva_cookie_consent`) and **env-driven**; each initializes independently so they can run together:
  - Plausible (`VITE_PLAUSIBLE_DOMAIN`), GA4 (`VITE_GA_MEASUREMENT_ID`), **Meta Pixel (`VITE_META_PIXEL_ID`)**.
  - The Meta Pixel is **injected dynamically** (not an inline snippet) so it satisfies the CSP (`script-src` has no `'unsafe-inline'`; `connect.facebook.net` is whitelisted).
- **Conversion events** fire to all configured providers; only events mapped in `META_STANDARD_EVENTS` reach the Pixel (as standard events):
  - `sign_up` → **CompleteRegistration** — email signup in `LoginModal.jsx`.
  - `initiate_checkout` → **InitiateCheckout** — in `stripeConfig.redirectToCheckout` (passes value+currency via the success URL).
  - `purchase` → **Purchase** — fired in `main.jsx` on the `?checkout=success` return, then strips the params (refresh-safe).
- **Known gaps:** OAuth signups (Google/FB/Apple) don't fire CompleteRegistration yet (email only); Purchase is client-side only — server-side CAPI in `stripe-webhook` is the accurate path (deferred).
- Set `VITE_META_PIXEL_ID` in `.env` **and** Netlify env vars (Vite inlines it at build time). Pixel ID itself comes from Meta Events Manager.

## Supabase MCP

Configured in `.mcp.json`. Project ID `jnzwuknbqpihuhbdbhhv`. All `mcp__supabase__*` tools allowed in `.claude/settings.local.json`.

Capabilities: SQL execution, migrations, Edge Function deploy, table/branch management, advisor queries, type generation.

**Tables**: `user_profiles`, `user_selections`, `user_settings`, `goals`, `milestones`, `waitlist`, `payment_history`, `user_subscriptions`, `subscription_audit_log`
**Key RPCs**: `get_current_user_tier`, `bulk_upsert_milestones`, `bulk_upsert_selections`, `get_user_data_optimized`

Run advisors (security + performance) after schema changes.

## Security Posture

- All RLS policies use `(select auth.uid())` for caching (optimized 2026-02-06)
- All public functions have explicit `search_path` set
- `service_role` policies scoped `TO service_role`, not `public`
- CSP in `netlify.toml`: no `'unsafe-inline'` in `script-src`, no `'unsafe-eval'` (Brave strips it; uses `'wasm-unsafe-eval'` instead); Stripe + googletagmanager whitelisted in `connect-src`; Meta Pixel whitelisted (`connect.facebook.net` in `script-src`, `www.facebook.com` in `connect-src`). Service worker (`public/sw.js`) also skips Facebook domains.
- `getCurrentUser()` uses `getUser()` (server-validated) NOT `getSession()` (localStorage-only)
- `.env` files must never contain real credentials (`.env.example` was cleaned 2026-02-06)
- **Open**: client-side rate limiter is in-memory and resets on reload — server-side limiter still needed
- **Open**: secureStorage AES key sits next to ciphertext in localStorage — no XSS protection
- **Open**: Supabase leaked-password protection not yet enabled in dashboard

## Build/Bundle Notes (baseline 2026-04-26, branch `improvements-2026-04-26`)

- Total JS ~1.6 MB uncompressed across chunks
- Largest chunk after split: ~391 KB (was 560 KB before vendor split)
- Entry `index-*.js`: ~8 KB (most logic lazy-split — keep it that way)
- Bundle warnings to fix: `analytics.js` and `lib/supabase.js` are imported both statically AND dynamically — pick one strategy per file or chunking is defeated

## Build Version Stamp

- `vite.config.js` injects `__APP_VERSION__` (from `package.json`), `__GIT_COMMIT__` (Netlify `COMMIT_REF`, else local `git rev-parse`), and `__BUILD_TIME__` via `define`; all declared as globals in `eslint.config.js`.
- `src/utils/version.js` exposes `APP_VERSION`, `GIT_COMMIT`, `BUILD_TIME`, `VERSION_LABEL`.
- Shown subtly in the footer (`v<version> · <commit>`, build time on hover) and as `window.__BUILD__` for console deploy-verification (esbuild strips `console.*` in prod, so a window global is used). Bump the visible version via `package.json` `version`.

## Native App (iOS — Capacitor)

- **Capacitor 8** wraps the Vite/React PWA as a native iOS app (SPM-based, no CocoaPods Podfile). Native project in `ios/`; config in `capacitor.config.ts` (appId `com.viventiva.app`, `webDir: dist`). iOS-first — Android not added yet.
- **`src/native/index.js`** — `isNativeApp()`, `getNativePlatform()`, `openOAuthUrl()`, `initNative({ onOAuthCode })`. No-op on web; only `@capacitor/core` is imported statically, the plugins (`@capacitor/app`, `@capacitor/browser`) are dynamic-imported inside native-only paths so they stay out of the web bundle.
- **OAuth deep-linking** — native sign-in (`lib/supabase.js` helpers) opens the provider via `@capacitor/browser` with `redirectTo` = `viventiva://auth/callback` (scheme in `ios/App/App/Info.plist`). `initNative`'s `appUrlOpen` listener runs the `exchangeCodeForSession` handler **injected from `main.jsx`** — the native layer never imports `supabase.js`, avoiding a static/dynamic bundle warning. **Supabase must whitelist `viventiva://auth/callback`** (Auth → URL Configuration) or native login fails.
- **Free-tier on native** — Apple/Google forbid external payment for digital goods, so `isNativeApp()` gates the Stripe CTAs in `UpgradeModal.jsx` + `PricingPage.jsx` to an "Available on the web" label and short-circuits the checkout handlers. Premium is bought on the website; tier is read from the server and unlocks in-app.
- **Build**: `npm run build:ios` (vite build + `cap sync ios`), `npm run ios` (open Xcode), `npm run cap:sync`. Icons/splash regen: edit `assets/` then `npx capacitor-assets generate --ios`.
- **Launch checklist** (Apple Developer account, signing, App Store Connect, review notes, the Supabase redirect-URL step): `docs/IOS_LAUNCH.md`.

## Repo Hygiene

- `.ralph/` directory is untracked (Ralph harness state) — do not commit
- Always create NEW commits — never amend pushed commits
- Don't commit `.env*` files with real values
- Don't use `git add -A` — stage specific files

## Open Improvement Backlog

See `~/.claude/projects/-Users-m4-Documents-01-Viventiva/memory/project_improvement_backlog.md` for the prioritized list (architecture, perf, UX, monetization). Top deferred items: split `ModernMoodPalette.jsx` and `LoginModal.jsx`, swap `crypto-js` for WebCrypto, adopt a router, server-side rate limiting, OG image generation via `html-to-image`.

## Custom Subagents Available

`.claude/agents/`: `app-project-manager`, `backend-architect`, `frontend-engineer`, `life-philosophy-guide`, `qa-validator`.

## Marketing Initiative (kicked off 2026-05-23)

Driven from a separate Claude Code instance at `/Users/m4` (not from this repo). This repo's instance handles code; marketing runs in parallel.

**Split-track architecture (user-approved 2026-05-23):**

| Track                   | Runs in                      | Tooling                                                                          | Purpose                                                             |
| ----------------------- | ---------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **A — Paid ads**        | Claude.ai (web/desktop)      | Official Meta Ads MCP — `mcp.facebook.com/ads` (launched 2026-04-29)             | Campaign mgmt, audiences, reporting. Created campaigns auto-paused. |
| **B — Organic posting** | Claude Code from `/Users/m4` | Custom subagent → Meta Graph API via curl; Supabase Storage as public media host | Page + IG feed posts + carousels. Reels/Stories deferred.           |

**Budget:** $0–100/mo testing. Strategy is creative-led (Advantage+ campaigns, kill losers by day 7) — too small to do audience testing. Goal: find hooks, not ROAS.

**Cross-track feedback loop:** ad creatives that convert → become organic templates; viral organic posts → become ad creative ideas.

**Phase 0 user-side blockers (not yet done as of 2026-05-23):**

- Facebook Page for Viventiva (personal profiles can't be posted to via API)
- IG account converted to **Business** type
- IG linked to FB Page (Accounts Center)
- Meta Developer App (developers.facebook.com, type: Business) with Instagram Graph API + Facebook Login + Pages API products
- User added as test user on the App (Development mode covers own page, no App Review needed)

**Track B planned phases (MVP = images + carousels only):**

1. Long-lived Page token via Graph API Explorer → store in Supabase Vault. Scopes: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`.
2. `marketing-media` public bucket in existing Supabase project (IG API needs public URLs, not uploads).
3. Content template engine — reuse `html-to-image` dep already in the project for Viventiva-branded quote cards.
4. `marketing-publisher` subagent in `.claude/agents/`.
5. `/schedule` Sunday-evening cron → drafts to review folder → manual approval → publish.

**Important runtime split:** Meta Ads MCP only works in Claude.ai (custom connector), NOT in Claude Code. If user asks for ad ops here, draft the prompt to paste into Claude.ai rather than try to execute. Graph API path is for organic only — don't reinvent it for paid.

**Phase 0 complete + first IG + FB posts live (2026-05-24).** FB Page ID `832064029998701`, IG Business Account ID `17841476529494834`, Meta App ID `1746842466474094`. IG handle is `@vieventiva` (kept despite typo vs brand). Tokens + scripts at `~/.config/viventiva-marketing/`. First posts: IG Media ID `17936884836257075`, FB Post ID `832064029998701_122129588457143462` (Memento Vivere quote card, same on both). Outstanding: App Secret (long-lived tokens), Supabase Storage `marketing-media` bucket (catbox.moe is test-only), subagent + cron. See `~/.claude/projects/-Users-m4/memory/project_viventiva_marketing_phase0.md` for full state.
