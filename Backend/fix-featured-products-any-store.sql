-- ============================================
-- PERMANENT SOLUTION: FIX FEATURED PRODUCTS FOR ANY STORE
-- ============================================
-- This script provides reusable queries that work for any seller_id/store

-- ============================================
-- OPTION 1: STORED PROCEDURE (RECOMMENDED - PERMANENT SOLUTION)
-- ============================================
-- Create a stored procedure that can be called for any seller_id
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS MarkFeaturedProducts(
    IN p_seller_id INT,
    IN p_limit_count INT
)
BEGIN
    -- Mark active products as bestseller for the given seller
    UPDATE products 
    SET is_bestseller = 1 
    WHERE seller_id = p_seller_id 
      AND is_active = 1 
      AND (is_bestseller = 0 OR is_bestseller IS NULL)
    ORDER BY created_at DESC 
    LIMIT p_limit_count;
    
    -- Return count of featured products
    SELECT 
        COUNT(*) as featured_products_count
    FROM products
    WHERE seller_id = p_seller_id 
      AND is_bestseller = 1 
      AND is_active = 1;
END$$

DELIMITER ;

-- ============================================
-- OPTION 2: GENERIC QUERIES (Use for any seller_id)
-- ============================================

-- 1. Check featured products status for ANY seller (replace <seller_id>)
-- SELECT 
--     products_id,
--     product_name,
--     seller_id,
--     is_bestseller,
--     is_active,
--     CASE 
--         WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ WILL SHOW AS FEATURED'
--         WHEN is_bestseller = 1 AND is_active = 0 THEN '❌ BESTSELLER BUT INACTIVE'
--         WHEN is_bestseller = 0 AND is_active = 1 THEN '❌ ACTIVE BUT NOT BESTSELLER'
--         ELSE '❌ NOT BESTSELLER AND INACTIVE'
--     END as status
-- FROM products
-- WHERE seller_id = <seller_id>
-- ORDER BY created_at DESC;

-- 2. Count featured products for ANY seller (replace <seller_id>)
-- SELECT 
--     COUNT(*) as total_products,
--     COUNT(CASE WHEN is_bestseller = 1 THEN 1 END) as bestseller_count,
--     COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count,
--     COUNT(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 END) as featured_count
-- FROM products
-- WHERE seller_id = <seller_id>;

-- 3. Fix featured products for ANY seller (replace <seller_id> and <limit>)
-- UPDATE products 
-- SET is_bestseller = 1 
-- WHERE seller_id = <seller_id> 
--   AND is_active = 1 
--   AND (is_bestseller = 0 OR is_bestseller IS NULL)
-- ORDER BY created_at DESC 
-- LIMIT <limit>;

-- ============================================
-- OPTION 3: FIX ALL STORES AT ONCE
-- ============================================

-- Mark featured products for ALL sellers (top 10 per seller)
-- UPDATE products p1
-- INNER JOIN (
--     SELECT products_id
--     FROM products
--     WHERE is_active = 1 
--       AND (is_bestseller = 0 OR is_bestseller IS NULL)
--     ORDER BY seller_id, created_at DESC
-- ) p2 ON p1.products_id = p2.products_id
-- SET p1.is_bestseller = 1
-- WHERE p1.products_id IN (
--     SELECT products_id FROM (
--         SELECT products_id,
--                ROW_NUMBER() OVER (PARTITION BY seller_id ORDER BY created_at DESC) as rn
--         FROM products
--         WHERE is_active = 1 
--           AND (is_bestseller = 0 OR is_bestseller IS NULL)
--     ) ranked
--     WHERE rn <= 10
-- );

-- ============================================
-- OPTION 4: CHECK ALL STORES STATUS
-- ============================================

-- Find all stores with NO featured products
SELECT 
    s.seller_id,
    s.seller_name,
    sd.store_id,
    sd.store_name,
    COUNT(p.products_id) as total_products,
    COUNT(CASE WHEN p.is_bestseller = 1 AND p.is_active = 1 THEN 1 END) as featured_count
FROM seller_details s
LEFT JOIN store_details sd ON s.seller_id = sd.seller_id
LEFT JOIN products p ON s.seller_id = p.seller_id
GROUP BY s.seller_id, s.seller_name, sd.store_id, sd.store_name
HAVING featured_count = 0
ORDER BY s.seller_id;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Example 1: Use stored procedure for seller_id 11
-- CALL MarkFeaturedProducts(11, 10);

-- Example 2: Use stored procedure for seller_id 5
-- CALL MarkFeaturedProducts(5, 15);

-- Example 3: Use stored procedure for all sellers (run in loop or script)
-- CALL MarkFeaturedProducts(1, 10);
-- CALL MarkFeaturedProducts(2, 10);
-- CALL MarkFeaturedProducts(3, 10);
-- ... etc

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify featured products for any seller (replace <seller_id>)
-- SELECT 
--     products_id,
--     product_name,
--     is_bestseller,
--     is_active
-- FROM products
-- WHERE seller_id = <seller_id> 
--   AND is_bestseller = 1 
--   AND is_active = 1
-- ORDER BY created_at DESC;
