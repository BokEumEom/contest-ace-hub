-- Create contest_details table for storing team members and schedules
-- Run this in Supabase SQL Editor to fix the missing table error

-- Create the contest_details table
CREATE TABLE IF NOT EXISTS contest_details (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  detail_type TEXT NOT NULL CHECK (detail_type IN ('team_members', 'schedules')),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, detail_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_details_user_id ON contest_details(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_details_contest_id ON contest_details(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_details_type ON contest_details(detail_type);
CREATE INDEX IF NOT EXISTS idx_contest_details_data ON contest_details USING GIN (data);

-- Enable Row Level Security (RLS)
ALTER TABLE contest_details ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_details
CREATE POLICY "Users can manage their own contest details" ON contest_details
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own contest details" ON contest_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contest details" ON contest_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest details" ON contest_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contest details" ON contest_details
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_details_updated_at 
  BEFORE UPDATE ON contest_details 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contest_details IS 'Stores contest details like team members and schedules';
COMMENT ON COLUMN contest_details.user_id IS 'Reference to the user who owns this detail';
COMMENT ON COLUMN contest_details.contest_id IS 'Reference to the contest this detail belongs to';
COMMENT ON COLUMN contest_details.detail_type IS 'Type of detail (team_members or schedules)';
COMMENT ON COLUMN contest_details.data IS 'JSON data containing the detail information';
COMMENT ON COLUMN contest_details.created_at IS 'When the detail was created';
COMMENT ON COLUMN contest_details.updated_at IS 'When the detail was last updated';