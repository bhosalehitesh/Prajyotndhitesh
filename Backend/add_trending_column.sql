-- Add is_trending column to Category table
-- This allows categories to be marked as trending for homepage display

ALTER TABLE Category 
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for faster queries on trending categories
CREATE INDEX IF NOT EXISTS idx_category_trending ON Category(is_trending) WHERE is_trending = TRUE;

-- Update existing categories to have is_trending = FALSE by default (already handled by DEFAULT)
-- No data migration needed as DEFAULT FALSE will apply to existing rows
