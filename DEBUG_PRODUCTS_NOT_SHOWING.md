# Debug: Products Not Showing on Home Page

## Problem
Backend API returns `sellerId: 11` correctly, but frontend at `http://localhost:5173/store/sakhi` shows no products even though products are marked as bestseller.

## Enhanced Logging Added

I've added comprehensive logging to help diagnose the issue:

### Frontend Logs to Check:
1. Open browser console (F12) → Console tab
2. Look for these log messages:

```
🏠 [HOME] Fetching featured products for slug: sakhi
🏠 [HOME] Store info: { storeId: 8, sellerId: 11, storeName: "sakhi" }
📡 [API] Fetching featured products: { slug: "sakhi", endpoint: "...", fullUrl: "..." }
✅ [API] Featured products fetched: { isArray: true, count: X, sample: {...} }
🏠 [HOME] API Response: { isArray: true, length: X, firstProduct: {...} }
🏠 [HOME] Transformed products: { count: X, firstTransformed: {...} }
```

### What to Check:

#### 1. Test Backend API Directly
```bash
curl http://localhost:8080/api/public/store/sakhi/featured
```

**Expected:** Should return JSON array of products
**If empty array `[]`:** Products might not be marked as bestseller or not active

#### 2. Check Database
Run this SQL to verify products are marked as bestseller:

```sql
-- Check products for sakhi store (seller_id = 11)
SELECT 
    products_id,
    product_name,
    seller_id,
    is_bestseller,
    is_active,
    CASE 
        WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ Featured (will show)'
        WHEN is_bestseller = 1 AND is_active = 0 THEN '⚠️ Bestseller but inactive'
        WHEN is_bestseller = 0 AND is_active = 1 THEN '📦 Regular (not featured)'
        ELSE '❌ Inactive'
    END as status
FROM products
WHERE seller_id = 11
ORDER BY is_bestseller DESC, created_at DESC;
```

#### 3. Check Browser Console
Look for these specific errors:

- **Network Error:**
  ```
  ❌ [API] Error fetching featured products: Network error
  ```
  → Backend might not be running or CORS issue

- **404 Error:**
  ```
  ❌ [API] Error fetching featured products: 404
  ```
  → API endpoint not found (check backend routes)

- **Empty Array:**
  ```
  ⚠️ [HOME] No products returned for slug: sakhi
  ```
  → Products exist but not marked as bestseller or not active

#### 4. Check Backend Console
Look for these logs in your Spring Boot console:

```
🔍 [DEBUG] Fetching featured products for slug: sakhi
✅ [DEBUG] Store found: sakhi (ID: 8)
📦 [DEBUG] Seller ID: 11
✅ [DEBUG] Returning X featured products for slug: sakhi
```

If you see:
```
❌ [DEBUG] Store has NO seller or seller ID is NULL
```
→ Store doesn't have seller_id linked (run fix-missing-seller-id.sql)

## Quick Fixes

### Fix 1: Mark Products as Bestseller
If products exist but aren't marked as bestseller:

```sql
-- Mark top 10 active products as bestseller for seller_id = 11
UPDATE products 
SET is_bestseller = 1
WHERE seller_id = 11 
  AND is_active = 1
  AND is_bestseller = 0
ORDER BY created_at DESC
LIMIT 10;
```

### Fix 2: Verify Products Are Active
```sql
-- Check if products are active
SELECT products_id, product_name, is_active, is_bestseller
FROM products
WHERE seller_id = 11;

-- Activate products if needed
UPDATE products 
SET is_active = 1
WHERE seller_id = 11 
  AND is_active = 0;
```

### Fix 3: Check API Endpoint
Test the endpoint directly:
```bash
# Should return products array
curl http://localhost:8080/api/public/store/sakhi/featured

# Should return store with sellerId
curl http://localhost:8080/api/public/store/sakhi
```

## Step-by-Step Debugging

1. **Open Browser Console** (F12)
2. **Navigate to:** `http://localhost:5173/store/sakhi`
3. **Check Console Logs:**
   - Look for `🏠 [HOME]` logs
   - Look for `📡 [API]` logs
   - Look for any `❌` error messages
4. **Check Network Tab:**
   - Open Network tab in DevTools
   - Look for request to `/api/public/store/sakhi/featured`
   - Check response status (200, 404, 500?)
   - Check response body (empty array `[]` or products?)
5. **Check Backend Console:**
   - Look for `[DEBUG]` logs
   - Check if sellerId is being found
   - Check if products are being returned

## Common Issues & Solutions

### Issue 1: Empty Array from API
**Symptom:** API returns `[]` (empty array)

**Solution:**
- Products not marked as `is_bestseller = 1`
- Products not marked as `is_active = 1`
- Run SQL to mark products as bestseller (see Fix 1 above)

### Issue 2: Network Error
**Symptom:** Console shows "Network error" or "Failed to fetch"

**Solution:**
- Check backend is running on `http://localhost:8080`
- Check CORS configuration in backend
- Check API_BASE_URL in frontend config

### Issue 3: Store Not Loading
**Symptom:** Console shows "Store not loaded or missing sellerId"

**Solution:**
- Check StoreContext is loading store correctly
- Verify backend returns `sellerId` in store response
- Check `FIX_SELLER_ID_ISSUE.md` for sellerId fix

### Issue 4: Products Transform Error
**Symptom:** Products received but not displayed

**Solution:**
- Check `transformProducts` function in `src/utils/format.js`
- Verify product structure matches backend format
- Check console for transformation errors

## After Fixing

Once products show up:
1. ✅ Home page displays featured products
2. ✅ Products page shows all products
3. ✅ Product cards are clickable
4. ✅ No console errors

## Still Not Working?

If products still don't show after checking all above:
1. Share the console logs (copy all `🏠 [HOME]` and `📡 [API]` messages)
2. Share the Network tab response for `/featured` endpoint
3. Share backend console logs
4. Share SQL query results for products table

