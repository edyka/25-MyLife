-- ============================================
-- MASTER FIX RLS POLICIES (Run this in Supabase SQL Editor)
-- This script fixes "permission denied" / "data not saving" errors
-- ============================================

-- 1. USER MILESTONES
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Enable all access for own milestones" ON user_milestones;

-- Create a simple, unified policy for all operations
CREATE POLICY "Enable all access for own milestones"
ON user_milestones
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 2. USER PROFILES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable all access for own profile" ON user_profiles;

CREATE POLICY "Enable all access for own profile"
ON user_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 3. USER SELECTIONS
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can insert their own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can update their own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can delete their own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can view own selections" ON user_selections; -- cleanup old names
DROP POLICY IF EXISTS "Users can update own selections" ON user_selections; -- cleanup old names
DROP POLICY IF EXISTS "Enable all access for own selections" ON user_selections;

CREATE POLICY "Enable all access for own selections"
ON user_selections
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 4. USER GOALS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON user_goals;
DROP POLICY IF EXISTS "Enable all access for own goals" ON user_goals;

CREATE POLICY "Enable all access for own goals"
ON user_goals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 5. USER SETTINGS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable all access for own settings" ON user_settings;

CREATE POLICY "Enable all access for own settings"
ON user_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. GRANT PERMISSIONS (Just in case)
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_milestones TO authenticated;
GRANT ALL ON user_goals TO authenticated;
GRANT ALL ON user_selections TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
