-- Check products for harsh store
-- This helps identify why some products show and some don't
-- ============================================

-- 1. Find harsh store
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    'Store Info' as info
FROM store_details
WHERE store_name LIKE '%harsh%' OR store_link LIKE '%harsh%';

-- 2. Check ALL products for harsh's seller (replace <seller_id> with actual seller_id from query 1)
-- Replace <seller_id> with the seller_id from query 1
SELECT 
    products_id,
    product_name,
    seller_id,
    is_bestseller,
    is_active,
    CASE 
        WHEN product_images IS NULL OR product_images = '' THEN '❌ No images'
        ELSE '✅ Has images'
    END as has_images,
    CASE 
        WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ Featured (will show)'
        WHEN is_bestseller = 1 AND is_active = 0 THEN '⚠️ Bestseller but inactive (WON\'T SHOW)'
        WHEN is_bestseller = 0 AND is_active = 1 THEN '📦 Regular (active - WILL SHOW)'
        WHEN is_bestseller = 0 AND is_active = 0 THEN '❌ Inactive (WON\'T SHOW)'
        WHEN is_active IS NULL THEN '❓ Active status unknown'
        ELSE '❌ Unknown status'
    END as status,
    created_at
FROM products
WHERE seller_id = <seller_id>  -- Replace with actual seller_id from query 1
ORDER BY is_active DESC, is_bestseller DESC, created_at DESC;

-- 3. Count products by status
SELECT 
    COUNT(*) as total_products,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN is_active = 0 OR is_active IS NULL THEN 1 ELSE 0 END) as inactive_count,
    SUM(CASE WHEN (product_images IS NULL OR product_images = '') AND (product_image_url IS NULL OR product_image_url = '') THEN 1 ELSE 0 END) as no_image_count,
    SUM(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 ELSE 0 END) as featured_count,
    CASE 
        WHEN SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) = 0 THEN '❌ NO ACTIVE PRODUCTS - Nothing will show!'
        WHEN SUM(CASE WHEN (product_images IS NULL OR product_images = '') AND (product_image_url IS NULL OR product_image_url = '') THEN 1 ELSE 0 END) > 0 THEN '⚠️ Some products have no images'
        ELSE '✅ Products should show'
    END as issue
FROM products
WHERE seller_id = <seller_id>;  -- Replace with actual seller_id from query 1

-- 4. Fix: Activate all products for harsh's store
-- Uncomment and run this to activate all products:
-- UPDATE products 
-- SET is_active = 1
-- WHERE seller_id = <seller_id>  -- Replace with actual seller_id
--   AND (is_active = 0 OR is_active IS NULL);

-- 5. Check products with missing required fields
SELECT 
    products_id,
    product_name,
    seller_id,
    CASE 
        WHEN product_name IS NULL OR product_name = '' THEN '❌ Missing name'
        WHEN selling_price IS NULL OR selling_price = 0 THEN '❌ Missing price'
        WHEN (product_images IS NULL OR product_images = '') AND (product_image_url IS NULL OR product_image_url = '') THEN '⚠️ Missing image'
        ELSE '✅ Has all fields'
    END as missing_fields
FROM products
WHERE seller_id = <seller_id>  -- Replace with actual seller_id
  AND is_active = 1
ORDER BY 
    CASE 
        WHEN product_name IS NULL OR product_name = '' THEN 1
        WHEN selling_price IS NULL OR selling_price = 0 THEN 2
        WHEN (product_images IS NULL OR product_images = '') AND (product_image_url IS NULL OR product_image_url = '') THEN 3
        ELSE 4
    END;

