-- Migration: Add 'inactive' status to posts table
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE posts 
DROP CONSTRAINT posts_status_check;

-- Add the new constraint with 'inactive' status included
ALTER TABLE posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('active', 'resolved', 'sold', 'inactive'));

-- Verify the constraint was added correctly
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'posts_status_check';