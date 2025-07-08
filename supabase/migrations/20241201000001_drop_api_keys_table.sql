-- Drop api_keys table (rollback migration)
-- Migration: 20241201000001_drop_api_keys_table.sql

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop the indexes
DROP INDEX IF EXISTS idx_api_keys_user_key_type;
DROP INDEX IF EXISTS idx_api_keys_key_type;
DROP INDEX IF EXISTS idx_api_keys_user_id;

-- Drop the table
DROP TABLE IF EXISTS api_keys; 