-- Create contest_submissions table for storing submission descriptions
-- Migration: 20241201000012_create_contest_submissions_table.sql

-- Create the contest_submissions table
CREATE TABLE IF NOT EXISTS contest_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  submission_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_submissions_user_id ON contest_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_contest_id ON contest_submissions(contest_id);

-- Enable Row Level Security (RLS)
ALTER TABLE contest_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_submissions
CREATE POLICY "Users can manage their own contest submissions" ON contest_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own contest submissions" ON contest_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contest submissions" ON contest_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest submissions" ON contest_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contest submissions" ON contest_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_submissions_updated_at 
  BEFORE UPDATE ON contest_submissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contest_submissions IS 'Stores contest submission descriptions';
COMMENT ON COLUMN contest_submissions.user_id IS 'Reference to the user who owns this submission';
COMMENT ON COLUMN contest_submissions.contest_id IS 'Reference to the contest this submission belongs to';
COMMENT ON COLUMN contest_submissions.submission_description IS 'Description of the submitted work';
COMMENT ON COLUMN contest_submissions.created_at IS 'When the submission was created';
COMMENT ON COLUMN contest_submissions.updated_at IS 'When the submission was last updated'; 