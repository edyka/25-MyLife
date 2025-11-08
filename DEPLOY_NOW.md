# 🚀 Netlify Deployment - Hitri Navodila

## Korak 1: Commit vseh sprememb

```bash
git add .
git commit -m "Prepare for Netlify deployment: cookie consent, Supabase setup, build fixes"
git push origin main
```

## Korak 2: Deployment preko Netlify CLI

```bash
# Prijava (če še niste)
netlify login

# Deployment
netlify deploy --prod
```

## Korak 3: Nastavitev Environment Variables

Po deploymentu v Netlify Dashboard:
1. Pojdite na **Site settings** → **Environment variables**
2. Dodajte:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Opcijsko) `VITE_SENTRY_DSN`
   - (Opcijsko) `VITE_PLAUSIBLE_DOMAIN` ali `VITE_GA_MEASUREMENT_ID`
3. Triggerajte nov deploy

## Korak 4: Preverite OAuth Redirect URIs

V Supabase Dashboard:
1. **Authentication** → **URL Configuration**
2. Dodajte Netlify URL:
   ```
   https://[your-site].netlify.app/auth/v1/callback
   ```

---

**Za podrobna navodila glejte:** `NETLIFY_DEPLOYMENT.md`

