-- ============================================
-- Database Performance Indexes
-- ============================================
-- Run this script on your PostgreSQL database to improve query performance
-- These indexes will significantly speed up product queries, especially with large datasets
-- ============================================

-- Index on seller_id for faster product lookups by seller
-- This is critical for the /sellerProducts endpoint
CREATE INDEX IF NOT EXISTS idx_products_seller_id 
ON products(seller_id);

-- Index on created_at for faster sorting by date (newest first)
-- Used in the paginated query ORDER BY p.createdAt DESC
CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

-- Composite index for seller + created_at (most common query pattern)
-- This will be even faster for paginated seller product queries
CREATE INDEX IF NOT EXISTS idx_products_seller_created_at 
ON products(seller_id, created_at DESC);

-- Index on category_id if you frequently filter by category
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON products(category_id);

-- Index on product_name for faster search queries
-- Used in the searchProductsByName functionality
CREATE INDEX IF NOT EXISTS idx_products_name_lower 
ON products(LOWER(product_name));

-- Index on custom_sku for faster SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_custom_sku 
ON products(custom_sku) 
WHERE custom_sku IS NOT NULL;

-- ============================================
-- Verify indexes were created
-- ============================================
-- Run this query to see all indexes on the products table:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'products';

-- ============================================
-- Performance Notes:
-- ============================================
-- 1. Indexes speed up SELECT queries but slightly slow down INSERT/UPDATE/DELETE
-- 2. For most applications, the read performance gain far outweighs the write cost
-- 3. These indexes are especially important when you have 1000+ products
-- 4. Monitor query performance using EXPLAIN ANALYZE in PostgreSQL

