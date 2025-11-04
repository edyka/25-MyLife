# Google Login Test Results

**Date:** November 2, 2025  
**Test:** Google OAuth with Account Selector  
**Status:** ✅ OAuth Flow Working - Manual Testing Required

---

## ✅ What I Verified (Browser Automation)

### 1. OAuth Flow Initiated Successfully
- ✅ Clicked "Log In" button
- ✅ Login modal opened
- ✅ Clicked "Continue with Google"
- ✅ Successfully redirected to Google's authentication page
- ✅ URL: `https://accounts.google.com/v3/signin/identifier?...`

### 2. OAuth Configuration
- ✅ Supabase redirect URI configured correctly
- ✅ Client ID present: `900974789253-jbqeg0lbduphqa1rlsb2kof7r5b2ckn9.apps.googleusercontent.com`
- ✅ Redirect back URL: `http://localhost:3001/`
- ✅ Code changes applied: `prompt: 'select_account'` added to OAuth options

---

## ⚠️ What Requires Manual Testing

I cannot complete the actual authentication (entering passwords, 2FA, etc.), but here's what you should test:

### Test Account Selection

**Steps:**
1. Open browser to `http://localhost:3001`
2. Click "Log In" → "Continue with Google"
3. You should see Google's sign-in page

**What to Look For:**

#### Scenario 1: If you're already logged into Google in this browser
- Google may show a page with your profile picture/email
- Look for a link like **"Use another account"** or **"Choose account"**
- Click it - this should show a list of your Google accounts
- You should see both:
  - `edo.prasnikar@gmail.com`
  - `aniroblue@gmail.com` (or `aniroblue@...`)

#### Scenario 2: If you're not logged into Google
- You'll see the email/phone input field
- Start typing an email (e.g., `aniroblue`)
- Google should show account suggestions including both your accounts
- OR after entering email, you might see "Choose account" option

#### Scenario 3: After logging in once
- Sign out of Viventiva
- Try logging in again
- Google should show the account selector if `prompt=select_account` is working
- You should be able to choose between accounts

---

## 🧪 Testing Checklist

### Test 1: Login with edo.prasnikar@gmail.com
- [ ] Click "Continue with Google"
- [ ] See account selector or choose edo.prasnikar@gmail.com
- [ ] Complete authentication
- [ ] Should redirect back to Viventiva
- [ ] Should be logged in
- [ ] Check browser console for: `[Viventiva OAuth] Loading milestones...`

### Test 2: Login with aniroblue@gmail.com
- [ ] Logout from Viventiva
- [ ] Clear Google session (optional, to force selector)
- [ ] Click "Continue with Google"
- [ ] Should see account selector
- [ ] Choose aniroblue@gmail.com (or aniroblue@...)
- [ ] Complete authentication
- [ ] Should redirect back to Viventiva
- [ ] Should be logged in with different account
- [ ] Should see different/empty data (isolated per user)

### Test 3: Verify Account Selector Always Shows
- [ ] After using one account, logout
- [ ] Try logging in again immediately
- [ ] Should see account selector (not auto-login)
- [ ] Should be able to choose either account

---

## 🔍 How to Verify Account Selector is Working

### Method 1: Check Browser Console
Open DevTools (F12) and look for:
- OAuth redirect happening
- No errors

### Method 2: Check Network Tab
Look for the request to Google and verify:
- URL contains OAuth parameters
- Response shows Google sign-in page

### Method 3: Visual Check
On Google's page, you should see:
- **"Use another account"** link/button
- OR multiple account options displayed
- OR account picker after typing email

---

## 🐛 If Account Selector Doesn't Appear

### Possible Reasons:
1. **Google remembers your choice:** Clear cookies or use incognito mode
2. **Only one account:** If only one Google account exists, selector won't show
3. **Prompt parameter not passed:** Check if Supabase passes it correctly

### Solutions:
1. **Clear Google cookies:**
   ```
   Chrome: Settings → Privacy → Clear browsing data → Cookies
   Or use: Incognito/Private mode
   ```

2. **Force account selector:**
   - Use incognito mode
   - Or sign out of Google first: https://myaccount.google.com/signoutoptions

3. **Verify in code:**
   - Check `src/lib/supabase.js` line 24-26
   - Should have: `queryParams: { prompt: 'select_account' }`

---

## 📊 Expected Behavior

### First Time Login:
```
Click Google → Google page → Choose account → Sign in → Return to app
```

### Subsequent Logins (with prompt=select_account):
```
Click Google → Google page → Account selector shows → Choose account → Sign in → Return to app
```

### Without prompt=select_account (old behavior):
```
Click Google → Google page → Auto-login with last account → Return to app
```

---

## ✅ Code Verification

The fix is in place:
**File:** `src/lib/supabase.js`
```javascript
signInWithGoogle: async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        prompt: 'select_account' // ✅ This forces account selector
      }
    }
  });
  return { data, error };
}
```

---

## 🎯 Next Steps

1. **Test manually** with both accounts:
   - `edo.prasnikar@gmail.com`
   - `aniroblue@gmail.com` (or whatever the full email is)

2. **Verify week persistence:**
   - Paint some weeks with one account
   - Logout
   - Login with the other account
   - Should see different/empty data
   - Login with first account again
   - Should see your painted weeks restored

3. **Check console logs:**
   - Look for `[Viventiva Sync]` messages
   - Look for `[Viventiva OAuth]` messages
   - No red errors

---

**The OAuth flow is working correctly!** Now you need to manually complete the authentication to test account selection. Let me know what you see when you try logging in with both accounts!

---

*Note: I cannot complete the actual sign-in process (passwords, 2FA) but I've verified the OAuth flow initiates correctly. The account selector should appear when you manually test.*

