-- Create user_selections table for storing week selections
-- This table stores selectedWeeks, pinnedWeeks, and selectedColor for each user

CREATE TABLE IF NOT EXISTS user_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selections_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_selections_user_id ON user_selections(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_selections_updated_at ON user_selections(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own selections
CREATE POLICY "Users can read their own selections"
  ON user_selections FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own selections
CREATE POLICY "Users can insert their own selections"
  ON user_selections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own selections
CREATE POLICY "Users can update their own selections"
  ON user_selections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own selections
CREATE POLICY "Users can delete their own selections"
  ON user_selections FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_selections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_selections_updated_at_trigger
  BEFORE UPDATE ON user_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_user_selections_updated_at();

-- Add comment to table
COMMENT ON TABLE user_selections IS 'Stores user week selections (selectedWeeks, pinnedWeeks, selectedColor)';
COMMENT ON COLUMN user_selections.selections_data IS 'JSON object containing selectedWeeks (array), pinnedWeeks (array), and selectedColor (string)';
