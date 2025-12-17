-- Migration script to add SmartBiz fields to collections table (same as categories)
-- Run this script to add isActive, slug, and orderIndex fields to collections

-- Add is_active column (defaults to true for existing collections)
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Update existing collections: set is_active based on hideFromWebsite
-- If hideFromWebsite is true, set is_active to false
UPDATE collections 
SET is_active = CASE WHEN hide_from_website = true THEN false ELSE true END
WHERE is_active IS NULL;

-- Add order_index column (defaults to 0)
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0 NOT NULL;

-- Add slug column (nullable, will be populated by application)
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Generate slugs for existing collections (based on collection_name)
-- This is a simple slug generation - the application will handle uniqueness
UPDATE collections 
SET slug = LOWER(REGEXP_REPLACE(collection_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Remove trailing/leading hyphens from slugs
UPDATE collections 
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- Add index on seller_id and slug for faster lookups (same as categories)
CREATE INDEX IF NOT EXISTS idx_collections_seller_slug ON collections(seller_id, slug);

-- Add index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON collections(is_active);

-- Add index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_collections_order_index ON collections(order_index);

-- Verify the changes
SELECT 
    collection_id,
    collection_name,
    is_active,
    hide_from_website,
    order_index,
    slug,
    seller_id
FROM collections
LIMIT 10;
