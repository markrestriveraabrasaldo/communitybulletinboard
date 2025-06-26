-- Enhanced Migration: Add search_logs table with better quality control
-- Run this in your Supabase SQL Editor

-- Create search_logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name VARCHAR(50),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraint to ensure minimum quality
  CONSTRAINT search_logs_quality_check CHECK (
    char_length(trim(query)) >= 3 AND
    query !~ '^(.)\1+$' -- Prevent repeated characters like 'aaa', 'hhh'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_category_id ON search_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_category_query ON search_logs(category_id, query);
CREATE INDEX IF NOT EXISTS idx_search_logs_results_count ON search_logs(results_count);

-- Enable Row Level Security
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_logs
-- Allow all authenticated users to insert search logs
CREATE POLICY "Authenticated users can log searches" ON search_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow reading aggregated search data (no personal info exposed)
CREATE POLICY "Search logs are readable for suggestions" ON search_logs
  FOR SELECT USING (true);

-- Enhanced cleanup function with better quality control
CREATE OR REPLACE FUNCTION cleanup_search_logs(keep_days INTEGER DEFAULT 30)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  result_count BIGINT;
BEGIN
  -- Delete old logs
  DELETE FROM search_logs 
  WHERE searched_at < NOW() - (keep_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS result_count = ROW_COUNT;
  
  -- Delete low-quality logs
  DELETE FROM search_logs WHERE
    char_length(trim(query)) < 3 OR                    -- Too short
    query ~ '^(.)\1+$' OR                              -- Repeated characters
    query ~ '^[^a-zA-Z]*$' OR                          -- No letters
    results_count = 0 AND searched_at < NOW() - INTERVAL '1 day'; -- No results and old
  
  RETURN QUERY SELECT result_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get search quality metrics
CREATE OR REPLACE FUNCTION get_search_quality_metrics()
RETURNS TABLE(
  total_searches BIGINT,
  quality_searches BIGINT,
  avg_query_length NUMERIC,
  searches_with_results BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_searches,
    COUNT(*) FILTER (WHERE char_length(query) >= 3 AND query ~ '[a-zA-Z]') as quality_searches,
    AVG(char_length(query)) as avg_query_length,
    COUNT(*) FILTER (WHERE results_count > 0) as searches_with_results
  FROM search_logs
  WHERE searched_at > NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Clean up any existing poor quality data
SELECT cleanup_search_logs(30);

-- Optional: Schedule cleanup to run daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-search-logs', '0 2 * * *', 'SELECT cleanup_search_logs();');