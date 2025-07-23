-- Fix all RLS issues across the database
-- This script ensures RLS is properly enabled on all tables with policies

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on all tables that should have it
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. RECREATE CONTESTS TABLE POLICIES
-- =====================================================

-- Drop existing policies for contests table
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

-- =====================================================
-- 3. VERIFY RLS STATUS
-- =====================================================

-- Check RLS status for all tables
DO $$
DECLARE
  table_record RECORD;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'api_keys',
        'contests', 
        'notifications',
        'contest_details',
        'contest_ideas',
        'contest_files',
        'contest_prompts',
        'contest_submissions',
        'contest_embeddings',
        'user_profiles',
        'user_activities',
        'user_statistics'
      )
  LOOP
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = table_record.tablename;
    
    IF rls_enabled = false THEN
      RAISE NOTICE 'WARNING: RLS is disabled on table %', table_record.tablename;
    ELSE
      RAISE NOTICE 'SUCCESS: RLS is enabled on table %', table_record.tablename;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. VERIFY POLICIES EXIST
-- =====================================================

-- Check if contests table has the required policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'contests';
  
  IF policy_count = 0 THEN
    RAISE EXCEPTION 'No RLS policies found on contests table';
  ELSE
    RAISE NOTICE 'Found % policies on contests table', policy_count;
  END IF;
END $$;

-- =====================================================
-- 5. FINAL VERIFICATION
-- =====================================================

-- Show final status
SELECT 
  'RLS Status Check Complete' as status,
  COUNT(*) as total_tables,
  COUNT(CASE WHEN rowsecurity = true THEN 1 END) as rls_enabled_tables,
  COUNT(CASE WHEN rowsecurity = false THEN 1 END) as rls_disabled_tables
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'api_keys',
    'contests', 
    'notifications',
    'contest_details',
    'contest_ideas',
    'contest_files',
    'contest_prompts',
    'contest_submissions',
    'contest_embeddings',
    'user_profiles',
    'user_activities',
    'user_statistics'
  ); 