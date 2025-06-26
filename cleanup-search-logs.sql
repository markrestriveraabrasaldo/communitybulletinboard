-- Aggressive cleanup of existing partial word search logs
-- Run this FIRST to clean existing bad data

-- Delete all partial words and low-quality searches
DELETE FROM search_logs WHERE
  -- Too short (less than 3 characters)
  char_length(trim(query)) < 3 OR
  
  -- Partial words like "mak", "maka" from "makati"
  query SIMILAR TO '%(mak|halo|ha|urgent|free|new)%' AND char_length(query) < 6 OR
  
  -- Starts with common partial patterns
  query LIKE 'ma%' AND char_length(query) < 5 OR
  query LIKE 'ha%' AND char_length(query) < 4 OR
  
  -- Repeated characters
  query ~ '^(.)\1+$' OR
  
  -- Only special characters or numbers
  query ~ '^[^a-zA-Z]*$' OR
  
  -- Common short words that are likely partial typing
  query IN ('the', 'and', 'for', 'you', 'are', 'can', 'how', 'what', 'who', 'why', 'when', 'where') OR
  
  -- No results and very short
  results_count = 0 AND char_length(query) < 4;

-- Keep only high-quality searches
-- This ensures suggestions will be meaningful
UPDATE search_logs SET query = trim(lower(query)) WHERE query != trim(lower(query));

-- Show what's left
SELECT 
  query, 
  COUNT(*) as frequency,
  AVG(results_count) as avg_results,
  MAX(searched_at) as last_searched
FROM search_logs 
WHERE searched_at > NOW() - INTERVAL '7 days'
GROUP BY query 
ORDER BY frequency DESC 
LIMIT 20;