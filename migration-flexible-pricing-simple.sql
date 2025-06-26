-- Simplified Migration: Flexible Pricing System
-- This version avoids complex index operations that may cause issues

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

-- Run the migration
SELECT migrate_legacy_pricing();

-- Verify migration results
SELECT 
  COALESCE(c.name, 'No Category') as category,
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE details ? 'pricing') as posts_with_new_pricing,
  COUNT(*) FILTER (WHERE details ? 'price') as posts_with_legacy_price,
  COUNT(*) FILTER (WHERE details ? 'price_range') as posts_with_legacy_price_range
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.name NULLS LAST;

-- Show examples of migrated pricing (limit to avoid large output)
SELECT 
  COALESCE(c.name, 'No Category') as category,
  LEFT(p.title, 50) as title_preview,
  details->'pricing' as new_pricing_structure
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE details ? 'pricing'
ORDER BY c.name NULLS LAST, p.created_at DESC
LIMIT 5;