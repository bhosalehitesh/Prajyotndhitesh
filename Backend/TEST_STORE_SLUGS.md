# Test Store Slugs - Debug Guide

## How to Test

### Step 1: Start Backend Server
Make sure your Spring Boot backend is running on `http://localhost:8080`

### Step 2: Test API Endpoints

#### Test "harsh" (Working)
```bash
curl http://localhost:8080/api/public/store/harsh
```

**Expected:** Should return store JSON

#### Test "tushar" (Not Working)
```bash
curl http://localhost:8080/api/public/store/tushar
```

**Expected:** 
- If store exists: Returns store JSON
- If store doesn't exist: Returns 404

### Step 3: Check Backend Console Logs

When you call the API, you'll see detailed logs:

**For "harsh" (working):**
```
🔍 [getStoreBySlug] Requested slug: 'harsh'
🔍 [findBySlug] Looking for slug: 'harsh' (original: 'harsh')
📦 [findBySlug] Total stores in database: X
  🔎 [findBySlug] Checking store: Harsh Store | storeLink: 'https://domain.com/harsh' | extracted slug: 'harsh'
  ✅ [findBySlug] EXACT MATCH found: Harsh Store
✅ [getStoreBySlug] Store found: Harsh Store (ID: X)
```

**For "tushar" (not working):**
```
🔍 [getStoreBySlug] Requested slug: 'tushar'
🔍 [findBySlug] Looking for slug: 'tushar' (original: 'tushar')
📦 [findBySlug] Total stores in database: X
  🔎 [findBySlug] Checking store: ... | storeLink: '...' | extracted slug: '...'
  ... (no match found)
❌ [findBySlug] Store not found with slug: 'tushar'
❌ [getStoreBySlug] Store not found: Store not found with slug: tushar
```

### Step 4: Analyze the Logs

The logs will show:
1. **All stores** being checked
2. **Each store's storeLink** and **extracted slug**
3. **Why it matches or doesn't match**

## Common Issues Found in Logs

### Issue 1: Store doesn't exist
**Log shows:** No store with name containing "tushar"
**Fix:** Create the store or check if it was deleted

### Issue 2: Wrong store_link
**Log shows:** Store exists but extracted slug ≠ "tushar"
**Example:** `extracted slug: 'tushar-store'` but looking for `'tushar'`
**Fix:**
```sql
UPDATE store_details 
SET store_link = REPLACE(store_link, '/tushar-store', '/tushar')
WHERE store_name LIKE '%tushar%';
```

### Issue 3: NULL store_link
**Log shows:** `⚠️ Store 'Tushar Store' has NULL storeLink`
**Fix:**
```sql
UPDATE store_details 
SET store_link = 'https://domain.com/tushar'
WHERE store_name LIKE '%tushar%' AND store_link IS NULL;
```

### Issue 4: Store_link format issue
**Log shows:** `storeLink: 'tushar'` (no domain/slash)
**Fix:**
```sql
UPDATE store_details 
SET store_link = CONCAT('https://domain.com/', store_link)
WHERE store_link NOT LIKE '%/%' AND store_name LIKE '%tushar%';
```

## Quick SQL Check

Before testing, run this to see what's in the database:

```sql
SELECT 
    store_id,
    store_name,
    store_link,
    CASE 
        WHEN store_link LIKE '%/%' THEN SUBSTRING(store_link FROM '[^/]+$')
        ELSE store_link
    END as extracted_slug,
    seller_id
FROM store_details 
WHERE store_name LIKE '%tushar%' 
   OR store_name LIKE '%harsh%'
ORDER BY store_name;
```

This shows:
- What `store_link` values exist
- What slug would be extracted
- Whether seller_id is set

## Next Steps

1. **Run the API test** → See backend logs
2. **Check the logs** → Identify the exact issue
3. **Run SQL query** → Verify database state
4. **Apply fix** → Based on what you find
5. **Test again** → Verify it works

