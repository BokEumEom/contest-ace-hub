-- Complete ContestHub Database Rollback
-- Execute this file in Supabase SQL Editor to drop all tables and functions
-- WARNING: This will permanently delete all data!

-- =====================================================
-- DROP ALL TRIGGERS FIRST
-- =====================================================

DROP TRIGGER IF EXISTS update_user_activities_updated_at ON user_activities;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_contest_submissions_updated_at ON contest_submissions;
DROP TRIGGER IF EXISTS update_contest_prompts_updated_at ON contest_prompts;
DROP TRIGGER IF EXISTS update_contest_files_updated_at ON contest_files;
DROP TRIGGER IF EXISTS update_contest_ideas_updated_at ON contest_ideas;
DROP TRIGGER IF EXISTS update_contest_embeddings_updated_at ON contest_embeddings;
DROP TRIGGER IF EXISTS update_contest_details_updated_at ON contest_details;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_contests_updated_at ON contests;
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;

-- =====================================================
-- DROP ALL FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS match_contests(text, integer);
DROP FUNCTION IF EXISTS match_contests_by_category(text, text, integer);
DROP FUNCTION IF EXISTS create_contest_embedding();

-- =====================================================
-- DROP ALL INDEXES
-- =====================================================

-- User activities indexes
DROP INDEX IF EXISTS idx_user_activities_user_id;
DROP INDEX IF EXISTS idx_user_activities_activity_type;
DROP INDEX IF EXISTS idx_user_activities_created_at;

-- User profiles indexes
DROP INDEX IF EXISTS idx_user_profiles_user_id;

-- Contest submissions indexes
DROP INDEX IF EXISTS idx_contest_submissions_user_id;
DROP INDEX IF EXISTS idx_contest_submissions_contest_id;
DROP INDEX IF EXISTS idx_contest_submissions_status;

-- Contest prompts indexes
DROP INDEX IF EXISTS idx_contest_prompts_user_id;
DROP INDEX IF EXISTS idx_contest_prompts_contest_id;
DROP INDEX IF EXISTS idx_contest_prompts_type;

-- Contest files indexes
DROP INDEX IF EXISTS idx_contest_files_user_id;
DROP INDEX IF EXISTS idx_contest_files_contest_id;
DROP INDEX IF EXISTS idx_contest_files_type;
DROP INDEX IF EXISTS idx_contest_files_uploaded_at;

-- Contest ideas indexes
DROP INDEX IF EXISTS idx_contest_ideas_user_id;
DROP INDEX IF EXISTS idx_contest_ideas_contest_id;
DROP INDEX IF EXISTS idx_contest_ideas_ai_generated;

-- Contest embeddings indexes
DROP INDEX IF EXISTS idx_contest_embeddings_contest_id;
DROP INDEX IF EXISTS idx_contest_embeddings_embedding;

-- Contest details indexes
DROP INDEX IF EXISTS idx_contest_details_user_id;
DROP INDEX IF EXISTS idx_contest_details_contest_id;
DROP INDEX IF EXISTS idx_contest_details_type;
DROP INDEX IF EXISTS idx_contest_details_data;

-- Notifications indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_contest_id;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;

-- Contests indexes
DROP INDEX IF EXISTS idx_contests_user_id;
DROP INDEX IF EXISTS idx_contests_status;
DROP INDEX IF EXISTS idx_contests_deadline;
DROP INDEX IF EXISTS idx_contests_category;

-- API keys indexes
DROP INDEX IF EXISTS idx_api_keys_user_id;
DROP INDEX IF EXISTS idx_api_keys_key_type;

-- =====================================================
-- DROP ALL TABLES (in reverse order due to foreign key constraints)
-- =====================================================

DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS contest_submissions;
DROP TABLE IF EXISTS contest_prompts;
DROP TABLE IF EXISTS contest_files;
DROP TABLE IF EXISTS contest_ideas;
DROP TABLE IF EXISTS contest_embeddings;
DROP TABLE IF EXISTS contest_details;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS api_keys;

-- =====================================================
-- DROP STORAGE BUCKETS (if they exist)
-- =====================================================

-- Note: Storage buckets must be dropped manually in Supabase dashboard
-- under Storage section

-- =====================================================
-- DISABLE EXTENSIONS (optional)
-- =====================================================

-- DROP EXTENSION IF EXISTS vector;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================

-- All tables, functions, triggers, and indexes have been dropped.
-- Storage buckets must be manually removed from the Supabase dashboard. 