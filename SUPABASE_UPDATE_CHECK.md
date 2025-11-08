# Supabase Database Update Check

**Date:** November 2, 2025

## ✅ Preverjanje sheme

### Tabele, ki jih aplikacija uporablja:

1. ✅ **user_profiles** - Profili uporabnikov
2. ✅ **user_milestones** - Milestone podatki
3. ✅ **user_goals** - Cilji uporabnikov
4. ✅ **user_selections** - Izbrane tedne in barve
5. ✅ **user_settings** - UI nastavitve (dark mode, theme)
6. ✅ **user_subscriptions** - Naročnine (za prihodnost)

### Status sheme v `supabase-setup.sql`:

✅ **Vse tabele so vključene**
✅ **RLS (Row Level Security) je omogočen za vse tabele**
✅ **Vse potrebne politike so nastavljene**
✅ **Indeksi so ustvarjeni za optimizacijo**
✅ **Triggerji za `updated_at` so nastavljeni**
✅ **Funkcija za avtomatsko ustvarjanje subscription ob registraciji**

---

## 🔍 Ali morate posodobiti Supabase?

### Če še NISTE izvedli `supabase-setup.sql`:

**DA, morate izvesti SQL skripto!**

**Koraki:**
1. Odprite Supabase Dashboard
2. Pojdite na **SQL Editor**
3. Kopirajte celotno vsebino `supabase-setup.sql`
4. Prilepite v SQL Editor
5. Kliknite **Run** ali pritisnite `Ctrl+Enter`

### Če STE že izvedli `supabase-setup.sql`:

**Preverite, ali so vse tabele ustvarjene:**

```sql
-- V Supabase SQL Editor izvedite:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_profiles',
  'user_milestones', 
  'user_goals',
  'user_selections',
  'user_settings',
  'user_subscriptions'
)
ORDER BY table_name;
```

**Rezultat mora prikazati vseh 6 tabel.**

### Preverite RLS politike:

```sql
-- Preverite, ali so RLS politike nastavljene:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles',
  'user_milestones',
  'user_goals',
  'user_selections',
  'user_settings',
  'user_subscriptions'
)
ORDER BY tablename, policyname;
```

**Vsaka tabela mora imeti politike za:**
- SELECT (branje)
- INSERT (vstavljanje)
- UPDATE (posodabljanje)
- DELETE (brisanje)

---

## ⚠️ Če manjka katera tabela:

### Možnost 1: Izvedite celotno `supabase-setup.sql`
- Najbolj varno
- Ustvari vse tabele, politike, indekse in triggerje
- Uporabite `CREATE TABLE IF NOT EXISTS` - ne bo napak, če tabela že obstaja

### Možnost 2: Izvedite samo manjkajoče dele
- Preverite, katera tabela manjka
- Kopirajte samo ustrezen del iz `supabase-setup.sql`

---

## 📋 Preverjanje po izvedbi

Po izvedbi SQL skripte preverite:

```sql
-- 1. Preverite tabele
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_profiles',
  'user_milestones', 
  'user_goals',
  'user_selections',
  'user_settings',
  'user_subscriptions'
);
-- Rezultat mora biti: 6

-- 2. Preverite RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'user_profiles',
  'user_milestones',
  'user_goals',
  'user_selections',
  'user_settings',
  'user_subscriptions'
);
-- Vsi rowsecurity morajo biti: true

-- 3. Preverite indekse
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles',
  'user_milestones',
  'user_goals',
  'user_selections',
  'user_settings',
  'user_subscriptions'
)
ORDER BY tablename;
-- Vsaka tabela mora imeti vsaj indeks na user_id
```

---

## ✅ Končni status

**Shema v `supabase-setup.sql` je popolna in vsebuje:**
- ✅ Vseh 6 tabel
- ✅ Vse RLS politike
- ✅ Vsi indeksi
- ✅ Vsi triggerji
- ✅ Funkcije za avtomatsko posodabljanje

**Če ste že izvedli SQL skripto, ni potrebna nobena posodobitev!**

---

## 🚀 Naslednji koraki

1. **Če še niste:** Izvedite `supabase-setup.sql` v Supabase SQL Editor
2. **Preverite:** Uporabite SQL poizvedbe zgoraj
3. **Testirajte:** Ustvarite testnega uporabnika in preverite, ali se podatki shranjujejo

---

**Zadnja posodobitev:** November 2, 2025

