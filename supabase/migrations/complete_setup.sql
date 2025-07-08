-- Complete ContestHub Database Setup
-- Execute this file in Supabase SQL Editor to set up all tables and functions

-- =====================================================
-- 1. CREATE HELPER FUNCTION FOR UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. CREATE API_KEYS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('gemini', 'firecrawl')),
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key_type)
);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_type ON api_keys(key_type);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for api_keys
CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at 
  BEFORE UPDATE ON api_keys 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE api_keys IS 'Stores user API keys for external services';
COMMENT ON COLUMN api_keys.user_id IS 'Reference to the user who owns this API key';
COMMENT ON COLUMN api_keys.key_type IS 'Type of API key (gemini or firecrawl)';
COMMENT ON COLUMN api_keys.api_key IS 'The actual API key value';
COMMENT ON COLUMN api_keys.created_at IS 'When the API key was created';
COMMENT ON COLUMN api_keys.updated_at IS 'When the API key was last updated';

-- =====================================================
-- 3. CREATE CONTESTS TABLE
-- =====================================================

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

-- Create indexes for contests
CREATE INDEX IF NOT EXISTS idx_contests_user_id ON contests(user_id);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_deadline ON contests(deadline);
CREATE INDEX IF NOT EXISTS idx_contests_category ON contests(category);

-- Enable Row Level Security (RLS)
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Create policies for contests
CREATE POLICY "Users can manage their own contests" ON contests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own contests" ON contests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contests" ON contests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contests" ON contests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contests" ON contests
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contests_updated_at 
  BEFORE UPDATE ON contests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contests IS 'Stores user contest information';
COMMENT ON COLUMN contests.user_id IS 'Reference to the user who owns this contest';
COMMENT ON COLUMN contests.title IS 'Contest title';
COMMENT ON COLUMN contests.organization IS 'Hosting organization';
COMMENT ON COLUMN contests.deadline IS 'Contest deadline date';
COMMENT ON COLUMN contests.category IS 'Contest category';
COMMENT ON COLUMN contests.prize IS 'Prize information';
COMMENT ON COLUMN contests.status IS 'Contest status (preparing, in-progress, submitted, completed)';
COMMENT ON COLUMN contests.days_left IS 'Days remaining until deadline';
COMMENT ON COLUMN contests.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN contests.team_members_count IS 'Number of team members';
COMMENT ON COLUMN contests.description IS 'Contest description';
COMMENT ON COLUMN contests.requirements IS 'JSON array of requirements';
COMMENT ON COLUMN contests.contest_theme IS 'Contest theme';
COMMENT ON COLUMN contests.submission_format IS 'Submission format requirements';
COMMENT ON COLUMN contests.contest_schedule IS 'Contest schedule';
COMMENT ON COLUMN contests.submission_method IS 'Submission method';
COMMENT ON COLUMN contests.prize_details IS 'Detailed prize information';
COMMENT ON COLUMN contests.result_announcement IS 'Result announcement date';
COMMENT ON COLUMN contests.precautions IS 'Precautions and notes';
COMMENT ON COLUMN contests.contest_url IS 'Contest URL';
COMMENT ON COLUMN contests.created_at IS 'When the contest was created';
COMMENT ON COLUMN contests.updated_at IS 'When the contest was last updated';

-- =====================================================
-- 4. CREATE NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_contest_id ON notifications(contest_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can manage their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON COLUMN notifications.user_id IS 'Reference to the user who owns this notification';
COMMENT ON COLUMN notifications.title IS 'Notification title';
COMMENT ON COLUMN notifications.message IS 'Notification message';
COMMENT ON COLUMN notifications.type IS 'Notification type (info, success, warning, error)';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.contest_id IS 'Reference to the contest this notification relates to';
COMMENT ON COLUMN notifications.created_at IS 'When the notification was created';
COMMENT ON COLUMN notifications.updated_at IS 'When the notification was last updated';

-- =====================================================
-- 5. CREATE CONTEST_DETAILS TABLE
-- =====================================================

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

-- Create indexes for contest_details
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

-- =====================================================
-- 6. CREATE CONTEST_IDEAS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contest_ideas (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for contest_ideas
CREATE INDEX IF NOT EXISTS idx_contest_ideas_user_id ON contest_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_ideas_contest_id ON contest_ideas(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_ideas_ai_generated ON contest_ideas(ai_generated);

-- Enable Row Level Security (RLS)
ALTER TABLE contest_ideas ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_ideas
CREATE POLICY "Users can manage their own contest ideas" ON contest_ideas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own contest ideas" ON contest_ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contest ideas" ON contest_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest ideas" ON contest_ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contest ideas" ON contest_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_ideas_updated_at 
  BEFORE UPDATE ON contest_ideas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contest_ideas IS 'Stores AI-generated contest ideas';
COMMENT ON COLUMN contest_ideas.user_id IS 'Reference to the user who owns this idea';
COMMENT ON COLUMN contest_ideas.contest_id IS 'Reference to the contest this idea belongs to';
COMMENT ON COLUMN contest_ideas.title IS 'Idea title';
COMMENT ON COLUMN contest_ideas.description IS 'Idea description';
COMMENT ON COLUMN contest_ideas.ai_generated IS 'Whether this idea was generated by AI';
COMMENT ON COLUMN contest_ideas.created_at IS 'When the idea was created';
COMMENT ON COLUMN contest_ideas.updated_at IS 'When the idea was last updated';

-- =====================================================
-- 7. CREATE CONTEST_FILES TABLE
-- =====================================================

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

-- Create indexes for contest_files
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

-- =====================================================
-- 8. VERIFICATION QUERY
-- =====================================================

-- This query will show all created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'api_keys',
    'contests', 
    'notifications',
    'contest_details',
    'contest_ideas',
    'contest_files'
  )
ORDER BY tablename;

-- =====================================================
-- 9. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Uncomment the following lines if you want to insert sample data
-- Note: Replace 'your-user-id' with an actual user ID from auth.users

/*
-- Sample contest
INSERT INTO contests (
  user_id, 
  title, 
  organization, 
  deadline, 
  category, 
  prize, 
  status,
  description,
  contest_theme,
  submission_format
) VALUES (
  'your-user-id',
  '2024 AI 창작 공모전',
  'AI 기술협회',
  '2024-12-31',
  'IT/기술',
  '대상 500만원',
  'preparing',
  'AI 기술을 활용한 창의적인 솔루션을 제안하는 공모전입니다.',
  'AI를 활용한 사회문제 해결',
  'PDF 10페이지 이하, 동영상 3분 이하'
);

-- Sample notification
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  contest_id
) VALUES (
  'your-user-id',
  '공모전 등록 완료',
  '2024 AI 창작 공모전이 성공적으로 등록되었습니다.',
  'success',
  1
);
*/ 