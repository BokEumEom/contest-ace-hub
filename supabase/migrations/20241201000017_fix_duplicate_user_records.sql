-- Fix duplicate user records in user_profiles and user_statistics
-- Migration: 20241201000017_fix_duplicate_user_records.sql

-- Remove duplicate user_profiles records, keeping the most recent one
DELETE FROM user_profiles 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM user_profiles 
  GROUP BY user_id
);

-- Remove duplicate user_statistics records, keeping the most recent one
DELETE FROM user_statistics 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM user_statistics 
  GROUP BY user_id
);

-- Ensure unique constraints are properly enforced
-- This will fail if there are still duplicates, which is what we want
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
ALTER TABLE user_statistics ADD CONSTRAINT user_statistics_user_id_unique UNIQUE (user_id); 