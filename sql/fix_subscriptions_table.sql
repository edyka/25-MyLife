-- Fix user_subscriptions table - recreate with correct schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- STEP 1: Check current table structure
-- ============================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND table_schema = 'public';

-- ============================================================
-- STEP 2: Drop old table and recreate (backup any data first if needed)
-- ============================================================
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'life')),
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly', 'lifetime', NULL)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'lifetime', 'trialing', 'past_due', 'incomplete', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- ============================================================
-- STEP 3: Verify table was created correctly
-- ============================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
