# Viventiva - Setup Guide for Worldwide Launch

This guide will walk you through setting up Viventiva for a worldwide audience using **100% free services** (no payment required at this stage).

## 📋 Table of Contents

1. [Supabase Setup (Database & Authentication)](#1-supabase-setup)
2. [Environment Variables](#2-environment-variables)
3. [OAuth Provider Configuration](#3-oauth-provider-configuration)
4. [Testing Your Setup](#4-testing-your-setup)
5. [Deployment to Netlify](#5-deployment-to-netlify)
6. [What's Next](#6-whats-next)

---

## 1. Supabase Setup

Supabase provides PostgreSQL database, authentication, and real-time features - all free up to 500MB database and 50,000 monthly active users.

### Step 1.1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### Step 1.2: Create New Project

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `viventiva` (or your preferred name)
   - **Database Password**: Generate a strong password and **save it securely**
   - **Region**: Choose closest to your target audience (e.g., `us-east-1` for USA)
   - **Pricing Plan**: Select **"Free"** (no credit card required)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 1.3: Run Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl/Cmd + Enter`
6. You should see: `Success. No rows returned`

This creates all the necessary tables:
- `user_profiles` - User information (name, birthdate, life expectancy)
- `user_milestones` - Painted moods and milestones (stored as JSONB)
- `user_goals` - User goals and aspirations
- `user_subscriptions` - Subscription tiers (for future Stripe integration)

### Step 1.4: Get Your API Keys

1. In Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll need two values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
4. Keep this tab open - you'll need these in the next step

---

## 2. Environment Variables

### Step 2.1: Create .env File

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Replace the placeholder values with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://[your-project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ[your-actual-anon-key]
   ```

4. Leave Stripe empty for now:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
   ```

5. Save the file

⚠️ **IMPORTANT**: Never commit `.env` to git. It's already in `.gitignore`.

---

## 3. OAuth Provider Configuration

To enable Google, Facebook, and Apple login, you need to configure OAuth providers in Supabase.

### Step 3.1: Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **"Google+ API"**
4. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure OAuth consent screen:
   - **App name**: Viventiva
   - **User support email**: Your email
   - **Developer contact**: Your email
6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: Viventiva
   - **Authorized redirect URIs**:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```
7. Copy **Client ID** and **Client Secret**
8. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Google** and toggle it ON
   - Paste Client ID and Client Secret
   - Click **Save**

### Step 3.2: Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** as app type
4. Fill in app details:
   - **App name**: Viventiva
   - **App contact email**: Your email
5. In app dashboard, add **"Facebook Login"** product
6. Go to **Settings** → **Basic**:
   - Copy **App ID** and **App Secret**
7. Go to **Facebook Login** → **Settings**:
   - Add Valid OAuth Redirect URI:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```
8. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Facebook** and toggle it ON
   - Paste App ID and App Secret
   - Click **Save**

### Step 3.3: Apple OAuth (Optional - Requires Apple Developer Account)

⚠️ Apple Sign In requires a paid Apple Developer account ($99/year). You can skip this for now.

1. Go to [Apple Developer](https://developer.apple.com)
2. Create **"Services ID"** and configure Sign in with Apple
3. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Apple** and toggle it ON
   - Configure with your Services ID and Team ID

### Step 3.4: Email Authentication

Email/password authentication is **already enabled by default** in Supabase. No additional configuration needed!

---

## 4. Testing Your Setup

### Step 4.1: Install Dependencies

```bash
npm install
```

### Step 4.2: Run Development Server

```bash
npm run dev
```

### Step 4.3: Test the Authentication Flow

1. Open `http://localhost:5173` in your browser
2. Fill out the form on the homepage:
   - Enter your name
   - Select your date of birth
   - Set life expectancy (default: 80)
3. Click **"Create My Life Journey"**
4. You should see your life statistics preview
5. Click **"Continue to Create Account"**
6. Try logging in with:
   - **Google** (if configured)
   - **Facebook** (if configured)
   - **Email** (always works)

### Step 4.4: Verify Database

1. Go to Supabase dashboard
2. Click **"Table Editor"** in sidebar
3. Check that your data appears in:
   - `user_profiles`
   - `user_milestones`
   - `user_subscriptions`

---

## 5. Deployment to Netlify

Your app is already configured for Netlify deployment.

### Step 5.1: Build the App

```bash
npm run build
```

### Step 5.2: Deploy to Netlify

```bash
netlify deploy --prod
```

### Step 5.3: Add Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Click **"Site settings"** → **"Environment variables"**
3. Add the same variables from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **"Save"**
5. Trigger a new deploy to apply the variables

### Step 5.4: Update OAuth Redirect URLs

For each OAuth provider (Google, Facebook), add your Netlify URL to redirect URIs:

```
https://[your-netlify-subdomain].netlify.app/auth/callback
```

---

## 6. What's Next

### ✅ Currently Free & Ready:

- ✅ Supabase hosting (500MB database, 50K users/month)
- ✅ Netlify hosting (100GB bandwidth/month)
- ✅ Google OAuth (free)
- ✅ Facebook OAuth (free)
- ✅ Email authentication (free)
- ✅ PostgreSQL database with Row-Level Security
- ✅ Real-time capabilities (if you add them later)

### 📝 Before Public Launch:

1. **Create Terms of Service** - Legal requirement
2. **Create Privacy Policy** - GDPR compliance
3. **Add GDPR Features to UI**:
   - Data export button (code already written)
   - Account deletion button (code already written)
4. **Test thoroughly** with multiple users
5. **Set up error monitoring** (Sentry free tier: 5K errors/month)

### 💰 When Ready to Monetize:

1. **Stripe Integration**:
   - Subscription management
   - Pricing tiers (Vivid/Vivente/Viventiva Pro)
   - Code is already prepared in database schema
2. **Custom Domain**:
   - Register domain (~$12/year)
   - Configure in Netlify
3. **Email Service**:
   - Resend (250 emails/day free)
   - Or SendGrid (100 emails/day free)
4. **Analytics**:
   - Plausible Analytics (privacy-focused, $9/month)
   - Or Google Analytics (free)

### 📊 Scaling Limits (When to Upgrade):

**Supabase Free Tier:**
- 500MB database storage
- 50K monthly active users
- 2GB file storage
- 5GB bandwidth

**Netlify Free Tier:**
- 100GB bandwidth/month
- Unlimited sites
- Automatic HTTPS

**When you exceed these, upgrade to:**
- Supabase Pro: $25/month (8GB database, 100K users)
- Netlify Pro: $19/month (400GB bandwidth)

---

## 🎉 Congratulations!

Your Viventiva app is now ready for worldwide launch - completely free until you start charging users!

### Support

If you encounter any issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure OAuth redirect URLs match exactly

### Quick Reference

- **Supabase Dashboard**: [https://app.supabase.com](https://app.supabase.com)
- **Netlify Dashboard**: [https://app.netlify.com](https://app.netlify.com)
- **Local Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Deploy**: `netlify deploy --prod`
