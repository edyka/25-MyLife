# Viventiva Setup Instructions

This document provides step-by-step instructions for setting up the remaining items from STRATEGIC_REVIEW.md.

## ✅ Already Completed

- Database schema updated (`supabase-setup.sql`)
- Privacy Policy complete
- Terms of Service complete
- Cookie consent banner implemented
- Sentry SDK installed and configured
- Analytics utility created (Plausible/GA)
- Retry logic implemented for Supabase syncs
- Pre-commit hooks configured (Husky)
- CI/CD pipeline created (GitHub Actions)
- Content Security Policy headers configured

---

## 🔧 Setup Required

### 1. Database Schema (CRITICAL)

**Action Required:** Run the updated `supabase-setup.sql` in your Supabase SQL Editor.

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute
5. Verify all tables are created:
   - `user_profiles`
   - `user_milestones`
   - `user_goals`
   - `user_selections` ✅ NEW
   - `user_settings` ✅ NEW
   - `user_subscriptions`

---

### 2. Sentry Error Monitoring (Optional but Recommended)

**Action Required:** Set up Sentry account and add DSN to environment variables.

1. Go to https://sentry.io and create a free account
2. Create a new project (React)
3. Copy your DSN (Data Source Name)
4. Add to your `.env` file:
   ```
   VITE_SENTRY_DSN=your_sentry_dsn_here
   ```
5. The code is already configured - errors will automatically be reported

**Note:** Sentry is already integrated in:
- `src/utils/sentry.js` - Configuration
- `src/main.jsx` - Initialization
- `src/components/ErrorBoundary.jsx` - Error reporting

---

### 3. Analytics Setup (Optional)

Choose one:

#### Option A: Plausible (Privacy-Friendly, Recommended)

1. Go to https://plausible.io and create an account
2. Add your domain
3. Add to your `.env` file:
   ```
   VITE_PLAUSIBLE_DOMAIN=yourdomain.com
   ```
4. Analytics will automatically initialize

#### Option B: Google Analytics 4

1. Go to https://analytics.google.com
2. Create a GA4 property
3. Get your Measurement ID (G-XXXXXXXXXX)
4. Add to your `.env` file:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Note:** Analytics code is already integrated in `src/utils/analytics.js` and `src/main.jsx`

---

### 4. Environment Variables

Create a `.env` file in the root directory (if it doesn't exist):

```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - Error Monitoring
VITE_SENTRY_DSN=

# Optional - Analytics (choose one)
VITE_PLAUSIBLE_DOMAIN=
# OR
VITE_GA_MEASUREMENT_ID=
```

**Note:** `.env.example` file has been created as a template.

---

### 5. GitHub Secrets (for CI/CD)

If you want to use the CI/CD pipeline, add these secrets to your GitHub repository:

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NETLIFY_AUTH_TOKEN` - Get from Netlify dashboard → User settings → Applications
   - `NETLIFY_SITE_ID` - Get from Netlify site settings

---

### 6. Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SENTRY_DSN` (optional)
   - `VITE_PLAUSIBLE_DOMAIN` or `VITE_GA_MEASUREMENT_ID` (optional)

---

### 7. Pre-commit Hooks

The Husky pre-commit hook is already configured. It will:
- Run ESLint on staged files
- Format code with Prettier
- Prevent commits with linting errors

**First time setup:**
```bash
npm run prepare
```

This will initialize Husky. The `.husky/pre-commit` hook is already created.

---

## 📋 Testing Checklist

Before launch, test:

- [ ] Email login works
- [ ] OAuth login works (Google, Facebook, Apple)
- [ ] Session persists on page refresh
- [ ] Logout works correctly
- [ ] Profile setup flow works
- [ ] Week painting saves to Supabase
- [ ] Settings sync to Supabase
- [ ] Cookie consent banner appears
- [ ] Privacy Policy page loads
- [ ] Terms of Service page loads
- [ ] Footer links work
- [ ] Error boundary catches errors
- [ ] Analytics tracks events (if configured)
- [ ] Sentry reports errors (if configured)

---

## 🚀 Deployment Checklist

- [ ] Run database schema in Supabase
- [ ] Set up Sentry account (optional)
- [ ] Set up analytics (optional)
- [ ] Add environment variables to Netlify
- [ ] Test production build locally: `npm run build`
- [ ] Deploy to Netlify
- [ ] Configure custom domain
- [ ] Test all features in production
- [ ] Monitor error logs

---

## 📝 Notes

- All code changes are complete
- Database schema needs to be run in Supabase
- Environment variables need to be configured
- Optional services (Sentry, Analytics) can be added later
- CI/CD will work automatically once GitHub secrets are configured

---

## 🆘 Troubleshooting

### Database Errors
- Make sure you ran the complete `supabase-setup.sql` script
- Check that RLS policies are enabled on all tables
- Verify user_id foreign keys are correct

### Sentry Not Working
- Check that `VITE_SENTRY_DSN` is set correctly
- Verify DSN format: `https://xxx@xxx.ingest.sentry.io/xxx`
- Check browser console for Sentry initialization messages

### Analytics Not Working
- Verify environment variable is set correctly
- Check browser console for analytics initialization
- For Plausible: Make sure domain matches exactly
- For GA: Verify Measurement ID format (G-XXXXXXXXXX)

### Pre-commit Hooks Not Running
- Run `npm run prepare` to initialize Husky
- Check that `.husky/pre-commit` file exists and is executable
- Verify `lint-staged` is in `package.json`

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Plausible Documentation](https://plausible.io/docs)
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)
- [Netlify Deployment Guide](https://docs.netlify.com/)

