-- ============================================
-- DIAGNOSE ALL STORES - Check Data Issues
-- ============================================
-- This script helps identify why some stores fetch data and others don't

-- 1. Check all stores and their basic info
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    CASE 
        WHEN seller_id IS NULL THEN '❌ MISSING SELLER'
        ELSE '✅ HAS SELLER'
    END as seller_status,
    CASE 
        WHEN store_link IS NULL OR store_link = '' THEN '❌ MISSING LINK'
        ELSE '✅ HAS LINK'
    END as link_status
FROM store_details
ORDER BY store_id;

-- 2. Find stores WITHOUT seller_id (CRITICAL - products won't load)
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id
FROM store_details
WHERE seller_id IS NULL;

-- 3. Find stores WITH NULL or EMPTY store_link (CRITICAL - slug matching will fail)
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id
FROM store_details
WHERE store_link IS NULL OR store_link = '';

-- 4. Extract slugs from store_link and show format
SELECT 
    store_id,
    store_name,
    store_link,
    CASE 
        WHEN store_link IS NOT NULL THEN 
            SUBSTRING(store_link, LENGTH(store_link) - LOCATE('/', REVERSE(store_link)) + 2)
        ELSE NULL
    END as extracted_slug,
    seller_id
FROM store_details
WHERE store_link IS NOT NULL
ORDER BY store_id;

-- 5. Check stores that have products (to verify seller_id linkage)
SELECT 
    s.store_id,
    s.store_name,
    s.seller_id,
    COUNT(p.products_id) as product_count,
    COUNT(CASE WHEN p.is_active = 1 THEN 1 END) as active_products,
    COUNT(CASE WHEN p.is_bestseller = 1 THEN 1 END) as bestseller_products
FROM store_details s
LEFT JOIN products p ON s.seller_id = p.seller_id
GROUP BY s.store_id, s.store_name, s.seller_id
ORDER BY s.store_id;

-- 6. Find stores with products but NO seller_id (data inconsistency)
SELECT DISTINCT
    s.store_id,
    s.store_name,
    s.seller_id,
    p.seller_id as product_seller_id
FROM store_details s
INNER JOIN products p ON s.store_id = (
    -- Try to match by store name or other logic
    SELECT store_id FROM store_details WHERE store_name = s.store_name LIMIT 1
)
WHERE s.seller_id IS NULL
LIMIT 10;

-- 7. Check for duplicate slugs (multiple stores with same slug)
SELECT 
    SUBSTRING(store_link, LENGTH(store_link) - LOCATE('/', REVERSE(store_link)) + 2) as slug,
    COUNT(*) as store_count,
    GROUP_CONCAT(store_id) as store_ids,
    GROUP_CONCAT(store_name) as store_names
FROM store_details
WHERE store_link IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- 8. Summary report
SELECT 
    COUNT(*) as total_stores,
    COUNT(CASE WHEN seller_id IS NOT NULL THEN 1 END) as stores_with_seller,
    COUNT(CASE WHEN seller_id IS NULL THEN 1 END) as stores_without_seller,
    COUNT(CASE WHEN store_link IS NOT NULL AND store_link != '' THEN 1 END) as stores_with_link,
    COUNT(CASE WHEN store_link IS NULL OR store_link = '' THEN 1 END) as stores_without_link,
    COUNT(CASE WHEN seller_id IS NOT NULL AND store_link IS NOT NULL AND store_link != '' THEN 1 END) as fully_configured_stores
FROM store_details;
