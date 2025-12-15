# Fix Featured Products Not Showing

## Problem
Featured products (marked as bestseller) are not visible on the home page.

## Root Cause
Featured products require **BOTH** conditions to be true:
1. `is_bestseller = 1` (or `true`)
2. `is_active = 1` (or `true`)

If either condition is false, the product won't appear in featured products.

## Quick Diagnosis

### 1. Check if products are marked as bestseller:
```sql
SELECT 
    products_id,
    product_name,
    seller_id,
    is_bestseller,
    is_active,
    CASE 
        WHEN is_bestseller = 1 AND is_active = 1 THEN '✅ WILL SHOW'
        WHEN is_bestseller = 1 AND is_active = 0 THEN '❌ BESTSELLER BUT INACTIVE'
        WHEN is_bestseller = 0 AND is_active = 1 THEN '❌ ACTIVE BUT NOT BESTSELLER'
        ELSE '❌ NOT BESTSELLER AND INACTIVE'
    END as status
FROM products
WHERE seller_id = <your_seller_id>
ORDER BY is_bestseller DESC, is_active DESC;
```

### 2. Count featured products for a seller:
```sql
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_bestseller = 1 THEN 1 END) as bestseller_count,
    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count,
    COUNT(CASE WHEN is_bestseller = 1 AND is_active = 1 THEN 1 END) as featured_count
FROM products
WHERE seller_id = <your_seller_id>;
```

## Quick Fixes

### Fix 1: Mark active products as bestseller (Recommended)
```sql
-- Mark top 10 active products as bestseller for a specific seller
UPDATE products 
SET is_bestseller = 1 
WHERE seller_id = <seller_id> 
  AND is_active = 1 
  AND (is_bestseller = 0 OR is_bestseller IS NULL)
ORDER BY created_at DESC 
LIMIT 10;
```

### Fix 2: Activate bestseller products
```sql
-- Activate products that are marked as bestseller but inactive
UPDATE products 
SET is_active = 1 
WHERE seller_id = <seller_id>
  AND is_bestseller = 1 
  AND is_active = 0;
```

### Fix 3: Mark specific products as bestseller
```sql
-- Mark specific products as bestseller
UPDATE products 
SET is_bestseller = 1 
WHERE seller_id = <seller_id> 
  AND products_id IN (<product_id1>, <product_id2>, <product_id3>);
```

## Backend Logs to Check

When featured products don't show, check backend console for:
1. `⚠️ [getStoreFeatured] WARNING: No bestseller products found for seller_id X`
2. `⭐ [getStoreFeatured] Found 0 bestseller products for seller X`

## Frontend Console to Check

Open browser console and look for:
1. `⚠️ [HOME] No featured products returned for slug`
2. `⚠️ [HOME] Check SQL: SELECT * FROM products WHERE seller_id = X AND is_bestseller = 1 AND is_active = 1`

## Testing Steps

1. **Test API directly:**
   ```bash
   curl http://localhost:8080/api/public/store/<slug>/featured
   ```
   Should return array of products with `isBestseller: true` and `isActive: true`.

2. **Check database:**
   ```sql
   SELECT * FROM products 
   WHERE seller_id = <seller_id> 
     AND is_bestseller = 1 
     AND is_active = 1;
   ```

3. **Verify in frontend:**
   - Open browser console
   - Navigate to home page
   - Check for `✅ [HOME] Transformed products` log
   - Verify product count matches database query

## Common Issues

### Issue 1: Products are active but not marked as bestseller
**Symptom:** Products show in regular products page but not in featured
**Fix:** Run Fix 1 above

### Issue 2: Products are bestseller but inactive
**Symptom:** Products marked as bestseller but don't show anywhere
**Fix:** Run Fix 2 above

### Issue 3: No products at all for seller
**Symptom:** Empty featured products array
**Fix:** First create products, then mark them as bestseller

## Prevention

When creating/updating products:
1. Mark popular products as bestseller: `is_bestseller = 1`
2. Ensure products are active: `is_active = 1`
3. Verify both flags are set before expecting featured products to show

## Full Diagnostic Script

Run `check-bestseller-products.sql` for comprehensive diagnostics:
```bash
mysql -u your_user -p your_database < check-bestseller-products.sql
```
