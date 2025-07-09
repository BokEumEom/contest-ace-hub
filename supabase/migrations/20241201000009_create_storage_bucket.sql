-- Storage setup for contest files
-- Migration: 20241201000009_create_storage_bucket.sql

-- Note: Storage bucket and policies must be created manually in Supabase dashboard
-- 
-- 1. Create bucket 'contest-files' in Storage section
-- 2. Create policies in Storage > contest-files > Policies:
--    - "Users can upload their own contest files" (INSERT)
--    - "Users can update their own contest files" (UPDATE) 
--    - "Users can delete their own contest files" (DELETE)
--    - "Public can view contest files" (SELECT)

-- Add comments for documentation
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';
COMMENT ON COLUMN storage.buckets.id IS 'Unique bucket identifier';
COMMENT ON COLUMN storage.buckets.name IS 'Bucket name';
COMMENT ON COLUMN storage.buckets.public IS 'Whether the bucket is publicly accessible';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types'; 