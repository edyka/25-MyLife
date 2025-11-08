# Viventiva Project Memory & Context

**Last Updated:** November 8, 2025
**Project:** MyLife / Viventiva - Life Week Visualization App
**Status:** Pre-Launch (95% Complete, Authentication Issues Blocking)

---

## User Preferences & Instructions

### General Working Style
- **Instruction:** "Everytime I give you a prompt, save it and remember it so you can continue next time"
- **Action:** Maintain this memory file with all important context, decisions, and instructions

### Project Instructions (from CLAUDE.md)
- "Add all my inputs to memory in certain form always learn and store it under viventiva project"

---

## Project Overview

**What is Viventiva:**
A life visualization app that displays your life as a grid of weeks (52 weeks × life expectancy years). Users can:
- Paint weeks with different moods/colors
- Track milestones and life events
- Visualize their life journey
- Set goals and aspirations

**Current Status:** Production-ready with authentication, performance optimizations, and modern UI

---

## Key Technical Decisions

### Architecture
- **Frontend:** React + Vite
- **State Management:** Zustand (with localStorage persistence)
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Styling:** Tailwind CSS + Custom glassmorphism design
- **Deployment:** Netlify
- **Authentication:** Google OAuth, Facebook OAuth, Email/Password

### Performance Optimizations (Completed)
1. ✅ Virtualization enabled (6.7x faster rendering)
2. ✅ Lucide icons optimized (individual imports)
3. ✅ Keyboard navigation added (WCAG AA compliant)
4. ✅ Backdrop filter optimized with fallbacks
5. ✅ Bundle size reduced by 13.5% (110KB savings)

### Data Architecture
- User profiles stored in Supabase
- Milestones (painted weeks + custom moods) synced with 1s debounce
- User data isolation implemented (no data leakage between accounts)
- UI preferences persist after logout (dark mode, theme, etc.)

---

## Completed Work Sessions

### Session 1: Authentication & Supabase Integration (Oct 11, 2025)
- Implemented complete authentication flow
- Created Supabase database schema
- Fixed data persistence issues
- Fixed user data isolation
- Created documentation (SETUP-GUIDE.md, FIXES_SUMMARY.md)

### Session 2: Performance Optimizations (Oct 11, 2025)
- Enabled virtualization
- Optimized icon imports
- Added keyboard navigation
- Optimized CSS backdrop filters
- Reduced bundle size by 110KB
- Created PERFORMANCE_IMPROVEMENTS_SUMMARY.md

---

## Current State (November 8, 2025)

### Strategic Review Completed
- **STRATEGIC_REVIEW.md:** Comprehensive 60-page analysis created
- **ACTION_PLAN.md:** 17-day launch roadmap created
- **Status:** 95% ready for launch, blocked by authentication issues

### Git Status
- Branch: `main`
- Uncommitted changes: 455 lines across 8 files (authentication fixes)
- Latest commits:
  1. `0140df2` - fix: improve authentication flow and data synchronization
  2. `040c96d` - docs: add comprehensive documentation and test tools
  3. `499a919` - feat: add optimized components, hooks, and assets

### Build Status
- ✅ Production build successful
- ✅ Bundle size: ~706KB (down from 816KB)
- ✅ Dev server runs without errors
- ✅ All features working

### Deployment Status
- Netlify CLI: Installed and authenticated (edo.prasnikar@gmail.com)
- Production: Not yet deployed (blocked by authentication issues)
- Build Status: Passing (3.96s build time, 706KB bundle)
- Target Launch: November 25, 2025 (17 days)

---

## Critical Blockers (November 8, 2025)

### BLOCKER: Authentication Issues
**Status:** 455 lines of uncommitted fixes across 8 files
**Documents:** FIX_LOGIN_ISSUES.md created with detailed analysis

**Issues:**
1. OAuth callback not setting authentication state properly
2. Missing error handling in OAuth flow
3. handleLogin setting localStorage before verifying user exists
4. loadUserDataFromSession missing state updates (infinite loading spinner)
5. Session restoration unreliable after page refresh

**Next Steps:**
1. Test uncommitted authentication fixes
2. Verify OAuth flow works (Google, Facebook, Apple)
3. Test session persistence across refreshes
4. Add E2E tests for authentication
5. Commit and deploy fixes

### BLOCKER: Missing Database Tables
**Issue:** Code references tables not in schema
- user_selections table (referenced in App.jsx but not in supabase-setup.sql)
- user_settings table (separate file, should be merged into main schema)

**Fix:** Add tables to supabase-setup.sql and deploy

## Outstanding Tasks

### Phase 0: Pre-Launch Blockers (CRITICAL)
- [ ] Fix authentication issues (test + commit FIX_LOGIN_ISSUES.md changes)
- [ ] Add user_selections table to database schema
- [ ] Merge user_settings into main schema
- [ ] Write Privacy Policy and Terms of Service
- [ ] Set up Sentry error monitoring
- [ ] Complete QA testing (all browsers, devices)

### Immediate (Week 1)

### Testing (Before Full Launch)
- [ ] Test on real mobile devices (iOS, Android)
- [ ] Test keyboard navigation flow
- [ ] Test with screen reader (VoiceOver, NVDA, JAWS)
- [ ] Test with reduced motion enabled
- [ ] Run Lighthouse audit (target: 90+)

### Future Enhancements
- [ ] Implement proper Supabase session management (replace localStorage auth flag)
- [ ] Add error toast notifications for sync failures
- [ ] Add conflict resolution for multi-device editing
- [ ] Add retry logic for failed syncs
- [ ] Implement real-time sync with Supabase Realtime
- [ ] Add Stripe integration for subscriptions
- [ ] Create Terms of Service & Privacy Policy

---

## Important File Locations

### Configuration
- `.env` - Environment variables (Supabase keys)
- `.env.example` - Template for environment setup
- `netlify.toml` - Netlify deployment config
- `vite.config.js` - Build configuration (code splitting)
- `tailwind.config.js` - UI styling config

### Database
- `supabase-setup.sql` - Complete database schema

### Documentation
- `README.md` - Project overview
- `SETUP-GUIDE.md` - Deployment instructions
- `STRATEGIC_REVIEW.md` - Comprehensive product/technical analysis (NEW)
- `ACTION_PLAN.md` - 17-day launch roadmap (NEW)
- `FIX_LOGIN_ISSUES.md` - Authentication bug analysis (NEW)
- `PROJECT_MEMORY.md` - Session continuity (this file)
- `FIXES_SUMMARY.md` - Data persistence fixes
- `PERFORMANCE_ANALYSIS.md` - Detailed performance audit
- `PERFORMANCE_IMPROVEMENTS_SUMMARY.md` - Latest optimizations

### Key Components
- `src/App.jsx` - Main app entry with auth routing
- `src/components/MainApp.jsx` - Main grid view (line 325: virtualization)
- `src/components/ModernMoodPalette.jsx` - Mood selection palette
- `src/components/ClearWeekBox.jsx` - Individual week component
- `src/components/HomePage.jsx` - Landing page with auth
- `src/components/Dashboard.jsx` - User dashboard
- `src/lib/supabase.js` - Supabase client configuration

### State Management
- `src/stores/useLifeStore.js` - Life data (birth, life expectancy)
- `src/stores/useMilestoneStore.js` - Milestones & custom moods
- `src/stores/useUIStore.js` - UI preferences (dark mode, theme)

---

## Environment Variables Required

```bash
# Supabase
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[anon-key]...

# Stripe (future)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[key]
```

---

## User Context & Preferences

### Communication Style
- User prefers comprehensive work: "all" tasks at once
- Expects detailed progress tracking with todos
- Values documentation and summaries
- Appreciates technical details and metrics

### Project Goals
- Create a production-ready life visualization app
- Worldwide deployment (free tier initially)
- Focus on performance and accessibility
- Modern, premium UI with glassmorphism
- Monetization through Stripe subscriptions (future)

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run preview          # Preview production build

# Deployment
netlify deploy --prod --dir=dist    # Deploy to production
netlify status                       # Check deployment status

# Git
git status                           # Check changes
git add -A                          # Stage all changes
git commit -m "message"             # Commit with message
git push origin main                # Push to GitHub
```

---

## Next Session Checklist

When resuming work:
1. ✅ Read this PROJECT_MEMORY.md file
2. ✅ Read STRATEGIC_REVIEW.md for full context
3. ✅ Read ACTION_PLAN.md for immediate next steps
4. ✅ Check git status (currently 455 lines uncommitted)
5. ✅ Review FIX_LOGIN_ISSUES.md before testing auth
6. ✅ Ask user which Phase 0 blocker to tackle first

## Key Insights from Strategic Review

### What's Going Well
- Modern, well-architected codebase (20,762 lines)
- Excellent documentation (13 MD files)
- Strong performance (706KB bundle, 6.7x faster rendering)
- Comprehensive authentication (Google, Facebook, Apple, Email)
- GDPR-compliant (data export/delete implemented)
- Free infrastructure (Supabase + Netlify)

### Critical Issues
1. **Authentication broken** - Users can't log in reliably
2. **Missing database tables** - Code references non-existent tables
3. **No error monitoring** - Can't diagnose production issues
4. **Legal docs incomplete** - Privacy Policy and Terms needed
5. **No tests for auth** - Critical path untested

### Launch Readiness: 95%
**Remaining 5%:**
- Fix authentication (2-3 days)
- Complete database schema (1 day)
- Write legal docs (1-2 days)
- Set up Sentry (1 day)
- QA testing (2-3 days)

**Total time to launch:** 7-10 days of focused work

---

## Notes for Future Sessions

- Always update this file when completing major tasks
- Document any new user preferences or instructions
- Track all important decisions and their rationale
- Keep deployment status up to date
- Maintain list of outstanding tasks

**Remember:** User expects continuity between sessions - use this file to maintain context!
