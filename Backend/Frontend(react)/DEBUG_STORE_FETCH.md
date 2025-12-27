# Debug Store Product Fetching

## Quick Check Steps

1. **Open Browser Console (F12)**
2. **Visit any store URL**: `http://localhost:5173/store/YOUR_STORE_NAME`
3. **Check Console Logs** - You should see:

```
🔍 Loading store for slug: YOUR_STORE_NAME
📡 Trying endpoint: http://localhost:8080/api/public/store/YOUR_STORE_NAME
📥 Store response status: 200 for slug: YOUR_STORE_NAME
✅ Store found: [Store Name] sellerId: [ID]
Fetching products from: http://localhost:8080/api/public/store/YOUR_STORE_NAME/products slug: YOUR_STORE_NAME
Response status: 200 for slug: YOUR_STORE_NAME
Received products: [number] for store: YOUR_STORE_NAME
```

## Common Issues

### Issue 1: Store Not Found (404)
**Symptom**: `Store response status: 404`
**Fix**: Update `store_link` in database:
```sql
UPDATE store_details 
SET store_link = REPLACE(store_link, '/old-slug', '/new-slug')
WHERE store_link LIKE '%/old-slug%';
```

### Issue 2: No Products Returned (200 but empty array)
**Symptom**: `Received products: 0`
**Check**:
```sql
-- Verify products exist for seller
SELECT s.store_name, s.seller_id, COUNT(p.products_id) as product_count
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE s.store_link LIKE '%YOUR_STORE_NAME%'
GROUP BY s.store_name, s.seller_id;
```

### Issue 3: Wrong Slug Extracted
**Symptom**: Logs show different slug than URL
**Check**: The slug extraction logic in `StoreContext.jsx` - it should match your URL pattern

## Test API Directly

```bash
# Test store endpoint
curl http://localhost:8080/api/public/store/YOUR_STORE_NAME

# Test products endpoint
curl http://localhost:8080/api/public/store/YOUR_STORE_NAME/products

# Test featured endpoint
curl http://localhost:8080/api/public/store/YOUR_STORE_NAME/featured
```

## Expected Response Format

**Store Response:**
```json
{
  "storeId": 1,
  "storeName": "Your Store",
  "storeLink": "https://domain.com/your-store",
  "seller": {
    "sellerId": 123
  }
}
```

**Products Response:**
```json
[
  {
    "productsId": 1,
    "productName": "Product Name",
    "sellingPrice": 1000,
    "mrp": 1500,
    "productCategory": "CLOTHING",
    "productImages": ["url1", "url2"]
  }
]
```

