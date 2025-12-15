# QUICK FIX: Products Not Fetching for Store

## Problem
Products not showing for stores (e.g., "sakhi" store after changing from "harsh")

## Root Cause
The `store_link` field in database contains the old slug. Backend extracts slug from `store_link`, not `store_name`.

## FASTEST FIX (SQL)

```sql
-- 1. Check current store_link values
SELECT store_id, store_name, store_link, seller_id 
FROM store_details 
WHERE store_name LIKE '%sakhi%' OR store_link LIKE '%sakhi%' OR store_link LIKE '%harsh%';

-- 2. Update store_link to match new store name
-- Replace 'yourdomain.com' with your actual domain, or use the pattern below
UPDATE store_details 
SET store_link = REPLACE(store_link, '/harsh', '/sakhi')
WHERE store_link LIKE '%/harsh%' OR store_link LIKE '%harsh/%';

-- OR if store_link is just the slug:
UPDATE store_details 
SET store_link = 'sakhi'
WHERE store_name LIKE '%sakhi%' AND (store_link = 'harsh' OR store_link LIKE 'harsh/%');

-- 3. Verify
SELECT store_id, store_name, store_link, seller_id 
FROM store_details 
WHERE store_name LIKE '%sakhi%';
```

## How Backend Extracts Slug

The backend `findBySlug()` method:
1. Gets all stores
2. Extracts slug from `store_link` field (everything after last `/`)
3. Compares with requested slug

Example:
- `store_link = "https://domain.com/sakhi"` → slug = "sakhi" ✅
- `store_link = "https://domain.com/harsh"` → slug = "harsh" ❌ (old)

## Test After Fix

1. Open browser console (F12)
2. Visit: `http://localhost:5173/store/sakhi` (or your frontend URL)
3. Check console logs:
   - Should see: "Loading store for slug: sakhi"
   - Should see: "Store found: [store name]"
   - Should see: "Received products: [number]"

4. Test API directly:
   ```
   GET http://localhost:8080/api/public/store/sakhi
   GET http://localhost:8080/api/public/store/sakhi/products
   ```

## If Still Not Working

Check:
1. Products are linked to correct `seller_id`:
   ```sql
   SELECT p.products_id, p.product_name, p.seller_id, s.store_name, s.seller_id
   FROM products p
   JOIN store_details s ON s.seller_id = p.seller_id
   WHERE s.store_name LIKE '%sakhi%';
   ```

2. Store has a seller:
   ```sql
   SELECT store_id, store_name, seller_id 
   FROM store_details 
   WHERE store_name LIKE '%sakhi%';
   ```

