# Fix Store Slug Issue - Products Not Visible

## Problem
After changing store name from "harsh" to "sakhi", products are not visible because the `store_link` field still contains the old slug.

## Understanding the Issue

The backend API uses the `store_link` field to extract the slug, not the `store_name`. The slug is extracted from everything after the last `/` in the `store_link`.

Example:
- `store_link = "https://yourdomain.com/harsh"` → slug = "harsh"
- `store_link = "https://yourdomain.com/sakhi"` → slug = "sakhi"

## Solution Options

### Option 1: Update via Backend API (Recommended)

If you have access to the seller/admin panel, update the store through the API:

**Endpoint:** `POST /api/stores/editStore`

**Request Body:**
```json
{
  "storeId": <your_store_id>,
  "storeName": "sakhi",
  "storeLink": "https://yourdomain.com/sakhi",
  "logoUrl": "<existing_logo_url>"
}
```

The backend will automatically regenerate the slug from the store name.

### Option 2: Update via SQL (Direct Database)

Run the SQL script: `update_store_slug.sql`

**Quick Fix:**
```sql
-- Find your store first
SELECT store_id, store_name, store_link, seller_id 
FROM store_details 
WHERE store_name LIKE '%sakhi%';

-- Update the store_link (replace 'yourdomain.com' with your actual domain)
UPDATE store_details 
SET store_link = 'https://yourdomain.com/sakhi'
WHERE store_name = 'sakhi' OR store_name LIKE '%sakhi%';
```

### Option 3: Check Product-Seller Link

If products still don't show, verify products are linked to the correct seller:

```sql
-- Check if products exist for the seller
SELECT 
    s.store_id,
    s.store_name,
    s.store_link,
    s.seller_id,
    COUNT(p.products_id) as product_count
FROM store_details s
LEFT JOIN products p ON p.seller_id = s.seller_id
WHERE s.store_name LIKE '%sakhi%'
GROUP BY s.store_id, s.store_name, s.store_link, s.seller_id;
```

If `product_count` is 0, the products might be linked to a different seller_id.

## Testing

After updating, test the API:

1. **Get store by slug:**
   ```
   GET http://localhost:8080/api/public/store/sakhi
   ```

2. **Get products:**
   ```
   GET http://localhost:8080/api/public/store/sakhi/products
   ```

3. **Get featured products:**
   ```
   GET http://localhost:8080/api/public/store/sakhi/featured
   ```

## Common Issues

1. **Store not found:** The slug in `store_link` doesn't match what you're using in the URL
2. **No products:** Products are linked to a different `seller_id` than the store
3. **Wrong domain:** The `store_link` uses a different domain format than expected

## Need Help?

Check the backend logs when accessing:
- `/api/public/store/sakhi` - Should return store details
- `/api/public/store/sakhi/products` - Should return products array

If you see "Store not found with slug: sakhi", the `store_link` needs to be updated.

