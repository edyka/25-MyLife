# 🧪 Testing Google Login - Quick Guide

## ✅ Dev Server Running

Your Viventiva app is now running at: **http://localhost:5173**

Two browser windows/tabs should have opened:

---

## 🔍 Option 1: Test in Main App

**URL:** http://localhost:5173

### Steps to Test:
1. ✅ **Homepage should load** - You'll see the Viventiva landing page
2. 🖱️ **Click "Log In" or "Sign Up"** button (top right)
3. 🪟 **Login modal appears** with authentication options
4. 🔵 **Click "Continue with Google"** button
5. ⏳ **Wait for redirect** to Google authentication
6. 🔐 **Sign in with your Google account**
7. ↩️ **Redirected back** to Viventiva
8. ✅ **Should load MainApp** with your life grid

### What to Watch For:
- ✅ Modal opens smoothly
- ✅ Google button is clickable
- ✅ Redirects to Google login
- ✅ Returns to app after auth
- ✅ Profile loads from Supabase
- ✅ Week grid displays correctly

### If It Works:
🎉 **Perfect!** Your Google OAuth is working correctly.

### If It Doesn't Work:
Check browser console (F12) for errors:
- Red errors about "Provider not enabled" → Check Supabase Dashboard
- Errors about "redirect_uri" → Check Google Cloud Console
- No redirect happens → Check browser console for JavaScript errors

---

## 🔬 Option 2: Test with Isolated Tool

**File:** test-google-auth.html (should open automatically)

This standalone page tests ONLY the OAuth functionality:

### Features:
- 🔍 **Configuration Check** - Validates Supabase connection
- 🚀 **Test Google Login** - Isolated OAuth flow
- 👤 **Check Session** - Verify authentication state
- 🗄️ **Database Test** - Check profile loading
- 🚪 **Sign Out** - Test logout functionality
- 📝 **Live Logging** - See real-time debug info

### How to Use:
1. **Click "Test Google Login"** - Starts OAuth flow
2. **Authenticate with Google**
3. **You'll be redirected back** to the test page
4. **Click "Check Current Session"** - Verify you're logged in
5. **Check the logs** - See detailed authentication info

### Advantages:
- ✅ No distractions from main app UI
- ✅ Detailed error messages
- ✅ Real-time logging
- ✅ Easy to share with support if issues arise

---

## 🐛 Troubleshooting

### Issue: Nothing happens when clicking Google button

**Possible causes:**
1. Supabase provider not enabled
2. Environment variables not loaded
3. JavaScript error blocking execution

**How to debug:**
1. Open browser console (F12)
2. Look for red error messages
3. Check Network tab for failed requests

### Issue: "Provider not enabled" error

**Solution:**
1. Go to: https://app.supabase.com/project/jnzwuknbqpihuhbdbhhv
2. Navigate: Authentication → Providers
3. Find Google and toggle it ON
4. Add your Client ID and Client Secret from Google Cloud Console
5. Click Save

### Issue: "Invalid redirect URI" error

**Solution:**
1. Go to: https://console.cloud.google.com
2. Navigate: APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Add to Authorized redirect URIs:
   ```
   https://jnzwuknbqpihuhbdbhhv.supabase.co/auth/v1/callback
   http://localhost:5173/
   ```
5. Click Save

### Issue: Redirects but doesn't log in

**Possible causes:**
1. Session not being saved (check cookies enabled)
2. Callback not being processed
3. Database connection issue

**How to debug:**
1. Check browser console for errors
2. Look for console.log messages starting with `[Viventiva]`
3. Check Supabase Dashboard → Authentication → Users to see if user was created

---

## 📊 What Should Happen (Step by Step)

### Successful Auth Flow:

```
1. Click "Continue with Google"
   ↓
2. Modal stays open, loading state shows
   ↓
3. Browser redirects to Google
   ↓
4. You see Google's login/account selection screen
   ↓
5. Select account and authorize
   ↓
6. Browser redirects back to http://localhost:5173#access_token=...
   ↓
7. App.jsx detects the access_token in URL hash
   ↓
8. Supabase processes the session
   ↓
9. App loads user profile from database
   ↓
10. Console logs: "[Viventiva OAuth] Loading returning user profile..."
   ↓
11. Console logs: "[Viventiva OAuth] Loading milestones..."
   ↓
12. MainApp renders with your life grid
   ↓
13. ✅ SUCCESS! You're authenticated and viewing your life visualization
```

### Console Logs to Look For:

**On successful auth:**
```
[Viventiva OAuth] OAuth callback detected! Processing authentication...
[Viventiva OAuth] Loading returning user profile: {name: "...", ...}
[Viventiva OAuth] Loading milestones: {...}
[Viventiva OAuth] Setting milestones from Supabase: X weeks
```

**If first-time user:**
```
[Viventiva OAuth] New user - needs to complete profile
```

---

## 🎯 Expected Results

### ✅ Everything Working:
- Google button is clickable
- Redirects to Google without errors
- Returns to app after authentication
- User is logged in and can see their data
- No errors in browser console

### ⚠️ Configuration Issue:
- Error messages about provider or credentials
- Check Supabase/Google Cloud settings
- **Not a code issue** - just configuration

### ❌ Code Issue:
- JavaScript errors in console
- White screen / React errors
- Let me know and I'll help fix!

---

## 📝 Testing Checklist

Use this to verify everything works:

- [ ] Homepage loads at http://localhost:5173
- [ ] "Log In" / "Sign Up" buttons visible
- [ ] Clicking button opens login modal
- [ ] Modal shows Google button with logo
- [ ] Clicking "Continue with Google" starts redirect
- [ ] Google authentication page appears
- [ ] Can select Google account
- [ ] Returns to Viventiva after auth
- [ ] Profile loads (or setup page if new user)
- [ ] Can paint weeks on the grid
- [ ] No errors in browser console
- [ ] Test page also works (test-google-auth.html)

---

## 🚀 Quick Commands

### Restart dev server:
```bash
# Stop: Ctrl+C in terminal
npm run dev
```

### Check logs:
```bash
# Browser console: F12 or Cmd+Option+I (Mac)
# Look for [Viventiva] messages
```

### Check Supabase:
```bash
# Open dashboard
open https://app.supabase.com/project/jnzwuknbqpihuhbdbhhv
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check browser console** (F12) - look for red errors
2. **Check `GOOGLE_AUTH_ANALYSIS.md`** - comprehensive troubleshooting
3. **Use test-google-auth.html** - isolated testing environment
4. **Check Supabase logs** - Dashboard → Logs
5. **Let me know** - I'm here to help debug!

---

**🎉 Fingers crossed for a successful test!**

The app should be open in your browser now. Try clicking the Google login button and let me know what happens!

---

*Dev server running on: http://localhost:5173*  
*Test tool: test-google-auth.html*  
*Ctrl+C to stop server*

