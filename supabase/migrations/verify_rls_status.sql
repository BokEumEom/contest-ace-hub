-- Verify RLS status for all tables
-- This script helps identify RLS issues

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Enabled'
    WHEN rowsecurity = false THEN '❌ RLS Disabled'
    ELSE '❓ Unknown'
  END as status
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
ORDER BY tablename;

-- Check RLS policies for contests table specifically
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'contests'
ORDER BY policyname;

-- Check if there are any tables with policies but RLS disabled
SELECT 
  t.schemaname,
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public' 
  AND t.tablename IN (
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
GROUP BY t.schemaname, t.tablename, t.rowsecurity
HAVING t.rowsecurity = false AND COUNT(p.policyname) > 0
ORDER BY t.tablename; 