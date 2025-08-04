-- Fix contest_prompts RLS policy to allow reading all prompts in a contest
-- Migration: 20241201000012_fix_contest_prompts_rls_policy.sql

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can read their own contest prompts" ON contest_prompts;
DROP POLICY IF EXISTS "Users can read all prompts in contests they can view" ON contest_prompts;
DROP POLICY IF EXISTS "Users can read contest prompts of contests they can view" ON contest_prompts;
DROP POLICY IF EXISTS "Users can read all contest prompts" ON contest_prompts;

-- Create a new policy that allows reading all prompts in a contest (similar to contest_files)
CREATE POLICY "Users can read all contest prompts" ON contest_prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = contest_prompts.contest_id
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Users can read all contest prompts" ON contest_prompts IS 'Allows users to read all prompts in contests they have access to'; 