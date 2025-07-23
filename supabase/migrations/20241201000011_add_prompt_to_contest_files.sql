-- Add prompt field to contest_files table
-- Migration: 20241201000011_add_prompt_to_contest_files.sql

-- Add prompt column to contest_files table
ALTER TABLE contest_files 
ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Add comment for documentation
COMMENT ON COLUMN contest_files.prompt IS 'Prompt used to generate this file (for AI-generated content)';

-- Create index for prompt search (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_contest_files_prompt ON contest_files(prompt) WHERE prompt IS NOT NULL; 