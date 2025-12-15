# Fix Store Fetching Issues

## Quick Diagnosis

### Step 1: Run Diagnostic SQL
```bash
# Run this SQL file to see all issues:
mysql -u your_user -p your_database < diagnose-all-stores.sql
```

Or run queries manually in your database client.

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages:
   - `❌ [StoreContext] CRITICAL: Store missing sellerId` = Store has no seller linked
   - `❌ [API] Error fetching store: 404` = Store not found
   - `❌ [API] Error fetching store: Network error` = Backend not running

### Step 3: Check Backend Logs
Look for these messages when accessing a store:
- `🔍 [getStoreBySlug] Requested slug: '...'`
- `✅ [getStoreBySlug] Store found: ...`
- `⚠️ [getStoreBySlug] WARNING: Store has NO seller linked!`
- `❌ [getStoreBySlug] Store not found: ...`

## Common Issues & Fixes

### Issue 1: Store Not Found (404)

**Symptoms:**
- Frontend shows "Store not found"
- Backend logs: `❌ [getStoreBySlug] Store not found`

**Causes:**
1. `store_link` is NULL or empty
2. Slug mismatch between URL and `store_link` field
3. Store doesn't exist in database

**Fix:**
```sql
-- Check if store exists
SELECT store_id, store_name, store_link FROM store_details WHERE store_name LIKE '%your-store-name%';

-- Update store_link if needed
UPDATE store_details 
SET store_link = 'https://thynktech.com/your-slug'
WHERE store_id = YOUR_STORE_ID;
```

### Issue 2: Store Found But No Products Load

**Symptoms:**
- Store loads successfully
- Products page is empty
- Backend logs: `⚠️ [getStoreBySlug] WARNING: Store has NO seller linked!`

**Causes:**
1. Store has no `seller_id` linked
2. Products exist but are linked to wrong `seller_id`
3. Products are inactive (`is_active = 0`)

**Fix:**
```sql
-- Check store's seller_id
SELECT store_id, store_name, seller_id FROM store_details WHERE store_id = YOUR_STORE_ID;

-- Link store to seller
UPDATE store_details 
SET seller_id = YOUR_SELLER_ID
WHERE store_id = YOUR_STORE_ID;

-- Verify seller exists
SELECT seller_id, seller_name FROM seller_details WHERE seller_id = YOUR_SELLER_ID;

-- Check products for this seller
SELECT COUNT(*) as total_products,
       SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products
FROM products 
WHERE seller_id = YOUR_SELLER_ID;
```

### Issue 3: Some Products Missing

**Symptoms:**
- Some products show, some don't
- Featured products empty but regular products show

**Causes:**
1. Products not marked as `is_bestseller = 1` (for featured)
2. Products marked as `is_active = 0`
3. Products have no images

**Fix:**
```sql
-- Check product status
SELECT products_id, product_name, is_active, is_bestseller,
       CASE WHEN product_images IS NULL OR JSON_LENGTH(product_images) = 0 THEN 'NO IMAGES' ELSE 'HAS IMAGES' END as image_status
FROM products 
WHERE seller_id = YOUR_SELLER_ID;

-- Activate products
UPDATE products 
SET is_active = 1 
WHERE seller_id = YOUR_SELLER_ID AND is_active = 0;

-- Mark products as bestseller (for featured page)
UPDATE products 
SET is_bestseller = 1 
WHERE seller_id = YOUR_SELLER_ID AND products_id IN (SELECT products_id FROM products WHERE ...);
```

### Issue 4: Slug Mismatch

**Symptoms:**
- URL has slug like `sakhi` but store_link has different format
- Backend logs show slug matching attempts but no match

**Fix:**
```sql
-- Check current store_link format
SELECT store_id, store_name, store_link FROM store_details WHERE store_id = YOUR_STORE_ID;

-- Update store_link to match URL slug
-- If URL is: /store/sakhi
-- Then store_link should be: https://thynktech.com/sakhi
UPDATE store_details 
SET store_link = CONCAT('https://thynktech.com/', 'sakhi')
WHERE store_id = YOUR_STORE_ID;
```

## Testing Checklist

After fixing issues, test:

1. **Store loads:**
   - Visit: `http://localhost:5173/store/your-slug`
   - Should see store name and details

2. **Products load:**
   - Visit: `http://localhost:5173/store/your-slug/products`
   - Should see product cards

3. **Featured products load:**
   - Visit: `http://localhost:5173/store/your-slug/featured`
   - Should see bestseller products

4. **Categories load:**
   - Visit: `http://localhost:5173/store/your-slug/categories`
   - Should see categories

## Backend API Test

Test directly via API:
```bash
# Test store endpoint
curl http://localhost:8080/api/public/store/your-slug

# Test products endpoint
curl http://localhost:8080/api/public/store/your-slug/products

# Test featured endpoint
curl http://localhost:8080/api/public/store/your-slug/featured

# Test categories endpoint
curl http://localhost:8080/api/public/store/your-slug/categories
```

Expected responses:
- `200 OK` with JSON data = Working ✅
- `404 Not Found` = Store not found ❌
- `500 Internal Server Error` = Server error ❌

## Still Not Working?

1. Check backend is running: `http://localhost:8080/api/public/store/your-slug`
2. Check CORS settings in backend
3. Check browser console for CORS errors
4. Check network tab for failed requests
5. Run `diagnose-all-stores.sql` to see all issues at once
