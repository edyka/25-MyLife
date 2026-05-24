-- Complete Subscription & Payments Schema for Viventiva
-- Run this in your Supabase SQL Editor to ensure all tables and policies are correct
-- This is safe to re-run (uses IF NOT EXISTS and DROP IF EXISTS)

-- ============================================================
-- 1. USER SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
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

-- ============================================================
-- 2. PAYMENT HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  plan_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. DROP EXISTING POLICIES (safe to re-run)
-- ============================================================
DROP POLICY IF EXISTS "Users can read own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can read own payments" ON public.payment_history;
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payment_history;

-- ============================================================
-- 5. CREATE POLICIES
-- ============================================================

-- Users can only read their own subscription
CREATE POLICY "Users can read own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert/update/delete subscriptions
CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Users can only read their own payment history
CREATE POLICY "Users can read own payments" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role (webhooks) can insert/update payments
CREATE POLICY "Service role can manage payments" ON public.payment_history
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 6. CREATE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_payment_intent ON public.payment_history(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at);

-- ============================================================
-- 7. HELPER FUNCTIONS
-- ============================================================

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION public.has_premium_access(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = check_user_id 
    AND (
      status = 'lifetime' OR 
      (status IN ('active', 'trialing') AND current_period_end > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(check_user_id UUID)
RETURNS TABLE(
  plan_type TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.plan_type,
    us.status,
    us.current_period_end as expires_at,
    (us.status IN ('active', 'trialing', 'lifetime') AND (us.current_period_end IS NULL OR us.current_period_end > NOW())) as is_active
  FROM public.user_subscriptions us
  WHERE us.user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert subscription (used by webhook)
CREATE OR REPLACE FUNCTION public.upsert_subscription(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_plan_type TEXT,
  p_billing_interval TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT FALSE
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
    plan_type, billing_interval, status, current_period_start, current_period_end,
    cancel_at_period_end, updated_at
  )
  VALUES (
    p_user_id, p_stripe_customer_id, p_stripe_subscription_id, p_stripe_price_id,
    p_plan_type, p_billing_interval, p_status, p_current_period_start, p_current_period_end,
    p_cancel_at_period_end, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    plan_type = EXCLUDED.plan_type,
    billing_interval = EXCLUDED.billing_interval,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. GRANT PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION public.has_premium_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan(UUID) TO authenticated;
-- upsert_subscription is only for service_role (webhooks), no grant needed

-- ============================================================
-- 9. TRIGGER TO AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- DONE! Your subscription schema is now complete.
-- ============================================================
