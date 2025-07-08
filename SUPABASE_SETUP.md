# Supabase Setup Guide

This project has been updated to use Supabase for API key storage instead of localStorage. Follow these steps to set up Supabase:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key

## 2. Set Up Environment Variables (Optional)

To use Supabase for secure API key storage, create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Example:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: If you don't set up these environment variables, the application will automatically fall back to using localStorage for API key storage.

## 3. Create Database Table

In your Supabase dashboard, go to the SQL Editor and run the following SQL to create the `api_keys` table:

```sql
-- Create api_keys table
CREATE TABLE api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('gemini', 'firecrawl')),
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key_type)
);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own API keys
CREATE POLICY "Users can manage their own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_type ON api_keys(key_type);
```

## 4. Enable Authentication (Optional)

If you want to use user authentication:

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your preferred authentication providers
3. Update the `apiKeyService` in `src/lib/supabase.ts` to handle authentication

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Go to the Settings page
3. Try saving API keys - they should now be stored in Supabase instead of localStorage

## Benefits of Using Supabase

- **Security**: API keys are stored securely in the database instead of browser localStorage
- **User-specific**: Each user can have their own API keys
- **Persistence**: Keys persist across devices and browser sessions
- **Scalability**: Can handle multiple users and applications
- **Backup**: Data is automatically backed up by Supabase

## Migration from localStorage

The application includes a fallback mechanism that automatically uses localStorage when:
- Supabase environment variables are not configured
- No user is authenticated
- Supabase is not available

This ensures the application continues to work even without Supabase setup, while providing the option to upgrade to secure cloud storage when ready.

## Fallback Behavior

When Supabase is not available, the application will:
1. Store API keys in localStorage (same as before)
2. Show a warning in the console
3. Continue to function normally
4. Automatically upgrade to Supabase when properly configured 