# Viventiva - Immediate Action Plan

**Created:** November 8, 2025
**Status:** Pre-Launch Blockers
**Target Launch Date:** November 25, 2025 (17 days)

---

## Critical Path to Launch

### Week 1: Fix Blockers (Nov 8-15)

#### Day 1-2: Authentication Fixes
**Owner:** Development Team
**Priority:** CRITICAL

- [ ] Review uncommitted changes in 8 files (455 lines)
- [ ] Test authentication fixes locally
  - [ ] Google OAuth login → verify redirect → verify session persists
  - [ ] Facebook OAuth login → verify redirect → verify session persists
  - [ ] Email login → verify session persists
  - [ ] Page refresh → verify user stays logged in
- [ ] Test error scenarios
  - [ ] OAuth cancelled by user
  - [ ] Invalid credentials
  - [ ] Network failure
  - [ ] Brave Shields blocking
- [ ] Commit authentication fixes
- [ ] Write E2E tests for auth flow (Playwright)
- [ ] Document authentication flow in code comments

**Success Criteria:**
- All 3 OAuth providers work end-to-end
- Session persists across page refreshes
- Error messages guide users to solutions
- Tests pass for happy path and error scenarios

---

#### Day 3: Database Schema Completion
**Owner:** Development Team
**Priority:** CRITICAL

**Current Issue:** Code references tables that don't exist in schema

1. **Add user_selections table:**
   ```sql
   CREATE TABLE IF NOT EXISTS user_selections (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
     selections_data JSONB DEFAULT '{}'::jsonb,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   -- Add RLS policies (copy from user_milestones pattern)
   -- Add indexes
   -- Add updated_at trigger
   ```

2. **Merge user_settings into main schema:**
   - Copy sql/create_user_settings_table.sql into supabase-setup.sql
   - Remove separate file
   - Update documentation

3. **Deploy to Supabase:**
   - Run updated schema in SQL Editor
   - Verify all tables created
   - Test data operations

**Success Criteria:**
- All tables referenced in code exist in database
- RLS policies working correctly
- No errors when saving/loading data

---

#### Day 4-5: Legal & Compliance
**Owner:** Product/Legal
**Priority:** HIGH

1. **Privacy Policy:**
   - Data collected: Email, name, birth date, mood data
   - Data usage: Service provision only
   - Data sharing: None (except Supabase as processor)
   - Data retention: Until account deletion
   - User rights: Export, delete (GDPR)
   - Contact information
   - Last updated date

2. **Terms of Service:**
   - Service description
   - User responsibilities
   - Intellectual property
   - Limitation of liability
   - Termination clause
   - Dispute resolution
   - Governing law

3. **Cookie Consent:**
   - Install cookie consent library (e.g., cookie-consent-js)
   - Categorize cookies (Essential, Analytics)
   - Add banner to HomePage
   - Implement opt-out for analytics

**Success Criteria:**
- Privacy Policy published (src/components/PrivacyPolicy.jsx)
- Terms of Service published (src/components/TermsOfService.jsx)
- Cookie consent banner functional
- Footer links updated

---

#### Day 6-7: Error Monitoring & Testing
**Owner:** Development Team
**Priority:** HIGH

1. **Sentry Setup:**
   ```bash
   npm install @sentry/react
   ```
   - Create Sentry account (free tier)
   - Add DSN to .env
   - Wrap App in Sentry ErrorBoundary
   - Test error reporting
   - Set up alerts (email/Slack)

2. **Testing:**
   - Run test suite: `npm run test`
   - Run coverage: `npm run test:coverage`
   - Fix failing tests
   - Add tests for auth flow (critical)
   - Manual testing:
     - [ ] Chrome (Desktop)
     - [ ] Safari (Desktop + Mobile)
     - [ ] Firefox (Desktop)
     - [ ] Edge (Desktop)
     - [ ] Chrome (Android)
     - [ ] Safari (iOS)

**Success Criteria:**
- Sentry configured and receiving errors
- Test coverage >70% on critical paths
- All browsers tested, no blockers
- Known issues documented

---

### Week 2: Polish & Deploy (Nov 16-22)

#### Day 8-9: Final Polish
**Owner:** Development Team
**Priority:** MEDIUM

1. **Onboarding Tutorial:**
   - Add intro overlay on first login
   - Explain week grid concept
   - Show how to paint moods
   - Add milestones/goals
   - Dismissible (store in localStorage)

2. **Error Message Improvements:**
   - Replace generic errors with specific guidance
   - Add "Try again" buttons
   - Link to troubleshooting docs
   - Show error codes for support

3. **Performance:**
   - Run Lighthouse audit
   - Fix any critical issues
   - Optimize images (WebP)
   - Minimize JavaScript

**Success Criteria:**
- Lighthouse score >90 (Performance, Accessibility, Best Practices)
- First-time users understand how to use the app
- Error messages helpful and actionable

---

#### Day 10-11: Deployment
**Owner:** DevOps/Development
**Priority:** HIGH

1. **Netlify Production Deployment:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

2. **Environment Variables:**
   - Add VITE_SUPABASE_URL in Netlify dashboard
   - Add VITE_SUPABASE_ANON_KEY
   - Add VITE_SENTRY_DSN

3. **Custom Domain (Optional):**
   - Register domain (e.g., viventiva.app)
   - Configure in Netlify
   - Update OAuth redirect URLs

4. **OAuth Redirect URLs:**
   - Update Google OAuth: Add production URL
   - Update Facebook OAuth: Add production URL
   - Test OAuth on production

**Success Criteria:**
- App deployed and accessible
- All environment variables configured
- OAuth working on production
- HTTPS enabled
- No errors in Sentry

---

#### Day 12-14: Soft Launch & Monitoring
**Owner:** Product Team
**Priority:** MEDIUM

1. **Analytics Setup:**
   - Choose: Google Analytics OR Plausible (privacy-focused)
   - Create account
   - Add tracking code
   - Set up goals (signup, profile complete, week painted)

2. **Soft Launch:**
   - Share with 10-20 friends/family
   - Ask for honest feedback
   - Monitor Sentry for errors
   - Monitor analytics for drop-off points

3. **Bug Fixes:**
   - Triage reported issues
   - Fix critical bugs immediately
   - Document known issues

**Success Criteria:**
- 20+ test users
- No critical bugs reported
- Analytics tracking correctly
- Feedback collected and prioritized

---

### Week 3: Public Launch (Nov 23-25)

#### Day 15: Pre-Launch Checklist
**Owner:** Product Team
**Priority:** HIGH

- [ ] All critical bugs fixed
- [ ] Legal pages published
- [ ] Analytics configured
- [ ] Sentry monitoring active
- [ ] Performance optimized (Lighthouse >90)
- [ ] Mobile tested thoroughly
- [ ] OAuth working (all providers)
- [ ] Database schema complete
- [ ] Error handling comprehensive
- [ ] Onboarding tutorial ready
- [ ] Social media accounts created
- [ ] Press materials prepared
- [ ] Product Hunt listing drafted
- [ ] HackerNews post drafted
- [ ] Reddit posts drafted

---

#### Day 16: Launch Day
**Owner:** Marketing/Product
**Priority:** CRITICAL

**9:00 AM PST - Product Hunt Launch:**
- Post on Product Hunt
- Share on Twitter/X
- Email personal network
- Post in relevant Slack/Discord communities

**12:00 PM PST - HackerNews:**
- Post Show HN thread
- Engage with comments
- Monitor for technical questions

**3:00 PM PST - Reddit:**
- r/productivity
- r/selfimprovement
- r/SideProject
- r/webdev (Show & Tell Saturday)

**Ongoing:**
- Respond to comments/feedback within 1 hour
- Monitor Sentry for errors
- Monitor analytics for drop-offs
- Fix critical bugs immediately
- Celebrate! 🎉

---

#### Day 17: Post-Launch Monitoring
**Owner:** Entire Team
**Priority:** HIGH

**Metrics to Watch:**
- Signups (goal: 50+)
- Activation rate (% who complete profile)
- Week-1 retention
- Error rate (<1%)
- Page load time (<2s)
- Conversion points (where users drop off)

**Actions:**
- Daily review of Sentry errors
- Daily review of user feedback
- Prioritize quick fixes
- Plan iteration roadmap

---

## Resource Requirements

### People
- 1 Full-stack Developer (you)
- 1 Designer/Copywriter (for legal docs)
- 5-10 Beta testers (soft launch)

### Tools (All Free Tier)
- Supabase (database + auth) - FREE
- Netlify (hosting) - FREE
- Sentry (error monitoring) - FREE (5K errors/month)
- Plausible or GA (analytics) - FREE/FREE
- GitHub (code hosting) - FREE
- Figma (design) - FREE

### Budget
- Domain name: $12/year (optional)
- Total cost: $0-12 for first month

---

## Risk Mitigation

### High Risk: Authentication Still Broken
**Mitigation:**
- Dedicate 2 full days to testing (Day 1-2)
- Get external tester to verify
- Have rollback plan (previous working version)

### Medium Risk: Legal Docs Inadequate
**Mitigation:**
- Use TermsFeed generator (free)
- Review examples from similar apps
- Consult lawyer if budget allows

### Low Risk: Server Overload
**Mitigation:**
- Supabase auto-scales (within free tier limits)
- Monitor usage in dashboard
- Have upgrade plan ready ($25/mo)

---

## Success Metrics (Launch Week)

### User Metrics
- 100+ signups
- 70%+ activation rate
- 10+ moods painted per user
- 50%+ week-1 retention

### Technical Metrics
- 99.9%+ uptime
- <1% error rate
- <2s page load time
- 0 security incidents

### Business Metrics
- 500+ Product Hunt upvotes
- 10+ HackerNews comments
- 20+ Twitter shares
- 5+ pieces of positive feedback

---

## Daily Standup Format

**What did I do yesterday?**
- [List completed tasks]

**What will I do today?**
- [List planned tasks]

**Any blockers?**
- [List issues needing help]

**Launch readiness: X%**

---

## Emergency Contacts

**Supabase Issues:**
- Dashboard: https://app.supabase.com
- Support: support@supabase.com
- Docs: https://supabase.com/docs

**Netlify Issues:**
- Dashboard: https://app.netlify.com
- Support: support@netlify.com
- Status: https://www.netlifystatus.com

**Sentry Issues:**
- Dashboard: https://sentry.io
- Docs: https://docs.sentry.io

---

## Post-Launch (Week 4+)

### Immediate Priorities
1. Fix reported bugs
2. Respond to all user feedback
3. Implement quick wins from feedback
4. Plan iteration roadmap

### Month 1 Goals
- 1,000 total users
- 40% MAU (monthly active users)
- >80% positive feedback
- <1% error rate

### Month 2-3 Goals
- Add most-requested features
- Improve onboarding based on data
- Prepare monetization (Stripe)
- Build mobile app (React Native)

---

**Remember:** Done is better than perfect. Launch with the MVP, iterate based on real user feedback.

**Questions?** Review STRATEGIC_REVIEW.md for detailed analysis and long-term recommendations.
