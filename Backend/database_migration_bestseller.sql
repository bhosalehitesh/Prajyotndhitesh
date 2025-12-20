-- ============================================
-- Database Migration: Add is_bestseller column
-- ============================================
-- This script works for PostgreSQL, MySQL, and other databases
-- Run this script manually if Hibernate auto-update doesn't work
-- ============================================

-- For PostgreSQL
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_bestseller'
    ) THEN
        ALTER TABLE products ADD COLUMN is_bestseller BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
END $$;

-- For MySQL (alternative syntax)
-- ALTER TABLE products 
-- ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE NOT NULL;

-- Update existing NULL values to FALSE (safety check)
UPDATE products 
SET is_bestseller = FALSE 
WHERE is_bestseller IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'is_bestseller';








