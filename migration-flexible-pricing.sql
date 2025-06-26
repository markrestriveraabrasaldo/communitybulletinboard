-- Migration: Flexible Pricing System
-- Adds support for flexible, currency-agnostic pricing while maintaining backward compatibility

-- Add new JSONB pricing structure to posts table
-- The new 'pricing' field in details JSONB will store PriceData structure:
-- {
--   "type": "fixed|range|free",
--   "value": number (for fixed),
--   "min": number (for range),
--   "max": number (for range),
--   "negotiable": boolean,
--   "unit": "item|hour|day|service|week|month"
-- }

-- Function to migrate existing price data to new structure
CREATE OR REPLACE FUNCTION migrate_legacy_pricing()
RETURNS void AS $$
DECLARE
  post_record RECORD;
  new_pricing JSONB;
BEGIN
  -- Migrate existing posts with legacy pricing
  FOR post_record IN 
    SELECT id, details, categories.name as category_name
    FROM posts 
    LEFT JOIN categories ON posts.category_id = categories.id
    WHERE details IS NOT NULL
  LOOP
    new_pricing := NULL;
    
    -- Handle Food Selling category with 'price' field
    IF post_record.category_name = 'Food Selling' AND post_record.details ? 'price' THEN
      new_pricing := jsonb_build_object(
        'type', 'fixed',
        'value', (post_record.details->>'price')::numeric,
        'negotiable', false,
        'unit', 'item'
      );
      
    -- Handle Services category with 'price_range' field
    ELSIF post_record.category_name = 'Services' AND post_record.details ? 'price_range' THEN
      CASE post_record.details->>'price_range'
        WHEN 'under_50' THEN
          new_pricing := jsonb_build_object(
            'type', 'range',
            'min', 0,
            'max', 50,
            'negotiable', false,
            'unit', 'service'
          );
        WHEN '50_100' THEN
          new_pricing := jsonb_build_object(
            'type', 'range',
            'min', 50,
            'max', 100,
            'negotiable', false,
            'unit', 'service'
          );
        WHEN '100_200' THEN
          new_pricing := jsonb_build_object(
            'type', 'range',
            'min', 100,
            'max', 200,
            'negotiable', false,
            'unit', 'service'
          );
        WHEN 'over_200' THEN
          new_pricing := jsonb_build_object(
            'type', 'range',
            'min', 200,
            'max', NULL,
            'negotiable', false,
            'unit', 'service'
          );
        WHEN 'negotiable' THEN
          new_pricing := jsonb_build_object(
            'type', 'fixed',
            'value', NULL,
            'negotiable', true,
            'unit', 'service'
          );
      END CASE;
    END IF;
    
    -- Update post with new pricing structure if we created one
    IF new_pricing IS NOT NULL THEN
      UPDATE posts 
      SET details = details || jsonb_build_object('pricing', new_pricing)
      WHERE id = post_record.id;
      
      RAISE NOTICE 'Migrated pricing for post % (%) to %', 
        post_record.id, post_record.category_name, new_pricing;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Pricing migration completed';
END;
$$ LANGUAGE plpgsql;

-- Function to extract numeric price for searching/filtering
CREATE OR REPLACE FUNCTION extract_price_value(pricing_data JSONB)
RETURNS numeric AS $$
BEGIN
  IF pricing_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  CASE pricing_data->>'type'
    WHEN 'fixed' THEN
      RETURN (pricing_data->>'value')::numeric;
    WHEN 'range' THEN
      -- Use minimum price for range queries
      RETURN (pricing_data->>'min')::numeric;
    WHEN 'free' THEN
      RETURN 0;
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if price is in range
CREATE OR REPLACE FUNCTION price_in_range(pricing_data JSONB, min_price numeric, max_price numeric)
RETURNS boolean AS $$
DECLARE
  price_min numeric;
  price_max numeric;
BEGIN
  IF pricing_data IS NULL THEN
    RETURN false;
  END IF;
  
  CASE pricing_data->>'type'
    WHEN 'fixed' THEN
      price_min := (pricing_data->>'value')::numeric;
      price_max := price_min;
    WHEN 'range' THEN
      price_min := (pricing_data->>'min')::numeric;
      price_max := (pricing_data->>'max')::numeric;
    WHEN 'free' THEN
      price_min := 0;
      price_max := 0;
    ELSE
      RETURN false;
  END CASE;
  
  -- Check if price range overlaps with search range
  RETURN (price_min <= max_price AND price_max >= min_price);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create indexes for price-based queries
-- Use BTREE for text values instead of GIN
CREATE INDEX IF NOT EXISTS idx_posts_pricing_type 
ON posts USING BTREE ((details->'pricing'->>'type'));

CREATE INDEX IF NOT EXISTS idx_posts_pricing_value 
ON posts USING BTREE (extract_price_value(details->'pricing'));

CREATE INDEX IF NOT EXISTS idx_posts_pricing_negotiable 
ON posts USING BTREE (((details->'pricing'->>'negotiable')::boolean));

-- Function to get price statistics for a category
CREATE OR REPLACE FUNCTION get_category_price_stats(category_name_param text)
RETURNS TABLE(
  total_posts bigint,
  free_posts bigint,
  fixed_posts bigint,
  range_posts bigint,
  negotiable_posts bigint,
  avg_price numeric,
  min_price numeric,
  max_price numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH price_data AS (
    SELECT 
      details->'pricing' as pricing,
      extract_price_value(details->'pricing') as price_value
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE c.name = category_name_param 
      AND details ? 'pricing'
      AND p.status = 'active'
  )
  SELECT 
    COUNT(*)::bigint as total_posts,
    COUNT(*) FILTER (WHERE pricing->>'type' = 'free')::bigint as free_posts,
    COUNT(*) FILTER (WHERE pricing->>'type' = 'fixed')::bigint as fixed_posts,
    COUNT(*) FILTER (WHERE pricing->>'type' = 'range')::bigint as range_posts,
    COUNT(*) FILTER (WHERE (pricing->>'negotiable')::boolean = true)::bigint as negotiable_posts,
    AVG(price_value) FILTER (WHERE price_value > 0) as avg_price,
    MIN(price_value) FILTER (WHERE price_value > 0) as min_price,
    MAX(price_value) as max_price
  FROM price_data;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_legacy_pricing();

-- Verify migration results
SELECT 
  c.name as category,
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE details ? 'pricing') as posts_with_new_pricing,
  COUNT(*) FILTER (WHERE details ? 'price') as posts_with_legacy_price,
  COUNT(*) FILTER (WHERE details ? 'price_range') as posts_with_legacy_price_range
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- Show examples of migrated pricing
SELECT 
  c.name as category,
  p.title,
  details->'pricing' as new_pricing_structure,
  CASE 
    WHEN details ? 'price' THEN 'price: ' || (details->>'price')
    WHEN details ? 'price_range' THEN 'price_range: ' || (details->>'price_range')
    ELSE 'no legacy pricing'
  END as legacy_pricing
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE details ? 'pricing'
ORDER BY c.name, p.created_at DESC
LIMIT 10;