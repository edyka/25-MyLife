-- Fix RLS policies for user_selections table
-- This resolves 403 Forbidden errors when saving selections

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can insert own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can update own selections" ON user_selections;
DROP POLICY IF EXISTS "Users can delete own selections" ON user_selections;

-- Ensure RLS is enabled
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper authentication check
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
GRANT ALL ON user_selections TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
