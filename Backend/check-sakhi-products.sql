-- Check products for sakhi store (store_id = 8, seller_id = 11)
-- ============================================

-- 1. Check store details
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    'Store Info' as info
FROM store_details
WHERE store_id = 8 OR store_name = 'sakhi';

-- 2. Check ALL products for seller_id = 11
SELECT 
    products_id,
    product_name,
    seller_id,
    is_bestseller,
    is_active,
    created_at,
    CASE 
        WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ Featured (will show)'
        WHEN is_bestseller = 1 AND is_active = 0 THEN '⚠️ Bestseller but inactive'
        WHEN is_bestseller = 0 AND is_active = 1 THEN '📦 Regular product (active)'
        ELSE '❌ Inactive'
    END as status
FROM products
WHERE seller_id = 11
ORDER BY is_bestseller DESC, created_at DESC;

-- 3. Count products by type
SELECT 
    COUNT(*) as total_products,
    SUM(CASE WHEN is_bestseller = 1 THEN 1 ELSE 0 END) as bestseller_count,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 ELSE 0 END) as featured_count,
    CASE 
        WHEN SUM(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 ELSE 0 END) = 0 THEN '❌ NO FEATURED PRODUCTS - Home page will be empty!'
        ELSE '✅ Has featured products'
    END as issue
FROM products
WHERE seller_id = 11;

-- 4. Fix: Mark some products as bestseller (if you want featured products)
-- Uncomment and run this to mark top 10 products as bestseller:
-- UPDATE products 
-- SET is_bestseller = 1
-- WHERE seller_id = 11 
--   AND is_active = 1
--   AND is_bestseller = 0
-- ORDER BY created_at DESC
-- LIMIT 10;

-- 5. Fix: Activate products if they're inactive
-- Uncomment and run this to activate all products:
-- UPDATE products 
-- SET is_active = 1
-- WHERE seller_id = 11 
--   AND is_active = 0;

