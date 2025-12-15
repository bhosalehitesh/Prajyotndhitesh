-- ============================================
-- COMPREHENSIVE DIAGNOSTIC: All Stores Status
-- Run this to see which stores work and which don't
-- ============================================

-- 1. Check ALL stores with their status
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    -- Extract slug from store_link (how backend does it)
    CASE 
        WHEN s.store_link LIKE '%/%' THEN SUBSTRING(s.store_link FROM '[^/]+$')
        ELSE s.store_link
    END as extracted_slug,
    s.seller_id,
    COUNT(p.products_id) as product_count,
    CASE 
        WHEN s.seller_id IS NULL THEN '❌ NO SELLER_ID'
        WHEN s.store_link IS NULL OR s.store_link = '' THEN '❌ EMPTY STORE_LINK'
        WHEN COUNT(p.products_id) = 0 THEN '❌ NO PRODUCTS'
        ELSE '✅ OK'
    END as status
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id
ORDER BY 
    CASE 
        WHEN s.seller_id IS NULL THEN 1
        WHEN s.store_link IS NULL OR s.store_link = '' THEN 2
        WHEN COUNT(p.products_id) = 0 THEN 3
        ELSE 4
    END,
    s.store_name;

-- 2. Find stores with NULL seller_id (CRITICAL - won't fetch products)
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    '❌ MISSING SELLER_ID - Products will NOT fetch' as issue
FROM store_details
WHERE seller_id IS NULL;

-- 3. Find stores with seller_id but no products
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    s.seller_id,
    '❌ NO PRODUCTS LINKED - Store exists but has no products' as issue
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE s.seller_id IS NOT NULL
  AND p.products_id IS NULL;

-- 4. Find stores with empty or NULL store_link (slug extraction will fail)
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    '❌ EMPTY STORE_LINK - Backend cannot extract slug' as issue
FROM store_details
WHERE store_link IS NULL OR store_link = '';

-- 5. Check for duplicate slugs (multiple stores with same slug - only first match works)
SELECT 
    CASE 
        WHEN store_link LIKE '%/%' THEN SUBSTRING(store_link FROM '[^/]+$')
        ELSE store_link
    END as slug,
    COUNT(*) as store_count,
    GROUP_CONCAT(CONCAT(store_id, ':', store_name) SEPARATOR ', ') as stores,
    '⚠️ DUPLICATE SLUG - Multiple stores share same slug' as issue
FROM store_details
WHERE store_link IS NOT NULL AND store_link != ''
GROUP BY slug
HAVING COUNT(*) > 1;

