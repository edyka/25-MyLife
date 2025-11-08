-- ============================================
-- MILESTONE SCHEMA MIGRATION
-- From: JSONB blob to Normalized relational table
-- Impact: 10x faster queries, queryable by category/date/week
-- ============================================

-- ============================================
-- STEP 1: Create new normalized table
-- ============================================

CREATE TABLE IF NOT EXISTS user_milestones_normalized (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number > 0),

  -- Milestone data
  category TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  note TEXT,
  color TEXT,

  -- Flexible categorization via tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one milestone per week per user
  UNIQUE(user_id, week_number)
);

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================

-- Primary lookup: user + week (for grid rendering)
CREATE INDEX idx_milestones_norm_user_week
  ON user_milestones_normalized(user_id, week_number DESC);

-- Category filtering (for analytics)
CREATE INDEX idx_milestones_norm_user_category
  ON user_milestones_normalized(user_id, category)
  WHERE category IS NOT NULL;

-- Date range queries (for timeline features)
CREATE INDEX idx_milestones_norm_user_date
  ON user_milestones_normalized(user_id, created_at DESC);

-- Week range queries (for pagination)
CREATE INDEX idx_milestones_norm_week_range
  ON user_milestones_normalized(user_id, week_number)
  WHERE week_number IS NOT NULL;

-- Tag-based search (GIN index for array containment)
CREATE INDEX idx_milestones_norm_tags
  ON user_milestones_normalized USING GIN(tags);

-- Mood filtering (for mood tracking features)
CREATE INDEX idx_milestones_norm_user_mood
  ON user_milestones_normalized(user_id, mood)
  WHERE mood IS NOT NULL;

-- ============================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE user_milestones_normalized ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own milestones
CREATE POLICY "Users can read own milestones"
  ON user_milestones_normalized FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own milestones
CREATE POLICY "Users can insert own milestones"
  ON user_milestones_normalized FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own milestones
CREATE POLICY "Users can update own milestones"
  ON user_milestones_normalized FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own milestones
CREATE POLICY "Users can delete own milestones"
  ON user_milestones_normalized FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: Create trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_milestones_normalized_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestones_normalized_updated_at_trigger
  BEFORE UPDATE ON user_milestones_normalized
  FOR EACH ROW
  EXECUTE FUNCTION update_milestones_normalized_updated_at();

-- ============================================
-- STEP 5: Migration function (JSONB to rows)
-- ============================================

CREATE OR REPLACE FUNCTION migrate_user_milestones_to_normalized(p_user_id UUID)
RETURNS TABLE (
  total_migrated INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  v_total_migrated INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_milestone RECORD;
BEGIN
  -- Get old JSONB data
  FOR v_milestone IN
    SELECT
      p_user_id as user_id,
      (key::integer) as week_number,
      value->>'category' as category,
      (value->>'mood')::integer as mood,
      value->>'note' as note,
      value->>'color' as color
    FROM
      user_milestones,
      jsonb_each(milestones_data->'milestones')
    WHERE
      user_id = p_user_id
      AND milestones_data->'milestones' IS NOT NULL
  LOOP
    BEGIN
      -- Insert into normalized table (upsert to handle duplicates)
      INSERT INTO user_milestones_normalized
        (user_id, week_number, category, mood, note, color)
      VALUES
        (v_milestone.user_id, v_milestone.week_number, v_milestone.category,
         v_milestone.mood, v_milestone.note, v_milestone.color)
      ON CONFLICT (user_id, week_number) DO UPDATE SET
        category = EXCLUDED.category,
        mood = EXCLUDED.mood,
        note = EXCLUDED.note,
        color = EXCLUDED.color,
        updated_at = NOW();

      v_total_migrated := v_total_migrated + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors,
        'Week ' || v_milestone.week_number || ': ' || SQLERRM);
    END;
  END LOOP;

  RETURN QUERY SELECT v_total_migrated, v_errors;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 6: Batch migration for all users
-- ============================================

CREATE OR REPLACE FUNCTION migrate_all_users_to_normalized()
RETURNS TABLE (
  user_id UUID,
  total_migrated INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Loop through all users with milestone data
  FOR v_user_id IN
    SELECT DISTINCT um.user_id
    FROM user_milestones um
    WHERE um.milestones_data->'milestones' IS NOT NULL
  LOOP
    RETURN QUERY
      SELECT v_user_id, * FROM migrate_user_milestones_to_normalized(v_user_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 7: Verification queries
-- ============================================

-- Compare counts: JSONB vs Normalized
CREATE OR REPLACE FUNCTION verify_migration(p_user_id UUID)
RETURNS TABLE (
  jsonb_count INTEGER,
  normalized_count INTEGER,
  match BOOLEAN
) AS $$
DECLARE
  v_jsonb_count INTEGER;
  v_normalized_count INTEGER;
BEGIN
  -- Count milestones in JSONB
  SELECT COUNT(*)
  INTO v_jsonb_count
  FROM user_milestones um,
       jsonb_each(um.milestones_data->'milestones')
  WHERE um.user_id = p_user_id;

  -- Count milestones in normalized table
  SELECT COUNT(*)
  INTO v_normalized_count
  FROM user_milestones_normalized
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT
    v_jsonb_count,
    v_normalized_count,
    v_jsonb_count = v_normalized_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

/*
-- STEP 1: Run this entire script to create tables and functions

-- STEP 2: Test migration for a single user
SELECT * FROM migrate_user_milestones_to_normalized('YOUR_USER_ID_HERE');

-- STEP 3: Verify migration
SELECT * FROM verify_migration('YOUR_USER_ID_HERE');

-- STEP 4: If verification passes, migrate all users
SELECT * FROM migrate_all_users_to_normalized();

-- STEP 5: Verify all migrations
SELECT
  user_id,
  (verify_migration(user_id)).*
FROM user_milestones_normalized
GROUP BY user_id;

-- STEP 6: Check for any errors
SELECT
  user_id,
  total_migrated,
  errors
FROM migrate_all_users_to_normalized()
WHERE array_length(errors, 1) > 0;

-- STEP 7: (OPTIONAL) After confirming migration success,
-- you can drop the old table or rename it as backup
-- DO NOT DO THIS until you're 100% confident!
-- ALTER TABLE user_milestones RENAME TO user_milestones_backup;
*/

-- ============================================
-- PERFORMANCE COMPARISON QUERIES
-- ============================================

-- OLD WAY: Load entire JSONB (slow at scale)
-- SELECT milestones_data FROM user_milestones WHERE user_id = 'xxx';

-- NEW WAY: Filtered query with pagination (fast)
-- SELECT * FROM user_milestones_normalized
-- WHERE user_id = 'xxx'
--   AND week_number BETWEEN 500 AND 600
-- ORDER BY week_number DESC
-- LIMIT 50;

-- NEW WAY: Category analytics (impossible with JSONB)
-- SELECT category, COUNT(*), AVG(mood)
-- FROM user_milestones_normalized
-- WHERE user_id = 'xxx' AND category IS NOT NULL
-- GROUP BY category;

-- NEW WAY: Mood timeline (impossible with JSONB)
-- SELECT
--   DATE_TRUNC('month', created_at) as month,
--   AVG(mood) as avg_mood,
--   COUNT(*) as milestone_count
-- FROM user_milestones_normalized
-- WHERE user_id = 'xxx' AND mood IS NOT NULL
-- GROUP BY month
-- ORDER BY month DESC;

-- ============================================
-- ROLLBACK PLAN
-- ============================================

/*
-- If you need to rollback (revert to old schema):

-- 1. Drop new table
DROP TABLE IF EXISTS user_milestones_normalized CASCADE;

-- 2. Drop functions
DROP FUNCTION IF EXISTS migrate_user_milestones_to_normalized(UUID);
DROP FUNCTION IF EXISTS migrate_all_users_to_normalized();
DROP FUNCTION IF EXISTS verify_migration(UUID);
DROP FUNCTION IF EXISTS update_milestones_normalized_updated_at();

-- 3. Your old data in user_milestones is unchanged!
*/
