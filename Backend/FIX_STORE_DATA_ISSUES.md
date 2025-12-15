# Fix Store Data Issues - Why Some Stores Don't Fetch Data

## Problem
Some stores fetch data successfully, while others don't. This document helps diagnose and fix the issues.

## Common Causes

### 1. **Missing `seller_id` in `store_details` table** ⚠️ CRITICAL
**Symptom:** Store loads but shows no products
**Fix:**
```sql
-- Check stores without seller_id
SELECT store_id, store_name, seller_id 
FROM store_details 
WHERE seller_id IS NULL;

-- Fix: Link store to seller
UPDATE store_details 
SET seller_id = <seller_id> 
WHERE store_id = <store_id>;
```

### 2. **NULL or Empty `store_link` field**
**Symptom:** Store not found (404 error)
**Fix:**
```sql
-- Check stores with missing links
SELECT store_id, store_name, store_link 
FROM store_details 
WHERE store_link IS NULL OR store_link = '';

-- Fix: Update store_link (format: domain/slug)
UPDATE store_details 
SET store_link = 'https://yourdomain.com/store-slug' 
WHERE store_id = <store_id>;
```

### 3. **Slug Mismatch**
**Symptom:** Store not found even though it exists
**Fix:**
```sql
-- Check slug format in store_link
SELECT store_id, store_name, store_link,
       SUBSTRING(store_link, LENGTH(store_link) - LOCATE('/', REVERSE(store_link)) + 2) as extracted_slug
FROM store_details;

-- Ensure slug matches URL (e.g., /store/my-store should match store_link ending with /my-store)
```

### 4. **No Products for Seller**
**Symptom:** Store loads but shows "No products found"
**Fix:**
```sql
-- Check if seller has products
SELECT COUNT(*) as product_count
FROM products 
WHERE seller_id = <seller_id>;

-- Check if products are active
SELECT COUNT(*) as active_count
FROM products 
WHERE seller_id = <seller_id> AND is_active = 1;

-- Activate products if needed
UPDATE products 
SET is_active = 1 
WHERE seller_id = <seller_id> AND is_active = 0;
```

### 5. **All Products Inactive**
**Symptom:** Store loads but shows no products (backend returns empty array)
**Fix:**
```sql
-- Check inactive products
SELECT products_id, product_name, is_active, seller_id
FROM products 
WHERE seller_id = <seller_id> AND is_active = 0;

-- Activate products
UPDATE products 
SET is_active = 1 
WHERE seller_id = <seller_id>;
```

## Diagnostic Queries

Run `diagnose-all-stores.sql` to get a comprehensive report:
```bash
mysql -u your_user -p your_database < diagnose-all-stores.sql
```

## Quick Fix Script

```sql
-- Fix stores without seller_id (replace <seller_id> with actual seller ID)
UPDATE store_details sd
INNER JOIN products p ON sd.store_name = (
    -- Try to match by seller name or other logic
    SELECT seller_name FROM seller_details WHERE seller_id = <seller_id>
)
SET sd.seller_id = <seller_id>
WHERE sd.seller_id IS NULL;

-- Verify fix
SELECT store_id, store_name, seller_id 
FROM store_details 
WHERE seller_id IS NOT NULL;
```

## Backend Logs to Check

When a store doesn't fetch data, check backend logs for:
1. `❌ [getStoreBySlug] WARNING: Store has NO seller linked!`
2. `❌ [getStoreProducts] CRITICAL: Store has NO seller linked!`
3. `⚠️ [getStoreProducts] WARNING: No products found for seller_id X`
4. `⚠️ [getStoreProducts] WARNING: All products are inactive`

## Frontend Console to Check

Open browser console and look for:
1. `❌ [StoreContext] CRITICAL: Store missing sellerId`
2. `❌ [Products] Cannot fetch products - store missing sellerId`
3. `⚠️ [Products] No products returned for slug`

## Testing Steps

1. **Test Store Loading:**
   ```
   curl http://localhost:8080/api/public/store/<slug>
   ```
   Should return store with `sellerId` field.

2. **Test Products:**
   ```
   curl http://localhost:8080/api/public/store/<slug>/products
   ```
   Should return array of products (may be empty if no products).

3. **Test Featured:**
   ```
   curl http://localhost:8080/api/public/store/<slug>/featured
   ```
   Should return array of bestseller products.

## Prevention

When creating a new store:
1. Always link `seller_id` when creating store
2. Ensure `store_link` is set correctly (format: `domain/slug`)
3. Verify slug matches the URL pattern
4. Test immediately after creation
