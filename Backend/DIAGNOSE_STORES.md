# Diagnose: Some Stores Fetching, Some Not

## Quick Diagnostic Steps

### Step 1: Run SQL Diagnostic
Run the SQL script: `check-store-products.sql`

This will show:
- ✅ **OK** - Stores that work (have seller_id and products)
- ❌ **NO SELLER_ID** - Store exists but no seller linked
- ❌ **NO PRODUCTS** - Store has seller but no products
- ❌ **EMPTY STORE_LINK** - Cannot extract slug

### Step 2: Check Backend Logs
When you access a store URL, check backend console logs. You'll see:

**Working Store:**
```
🔍 [DEBUG] Fetching products for slug: sakhi
✅ [DEBUG] Store found: Sakhi Fashion (ID: 1)
📦 [DEBUG] Seller ID: 123
📦 [DEBUG] Found 15 products for seller 123
✅ [DEBUG] Returning 15 products for slug: sakhi
```

**Not Working Store:**
```
🔍 [DEBUG] Fetching products for slug: harsh
✅ [DEBUG] Store found: Harsh Store (ID: 2)
❌ [DEBUG] Store has NO seller - returning empty products
```

OR

```
🔍 [DEBUG] Fetching products for slug: harsh
❌ [DEBUG] Store not found with slug: harsh
```

### Step 3: Check Frontend Console
Open browser console (F12) and visit store URL. You'll see:

**Working:**
```
🔍 Loading store for slug: sakhi
✅ Store found: Sakhi Fashion sellerId: 123
Received products: 15 for store: sakhi
```

**Not Working:**
```
🔍 Loading store for slug: harsh
✅ Store found: Harsh Store sellerId: none
Received products: 0 for store: harsh
```

## Common Issues & Fixes

### Issue 1: ❌ NO SELLER_ID
**Backend Log:** `Store has NO seller - returning empty products`
**Fix:**
```sql
-- Link store to seller
UPDATE store_details 
SET seller_id = [SELLER_ID]
WHERE store_id = [STORE_ID];
```

### Issue 2: ❌ NO PRODUCTS
**Backend Log:** `Found 0 products for seller [ID]`
**Fix:**
```sql
-- Link products to seller
UPDATE products 
SET seller_id = [SELLER_ID]
WHERE products_id IN ([PRODUCT_IDS]);
```

### Issue 3: ❌ Store Not Found
**Backend Log:** `Store not found with slug: [slug]`
**Fix:**
```sql
-- Update store_link to match slug
UPDATE store_details 
SET store_link = REPLACE(store_link, '/old-slug', '/new-slug')
WHERE store_id = [STORE_ID];
```

### Issue 4: ❌ EMPTY STORE_LINK
**Backend Log:** `Store not found with slug: [slug]`
**Fix:**
```sql
-- Set store_link based on store_name
UPDATE store_details 
SET store_link = CONCAT('https://domain.com/', LOWER(REPLACE(store_name, ' ', '-')))
WHERE store_link IS NULL OR store_link = '';
```

## Quick Test Commands

### Test Store Endpoint
```bash
curl http://localhost:8080/api/public/store/sakhi
```

### Test Products Endpoint
```bash
curl http://localhost:8080/api/public/store/sakhi/products
```

### Test Featured Endpoint
```bash
curl http://localhost:8080/api/public/store/sakhi/featured
```

## Expected Responses

**Working Store:**
```json
// GET /api/public/store/sakhi/products
[
  {
    "productsId": 1,
    "productName": "Product 1",
    "sellingPrice": 1000,
    "mrp": 1500,
    "productCategory": "CLOTHING",
    "productImages": ["url1"]
  }
]
```

**Not Working Store:**
```json
// GET /api/public/store/harsh/products
[]
```

## Next Steps

1. **Run diagnostic SQL** → See which stores have issues
2. **Check backend logs** → See exact error for failing stores
3. **Apply fixes** → Based on the issue type
4. **Test again** → Verify products now fetch

