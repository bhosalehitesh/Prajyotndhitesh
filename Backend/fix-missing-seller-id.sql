-- Fix Stores Missing seller_id
-- This script helps identify and fix stores that don't have seller_id linked

-- ============================================
-- 1. FIND STORES WITH MISSING seller_id
-- ============================================
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    '❌ ISSUE: Missing seller_id' as issue
FROM store_details
WHERE seller_id IS NULL
ORDER BY store_id;

-- ============================================
-- 2. CHECK AVAILABLE SELLERS
-- ============================================
-- Find available sellers to link stores to
SELECT 
    seller_id, 
    full_name, 
    phone,
    enabled,
    COUNT(s.store_id) as store_count
FROM seller_details sd
LEFT JOIN store_details s ON s.seller_id = sd.seller_id
GROUP BY seller_id, full_name, phone, enabled
ORDER BY seller_id;

-- ============================================
-- 3. FIND STORES THAT NEED seller_id LINKED
-- ============================================
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    s.seller_id,
    CASE 
        WHEN s.seller_id IS NULL THEN '❌ MISSING seller_id'
        ELSE '✅ Has seller_id'
    END as status
FROM store_details s
ORDER BY 
    CASE WHEN s.seller_id IS NULL THEN 0 ELSE 1 END,
    s.store_id;

-- ============================================
-- 4. FIX: LINK STORE TO SELLER
-- ============================================
-- Replace <store_id> and <seller_id> with actual values
-- 
-- Example: If store_id = 8 should be linked to seller_id = 5
-- UPDATE store_details 
-- SET seller_id = 5
-- WHERE store_id = 8 AND seller_id IS NULL;

-- ============================================
-- 5. VERIFY FIX AFTER UPDATING
-- ============================================
-- Replace <store_id> with the store you fixed
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    s.seller_id,
    sd.full_name as seller_name,
    sd.phone as seller_phone,
    COUNT(p.products_id) as product_count,
    CASE 
        WHEN s.seller_id IS NULL THEN '❌ STILL MISSING seller_id'
        WHEN COUNT(p.products_id) = 0 THEN '⚠️ No products linked'
        ELSE '✅ OK - Has seller_id and products'
    END as status
FROM store_details s
LEFT JOIN seller_details sd ON s.seller_id = sd.seller_id
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE s.store_id = 8  -- Replace with your store_id
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id, sd.full_name, sd.phone;

-- ============================================
-- 6. CHECK PRODUCT COUNT FOR ALL STORES
-- ============================================
SELECT 
    s.store_id,
    s.store_name,
    s.seller_id,
    COUNT(p.products_id) as product_count,
    CASE 
        WHEN s.seller_id IS NULL THEN '❌ Missing seller_id'
        WHEN COUNT(p.products_id) = 0 THEN '⚠️ No products'
        ELSE '✅ OK'
    END as status
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
GROUP BY s.store_id, s.store_name, s.seller_id
ORDER BY 
    CASE WHEN s.seller_id IS NULL THEN 0 ELSE 1 END,
    product_count ASC,
    s.store_id;

