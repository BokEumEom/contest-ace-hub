-- Drop all tables (rollback migration)
-- Migration: 20241201000005_drop_all_tables.sql

-- Drop triggers first
DROP TRIGGER IF EXISTS update_contest_details_updated_at ON contest_details;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_contests_updated_at ON contests;
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_contest_details_data;
DROP INDEX IF EXISTS idx_contest_details_type;
DROP INDEX IF EXISTS idx_contest_details_contest_id;
DROP INDEX IF EXISTS idx_contest_details_user_id;

DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_user_id;

DROP INDEX IF EXISTS idx_contests_category;
DROP INDEX IF EXISTS idx_contests_deadline;
DROP INDEX IF EXISTS idx_contests_user_id;

DROP INDEX IF EXISTS idx_api_keys_user_key_type;
DROP INDEX IF EXISTS idx_api_keys_key_type;
DROP INDEX IF EXISTS idx_api_keys_user_id;

-- Drop tables in reverse order (due to foreign key constraints)
DROP TABLE IF EXISTS contest_details;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS api_keys; 