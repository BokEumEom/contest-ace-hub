-- Fix RLS for contests table
-- Migration: 20241201000019_fix_contests_rls.sql

-- Ensure RLS is enabled on contests table
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can manage their own contests" ON contests;
DROP POLICY IF EXISTS "Users can read their own contests" ON contests;
DROP POLICY IF EXISTS "Users can read public contests" ON contests;
DROP POLICY IF EXISTS "Users can insert their own contests" ON contests;
DROP POLICY IF EXISTS "Users can update their own contests" ON contests;
DROP POLICY IF EXISTS "Users can delete their own contests" ON contests;

-- Create comprehensive RLS policies for contests table
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

-- Verify RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'contests' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on contests table';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE contests IS 'Contests table with Row Level Security enabled - users can only access their own contests and public contests'; 