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
- CSP in `netlify.toml`: no `'unsafe-inline'` in `script-src`, no `'unsafe-eval'` (Brave strips it; uses `'wasm-unsafe-eval'` instead); Stripe + googletagmanager whitelisted in `connect-src`
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

## Repo Hygiene

- `.ralph/` directory is untracked (Ralph harness state) — do not commit
- Always create NEW commits — never amend pushed commits
- Don't commit `.env*` files with real values
- Don't use `git add -A` — stage specific files

## Open Improvement Backlog

See `~/.claude/projects/-Users-m4-Documents-01-Viventiva/memory/project_improvement_backlog.md` for the prioritized list (architecture, perf, UX, monetization). Top deferred items: split `ModernMoodPalette.jsx` and `LoginModal.jsx`, swap `crypto-js` for WebCrypto, adopt a router, server-side rate limiting, OG image generation via `html-to-image`.

## Custom Subagents Available

`.claude/agents/`: `app-project-manager`, `backend-architect`, `frontend-engineer`, `life-philosophy-guide`, `qa-validator`.
