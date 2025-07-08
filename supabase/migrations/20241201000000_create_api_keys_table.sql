-- Create api_keys table for storing user API keys
-- Migration: 20241201000000_create_api_keys_table.sql

-- Create the api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('gemini', 'firecrawl')),
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_type ON api_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_key_type ON api_keys(user_id, key_type);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own API keys
CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow users to read their own API keys
CREATE POLICY "Users can read their own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own API keys
CREATE POLICY "Users can insert their own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own API keys
CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own API keys
CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at 
  BEFORE UPDATE ON api_keys 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE api_keys IS 'Stores user API keys for external services like Gemini and Firecrawl';
COMMENT ON COLUMN api_keys.user_id IS 'Reference to the user who owns this API key';
COMMENT ON COLUMN api_keys.key_type IS 'Type of API key (gemini or firecrawl)';
COMMENT ON COLUMN api_keys.api_key IS 'The actual API key value (encrypted in production)';
COMMENT ON COLUMN api_keys.created_at IS 'Timestamp when the API key was first created';
COMMENT ON COLUMN api_keys.updated_at IS 'Timestamp when the API key was last updated'; 