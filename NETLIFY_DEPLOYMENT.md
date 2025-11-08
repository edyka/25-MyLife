# Netlify Deployment Guide - Viventiva

**Date:** November 2, 2025  
**Status:** Ready for Deployment

---

## ✅ Pre-deployment Checklist

- [x] Build uspešen (`npm run build`)
- [x] `netlify.toml` konfiguracija pripravljena
- [x] Vse funkcionalnosti implementirane
- [x] Cookie consent GDPR skladen
- [x] Supabase shema pripravljena

---

## 🚀 Deployment na Netlify

### Metoda 1: Preko Netlify Dashboard (Priporočeno)

#### Korak 1: Priprava Git repozitorija

```bash
# Commit vseh sprememb
git add .
git commit -m "Prepare for Netlify deployment - cookie consent, Supabase setup, build fixes"

# Push na GitHub/GitLab
git push origin main
```

#### Korak 2: Povezovanje z Netlify

1. **Odprite Netlify Dashboard**
   - Pojdite na: https://app.netlify.com
   - Prijavite se v vaš račun

2. **Ustvarite nov site**
   - Kliknite **"Add new site"** → **"Import an existing project"**
   - Izberite **"Deploy with GitHub"** (ali GitLab/Bitbucket)
   - Avtorizirajte Netlify za dostop do vašega repozitorija
   - Izberite repozitorij z Viventiva projektom

3. **Konfiguracija build nastavitev**
   - **Build command:** `npm run build` (že nastavljeno v `netlify.toml`)
   - **Publish directory:** `dist` (že nastavljeno v `netlify.toml`)
   - **Base directory:** (pustite prazno)
   - Kliknite **"Deploy site"**

#### Korak 3: Nastavitev Environment Variables

Po prvem deploymentu:

1. Pojdite na **Site settings** → **Environment variables**
2. Dodajte naslednje spremenljivke:

**Obvezne:**
```
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[your-anon-key]
```

**Opcijske (priporočeno):**
```
VITE_SENTRY_DSN=https://[your-sentry-dsn]
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
# ALI
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Kliknite **"Save"**
4. Pojdite na **Deploys** → **Trigger deploy** → **Deploy site** (za ponovno build z novimi env spremenljivkami)

---

### Metoda 2: Preko Netlify CLI

#### Korak 1: Namestitev Netlify CLI

```bash
npm install -g netlify-cli
```

#### Korak 2: Prijava

```bash
netlify login
```

#### Korak 3: Inicializacija projekta

```bash
# V root direktoriju projekta
netlify init
```

Izberite:
- **Create & configure a new site**
- Izberite vaš team
- Vnesite ime site-a (npr. `viventiva`)

#### Korak 4: Nastavitev Environment Variables

```bash
# Obvezne
netlify env:set VITE_SUPABASE_URL "https://[your-project-id].supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJ[your-anon-key]"

# Opcijske
netlify env:set VITE_SENTRY_DSN "https://[your-sentry-dsn]"
netlify env:set VITE_PLAUSIBLE_DOMAIN "yourdomain.com"
```

#### Korak 5: Deployment

```bash
# Build in deploy
netlify deploy --prod
```

---

## 🔧 Post-Deployment Nastavitve

### 1. Preverite Build Logs

1. Pojdite na **Deploys** v Netlify dashboardu
2. Kliknite na najnovejši deploy
3. Preverite, ali je build uspešen
4. Če so napake, preverite build logs

### 2. Preverite Funkcionalnost

- [ ] Odprite deployed site
- [ ] Preverite, ali se aplikacija naloži
- [ ] Testirajte login (Google/Facebook/Email)
- [ ] Preverite, ali se podatki shranjujejo v Supabase
- [ ] Preverite cookie consent banner

### 3. Nastavitev Custom Domain (Opcijsko)

1. Pojdite na **Domain settings**
2. Kliknite **"Add custom domain"**
3. Vnesite vašo domeno (npr. `viventiva.com`)
4. Sledite navodilom za DNS nastavitve

### 4. Preverite Security Headers

Security headers so že nastavljeni v `netlify.toml`:
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Content Security Policy
- ✅ Cache-Control za statične asset-e

---

## 🔍 Troubleshooting

### Problem: Build ne uspe

**Rešitev:**
- Preverite build logs v Netlify dashboardu
- Preverite, ali so vse environment variables nastavljene
- Preverite, ali je Node.js verzija pravilna (18+)

### Problem: Aplikacija se ne naloži

**Rešitev:**
- Preverite, ali so Supabase credentials pravilni
- Preverite browser console za napake
- Preverite, ali je Supabase projekt aktiven

### Problem: OAuth login ne deluje

**Rešitev:**
- Preverite, ali so OAuth redirect URIs nastavljeni v Supabase
- Dodajte Netlify URL v Supabase OAuth settings:
  ```
  https://[your-site].netlify.app/auth/v1/callback
  ```

### Problem: Environment variables niso dostopne

**Rešitev:**
- Preverite, ali so nastavljene v Netlify dashboardu
- Ponovno triggerajte deploy po nastavitvi env variables
- Preverite, ali so spremenljivke začete z `VITE_`

---

## 📋 Deployment Checklist

### Pred Deploymentom

- [ ] Vse spremembe so commitane
- [ ] Build uspe lokalno (`npm run build`)
- [ ] Supabase shema je izvedena (`supabase-setup-safe.sql`)
- [ ] Environment variables so pripravljene
- [ ] OAuth redirect URIs so nastavljeni v Supabase

### Po Deploymentu

- [ ] Build je uspešen v Netlify
- [ ] Aplikacija se naloži
- [ ] Login deluje (vsi načini)
- [ ] Podatki se shranjujejo v Supabase
- [ ] Cookie consent deluje
- [ ] Analytics deluje (če je nastavljen)
- [ ] Error monitoring deluje (če je nastavljen)

---

## 🔗 Povezave

- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://app.supabase.com
- **Netlify Docs:** https://docs.netlify.com

---

## ✅ Status

Projekt je pripravljen za deployment na Netlify!

**Zadnja posodobitev:** November 2, 2025

