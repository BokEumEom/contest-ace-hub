-- Create contest_results table for storing contest results
-- Migration: 20241201000020_create_contest_results_table.sql

CREATE TABLE IF NOT EXISTS contest_results (
  id BIGSERIAL PRIMARY KEY,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  description TEXT,
  status TEXT NOT NULL,
  prize_amount TEXT,
  feedback TEXT,
  announcement_date DATE NOT NULL,
  file_ids INTEGER[], -- 관련 파일 ID들 (선택적)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_results_contest_id ON contest_results(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_results_status ON contest_results(status);
CREATE INDEX IF NOT EXISTS idx_contest_results_created_by ON contest_results(created_by);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_results_updated_at 
    BEFORE UPDATE ON contest_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE contest_results ENABLE ROW LEVEL SECURITY;

-- Users can read all contest results
CREATE POLICY "Users can read contest results" ON contest_results
  FOR SELECT USING (true);

-- Contest owners can insert/update/delete results
CREATE POLICY "Contest owners can manage results" ON contest_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = contest_results.contest_id 
      AND contests.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE contest_results IS 'Stores contest results and rankings';
COMMENT ON COLUMN contest_results.contest_id IS 'Reference to the contest';
COMMENT ON COLUMN contest_results.description IS 'Result description or notes';
COMMENT ON COLUMN contest_results.status IS 'Result status (user-defined)';
COMMENT ON COLUMN contest_results.prize_amount IS 'Prize amount or description';
COMMENT ON COLUMN contest_results.feedback IS 'Judge feedback or comments';
COMMENT ON COLUMN contest_results.announcement_date IS 'Date when results were announced';
COMMENT ON COLUMN contest_results.created_by IS 'User who created this result entry';
