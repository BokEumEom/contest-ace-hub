-- Create user_profiles table for storing user profile information
-- Migration: 20241201000014_create_user_profiles_table.sql

-- Create the user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can manage their own profiles" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own profiles" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile information';
COMMENT ON COLUMN user_profiles.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_profiles.display_name IS 'User display name';
COMMENT ON COLUMN user_profiles.bio IS 'User biography';
COMMENT ON COLUMN user_profiles.location IS 'User location';
COMMENT ON COLUMN user_profiles.website IS 'User website URL';
COMMENT ON COLUMN user_profiles.avatar_url IS 'User avatar image URL';
COMMENT ON COLUMN user_profiles.social_links IS 'JSON object containing social media links';
COMMENT ON COLUMN user_profiles.preferences IS 'JSON object containing user preferences';
COMMENT ON COLUMN user_profiles.created_at IS 'When the profile was created';
COMMENT ON COLUMN user_profiles.updated_at IS 'When the profile was last updated'; 