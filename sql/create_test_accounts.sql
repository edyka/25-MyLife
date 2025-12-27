-- Create Test Users with Different Subscription Tiers
-- Run this in Supabase SQL Editor to create 3 test accounts
-- Password for all: TestPass123!

-- ============================================================
-- STEP 1: Create the test users via Supabase Auth Admin API
-- ============================================================

-- Create FREE user
SELECT auth.create_user(
  '{
    "email": "test-free@viventiva.test",
    "password": "TestPass123!",
    "email_confirm": true,
    "user_metadata": {"full_name": "Test Free User"}
  }'::jsonb
);

-- Create PRO user
SELECT auth.create_user(
  '{
    "email": "test-pro@viventiva.test",
    "password": "TestPass123!",
    "email_confirm": true,
    "user_metadata": {"full_name": "Test Pro User"}
  }'::jsonb
);

-- Create LIFETIME user
SELECT auth.create_user(
  '{
    "email": "test-life@viventiva.test",
    "password": "TestPass123!",
    "email_confirm": true,
    "user_metadata": {"full_name": "Test Life User"}
  }'::jsonb
);

-- ============================================================
-- STEP 2: Get the user IDs we just created
-- ============================================================
SELECT id, email FROM auth.users 
WHERE email IN ('test-free@viventiva.test', 'test-pro@viventiva.test', 'test-life@viventiva.test');

-- ============================================================
-- STEP 3: Set up subscriptions (run after getting IDs above)
-- Replace the UUIDs below with the actual IDs from STEP 2
-- ============================================================

-- PRO user subscription (replace USER_ID_FOR_PRO)
INSERT INTO public.user_subscriptions (user_id, plan_type, billing_interval, status, current_period_start, current_period_end)
SELECT id, 'pro', 'yearly', 'active', NOW(), NOW() + INTERVAL '1 year'
FROM auth.users WHERE email = 'test-pro@viventiva.test'
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'pro', billing_interval = 'yearly', status = 'active',
  current_period_end = NOW() + INTERVAL '1 year', updated_at = NOW();

-- LIFETIME user subscription (replace USER_ID_FOR_LIFE)
INSERT INTO public.user_subscriptions (user_id, plan_type, billing_interval, status)
SELECT id, 'life', 'lifetime', 'lifetime'
FROM auth.users WHERE email = 'test-life@viventiva.test'
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'life', billing_interval = 'lifetime', status = 'lifetime', updated_at = NOW();

-- ============================================================
-- STEP 4: Create basic profiles for the test users
-- ============================================================
INSERT INTO public.user_profiles (user_id, name, birth_day, birth_month, birth_year, life_expectancy)
SELECT id, 'Test Free User', 15, 1, 1990, 80
FROM auth.users WHERE email = 'test-free@viventiva.test'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_profiles (user_id, name, birth_day, birth_month, birth_year, life_expectancy)
SELECT id, 'Test Pro User', 20, 3, 1985, 85
FROM auth.users WHERE email = 'test-pro@viventiva.test'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_profiles (user_id, name, birth_day, birth_month, birth_year, life_expectancy)
SELECT id, 'Test Life User', 10, 7, 1988, 90
FROM auth.users WHERE email = 'test-life@viventiva.test'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- STEP 5: Verify setup
-- ============================================================
SELECT 
  u.email,
  p.name,
  COALESCE(s.plan_type, 'free') as plan_type,
  s.status,
  s.billing_interval
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
LEFT JOIN public.user_subscriptions s ON u.id = s.user_id
WHERE u.email LIKE 'test-%@viventiva.test'
ORDER BY u.email;

-- ============================================================
-- TEST CREDENTIALS:
-- ============================================================
-- Email: test-free@viventiva.test  | Password: TestPass123! | Tier: FREE
-- Email: test-pro@viventiva.test   | Password: TestPass123! | Tier: PRO
-- Email: test-life@viventiva.test  | Password: TestPass123! | Tier: LIFETIME
