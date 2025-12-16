-- ============================================
-- Add is_bestseller column to products table
-- ============================================
-- Run this script on your PostgreSQL database to add the bestseller field

-- Add the column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;

-- Update existing products to have is_bestseller = false if NULL
UPDATE products 
SET is_bestseller = FALSE 
WHERE is_bestseller IS NULL;

-- Make sure the column is NOT NULL with default
ALTER TABLE products 
ALTER COLUMN is_bestseller SET DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'is_bestseller';







