-- ============================================
-- CHECK BESTSELLER PRODUCTS - Why Featured Products Don't Show
-- ============================================

-- 1. Check all products marked as bestseller
SELECT 
    products_id,
    product_name,
    seller_id,
    is_bestseller,
    is_active,
    CASE 
        WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ WILL SHOW'
        WHEN is_bestseller = 1 AND is_active = 0 THEN '❌ BESTSELLER BUT INACTIVE'
        WHEN is_bestseller = 0 AND is_active = 1 THEN '❌ ACTIVE BUT NOT BESTSELLER'
        ELSE '❌ NOT BESTSELLER AND INACTIVE'
    END as status
FROM products
WHERE is_bestseller = 1 OR is_active = 1
ORDER BY seller_id, is_bestseller DESC, is_active DESC;

-- 2. Count bestseller products by seller
SELECT 
    seller_id,
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_bestseller = 1 THEN 1 END) as bestseller_count,
    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count,
    COUNT(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 END) as featured_count
FROM products
GROUP BY seller_id
ORDER BY seller_id;

-- 3. Find sellers with NO featured products (bestseller + active)
SELECT 
    s.seller_id,
    s.seller_name,
    COUNT(p.products_id) as total_products,
    COUNT(CASE WHEN p.is_bestseller = 1 THEN 1 END) as bestseller_products,
    COUNT(CASE WHEN p.is_active = 1 THEN 1 END) as active_products,
    COUNT(CASE WHEN p.is_bestseller = 1 AND p.is_active = 1 THEN 1 END) as featured_products
FROM seller_details s
LEFT JOIN products p ON s.seller_id = p.seller_id
GROUP BY s.seller_id, s.seller_name
HAVING featured_products = 0
ORDER BY s.seller_id;

-- 4. Check specific seller's products (replace <seller_id> with actual seller ID)
-- SELECT 
--     products_id,
--     product_name,
--     is_bestseller,
--     is_active,
--     created_at
-- FROM products
-- WHERE seller_id = <seller_id>
-- ORDER BY created_at DESC;

-- 5. Find products that SHOULD be featured but aren't (active but not bestseller)
SELECT 
    products_id,
    product_name,
    seller_id,
    is_bestseller,
    is_active
FROM products
WHERE is_active = 1 AND (is_bestseller = 0 OR is_bestseller IS NULL)
ORDER BY seller_id, created_at DESC
LIMIT 20;

-- 6. Fix: Mark products as bestseller (replace <seller_id> and <product_id>)
-- UPDATE products 
-- SET is_bestseller = 1 
-- WHERE seller_id = <seller_id> AND products_id = <product_id>;

-- 7. Fix: Activate bestseller products that are inactive
-- UPDATE products 
-- SET is_active = 1 
-- WHERE is_bestseller = 1 AND is_active = 0;

-- 8. Quick fix: Mark top 10 active products as bestseller for a seller
-- UPDATE products 
-- SET is_bestseller = 1 
-- WHERE seller_id = <seller_id> 
--   AND is_active = 1 
--   AND is_bestseller = 0
-- ORDER BY created_at DESC 
-- LIMIT 10;
