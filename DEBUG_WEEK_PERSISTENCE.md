# Debug Guide: Week Persistence Issues

## 🐛 Current Issues
1. Username shows "edo" even when logging in with aniroblue account
2. Week colors not persisting after logout/login

---

## ✅ Fixes Applied

### 1. Username Fix
**Problem:** App was only using `profile.name` from Supabase, not Google user metadata

**Fix:**
- Now uses Google user metadata (full_name, email) as fallback
- Clears username on logout
- Extracts name from email if metadata not available

**Code changes:**
- `src/App.jsx` - Added Google user metadata fallback
- `src/components/TabNavigation.jsx` - Clear username on logout

### 2. Week Persistence Fix
**Problem:** Milestones might not be syncing correctly or loading incorrectly

**Fixes:**
- Clear milestones before loading (prevents data leakage)
- Always sync (even if milestones is empty object)
- Better logging to track sync/load operations
- Handle both old and new data formats

**Code changes:**
- `src/components/MainApp.jsx` - Improved sync logic
- `src/App.jsx` - Clear milestones before loading

---

## 🔍 How to Debug

### Check Browser Console

Open DevTools (F12) and look for these logs:

#### When Logging In:
```
[Viventiva OAuth] Loading returning user profile: {...}
[Viventiva OAuth] Loading milestones: {...}
[Viventiva OAuth] Loaded: X weeks
```

#### When Painting Weeks:
```
[Viventiva Sync] Saving milestones to Supabase: X weeks
[Viventiva Sync] Data structure: { milestones: X, customMoods: Y, customCategories: Z }
[Viventiva Sync] Milestones saved successfully to Supabase
```

#### Red Flags:
- ❌ `Error saving milestones:` - Sync failed
- ❌ `No milestone data found` - Data not in database
- ❌ `Loaded: 0 weeks` - No data loaded (expected if first time)

---

## 🧪 Testing Steps

### Test 1: Username Display

1. **Logout**
2. **Login with `aniroblue@gmail.com`**
3. **Check Dashboard** - Should show "Hello aniroblue" or similar
   - If shows "Hello edo" → Username not clearing/updating

**Debug:**
- Open console, look for: `[Viventiva OAuth] Loading returning user profile`
- Check `profile.name` and `user.email` in console
- Verify which account you're logged in with

### Test 2: Week Persistence

1. **Login with aniroblue account**
2. **Paint 5-10 weeks** with different colors
3. **Wait 2 seconds** (for sync)
4. **Check console** for: `[Viventiva Sync] Milestones saved successfully`
5. **Logout**
6. **Login again with same account**
7. **Check if painted weeks are visible**

**If weeks are missing:**

#### Check Console Logs:
- Look for `[Viventiva Sync] Saving...` when painting
- Look for `[Viventiva OAuth] Loaded: X weeks` when logging in
- Check for errors

#### Check Supabase Database:
1. Go to: https://app.supabase.com/project/jnzwuknbqpihuhbdbhhv
2. Navigate: Table Editor → `user_milestones`
3. Find your user_id (check `auth.users` table)
4. Check `milestones_data` column
5. Should see JSON like: `{"milestones": {"1": {...}, "5": {...}}}`

---

## 🔧 Common Issues & Solutions

### Issue: Username Still Shows Wrong Account

**Possible causes:**
1. Profile name in Supabase is still set to old value
2. Google metadata not being passed correctly

**Solution:**
1. Check Supabase `user_profiles` table
2. Update the `name` field for the correct user_id
3. Or delete the profile row to force regeneration from Google

### Issue: Weeks Not Saving

**Check:**
1. Is user authenticated? (`localStorage.getItem('viventiva_authenticated')`)
2. Does console show sync messages?
3. Are there errors in console?
4. Is Supabase connection working?

**Solutions:**
1. **If no sync messages:**
   - Verify user is authenticated
   - Check if milestones object exists
   - Add `console.log('Milestones:', milestones)` before sync

2. **If sync messages but data not in Supabase:**
   - Check network tab for failed requests
   - Check Supabase logs
   - Verify user_id is correct

3. **If data in Supabase but not loading:**
   - Check data format (new vs old)
   - Verify loading code is executing
   - Check for errors in console

### Issue: Wrong Data When Switching Accounts

**Solution:**
- The fixes now clear milestones before loading
- Make sure you're fully logging out before switching
- Clear browser cache if needed

---

## 📊 Expected Behavior

### Login Flow:
```
1. User logs in → OAuth callback
2. Get user from Supabase auth
3. Clear old milestones (empty state)
4. Load profile from user_profiles table
5. Set username from: profile.name → user_metadata.full_name → email
6. Load milestones from user_milestones table
7. Display correct username and weeks
```

### Painting Flow:
```
1. User paints week → setMilestones called
2. Zustand store updates (localStorage)
3. useEffect triggers (milestones changed)
4. After 1 second debounce:
5. Get current user
6. Save to Supabase: { milestones, customMoods, customCategories }
7. Console log: "Milestones saved successfully"
```

---

## 🔍 Manual Verification

### Check Supabase Data Directly:

```sql
-- Get all milestones
SELECT user_id, milestones_data 
FROM user_milestones;

-- Get specific user's milestones (replace USER_ID)
SELECT milestones_data 
FROM user_milestones 
WHERE user_id = 'USER_ID';

-- Get user profiles
SELECT user_id, name, email 
FROM user_profiles;
```

### Check localStorage:
```javascript
// In browser console:
localStorage.getItem('memento-vivere-milestones')
// Should show JSON with milestones
```

---

## 🎯 Next Steps If Still Not Working

1. **Check browser console** for specific error messages
2. **Check Supabase Dashboard** → Logs for errors
3. **Verify user_id** matches between sessions
4. **Test with console logging** - add more logs if needed
5. **Check network tab** for failed Supabase requests

---

*The fixes are in place. Test again and check the console logs for detailed information!*

