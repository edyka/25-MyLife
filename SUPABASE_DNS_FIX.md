# 🔧 Supabase DNS Error Fix Guide

## ❌ Problem
**Error:** `DNS_PROBE_POSSIBLE` - Cannot resolve `jnzwuknbqpihuhbdbhhv.supabase.co`

**Cause:** The Supabase project domain doesn't exist in DNS, which typically means:
- Project was deleted or paused
- Project was inactive for too long (free tier projects pause after inactivity)
- Project ID is incorrect

---

## ✅ Solutions

### Option 1: Check Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com
   ```

2. **Sign in** with your account (GitHub/Google/Email)

3. **Check your projects:**
   - Look for a project with ID: `jnzwuknbqpihuhbdbhhv`
   - Or check if you have any active projects

4. **If project exists but is paused:**
   - Click on the project
   - Click "Restore" or "Resume" button
   - Wait a few minutes for DNS to propagate

5. **If project doesn't exist:**
   - You'll need to create a new project (see Option 2)

---

### Option 2: Create New Supabase Project

If your project was deleted, create a new one:

1. **Go to:** https://app.supabase.com

2. **Click "New Project"**

3. **Fill in details:**
   - **Name:** `viventiva` (or your preferred name)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free (no credit card needed)

4. **Wait 2-3 minutes** for project to initialize

5. **Get your new credentials:**
   - Go to: **Settings** → **API**
   - Copy:
     - **Project URL:** `https://[new-project-id].supabase.co`
     - **anon public key:** `eyJ...`

6. **Update `.env` file:**
   ```bash
   VITE_SUPABASE_URL=https://[new-project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=[new-anon-key]
   ```

7. **Run database schema:**
   - Go to: **SQL Editor** in Supabase dashboard
   - Copy contents of `supabase-setup.sql`
   - Paste and run it

8. **Configure Google OAuth:**
   - Go to: **Authentication** → **Providers**
   - Enable Google
   - Add Client ID and Secret from Google Cloud Console
   - Add redirect URI: `https://[new-project-id].supabase.co/auth/v1/callback`

---

### Option 3: Reactivate Existing Project

If project was paused due to inactivity:

1. **Sign in to Supabase Dashboard**

2. **Find your project** (might be in "Paused" section)

3. **Click "Restore"** or "Resume"

4. **Wait 5-10 minutes** for DNS to update

5. **Test connection:**
   ```bash
   curl -I https://jnzwuknbqpihuhbdbhhv.supabase.co
   ```

---

## 🔍 How to Find Your Project

### Check Email
- Look for emails from Supabase about project status
- Check for "Project paused" or "Project deleted" notifications

### Check Dashboard
- All projects are listed at: https://app.supabase.com/projects
- Paused projects show a "Restore" button
- Deleted projects won't appear (need to create new)

---

## 🔐 After Fixing DNS

Once you have a working Supabase project:

1. **Update `.env` file** with new credentials

2. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Test the connection:**
   ```bash
   curl https://[your-project-id].supabase.co/auth/v1/health
   ```

4. **Test Google login again** in the browser

---

## 📝 Quick Checklist

- [ ] Check Supabase Dashboard for project status
- [ ] If paused: Click "Restore"
- [ ] If deleted: Create new project
- [ ] Update `.env` with correct credentials
- [ ] Run `supabase-setup.sql` in SQL Editor
- [ ] Configure Google OAuth provider
- [ ] Restart dev server
- [ ] Test Google login

---

## 🆘 Still Having Issues?

### Check Network:
```bash
# Test if other Supabase projects work
curl -I https://app.supabase.com

# Check your internet connection
ping google.com
```

### Common Issues:
- **Wrong project ID:** Double-check the URL in `.env`
- **DNS cache:** Try `sudo dscacheutil -flushcache` (Mac) or restart browser
- **Firewall/VPN:** May block Supabase domains

---

## 💡 Prevention

To avoid this in the future:
- **Keep projects active:** Use free tier projects regularly
- **Set up monitoring:** Get notified if project pauses
- **Backup credentials:** Save project URL and keys securely
- **Document setup:** Keep notes on which project you're using

---

**Next Steps:** Go to https://app.supabase.com and check your project status!

