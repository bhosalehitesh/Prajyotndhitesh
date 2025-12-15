# Fix: /tushar Not Fetching (But /store/harsh Works)

## Problem
- ✅ `http://localhost:5173/store/harsh` - WORKS
- ❌ `http://localhost:5173/tushar` - NOT WORKING

## Root Cause Analysis

Both routes should work:
- `/store/:slug` → Extracts slug from `/store/harsh` → slug = "harsh" ✅
- `/:slug` → Extracts slug from `/tushar` → slug = "tushar" ❌

The issue is likely in the **database**, not the code.

## Quick Diagnostic

### Step 1: Check if "tushar" store exists
```sql
SELECT store_id, store_name, store_link, seller_id 
FROM store_details 
WHERE store_name LIKE '%tushar%' 
   OR store_link LIKE '%tushar%';
```

### Step 2: Check extracted slug
```sql
SELECT 
    store_id,
    store_name,
    store_link,
    -- Extract slug (how backend does it)
    CASE 
        WHEN store_link LIKE '%/%' THEN SUBSTRING(store_link FROM '[^/]+$')
        ELSE store_link
    END as extracted_slug,
    seller_id
FROM store_details 
WHERE store_name LIKE '%tushar%' 
   OR store_link LIKE '%tushar%';
```

### Step 3: Compare with working store "harsh"
```sql
SELECT 
    store_id,
    store_name,
    store_link,
    CASE 
        WHEN store_link LIKE '%/%' THEN SUBSTRING(store_link FROM '[^/]+$')
        ELSE store_link
    END as extracted_slug,
    seller_id,
    (SELECT COUNT(*) FROM products WHERE seller_id = store_details.seller_id) as product_count
FROM store_details 
WHERE store_name LIKE '%harsh%' 
   OR store_name LIKE '%tushar%'
ORDER BY store_name;
```

## Common Fixes

### Fix 1: Store doesn't exist
**If query returns 0 rows:**
- Create the store or check if it was deleted

### Fix 2: Wrong store_link
**If `extracted_slug` ≠ "tushar":**
```sql
-- Update store_link to match slug "tushar"
UPDATE store_details 
SET store_link = REPLACE(store_link, '/old-slug', '/tushar')
WHERE store_name LIKE '%tushar%';

-- OR set it directly
UPDATE store_details 
SET store_link = 'https://domain.com/tushar'  -- Replace with your domain
WHERE store_name LIKE '%tushar%';
```

### Fix 3: No seller_id
**If `seller_id` is NULL:**
```sql
-- Link store to seller
UPDATE store_details 
SET seller_id = [SELLER_ID]
WHERE store_name LIKE '%tushar%';
```

### Fix 4: No products
**If `product_count` is 0:**
```sql
-- Link products to seller
UPDATE products 
SET seller_id = [SELLER_ID]
WHERE seller_id IS NULL 
   OR seller_id != [SELLER_ID];
```

## Test After Fix

1. **Check browser console (F12)** when visiting `/tushar`:
   ```
   🔍 [SLUG] Extracting slug from path: /tushar
   ✅ [SLUG] Found slug from /:slug pattern: tushar
   🔍 Loading store for slug: tushar
   ✅ Store found: [Store Name]
   ```

2. **Check backend logs**:
   ```
   🔍 [DEBUG] Fetching products for slug: tushar
   ✅ [DEBUG] Store found: Tushar Store (ID: X)
   📦 [DEBUG] Seller ID: [ID]
   📦 [DEBUG] Found X products for seller [ID]
   ```

3. **Test API directly**:
   ```bash
   curl http://localhost:8080/api/public/store/tushar
   curl http://localhost:8080/api/public/store/tushar/products
   ```

## Quick Fix SQL

Run this to check and fix "tushar" store:

```sql
-- 1. Check current state
SELECT 
    store_id,
    store_name,
    store_link,
    CASE 
        WHEN store_link LIKE '%/%' THEN SUBSTRING(store_link FROM '[^/]+$')
        ELSE store_link
    END as extracted_slug,
    seller_id,
    (SELECT COUNT(*) FROM products WHERE seller_id = store_details.seller_id) as product_count
FROM store_details 
WHERE store_name LIKE '%tushar%' 
   OR store_link LIKE '%tushar%';

-- 2. If store exists but slug is wrong, fix it:
UPDATE store_details 
SET store_link = CONCAT('https://domain.com/', 'tushar')  -- Replace domain
WHERE store_name LIKE '%tushar%' 
  AND (store_link IS NULL 
       OR SUBSTRING(store_link FROM '[^/]+$') != 'tushar');

-- 3. Verify fix
SELECT 
    store_id,
    store_name,
    store_link,
    SUBSTRING(store_link FROM '[^/]+$') as extracted_slug
FROM store_details 
WHERE store_name LIKE '%tushar%';
```

