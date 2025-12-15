-- Check Tushar Store Status
-- Run this to see why products aren't fetching

-- 1. Check store details
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    CASE 
        WHEN store_link LIKE '%/%' THEN SUBSTRING(store_link FROM '[^/]+$')
        ELSE store_link
    END as extracted_slug
FROM store_details 
WHERE store_name = 'tushar' 
   OR store_link LIKE '%tushar%';

-- 2. Check if store has seller_id
SELECT 
    store_id,
    store_name,
    seller_id,
    CASE 
        WHEN seller_id IS NULL THEN '❌ NO SELLER_ID - Products will NOT fetch'
        ELSE '✅ Has seller_id'
    END as status
FROM store_details 
WHERE store_name = 'tushar';

-- 3. Check if seller has products
SELECT 
    s.store_id,
    s.store_name,
    s.seller_id,
    COUNT(p.products_id) as product_count,
    CASE 
        WHEN s.seller_id IS NULL THEN '❌ NO SELLER_ID'
        WHEN COUNT(p.products_id) = 0 THEN '❌ NO PRODUCTS'
        ELSE '✅ OK'
    END as status
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE s.store_name = 'tushar'
GROUP BY s.store_id, s.store_name, s.seller_id;

-- 4. Show sample products if they exist
SELECT 
    p.products_id,
    p.product_name,
    p.seller_id,
    s.store_name
FROM products p
JOIN store_details s ON s.seller_id = p.seller_id
WHERE s.store_name = 'tushar'
LIMIT 10;

