-- ============================================
-- FIX FEATURED PRODUCTS FOR SAKHI STORE (seller_id = 11)
-- ============================================

-- 1. Check current status of products for seller_id 11
SELECT 
    products_id,
    product_name,
    is_bestseller,
    is_active,
    CASE 
        WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ WILL SHOW AS FEATURED'
        WHEN is_bestseller = 1 AND is_active = 0 THEN '❌ BESTSELLER BUT INACTIVE'
        WHEN is_bestseller = 0 AND is_active = 1 THEN '❌ ACTIVE BUT NOT BESTSELLER'
        ELSE '❌ NOT BESTSELLER AND INACTIVE'
    END as status
FROM products
WHERE seller_id = 11
ORDER BY created_at DESC;

-- 2. Count products by status
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_bestseller = 1 THEN 1 END) as bestseller_count,
    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count,
    COUNT(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 END) as featured_count
FROM products
WHERE seller_id = 11;

-- 3. FIX: Mark top 10 active products as bestseller (RECOMMENDED)
UPDATE products 
SET is_bestseller = 1 
WHERE seller_id = 11 
  AND is_active = 1 
  AND (is_bestseller = 0 OR is_bestseller IS NULL)
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verify the fix
SELECT 
    products_id,
    product_name,
    is_bestseller,
    is_active
FROM products
WHERE seller_id = 11 
  AND is_bestseller = 1 
  AND is_active = 1
ORDER BY created_at DESC;

-- 5. If no active products exist, activate some products first, then mark as bestseller
-- Step A: Activate products (if needed)
-- UPDATE products 
-- SET is_active = 1 
-- WHERE seller_id = 11 
--   AND is_active = 0
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- Step B: Then mark them as bestseller
-- UPDATE products 
-- SET is_bestseller = 1 
-- WHERE seller_id = 11 
--   AND is_active = 1 
--   AND (is_bestseller = 0 OR is_bestseller IS NULL)
-- ORDER BY created_at DESC 
-- LIMIT 10;
