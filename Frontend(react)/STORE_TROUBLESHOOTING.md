# Store Troubleshooting Guide

## Problem: Some Stores Fetch Data, Others Don't

If some stores work but others don't, follow these diagnostic steps:

---

## Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Navigate to a **non-working store**: `/store/{slug}`
3. Check Console tab for errors

**Look for:**
- `❌ [StoreContext] Error loading store`
- `❌ [API] Error fetching store`
- HTTP status codes (404, 500, etc.)

---

## Step 2: Test Backend API Directly

Test the store endpoint directly:

```bash
# Replace {slug} with the actual store slug
curl http://localhost:8080/api/public/store/{slug}
```

**Expected Results:**
- ✅ **200 OK**: Store exists, check frontend
- ❌ **404 Not Found**: Store doesn't exist or `store_link` is wrong
- ❌ **500 Error**: Backend issue

---

## Step 3: Check Database

Run the diagnostic SQL script: `Backend/diagnose-store-issues.sql`

**Quick Check:**
```sql
-- Check if store exists and has correct store_link
SELECT 
    store_id,
    store_name,
    store_link,
    SUBSTRING_INDEX(store_link, '/', -1) as slug,
    seller_id
FROM store_details
WHERE store_link LIKE '%{your_slug}%';
```

**Common Issues:**

### Issue 1: Missing `store_link`
```sql
-- Find stores with missing store_link
SELECT store_id, store_name, store_link, seller_id
FROM store_details
WHERE store_link IS NULL OR store_link = '';
```

**Fix:**
```sql
-- Update store_link (replace 'yourdomain.com' with your domain)
UPDATE store_details 
SET store_link = CONCAT('https://yourdomain.com/', LOWER(REPLACE(store_name, ' ', '-')))
WHERE store_link IS NULL OR store_link = '';
```

### Issue 2: Wrong `store_link` Format
The backend extracts slug from `store_link` (everything after last `/`).

**Example:**
- ✅ `store_link = "https://domain.com/brownn_boys"` → slug = `brownn_boys`
- ❌ `store_link = "brownn_boys"` → might not work
- ❌ `store_link = "https://domain.com/store/brownn_boys"` → slug = `brownn_boys` ✅

**Fix:**
```sql
-- Update store_link to correct format
UPDATE store_details 
SET store_link = CONCAT('https://yourdomain.com/', SUBSTRING_INDEX(store_link, '/', -1))
WHERE store_link NOT LIKE 'https://%' AND store_link NOT LIKE 'http://%';
```

### Issue 3: Missing `seller_id`
```sql
-- Find stores with missing seller_id
SELECT store_id, store_name, store_link, seller_id
FROM store_details
WHERE seller_id IS NULL;
```

**Fix:** Link store to correct seller (requires seller app or admin panel)

### Issue 4: No Products
```sql
-- Check product count for each store
SELECT 
    s.store_id,
    s.store_name,
    s.seller_id,
    COUNT(p.products_id) as product_count
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
GROUP BY s.store_id, s.store_name, s.seller_id
HAVING product_count = 0;
```

**Fix:** Ensure products are linked to correct `seller_id`

---

## Step 4: Check Frontend Error Display

The frontend now shows diagnostic information when a store fails to load:

1. Navigate to non-working store
2. Look for yellow warning box with diagnostic steps
3. Click the API URL to test directly
4. Follow the SQL queries shown

---

## Step 5: Verify Store Slug Matching

The backend uses fuzzy matching for slugs:

1. **Exact match**: `brownn_boys` = `brownn_boys` ✅
2. **Hyphen removal**: `brownn-boys` = `brownnboys` ✅
3. **Case insensitive**: `Brownn_Boys` = `brownn_boys` ✅

**Test slug matching:**
```sql
SET @test_slug = 'your_slug_here';

SELECT 
    store_id,
    store_name,
    store_link,
    SUBSTRING_INDEX(store_link, '/', -1) as extracted_slug,
    CASE 
        WHEN LOWER(REPLACE(SUBSTRING_INDEX(store_link, '/', -1), '-', '')) = 
             LOWER(REPLACE(@test_slug, '-', '')) 
        THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as match_status
FROM store_details;
```

---

## Common Fixes

### Fix 1: Update All Store Links
```sql
-- Update all store_link fields to proper format
UPDATE store_details 
SET store_link = CONCAT('https://yourdomain.com/', 
    LOWER(REPLACE(REPLACE(store_name, ' ', '-'), '_', '-')))
WHERE store_link IS NULL 
   OR store_link = ''
   OR store_link NOT LIKE 'https://%';
```

### Fix 2: Verify Products Are Linked
```sql
-- Check and fix product-seller linkage
SELECT 
    p.products_id,
    p.product_name,
    p.seller_id as product_seller_id,
    s.seller_id as store_seller_id,
    s.store_name
FROM products p
JOIN store_details s ON p.seller_id = s.seller_id
WHERE s.store_link LIKE '%{your_slug}%';
```

### Fix 3: Check Categories
```sql
-- Verify categories exist for seller
SELECT 
    c.category_id,
    c.category_name,
    c.seller_id,
    s.store_name
FROM categories c
JOIN store_details s ON c.seller_id = s.seller_id
WHERE s.store_link LIKE '%{your_slug}%';
```

---

## Testing After Fix

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart frontend**: `npm run dev`
3. **Test store URL**: `http://localhost:5173/store/{slug}`
4. **Check console**: Should see `✅ Store found`
5. **Check products**: Should see products loading

---

## Still Not Working?

1. **Check backend logs** for detailed error messages
2. **Verify CORS** settings allow frontend origin
3. **Check network tab** in DevTools for failed requests
4. **Test API directly** with Postman/curl
5. **Compare working vs non-working stores** in database

---

## Quick Diagnostic Checklist

- [ ] Store exists in `store_details` table
- [ ] `store_link` field is not NULL or empty
- [ ] `store_link` contains the slug (after last `/`)
- [ ] `seller_id` is not NULL
- [ ] Products exist with matching `seller_id`
- [ ] Backend API returns 200 OK for `/api/public/store/{slug}`
- [ ] Frontend console shows no errors
- [ ] Network tab shows successful API calls

---

## Need More Help?

1. Check `Backend/diagnose-store-issues.sql` for comprehensive diagnostics
2. Review backend logs for detailed error messages
3. Compare a working store vs non-working store in database
4. Test API endpoints directly with Postman

