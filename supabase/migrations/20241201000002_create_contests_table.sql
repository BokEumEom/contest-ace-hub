-- Create contests table for storing contest data
-- Migration: 20241201000002_create_contests_table.sql

-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the contests table
CREATE TABLE IF NOT EXISTS contests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT,
  deadline DATE,
  category TEXT,
  prize TEXT,
  status TEXT CHECK (status IN ('preparing', 'in-progress', 'submitted', 'completed')) DEFAULT 'preparing',
  days_left INTEGER,
  progress INTEGER DEFAULT 0,
  team_members_count INTEGER DEFAULT 0,
  description TEXT,
  requirements JSONB,
  contest_theme TEXT,
  submission_format TEXT,
  contest_schedule TEXT,
  submission_method TEXT,
  prize_details TEXT,
  result_announcement TEXT,
  precautions TEXT,
  contest_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contests_user_id ON contests(user_id);
CREATE INDEX IF NOT EXISTS idx_contests_deadline ON contests(deadline);
CREATE INDEX IF NOT EXISTS idx_contests_category ON contests(category);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contests_updated_at 
    BEFORE UPDATE ON contests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contests IS 'Stores user contest data';
COMMENT ON COLUMN contests.user_id IS 'Reference to the user who owns this contest';
COMMENT ON COLUMN contests.title IS 'Contest title';
COMMENT ON COLUMN contests.organization IS 'Organizing institution';
COMMENT ON COLUMN contests.deadline IS 'Contest deadline date';
COMMENT ON COLUMN contests.category IS 'Contest category (IT/기술, 디자인, etc.)';
COMMENT ON COLUMN contests.prize IS 'Prize information';
COMMENT ON COLUMN contests.description IS 'Contest description';
COMMENT ON COLUMN contests.url IS 'Contest URL';
COMMENT ON COLUMN contests.participants IS 'Number of participants';
COMMENT ON COLUMN contests.days_left IS 'Days remaining until deadline';
COMMENT ON COLUMN contests.contest_theme IS 'Contest theme or topic';
COMMENT ON COLUMN contests.submission_format IS 'Required submission format';
COMMENT ON COLUMN contests.contest_schedule IS 'Contest schedule';
COMMENT ON COLUMN contests.submission_method IS 'How to submit';
COMMENT ON COLUMN contests.prize_details IS 'Detailed prize information';
COMMENT ON COLUMN contests.result_announcement IS 'Result announcement date';
COMMENT ON COLUMN contests.precautions IS 'Important precautions'; 