-- Add ai_model field to contest_files table
-- Migration: 20241201000012_add_ai_model_to_contest_files.sql

-- Add ai_model column to contest_files table
ALTER TABLE contest_files 
ADD COLUMN IF NOT EXISTS ai_model TEXT;

-- Add comment for documentation
COMMENT ON COLUMN contest_files.ai_model IS 'AI model used to generate this file (for AI-generated content)';

-- Create index for ai_model search (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_contest_files_ai_model ON contest_files(ai_model) WHERE ai_model IS NOT NULL; 