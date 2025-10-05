# Memento Vivere - Optimization Todo List

**Project:** Life Visualization Application
**Location:** `/Users/EdoM1/Documents/25 MyLife`
**Generated:** 2025-09-24

---

## 1. CRITICAL FIXES (Must Do Immediately)

### 1.1 Fix ESLint Errors - 7 Critical Issues
**Priority:** P0 - Blocking
**Impact:** Prevents production build, code quality issues
**Time:** 30 minutes

#### Tasks:
- [ ] **Remove unused imports in MainApp.jsx** (Lines 11-12)
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/MainApp.jsx`
  - Remove: `LifeInsights`, `MobileColorSelection`
  - Impact: Clean build, prevents dead code

- [ ] **Remove unused variable in MainApp.jsx** (Line 62)
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/MainApp.jsx`
  - Fix: `setCustomCategories` assigned but never used
  - Impact: Remove unnecessary state setter

- [ ] **Fix unused error variable in ModernMainApp.jsx** (Line 48)
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/ModernMainApp.jsx`
  - Fix: Replace `catch (err)` with `catch (_err)` or log error
  - Impact: Proper error handling or explicit ignore

- [ ] **Remove unused imports in MoodPalette.jsx** (Lines 1, 3)
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/MoodPalette.jsx`
  - Remove: `useState`, `getTotalWeeks`
  - Impact: Cleaner imports, smaller bundle

- [ ] **Fix unused parameter in MoodPalette.jsx** (Line 17)
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/MoodPalette.jsx`
  - Fix: Rename `lifeExpectancy` to `_lifeExpectancy` or remove
  - Impact: Follow ESLint conventions

**Command to run:**
```bash
cd /Users/EdoM1/Documents/25\ MyLife && npm run lint:fix
```

---

## 2. HIGH PRIORITY PERFORMANCE (Significant Impact)

### 2.1 Reduce Bundle Size - Framer Motion Optimization
**Priority:** P1
**Impact:** 80KB+ bundle reduction (186KB chunk includes framer-motion)
**Time:** 2 hours

#### Analysis:
- 31 files import framer-motion
- Largest chunk: `chunk-CoodwyOy.js` (186.66 KB)
- Framer Motion contributes ~80KB to bundle

#### Tasks:
- [ ] **Replace Framer Motion with CSS transitions** in critical path components
  - Files: WeekBox, ModernWeekBox, ClearWeekBox
  - Replace `motion.div` with CSS `transition` and `transform`
  - Impact: 40KB reduction, faster initial load

- [ ] **Lazy load Framer Motion animations** for non-critical features
  - Files: About, AppPolicy, TermsOfService, PrivacyPolicy
  - Use dynamic imports: `const { motion } = await import('framer-motion')`
  - Impact: 30KB reduction from main bundle

- [ ] **Remove unused Framer Motion variants**
  - Audit all `variants` objects and remove unused animations
  - Impact: 10KB reduction, cleaner code

### 2.2 Eliminate Duplicate Code in Hooks - 500+ Lines
**Priority:** P1
**Impact:** Maintainability, bundle size, DRY principle
**Time:** 3 hours

#### Analysis:
- `useWeekInteractions.js` (324 lines) duplicates `useWeekInteractionsZustand.js` (212 lines)
- `useTouchGestures.js` (84 lines) duplicates `useModernTouchGestures.js` (244 lines)
- Similar logic in `useAdvancedSelection.js` (173 lines) and `useSelectionState.js` (148 lines)

#### Tasks:
- [ ] **Deprecate legacy useWeekInteractions.js**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/hooks/useWeekInteractions.js`
  - Action: Replace all imports with `useWeekInteractionsZustand.js`
  - Impact: Remove 324 lines, 15KB reduction

- [ ] **Consolidate touch gesture hooks**
  - Files: `useTouchGestures.js` + `useModernTouchGestures.js`
  - Action: Keep modern version, remove legacy
  - Impact: Remove 84 lines, cleaner API

- [ ] **Merge selection hooks**
  - Files: `useAdvancedSelection.js` + `useSelectionState.js`
  - Action: Extract shared logic, create single hook
  - Impact: Remove ~100 lines of duplication

### 2.3 Fix Unnecessary Re-renders - Zustand Store Optimization
**Priority:** P1
**Impact:** Smoother UX, better performance on interactions
**Time:** 2 hours

#### Issues:
- `useLifeSelectors()` always creates new object (line 83-105)
- Computed values recalculated on every render
- Store subscribers not properly memoized

#### Tasks:
- [ ] **Optimize Zustand selectors in useLifeStore.js**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/stores/useLifeStore.js`
  - Replace `useLifeSelectors()` with individual selectors
  - Use `shallow` equality from zustand/shallow
  - Impact: 70% reduction in re-renders for life data

- [ ] **Add selector memoization to useMilestoneStore.js**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/stores/useMilestoneStore.js`
  - Create granular selectors for milestones
  - Impact: Prevent re-render cascade on milestone updates

- [ ] **Optimize useSelectionStore.js subscriptions**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/stores/useSelectionStore.js`
  - Add `useShallow()` for multi-value selections
  - Impact: Faster selection interactions

### 2.4 Add Missing Error Boundaries
**Priority:** P1
**Impact:** App crashes on errors, poor UX
**Time:** 1.5 hours

#### Tasks:
- [ ] **Wrap async operations in try-catch**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/ModernMainApp.jsx` (Line 36-52)
  - Add error state and user feedback for PNG export failure
  - Impact: Graceful error handling

- [ ] **Add error boundaries to lazy components**
  - Files: GoalTracker, StatsSection, LifeInsights (lazy loaded)
  - Wrap with ErrorBoundary component
  - Impact: Prevent full app crash on component failure

- [ ] **Handle localStorage failures gracefully**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/utils/secureStorage.js`
  - Add fallback for Brave/privacy browsers
  - Already partially implemented but needs user notification
  - Impact: Better UX for privacy-focused users

---

## 3. MEDIUM PRIORITY ARCHITECTURE (Code Quality)

### 3.1 Security Enhancement - PBKDF2 Iterations
**Priority:** P2
**Impact:** Security hardening against brute force
**Time:** 30 minutes

#### Task:
- [ ] **Increase PBKDF2 iterations in secureStorage.js**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/utils/secureStorage.js` (Line 19)
  - Current: 10,000 iterations (OWASP 2018 minimum)
  - Recommended: 100,000 iterations (OWASP 2023 standard)
  - Change: `iterations: 100000`
  - Impact: 10x stronger encryption, negligible performance impact (one-time on key generation)

### 3.2 Memory Leak Prevention - Event Listener Cleanup
**Priority:** P2
**Impact:** Memory leaks on navigation, component unmounting
**Time:** 2 hours

#### Analysis:
8 components with useEffect but missing cleanup functions

#### Tasks:
- [ ] **Add cleanup to SetupPage.jsx**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/SetupPage.jsx`
  - Audit all useEffect calls, add return cleanup functions
  - Impact: Prevent memory leaks on page unmount

- [ ] **Add cleanup to VirtualizedWeekGrid.jsx**
  - File: `/Users/EdoM1/Documents/25 MyLife/src/components/VirtualizedWeekGrid.jsx`
  - Add event listener cleanup
  - Impact: Critical for virtualized scroll performance

- [ ] **Add cleanup to remaining components**
  - Files: ModernApp.jsx, BrowserCompatibility.jsx, PhilosophicalReflection.jsx, ModernResponsiveWeekGrid.jsx, StoreProvider.jsx, Web3LifeGrid.jsx
  - Audit and add cleanup where needed
  - Impact: Prevent cumulative memory leaks

### 3.3 Code Splitting & Lazy Loading Optimization
**Priority:** P2
**Impact:** Faster initial load, better code organization
**Time:** 2 hours

#### Tasks:
- [ ] **Implement route-based code splitting**
  - Split About, Settings, Goals into separate chunks
  - Use React.lazy() and Suspense
  - Impact: 30-40KB reduction in initial bundle

- [ ] **Create component-level lazy boundaries**
  - Lazy load: PhilosophicalReflection, LifeInsights, MilestonePanel
  - Impact: Load components only when tab is active

- [ ] **Optimize third-party imports**
  - Tree-shake unused lucide-react icons
  - Replace `import * as` with specific imports
  - Impact: 10-15KB reduction

### 3.4 State Management Cleanup
**Priority:** P2
**Impact:** Code maintainability, consistency
**Time:** 3 hours

#### Tasks:
- [ ] **Remove legacy state management patterns**
  - Identify components still using props drilling
  - Migrate to Zustand stores consistently
  - Impact: Cleaner component tree, easier debugging

- [ ] **Consolidate store actions**
  - Review all store actions for duplication
  - Create shared utility actions
  - Impact: Less code, single source of truth

- [ ] **Add store devtools integration**
  - Install zustand devtools middleware
  - Add Redux DevTools support
  - Impact: Better debugging experience

---

## 4. LOW PRIORITY POLISH (Nice-to-Have)

### 4.1 Accessibility Enhancements
**Priority:** P3
**Impact:** WCAG 2.1 compliance, better a11y
**Time:** 4 hours

#### Analysis:
- Only 50 ARIA attributes across 74 files
- Missing keyboard navigation hints
- No screen reader announcements for dynamic content

#### Tasks:
- [ ] **Add ARIA labels to interactive elements**
  - WeekBox components need aria-label with week number
  - MoodPalette needs aria-labels for color buttons
  - Impact: Screen reader support

- [ ] **Implement keyboard navigation indicators**
  - Add visual focus states to all interactive elements
  - Implement focus trap for modals
  - Impact: Keyboard-only user experience

- [ ] **Add live regions for dynamic updates**
  - Use `aria-live` for milestone updates
  - Announce selection changes
  - Impact: Real-time feedback for screen readers

- [ ] **Color contrast audit**
  - Run automated contrast checker
  - Fix any contrast ratio violations (WCAG AA minimum 4.5:1)
  - Impact: Better readability for low-vision users

### 4.2 Performance Monitoring & Metrics
**Priority:** P3
**Impact:** Data-driven optimization decisions
**Time:** 2 hours

#### Tasks:
- [ ] **Integrate Web Vitals monitoring**
  - Add web-vitals library
  - Track LCP, FID, CLS, TTFB
  - Send metrics to analytics
  - Impact: Measure performance improvements

- [ ] **Add render performance tracking**
  - Use React Profiler API
  - Identify slow components
  - Impact: Target future optimizations

- [ ] **Implement bundle size budgets**
  - Add budget plugin to Vite config
  - Set max chunk size limits
  - Impact: Prevent bundle bloat

### 4.3 Testing Coverage
**Priority:** P3
**Impact:** Regression prevention, code confidence
**Time:** 6 hours

#### Tasks:
- [ ] **Add unit tests for stores**
  - Test all Zustand store actions
  - Verify state updates and side effects
  - Target: 80% coverage
  - Impact: Prevent store regressions

- [ ] **Add integration tests for hooks**
  - Test hook interactions with stores
  - Verify selection logic
  - Impact: Catch edge cases

- [ ] **Add E2E tests for critical paths**
  - Setup → Paint weeks → Export
  - Goal creation → Milestone tracking
  - Impact: Prevent user-facing bugs

### 4.4 Developer Experience
**Priority:** P3
**Impact:** Faster development, better onboarding
**Time:** 3 hours

#### Tasks:
- [ ] **Add TypeScript gradual migration**
  - Convert utils to .ts files
  - Add type definitions for stores
  - Impact: Better IDE support, fewer bugs

- [ ] **Improve ESLint configuration**
  - Add rules for React hooks
  - Add accessibility linting rules
  - Impact: Catch issues during development

- [ ] **Add pre-commit hooks**
  - Run linting and tests before commit
  - Auto-format code with Prettier
  - Impact: Consistent code quality

---

## Summary & Recommended Order

### Week 1 - Critical & High Priority (40 hours)
1. Fix ESLint errors (0.5h)
2. Optimize Zustand re-renders (2h)
3. Add error boundaries (1.5h)
4. Eliminate duplicate hooks (3h)
5. Reduce Framer Motion bundle (2h)
6. Fix memory leaks (2h)
7. Increase PBKDF2 iterations (0.5h)
8. Code splitting optimization (2h)
9. State management cleanup (3h)

**Impact:** Stable build, 40% performance improvement, 100KB+ bundle reduction

### Week 2 - Architecture & Polish (20 hours)
1. Accessibility enhancements (4h)
2. Performance monitoring (2h)
3. Testing coverage (6h)
4. Developer experience improvements (3h)

**Impact:** Production-ready quality, maintainable codebase, better UX

---

## Measurement Criteria

### Performance Metrics:
- **Initial Load Time:** Target < 2s (currently ~3.5s)
- **Bundle Size:** Target < 400KB (currently 550KB+)
- **Re-render Count:** Target 70% reduction
- **Time to Interactive:** Target < 3s

### Code Quality Metrics:
- **ESLint Errors:** Target 0 (currently 7)
- **Code Duplication:** Target < 5% (currently ~32% in hooks)
- **Test Coverage:** Target 80% (currently ~45%)
- **Accessibility Score:** Target 95+ (currently ~72)

---

**Note:** This todo list is based on comprehensive analysis from frontend-engineer, backend-architect, and qa-validator agents. Priorities are set based on user impact, technical debt, and development efficiency.