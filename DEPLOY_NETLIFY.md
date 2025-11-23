# Netlify Deployment Guide for Viventiva Waitlist

## Quick Deploy Steps

### 1. Push to GitHub/GitLab
```bash
git add .
git commit -m "Add waitlist landing page"
git push origin main
```

### 2. Deploy to Netlify

**Option A: Netlify CLI (Fastest)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (first time)
netlify init

# Or deploy directly
netlify deploy --prod
```

**Option B: Netlify Dashboard**
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub/GitLab)
4. Select your repository
5. Build settings are auto-detected from `netlify.toml`
6. Click "Deploy"

### 3. Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get these from:**
Supabase Dashboard → Project Settings → API

### 4. Run the Waitlist SQL Schema

Don't forget to run the SQL in `supabase/waitlist_schema.sql` in your Supabase SQL Editor!

## Custom Domain (Optional)

1. In Netlify: Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate is auto-provisioned

## Post-Deploy Checklist

- [ ] Waitlist page loads correctly
- [ ] Email signup works
- [ ] Counter displays properly
- [ ] Mobile responsive
- [ ] Supabase environment variables set
- [ ] SQL schema executed
- [ ] Test form submission

## Deploy from Terminal (Quick)

Run this now to deploy:
```bash
npm run build && netlify deploy --prod
```

## Troubleshooting

**Build fails?**
- Check `npm run build` works locally first
- Verify environment variables are set

**Form doesn't work?**
- Check Supabase env vars
- Verify waitlist table exists
- Check browser console for errors

## Your Live URL

After deployment, your site will be at:
`https://your-site-name.netlify.app`

You can customize this in Site settings → Domain management.
