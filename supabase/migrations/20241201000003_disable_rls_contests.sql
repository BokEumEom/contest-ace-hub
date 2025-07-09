-- Disable Row Level Security on contests table
-- Migration: 20241201000003_disable_rls_contests.sql

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can manage their own contests" ON contests;
DROP POLICY IF EXISTS "Users can read their own contests" ON contests;
DROP POLICY IF EXISTS "Users can insert their own contests" ON contests;
DROP POLICY IF EXISTS "Users can update their own contests" ON contests;
DROP POLICY IF EXISTS "Users can delete their own contests" ON contests;

-- Disable Row Level Security
ALTER TABLE contests DISABLE ROW LEVEL SECURITY; 