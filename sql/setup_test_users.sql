-- Set up subscriptions for existing users
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. LIFETIME subscription for edo.prasnikar@gmail.com
-- ============================================================
INSERT INTO public.user_subscriptions (user_id, plan_type, billing_interval, status)
SELECT id, 'life', 'lifetime', 'lifetime'
FROM auth.users WHERE email = 'edo.prasnikar@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'life',
  billing_interval = 'lifetime',
  status = 'lifetime',
  updated_at = NOW();

-- ============================================================
-- 2. PRO subscription for aniroblue@gmail.com
-- ============================================================
INSERT INTO public.user_subscriptions (user_id, plan_type, billing_interval, status, current_period_start, current_period_end)
SELECT id, 'pro', 'yearly', 'active', NOW(), NOW() + INTERVAL '1 year'
FROM auth.users WHERE email = 'aniroblue@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = 'pro',
  billing_interval = 'yearly',
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- ============================================================
-- 3. Create FREE test account
-- ============================================================
SELECT auth.create_user(
  '{
    "email": "test-free@viventiva.test",
    "password": "TestPass123!",
    "email_confirm": true,
    "user_metadata": {"full_name": "Test Free User"}
  }'::jsonb
);

-- Create profile for free test user
INSERT INTO public.user_profiles (user_id, name, birth_day, birth_month, birth_year, life_expectancy)
SELECT id, 'Test Free User', 15, 1, 1990, 80
FROM auth.users WHERE email = 'test-free@viventiva.test'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 4. VERIFY ALL SUBSCRIPTIONS
-- ============================================================
SELECT 
  u.email,
  COALESCE(s.plan_type, 'free') as plan_type,
  s.status,
  s.billing_interval,
  s.current_period_end
FROM auth.users u
LEFT JOIN public.user_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('edo.prasnikar@gmail.com', 'aniroblue@gmail.com', 'test-free@viventiva.test')
ORDER BY s.plan_type DESC NULLS LAST;

-- ============================================================
-- SUMMARY:
-- ============================================================
-- edo.prasnikar@gmail.com  -> LIFETIME (all features forever)
-- aniroblue@gmail.com      -> PRO (yearly subscription)
-- test-free@viventiva.test -> FREE (Password: TestPass123!)
