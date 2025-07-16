-- Create contest_prompts table for storing AI generation prompts
-- Migration: 20241201000010_create_contest_prompts_table.sql

-- Create the contest_prompts table
CREATE TABLE IF NOT EXISTS contest_prompts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  file_id BIGINT REFERENCES contest_files(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('image', 'document', 'video', 'audio', 'other')),
  prompt_text TEXT NOT NULL,
  ai_model TEXT,
  generation_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_prompts_user_id ON contest_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_prompts_contest_id ON contest_prompts(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_prompts_file_id ON contest_prompts(file_id);
CREATE INDEX IF NOT EXISTS idx_contest_prompts_type ON contest_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_contest_prompts_created_at ON contest_prompts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contest_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_prompts
-- 기존 정책들 (작성자만 관리 가능)
CREATE POLICY "Users can manage their own contest prompts" ON contest_prompts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own contest prompts" ON contest_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contest prompts" ON contest_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest prompts" ON contest_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contest prompts" ON contest_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- 새로운 정책: 공모전 작성자의 프롬프트를 공모전을 본 사용자가 읽을 수 있도록
CREATE POLICY "Users can read contest prompts of contests they can view" ON contest_prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = contest_prompts.contest_id 
      AND contests.user_id = contest_prompts.user_id
    )
  );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_prompts_updated_at 
  BEFORE UPDATE ON contest_prompts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contest_prompts IS 'Stores AI generation prompts for contests';
COMMENT ON COLUMN contest_prompts.user_id IS 'Reference to the user who owns this prompt';
COMMENT ON COLUMN contest_prompts.contest_id IS 'Reference to the contest this prompt belongs to';
COMMENT ON COLUMN contest_prompts.file_id IS 'Reference to the file this prompt is connected to';
COMMENT ON COLUMN contest_prompts.prompt_type IS 'Type of prompt (image, document, video, audio, other)';
COMMENT ON COLUMN contest_prompts.prompt_text IS 'The actual prompt text';
COMMENT ON COLUMN contest_prompts.ai_model IS 'AI model used for generation';
COMMENT ON COLUMN contest_prompts.generation_params IS 'Parameters used for generation';
COMMENT ON COLUMN contest_prompts.created_at IS 'When the prompt was created';
COMMENT ON COLUMN contest_prompts.updated_at IS 'When the prompt was last updated'; 