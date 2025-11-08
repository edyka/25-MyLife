# Supabase Setup - Navodila za popravilo napake

**Napaka:** `ERROR: 42710: policy "Users can view own profile" for table "user_profiles" already exists`

## ✅ Rešitev

Ustvaril sem novo SQL datoteko **`supabase-setup-safe.sql`**, ki je varna za večkratno izvajanje.

### Koraki:

1. **Odprite Supabase Dashboard**
   - Pojdite na vaš projekt
   - Kliknite na **SQL Editor**

2. **Uporabite novo datoteko**
   - Odprite datoteko `supabase-setup-safe.sql` v vašem projektu
   - Kopirajte celotno vsebino
   - Prilepite v Supabase SQL Editor
   - Kliknite **Run** ali pritisnite `Ctrl+Enter`

### Razlika med datotekama:

- **`supabase-setup.sql`** - Originalna verzija (napaka, če se izvede večkrat)
- **`supabase-setup-safe.sql`** - Nova verzija (varna za večkratno izvajanje)

### Kaj naredi nova verzija:

✅ Uporablja `DROP POLICY IF EXISTS` pred `CREATE POLICY`  
✅ Uporablja `DROP TRIGGER IF EXISTS` pred `CREATE TRIGGER`  
✅ Uporablja `CREATE OR REPLACE FUNCTION` za funkcije  
✅ Uporablja `CREATE INDEX IF NOT EXISTS` za indekse  
✅ Uporablja `CREATE TABLE IF NOT EXISTS` za tabele  
✅ Dodaja `ON CONFLICT DO NOTHING` za vstavljanje subscription

### Rezultat:

Po izvedbi boste imeli:
- ✅ Vseh 6 tabel
- ✅ Vse RLS politike (brez napak)
- ✅ Vsi triggerji
- ✅ Vsi indeksi
- ✅ Vse funkcije

---

## 🔍 Preverjanje po izvedbi

Izvedite to SQL poizvedbo, da preverite, ali je vse v redu:

```sql
-- Preverite tabele
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

**Pričakovan rezultat:** 6 vrstic (ena za vsako tabelo)

---

## ⚠️ Opomba

Če ste že izvedli del originalne skripte, nova skripta bo:
- Obstoječe politike najprej izbrisala
- Nato ustvarila nove (enake)
- Obstoječe podatke ohranila

**Ni potrebno brisati obstoječih podatkov!**

---

**Zadnja posodobitev:** November 2, 2025

