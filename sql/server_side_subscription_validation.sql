-- ============================================================
-- SERVER-SIDE SUBSCRIPTION VALIDATION
-- Run this in Supabase SQL Editor
-- Prevents client-side tier manipulation
-- ============================================================

-- ============================================================
-- 1. SECURE FUNCTION TO GET USER'S SUBSCRIPTION TIER
-- This is the ONLY source of truth for subscription status
-- ============================================================

-- Drop if exists to allow re-running
DROP FUNCTION IF EXISTS public.get_current_user_tier();

-- Function that authenticated users can call to get their tier
-- This replaces trusting localStorage
CREATE OR REPLACE FUNCTION public.get_current_user_tier()
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_sub RECORD;
BEGIN
  -- Get the current user's subscription
  SELECT
    plan_type,
    status,
    current_period_end,
    billing_interval,
    cancel_at_period_end
  INTO user_sub
  FROM public.user_subscriptions
  WHERE user_id = auth.uid();

  -- If no subscription found, return free tier
  IF NOT FOUND THEN
    RETURN json_build_object(
      'tier', 'free',
      'is_active', true,
      'expires_at', null,
      'can_export_png', false,
      'can_use_unlimited_moods', false,
      'can_access_premium_themes', false,
      'can_access_advanced_stats', false
    );
  END IF;

  -- Check if subscription is active
  DECLARE
    is_active BOOLEAN;
    effective_tier TEXT;
  BEGIN
    -- Determine if subscription is active
    is_active := (
      user_sub.status IN ('active', 'trialing', 'lifetime')
      AND (user_sub.current_period_end IS NULL OR user_sub.current_period_end > NOW())
    ) OR user_sub.status = 'lifetime';

    -- Determine effective tier
    IF is_active THEN
      effective_tier := user_sub.plan_type;
    ELSE
      effective_tier := 'free';
    END IF;

    -- Return tier with feature flags
    RETURN json_build_object(
      'tier', effective_tier,
      'is_active', is_active,
      'expires_at', user_sub.current_period_end,
      'status', user_sub.status,
      'cancel_at_period_end', user_sub.cancel_at_period_end,
      -- Feature flags based on tier
      'can_export_png', effective_tier IN ('pro', 'life'),
      'can_use_unlimited_moods', effective_tier IN ('pro', 'life'),
      'can_access_premium_themes', effective_tier IN ('pro', 'life'),
      'can_access_advanced_stats', effective_tier IN ('pro', 'life'),
      'can_access_ai_insights', effective_tier = 'life',
      'is_founding_member', effective_tier = 'life'
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_tier() TO authenticated;


-- ============================================================
-- 2. RLS POLICIES FOR PREMIUM FEATURE VALIDATION
-- These prevent premium features from being accessed by free users
-- ============================================================

-- Example: If you have a premium_exports table to track exports
-- This ensures only premium users can insert export records
/*
CREATE TABLE IF NOT EXISTS public.user_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'png', 'pdf', 'poster'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_exports ENABLE ROW LEVEL SECURITY;

-- Only premium users can create exports
CREATE POLICY "Only premium users can export" ON public.user_exports
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.has_premium_access(auth.uid())
  );

-- Users can read their own exports
CREATE POLICY "Users can read own exports" ON public.user_exports
  FOR SELECT USING (auth.uid() = user_id);
*/


-- ============================================================
-- 3. VALIDATE PREMIUM BEFORE SENSITIVE OPERATIONS
-- This function can be called before any premium operation
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_premium_operation(operation_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Check if user has premium access
  has_access := public.has_premium_access(auth.uid());

  -- Log the attempt (optional - for analytics)
  -- INSERT INTO public.operation_logs (user_id, operation, has_access, created_at)
  -- VALUES (auth.uid(), operation_name, has_access, NOW());

  IF NOT has_access THEN
    RAISE EXCEPTION 'Premium subscription required for: %', operation_name;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.validate_premium_operation(TEXT) TO authenticated;


-- ============================================================
-- 4. SECURE CUSTOM MOODS LIMIT
-- Free users: max 4 custom moods
-- Premium users: unlimited
-- ============================================================

-- Function to check if user can create more custom moods
CREATE OR REPLACE FUNCTION public.can_create_custom_mood()
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  has_premium BOOLEAN;
  max_free_moods INTEGER := 4;
BEGIN
  -- Check premium status
  has_premium := public.has_premium_access(auth.uid());

  -- Premium users can always create
  IF has_premium THEN
    RETURN true;
  END IF;

  -- Count existing custom moods for free user
  -- Assumes custom moods are stored in user_milestones.custom_moods JSONB
  SELECT jsonb_object_keys(COALESCE(
    (SELECT (milestones_data->>'customMoods')::jsonb
     FROM public.user_milestones
     WHERE user_id = auth.uid()),
    '{}'::jsonb
  )) INTO current_count;

  -- Actually count the keys
  SELECT COUNT(*) INTO current_count
  FROM jsonb_object_keys(COALESCE(
    (SELECT (milestones_data->>'customMoods')::jsonb
     FROM public.user_milestones
     WHERE user_id = auth.uid()),
    '{}'::jsonb
  ));

  RETURN current_count < max_free_moods;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.can_create_custom_mood() TO authenticated;


-- ============================================================
-- 5. AUDIT LOG FOR SUBSCRIPTION CHANGES (Optional)
-- Track all subscription changes for debugging
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'cancelled', 'renewed'
  old_plan TEXT,
  new_plan TEXT,
  old_status TEXT,
  new_status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can write to audit log
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages audit log" ON public.subscription_audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own audit log
CREATE POLICY "Users can read own audit log" ON public.subscription_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_audit_user_id ON public.subscription_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_created_at ON public.subscription_audit_log(created_at);


-- ============================================================
-- 6. TRIGGER TO LOG SUBSCRIPTION CHANGES
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscription_audit_log (user_id, action, new_plan, new_status, metadata)
    VALUES (NEW.user_id, 'created', NEW.plan_type, NEW.status,
            jsonb_build_object('stripe_subscription_id', NEW.stripe_subscription_id));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine action type
    DECLARE
      action_type TEXT;
    BEGIN
      IF OLD.plan_type != NEW.plan_type THEN
        IF (NEW.plan_type = 'life') OR
           (NEW.plan_type = 'pro' AND OLD.plan_type = 'free') THEN
          action_type := 'upgraded';
        ELSE
          action_type := 'downgraded';
        END IF;
      ELSIF OLD.status != NEW.status THEN
        IF NEW.status = 'cancelled' THEN
          action_type := 'cancelled';
        ELSIF NEW.status = 'active' AND OLD.status != 'active' THEN
          action_type := 'renewed';
        ELSE
          action_type := 'status_changed';
        END IF;
      ELSE
        action_type := 'updated';
      END IF;

      INSERT INTO public.subscription_audit_log (
        user_id, action, old_plan, new_plan, old_status, new_status, metadata
      )
      VALUES (
        NEW.user_id, action_type, OLD.plan_type, NEW.plan_type,
        OLD.status, NEW.status,
        jsonb_build_object(
          'stripe_subscription_id', NEW.stripe_subscription_id,
          'cancel_at_period_end', NEW.cancel_at_period_end
        )
      );
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_subscription_changes ON public.user_subscriptions;
CREATE TRIGGER log_subscription_changes
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_subscription_change();


-- ============================================================
-- DONE!
--
-- USAGE IN FRONTEND:
--
-- // Replace localStorage tier with database query
-- const { data, error } = await supabase.rpc('get_current_user_tier');
-- if (data) {
--   usePremiumStore.setState({
--     tier: data.tier,
--     subscriptionData: data
--   });
-- }
--
-- // Validate before premium operation
-- const { data, error } = await supabase.rpc('validate_premium_operation', {
--   operation_name: 'export_png'
-- });
-- if (error) {
--   showUpgradeModal();
-- }
-- ============================================================
