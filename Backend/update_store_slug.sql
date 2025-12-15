-- ============================================
-- SQL Script to Fix Store Slug Issue
-- ============================================
-- Problem: Products not visible after changing store name from "harsh" to "sakhi"
-- Solution: Update the store_link field which contains the slug used by the API
-- ============================================

-- STEP 1: Check current store details
SELECT 
    store_id, 
    store_name, 
    store_link, 
    seller_id,
    -- Extract slug from store_link
    SUBSTRING(store_link FROM '[^/]+$') as current_slug
FROM store_details 
WHERE store_name LIKE '%sakhi%' OR store_name LIKE '%harsh%' OR store_link LIKE '%harsh%' OR store_link LIKE '%sakhi%'
ORDER BY store_id;

-- STEP 2: Check products linked to the seller
-- First, get the seller_id from the store
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    s.seller_id,
    COUNT(p.products_id) as product_count
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE s.store_name LIKE '%sakhi%' OR s.store_name LIKE '%harsh%'
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id;

-- STEP 3: Update store_link to use "sakhi" as slug
-- The backend expects format: domain/slug (e.g., "https://yourdomain.com/sakhi" or "domain/sakhi")

-- Option A: If storeLink format is "domain/harsh" or "https://domain.com/harsh"
-- Replace "/harsh" with "/sakhi"
UPDATE store_details 
SET store_link = REPLACE(store_link, '/harsh', '/sakhi')
WHERE (store_link LIKE '%/harsh%' OR store_link LIKE '%/harsh/%')
  AND store_name LIKE '%sakhi%';

-- Option B: If you know the exact domain, update directly
-- Replace 'yourdomain.com' with your actual domain
UPDATE store_details 
SET store_link = 'https://yourdomain.com/sakhi'
WHERE store_name = 'sakhi' OR store_name LIKE '%sakhi%';

-- Option C: If storeLink is just the slug (e.g., "harsh")
UPDATE store_details 
SET store_link = 'sakhi'
WHERE store_link = 'harsh' OR store_link LIKE 'harsh/%';

-- STEP 4: Verify the update worked
SELECT 
    store_id, 
    store_name, 
    store_link,
    seller_id,
    SUBSTRING(store_link FROM '[^/]+$') as extracted_slug
FROM store_details 
WHERE store_name LIKE '%sakhi%' OR store_link LIKE '%sakhi%';

-- STEP 5: Verify products are linked to the correct seller
SELECT 
    p.products_id,
    p.product_name,
    p.seller_id,
    s.store_name,
    s.store_link
FROM products p
JOIN store_details s ON s.seller_id = p.seller_id
WHERE s.store_name LIKE '%sakhi%' OR s.store_link LIKE '%sakhi%'
LIMIT 10;

