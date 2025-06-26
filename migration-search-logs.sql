-- Migration: Add search_logs table for dynamic search suggestions
-- Run this in your Supabase SQL Editor

-- Create search_logs table
CREATE TABLE search_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name VARCHAR(50),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_search_logs_query ON search_logs(query);
CREATE INDEX idx_search_logs_category_id ON search_logs(category_id);
CREATE INDEX idx_search_logs_searched_at ON search_logs(searched_at DESC);
CREATE INDEX idx_search_logs_category_query ON search_logs(category_id, query);

-- Enable Row Level Security
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_logs
-- Allow all authenticated users to insert search logs
CREATE POLICY "Authenticated users can log searches" ON search_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow reading aggregated search data (no personal info exposed)
CREATE POLICY "Search logs are readable for suggestions" ON search_logs
  FOR SELECT USING (true);

-- Optional: Create a function to clean old search logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_search_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM search_logs 
  WHERE searched_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule cleanup to run daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-search-logs', '0 2 * * *', 'SELECT cleanup_old_search_logs();');