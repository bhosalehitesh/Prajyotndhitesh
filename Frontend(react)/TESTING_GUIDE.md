# Testing Guide - Seller-Wise Website

## Overview
This guide helps you test the seller-wise website implementation where each seller has a unique store accessible via `/store/{store_slug}` URL.

## Prerequisites

1. **Backend Running**: Ensure your Spring Boot backend is running on `http://localhost:8080`
2. **Database Setup**: Ensure you have at least one store with a valid `store_slug` in the database
3. **Frontend Running**: Start the React app with `npm run dev`

## Test Data Setup

### 1. Verify Store in Database
```sql
-- Check available stores
SELECT store_id, store_name, slug, seller_id 
FROM store_details 
WHERE slug IS NOT NULL;

-- Example: If you have a store with slug 'brownn_boys'
-- The URL will be: http://localhost:5173/store/brownn_boys
```

### 2. Verify Store Has Products
```sql
-- Check products for a specific seller
SELECT p.products_id, p.product_name, p.selling_price, s.store_name
FROM products p
JOIN store_details s ON p.seller_id = s.seller_id
WHERE s.slug = 'your_store_slug';
```

## Testing Steps

### Test 1: Store Loading by Slug

**URL Format**: `http://localhost:5173/store/{store_slug}`

**Steps**:
1. Open browser and navigate to: `http://localhost:5173/store/brownn_boys` (replace with your store slug)
2. Open browser DevTools (F12) → Console tab
3. **Expected Results**:
   - ✅ Console shows: `✅ [SLUG] Found slug from route params: brownn_boys`
   - ✅ Console shows: `🔍 Loading store for slug: brownn_boys`
   - ✅ Console shows: `✅ Store found: [Store Name] storeId: [ID] sellerId: [ID]`
   - ✅ Store name appears in header/navigation
   - ✅ Store logo appears (if available)

**If Store Not Found**:
- Check console for error: `❌ Error loading store`
- Verify store slug exists in database
- Verify backend endpoint: `GET /api/public/store/{slug}` returns 200

---

### Test 2: Store-Specific Products

**URL**: `http://localhost:5173/store/{store_slug}/products`

**Steps**:
1. Navigate to products page
2. Open DevTools → Console
3. **Expected Results**:
   - ✅ Console shows: `Fetching products for slug: {store_slug}`
   - ✅ Products list displays (only products from that seller)
   - ✅ Product cards show correct images, prices, names

**Test Category Filter**:
1. Navigate to: `http://localhost:5173/store/{store_slug}/categories`
2. Click on a category
3. **Expected**: Products page filters by selected category

---

### Test 3: Store-Specific Categories

**URL**: `http://localhost:5173/store/{store_slug}/categories`

**Steps**:
1. Navigate to categories page
2. **Expected Results**:
   - ✅ Only categories for that seller's store are displayed
   - ✅ Categories are clickable and navigate to filtered products

---

### Test 4: Featured Products (Home Page)

**URL**: `http://localhost:5173/store/{store_slug}`

**Steps**:
1. Navigate to home page
2. Scroll to "Featured Products" section
3. **Expected Results**:
   - ✅ Only featured/bestseller products from that store are displayed
   - ✅ Products are in a carousel/slider

---

### Test 5: Cart Store Locking

**Purpose**: Verify cart is locked to one store and clears when switching stores

**Steps**:
1. Navigate to: `http://localhost:5173/store/store1/products`
2. Add a product to cart
3. Open DevTools → Application → Local Storage
4. **Expected**: `cartStoreId` and `cartSellerId` are set
5. Navigate to: `http://localhost:5173/store/store2/products` (different store)
6. Try to add a product
7. **Expected**: 
   - ✅ Warning dialog: "Your cart contains items from a different store..."
   - ✅ If confirmed, cart clears and new item is added
   - ✅ `cartStoreId` updates to new store's ID

**Verify in Console**:
- ✅ `⚠️ Different store detected. Clearing cart and starting fresh.`

---

### Test 6: Store Context in Navigation

**Steps**:
1. Navigate to any store: `http://localhost:5173/store/{store_slug}`
2. Click navigation links (Categories, Products, Featured)
3. **Expected**: All links maintain the store slug in URL
   - Categories: `/store/{slug}/categories`
   - Products: `/store/{slug}/products`
   - Featured: `/store/{slug}/featured`

---

### Test 7: Orders with Store ID and Seller ID

**Prerequisites**: User must be logged in

**Steps**:
1. Login as a user
2. Navigate to: `http://localhost:5173/store/{store_slug}/orders`
3. **Expected Results**:
   - ✅ Orders page loads
   - ✅ If orders exist, they show `storeId` and `sellerId` in order details
   - ✅ Orders are filtered by user

**Test Placing Order** (if checkout is implemented):
1. Add items to cart from a store
2. Proceed to checkout
3. Place order
4. **Expected**: Order includes `storeId` and `sellerId` in request payload

---

### Test 8: API Endpoints Direct Testing

Test backend endpoints directly using curl or Postman:

```bash
# Test store by slug
curl http://localhost:8080/api/public/store/brownn_boys

# Test store products
curl http://localhost:8080/api/public/store/brownn_boys/products

# Test store categories
curl http://localhost:8080/api/public/store/brownn_boys/categories

# Test featured products
curl http://localhost:8080/api/public/store/brownn_boys/featured
```

**Expected**: All return 200 OK with JSON data

---

## Common Issues & Solutions

### Issue 1: Store Not Loading

**Symptoms**: 
- Page shows "Loading..." indefinitely
- Console shows: `❌ Error loading store`

**Solutions**:
1. Check backend is running: `http://localhost:8080/api/public/store/{slug}`
2. Verify store slug exists in database
3. Check CORS settings in backend
4. Verify API base URL in `src/constants/config.js`

---

### Issue 2: No Products Displayed

**Symptoms**:
- Products page is empty
- Console shows: `No products returned for slug: {slug}`

**Solutions**:
1. Verify seller has products in database
2. Check products are linked to correct `seller_id`
3. Verify products have `bestseller = true` for featured products
4. Check backend logs for errors

---

### Issue 3: Cart Not Locking

**Symptoms**:
- Can add items from different stores without warning

**Solutions**:
1. Check `CartContext` is properly initialized
2. Verify `addToCart` receives `storeId` and `sellerId`
3. Check localStorage: `cartStoreId` should be set
4. Verify `ProductCard` passes store info correctly

---

### Issue 4: Routes Not Working

**Symptoms**:
- 404 errors on store routes
- Routes redirect incorrectly

**Solutions**:
1. Verify routes in `App.jsx` are correct
2. Check React Router version compatibility
3. Ensure routes are defined before catch-all routes
4. Check browser console for routing errors

---

## Browser Console Checklist

When testing, check console for these logs:

✅ **Store Loading**:
```
✅ [SLUG] Found slug from route params: {slug}
🔍 Loading store for slug: {slug}
✅ Store found: {name} storeId: {id} sellerId: {id}
```

✅ **Products Loading**:
```
Fetching products for slug: {slug}
Received products: {count}
Transformed products: {count}
```

✅ **Cart Operations**:
```
⚠️ Different store detected. Clearing cart and starting fresh.
```

❌ **Errors to Watch For**:
- `❌ Error loading store`
- `Failed to fetch`
- `Network error occurred`
- `storeId and sellerId are required`

---

## Testing Checklist

- [ ] Store loads correctly by slug
- [ ] Store name and logo display
- [ ] Products page shows store-specific products
- [ ] Categories page shows store-specific categories
- [ ] Featured products show on home page
- [ ] Cart locks to one store
- [ ] Cart clears when switching stores (with confirmation)
- [ ] Navigation maintains store slug in URLs
- [ ] Orders page displays (if logged in)
- [ ] All API calls use correct endpoints
- [ ] No console errors
- [ ] Responsive design works on mobile

---

## Next Steps After Testing

1. **If all tests pass**: Deploy to staging/production
2. **If issues found**: 
   - Check backend logs
   - Verify database data
   - Review API responses in Network tab
   - Check React component state in DevTools

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify backend is running and accessible
4. Check database for correct store/product data
5. Review this guide's "Common Issues" section

