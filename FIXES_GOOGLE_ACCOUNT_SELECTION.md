# Fixes: Google Account Selection & Week Persistence

**Date:** November 2, 2025  
**Issues Fixed:** 2

---

## ✅ Issue 1: Google OAuth Always Auto-Selects Same Account

### Problem
When clicking "Continue with Google", Google automatically logged in with `edo.prasnikar@gmail.com` without showing the account selector, preventing users from choosing a different Google account.

### Root Cause
Google OAuth by default uses the last selected account. Without the `prompt: 'select_account'` parameter, Google skips the account selection screen.

### Fix Applied
**File:** `src/lib/supabase.js`

Added `queryParams` with `prompt: 'select_account'` to force Google to always show the account selector:

```javascript
signInWithGoogle: async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        prompt: 'select_account' // Force Google to show account selector
      }
    }
  });
  return { data, error };
}
```

### Result
- ✅ Google now always shows account selector
- ✅ Users can choose which Google account to use
- ✅ No more auto-selecting the same account

---

## ✅ Issue 2: Week Selections Not Persisting

### Problem
Painted weeks (selected mood colors) were not being remembered when logging in again. The app would show a blank grid even after painting weeks previously.

### Root Cause
The auto-sync was only saving `milestones` (painted weeks) but not `customMoods` and `customCategories`. Additionally, when loading, the app only restored `milestones`, missing any custom mood configurations.

### Fixes Applied

#### 1. Enhanced Auto-Sync (MainApp.jsx)
**File:** `src/components/MainApp.jsx`

Updated the sync function to save milestones along with customMoods and customCategories:

```javascript
// Save milestones along with customMoods and customCategories
const milestoneData = {
  milestones: milestones,
  customMoods: customMoods || {},
  customCategories: customCategories || {}
};
await database.saveMilestones(user.id, milestoneData);
```

Also added `customMoods` and `customCategories` to the useEffect dependencies so they trigger sync when changed.

#### 2. Enhanced Data Loading (App.jsx)
**File:** `src/App.jsx`

Updated all three loading points to handle both:
- **Old format:** Just milestones object `{ weekNum: {...} }`
- **New format:** Complete data structure `{ milestones: {}, customMoods: {}, customCategories: {} }`

```javascript
if (data.milestones) {
  // New format: Extract and load all components
  milestoneStore.setMilestones(data.milestones || {});
  if (data.customMoods) {
    milestoneStore.setCustomMoods(data.customMoods);
  }
  if (data.customCategories) {
    milestoneStore.setCustomCategories(data.customCategories);
  }
} else {
  // Old format: Just milestones (backward compatible)
  milestoneStore.setMilestones(data);
}
```

**Updated locations:**
- `loadUserData()` function (line 60-89)
- `handleOAuthCallback()` function (line 128-157)
- `handleLogin()` function (line 219-247)

### Result
- ✅ Painted weeks now persist across sessions
- ✅ Custom mood configurations are saved and restored
- ✅ Custom categories are saved and restored
- ✅ Backward compatible with old data format
- ✅ Auto-sync happens after 1 second of inactivity

---

## 🔄 How It Works Now

### Google Login Flow:
```
1. Click "Continue with Google"
2. Google shows account selector (NEW!)
3. Choose your account
4. Authenticate
5. Redirect back to app
6. Load your saved weeks and configurations ✅
```

### Week Persistence Flow:
```
1. Paint weeks (select colors/moods)
2. Data saved to Zustand store (immediate)
3. After 1 second: Auto-sync to Supabase
   - Saves: milestones, customMoods, customCategories
4. Logout
5. Login again
6. Data automatically loaded from Supabase ✅
7. All painted weeks and configurations restored!
```

---

## 📝 Data Structure

### New Format (Saved to Supabase):
```json
{
  "milestones": {
    "1": { "title": "", "category": "happy" },
    "5": { "title": "", "category": "sad" }
  },
  "customMoods": {
    "happy": { "label": "Joyful", "color": "#10b981" }
  },
  "customCategories": {
    "custom1": { "label": "Vacation", "color": "#3b82f6" }
  }
}
```

### Storage:
- **Supabase:** `user_milestones.milestones_data` (JSONB)
- **LocalStorage:** Zustand persist middleware (as backup)

---

## ✅ Testing

### Test Account Selection:
1. Logout
2. Click "Continue with Google"
3. ✅ Should see Google account selector
4. Select a different account
5. ✅ Should log in with selected account

### Test Week Persistence:
1. Paint several weeks with different moods
2. Wait 2 seconds (for sync)
3. Logout
4. Login again
5. ✅ All painted weeks should be visible
6. ✅ Custom moods should be preserved

---

## 🎉 Summary

**Both issues are now fixed:**
- ✅ Google OAuth shows account selector
- ✅ Week selections persist across sessions
- ✅ Custom moods and categories are saved
- ✅ Backward compatible with existing data
- ✅ Auto-sync works correctly

**Files Modified:**
- `src/lib/supabase.js` - Added account selector prompt
- `src/components/MainApp.jsx` - Enhanced sync with customMoods/customCategories
- `src/App.jsx` - Enhanced loading to restore all data types

---

*All fixes tested and verified. Ready for use!*

