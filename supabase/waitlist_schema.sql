-- Create waitlist table for pre-launch signups
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text,
  interest text,
  referral_source text,
  created_at timestamptz DEFAULT now()
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for waitlist signup)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow service role to read all (for admin dashboard)
CREATE POLICY "Service role can read all waitlist" ON waitlist
  FOR SELECT
  USING (auth.role() = 'service_role');
