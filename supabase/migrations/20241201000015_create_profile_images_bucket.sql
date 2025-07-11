-- Create profile-images storage bucket
-- Migration: 20241201000015_create_profile_images_bucket.sql

-- Note: Storage bucket and policies must be created manually in Supabase dashboard
-- 
-- 1. Create bucket 'profile-images' in Storage section
-- 2. Create policies in Storage > profile-images > Policies:
--    - "Users can upload their own profile images" (INSERT)
--    - "Users can update their own profile images" (UPDATE) 
--    - "Users can delete their own profile images" (DELETE)
--    - "Public can view profile images" (SELECT)

-- Add comments for documentation
COMMENT ON TABLE storage.buckets IS 'Storage buckets for profile images';
COMMENT ON COLUMN storage.buckets.id IS 'Unique bucket identifier';
COMMENT ON COLUMN storage.buckets.name IS 'Bucket name';
COMMENT ON COLUMN storage.buckets.public IS 'Whether the bucket is publicly accessible';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types';

-- Profile images bucket configuration:
-- Name: profile-images
-- Public: true (for public access to profile images)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp 