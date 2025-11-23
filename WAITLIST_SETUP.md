# Waitlist Landing Page Setup Instructions

## 🗄️ Database Setup

You need to run the SQL schema in your Supabase project:

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/waitlist_schema.sql`
3. Run the SQL query
4. This will create the `waitlist` table with proper indexes and Row Level Security

## 🚀 Using the Waitlist Page

### Option 1: Replace Homepage (Pre-Launch Mode)
In `src/components/HomePage.jsx`, update to show the waitlist:

```javascript
import WaitlistPage from './WaitlistPage';

// At the top of your component
const LAUNCH_MODE = 'waitlist'; // or 'live'

// In your return statement
if (LAUNCH_MODE === 'waitlist') {
  return <WaitlistPage />;
}

// ... rest of your existing HomePage code
```

### Option 2: Add as a Route
If using React Router, add a route:

```javascript
import WaitlistPage from './components/WaitlistPage';

<Route path="/waitlist" element={<WaitlistPage />} />
```

### Option 3: Environment Variable (Recommended)
Use an environment variable for easy switching:

```javascript
// In .env
VITE_LAUNCH_MODE=waitlist

// In HomePage.jsx
const isWaitlistMode = import.meta.env.VITE_LAUNCH_MODE === 'waitlist';

if (isWaitlistMode) {
  return <WaitlistPage />;
}
```

## 📊 Viewing Waitlist Signups

### From Supabase Dashboard:
1. Go to Table Editor → `waitlist` table
2. View all signups with emails, names, interests, and timestamps

### Export to CSV:
```sql
SELECT email, name, interest, created_at 
FROM waitlist 
ORDER BY created_at DESC;
```

Copy results and export for email marketing tools like Mailchimp or ConvertKit.

## 📧 Email Integration (Future)

When ready to email your waitlist:

1. **Export emails**: Get all emails from Supabase
2. **Import to email tool**: Use Mailchimp, ConvertKit, or Loops
3. **Create launch campaign**: "We're live! Here's your early access..."
4. **Add UTM parameters**: Track which emails convert

## 🎨 Customization

The waitlist page uses your app's color scheme (orange/red gradients). To customize:

- Change colors in the component (search for `orange` and `red`)
- Update the headline and benefits
- Add your own preview image/mockup
- Customize the interest options in the dropdown

## ✅ Testing Checklist

- [ ] SQL schema runs without errors
- [ ] Email submission works
- [ ] Duplicate emails show proper error
- [ ] Counter updates after signup  
- [ ] Success state displays correctly
- [ ] Page looks good on mobile
- [ ] All fields save to Supabase

## 🎯 Next Steps

1. Run the SQL schema
2. Test the waitlist page
3. Set up your launch mode toggle
4. Connect to email marketing tool
5. Create social media content
6. Start driving traffic!
