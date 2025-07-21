-- Add is_public column to contests table
-- Migration: 20241201000018_add_is_public_to_contests.sql

-- Add is_public column to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Add comment for documentation
COMMENT ON COLUMN contests.is_public IS 'Whether the contest is publicly visible to other users';

-- Create index for better performance on public contests queries
CREATE INDEX IF NOT EXISTS idx_contests_is_public ON contests(is_public);

-- Update RLS policies to consider is_public column
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own contests" ON contests;
DROP POLICY IF EXISTS "Users can manage their own contests" ON contests;

-- Create new policies that consider is_public
CREATE POLICY "Users can read their own contests" ON contests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read public contests" ON contests
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own contests" ON contests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contests" ON contests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contests" ON contests
  FOR DELETE USING (auth.uid() = user_id); 