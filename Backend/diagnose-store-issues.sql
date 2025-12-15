-- Diagnostic SQL Script: Find Stores That Aren't Working
-- This script helps identify why some stores fetch data while others don't

-- ============================================
-- 1. CHECK ALL STORES AND THEIR SLUGS
-- ============================================
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    -- Extract slug from store_link (everything after last /)
    SUBSTRING_INDEX(store_link, '/', -1) as extracted_slug,
    -- Check if store_link is NULL or empty
    CASE 
        WHEN store_link IS NULL OR store_link = '' THEN '❌ MISSING store_link'
        ELSE '✅ Has store_link'
    END as store_link_status
FROM store_details
ORDER BY store_id;

-- ============================================
-- 2. FIND STORES WITH MISSING OR INVALID store_link
-- ============================================
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    '❌ ISSUE: Missing or invalid store_link' as issue
FROM store_details
WHERE store_link IS NULL 
   OR store_link = ''
   OR store_link NOT LIKE '%/%'
ORDER BY store_id;

-- ============================================
-- 3. CHECK PRODUCT COUNT FOR EACH STORE
-- ============================================
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    SUBSTRING_INDEX(s.store_link, '/', -1) as slug,
    s.seller_id,
    COUNT(p.products_id) as product_count,
    CASE 
        WHEN COUNT(p.products_id) = 0 THEN '❌ NO PRODUCTS'
        WHEN COUNT(p.products_id) > 0 THEN '✅ Has products'
    END as product_status
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id
ORDER BY product_count ASC, s.store_id;

-- ============================================
-- 4. FIND STORES WITH NO PRODUCTS
-- ============================================
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    SUBSTRING_INDEX(s.store_link, '/', -1) as slug,
    s.seller_id,
    '❌ ISSUE: No products linked to seller_id' as issue
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE p.products_id IS NULL
ORDER BY s.store_id;

-- ============================================
-- 5. CHECK SELLER LINKAGE
-- ============================================
SELECT 
    s.store_id,
    s.store_name,
    s.seller_id,
    CASE 
        WHEN s.seller_id IS NULL THEN '❌ MISSING seller_id'
        ELSE '✅ Has seller_id'
    END as seller_status
FROM store_details s
ORDER BY s.store_id;

-- ============================================
-- 6. FIND STORES WITH MISSING seller_id
-- ============================================
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    '❌ ISSUE: Missing seller_id - products cannot be fetched' as issue
FROM store_details
WHERE seller_id IS NULL
ORDER BY store_id;

-- ============================================
-- 7. COMPREHENSIVE DIAGNOSTIC REPORT
-- ============================================
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    SUBSTRING_INDEX(s.store_link, '/', -1) as slug,
    s.seller_id,
    COUNT(DISTINCT p.products_id) as product_count,
    COUNT(DISTINCT c.category_id) as category_count,
    -- Build issue list
    CONCAT_WS(' | ',
        CASE WHEN s.store_link IS NULL OR s.store_link = '' THEN 'Missing store_link' END,
        CASE WHEN s.seller_id IS NULL THEN 'Missing seller_id' END,
        CASE WHEN COUNT(DISTINCT p.products_id) = 0 THEN 'No products' END,
        CASE WHEN COUNT(DISTINCT c.category_id) = 0 THEN 'No categories' END
    ) as issues,
    -- Overall status
    CASE 
        WHEN s.store_link IS NULL OR s.store_link = '' THEN '❌ BROKEN - Missing store_link'
        WHEN s.seller_id IS NULL THEN '❌ BROKEN - Missing seller_id'
        WHEN COUNT(DISTINCT p.products_id) = 0 THEN '⚠️ WARNING - No products'
        WHEN COUNT(DISTINCT c.category_id) = 0 THEN '⚠️ WARNING - No categories'
        ELSE '✅ OK'
    END as status
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
LEFT JOIN categories c ON c.seller_id = s.seller_id
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id
ORDER BY 
    CASE 
        WHEN s.store_link IS NULL OR s.store_link = '' THEN 1
        WHEN s.seller_id IS NULL THEN 2
        WHEN COUNT(DISTINCT p.products_id) = 0 THEN 3
        ELSE 4
    END,
    s.store_id;

-- ============================================
-- 8. TEST SPECIFIC STORE SLUG
-- Replace 'your_slug_here' with the actual slug you're testing
-- ============================================
SET @test_slug = 'your_slug_here'; -- CHANGE THIS

SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    SUBSTRING_INDEX(s.store_link, '/', -1) as extracted_slug,
    @test_slug as requested_slug,
    CASE 
        WHEN SUBSTRING_INDEX(s.store_link, '/', -1) = @test_slug THEN '✅ EXACT MATCH'
        WHEN LOWER(REPLACE(SUBSTRING_INDEX(s.store_link, '/', -1), '-', '')) = LOWER(REPLACE(@test_slug, '-', '')) THEN '✅ MATCH (ignoring hyphens)'
        ELSE '❌ NO MATCH'
    END as match_status,
    s.seller_id,
    COUNT(p.products_id) as product_count
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE SUBSTRING_INDEX(s.store_link, '/', -1) = @test_slug
   OR LOWER(REPLACE(SUBSTRING_INDEX(s.store_link, '/', -1), '-', '')) = LOWER(REPLACE(@test_slug, '-', ''))
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id;

-- ============================================
-- 9. FIX COMMON ISSUES
-- ============================================

-- Fix stores with NULL store_link (set to store_name)
-- UPDATE store_details 
-- SET store_link = CONCAT('https://yourdomain.com/', LOWER(REPLACE(store_name, ' ', '-')))
-- WHERE store_link IS NULL OR store_link = '';

-- Fix stores with missing seller_id (if you know the correct seller_id)
-- UPDATE store_details 
-- SET seller_id = <correct_seller_id>
-- WHERE store_id = <store_id> AND seller_id IS NULL;

