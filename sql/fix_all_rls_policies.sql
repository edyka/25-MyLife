-- Fix ALL RLS policies for proper authentication
-- This resolves 406 and 403 errors when accessing user data

-- Fix user_profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_milestones table policies
DROP POLICY IF EXISTS "Users can view own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON user_milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON user_milestones;

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON user_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON user_milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON user_milestones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON user_milestones FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix user_selections table policies (if not already done)
DROP POLICY IF EXISTS "Users can view own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can insert own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can update own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can delete own selections" ON user_selections;

ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own selections"
  ON user_selections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selections"
  ON user_selections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selections"
  ON user_selections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own selections"
  ON user_selections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_milestones TO authenticated;
GRANT ALL ON user_selections TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
