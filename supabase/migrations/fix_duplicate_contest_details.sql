-- Fix duplicate contest_details records
-- This script should be run in the Supabase SQL Editor

-- First, let's see if there are any duplicate records
SELECT 
  contest_id, 
  detail_type, 
  COUNT(*) as count
FROM contest_details 
GROUP BY contest_id, detail_type 
HAVING COUNT(*) > 1;

-- If duplicates exist, we'll keep the most recent one for each contest_id and detail_type combination
-- Delete duplicate records, keeping only the most recent one
DELETE FROM contest_details 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY contest_id, detail_type 
             ORDER BY updated_at DESC, created_at DESC
           ) as rn
    FROM contest_details
  ) t
  WHERE t.rn > 1
);

-- Verify the fix by checking for duplicates again
SELECT 
  contest_id, 
  detail_type, 
  COUNT(*) as count
FROM contest_details 
GROUP BY contest_id, detail_type 
HAVING COUNT(*) > 1;

-- This should return no rows if the fix was successful 