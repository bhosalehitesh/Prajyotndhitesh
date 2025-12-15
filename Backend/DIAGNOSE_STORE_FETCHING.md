# Diagnosing Store Fetching Issues

## Problem
Some stores fetch data successfully while others don't.

## Common Causes

### 1. Store Link Issues
- Store's `storeLink` field is NULL or empty
- Slug mismatch between URL and `storeLink` field
- Special characters in slug causing matching issues

### 2. Missing Seller ID
- Store exists but has no `seller_id` linked
- Products won't load if `sellerId` is null

### 3. Database Issues
- Store doesn't exist in database
- Store exists but is inactive/deleted

## Diagnostic SQL Queries

### Check all stores and their slugs:
```sql
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    CASE 
        WHEN store_link IS NULL THEN 'NULL'
        WHEN store_link = '' THEN 'EMPTY'
        ELSE SUBSTRING(store_link, LENGTH(store_link) - LOCATE('/', REVERSE(store_link)) + 2)
    END as extracted_slug
FROM store_details
ORDER BY store_id;
```

### Find stores without seller_id:
```sql
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id
FROM store_details
WHERE seller_id IS NULL;
```

### Find stores with NULL or empty store_link:
```sql
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id
FROM store_details
WHERE store_link IS NULL OR store_link = '';
```

### Check specific store by slug (replace 'sakhi' with your slug):
```sql
SELECT 
    store_id,
    store_name,
    store_link,
    seller_id,
    CASE 
        WHEN store_link LIKE '%/sakhi%' THEN 'MATCH'
        ELSE 'NO MATCH'
    END as match_status
FROM store_details
WHERE store_link LIKE '%/sakhi%' 
   OR store_link LIKE '%/sakhi/%'
   OR store_name LIKE '%sakhi%';
```

## Frontend Debugging

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   - `📡 [API] Fetching store for slug: ...`
   - `✅ [API] Store fetched successfully: ...`
   - `❌ [API] Error fetching store: ...`
   - `❌ [StoreContext] CRITICAL: Store missing sellerId`

### Check Network Tab
1. Open Network tab in DevTools
2. Look for request to `/api/public/store/{slug}`
3. Check response status:
   - `200 OK` = Store found
   - `404 Not Found` = Store not found
   - `500 Internal Server Error` = Server error

## Backend Debugging

### Check Backend Logs
Look for these log messages:
- `🔍 [getStoreBySlug] Requested slug: '...'`
- `🔍 [findBySlug] Looking for slug: '...'`
- `📦 [findBySlug] Total stores in database: ...`
- `✅ [findBySlug] EXACT MATCH found: ...`
- `❌ [findBySlug] Store not found with slug: ...`

## Quick Fixes

### Fix 1: Update store_link for a store
```sql
UPDATE store_details
SET store_link = 'https://thynktech.com/your-slug'
WHERE store_id = YOUR_STORE_ID;
```

### Fix 2: Link store to seller
```sql
UPDATE store_details
SET seller_id = YOUR_SELLER_ID
WHERE store_id = YOUR_STORE_ID;
```

### Fix 3: Check if seller exists
```sql
SELECT seller_id, seller_name, email
FROM seller_details
WHERE seller_id = YOUR_SELLER_ID;
```
