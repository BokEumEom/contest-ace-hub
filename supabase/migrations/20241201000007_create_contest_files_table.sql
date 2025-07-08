-- Create contest_files table for storing contest-related files
-- Migration: 20241201000007_create_contest_files_table.sql

-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the contest_files table
CREATE TABLE IF NOT EXISTS contest_files (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_files_user_id ON contest_files(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_files_contest_id ON contest_files(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_files_type ON contest_files(type);
CREATE INDEX IF NOT EXISTS idx_contest_files_uploaded_at ON contest_files(uploaded_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contest_files ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_files
CREATE POLICY "Users can manage their own contest files" ON contest_files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own contest files" ON contest_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contest files" ON contest_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest files" ON contest_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contest files" ON contest_files
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_files_updated_at 
  BEFORE UPDATE ON contest_files 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contest_files IS 'Stores contest-related files';
COMMENT ON COLUMN contest_files.user_id IS 'Reference to the user who owns this file';
COMMENT ON COLUMN contest_files.contest_id IS 'Reference to the contest this file belongs to';
COMMENT ON COLUMN contest_files.name IS 'File name';
COMMENT ON COLUMN contest_files.url IS 'File URL or path';
COMMENT ON COLUMN contest_files.type IS 'File type (e.g., image, document, video)';
COMMENT ON COLUMN contest_files.size IS 'File size in bytes';
COMMENT ON COLUMN contest_files.uploaded_at IS 'When the file was uploaded';
COMMENT ON COLUMN contest_files.created_at IS 'When the file record was created';
COMMENT ON COLUMN contest_files.updated_at IS 'When the file record was last updated'; 