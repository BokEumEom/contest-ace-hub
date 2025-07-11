-- Create user_activities table for storing user activity and achievements
-- Migration: 20241201000015_create_user_activities_table.sql

-- Create the user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('contest_created', 'contest_submitted', 'contest_completed', 'contest_won', 'contest_participated')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_contest_id ON user_activities(contest_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activities
CREATE POLICY "Users can manage their own activities" ON user_activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON user_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON user_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_activities IS 'Stores user activity and achievement records';
COMMENT ON COLUMN user_activities.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_activities.contest_id IS 'Reference to the contest (if applicable)';
COMMENT ON COLUMN user_activities.activity_type IS 'Type of activity performed';
COMMENT ON COLUMN user_activities.title IS 'Activity title';
COMMENT ON COLUMN user_activities.description IS 'Activity description';
COMMENT ON COLUMN user_activities.metadata IS 'Additional activity metadata';
COMMENT ON COLUMN user_activities.points IS 'Points earned for this activity';
COMMENT ON COLUMN user_activities.created_at IS 'When the activity occurred';

-- Create user_statistics table for storing aggregated user statistics
CREATE TABLE IF NOT EXISTS user_statistics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_contests INTEGER DEFAULT 0,
  completed_contests INTEGER DEFAULT 0,
  won_contests INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  total_hours INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_statistics
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_total_points ON user_statistics(total_points);

-- Enable Row Level Security (RLS)
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for user_statistics
CREATE POLICY "Users can manage their own statistics" ON user_statistics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statistics" ON user_statistics
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_statistics_updated_at 
  BEFORE UPDATE ON user_statistics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for user_statistics
COMMENT ON TABLE user_statistics IS 'Stores aggregated user statistics';
COMMENT ON COLUMN user_statistics.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_statistics.total_contests IS 'Total number of contests participated';
COMMENT ON COLUMN user_statistics.completed_contests IS 'Number of completed contests';
COMMENT ON COLUMN user_statistics.won_contests IS 'Number of contests won';
COMMENT ON COLUMN user_statistics.total_points IS 'Total points earned';
COMMENT ON COLUMN user_statistics.total_hours IS 'Total hours spent on contests';
COMMENT ON COLUMN user_statistics.current_streak IS 'Current activity streak';
COMMENT ON COLUMN user_statistics.longest_streak IS 'Longest activity streak achieved';
COMMENT ON COLUMN user_statistics.achievements IS 'JSON array of achievements earned';
COMMENT ON COLUMN user_statistics.last_activity_at IS 'Last activity timestamp';
COMMENT ON COLUMN user_statistics.created_at IS 'When the statistics were created';
COMMENT ON COLUMN user_statistics.updated_at IS 'When the statistics were last updated'; 