# 🚀 Next Steps After Creating New Database & Shop

## ✅ What You've Done
- ✅ Created new database: `newdb`
- ✅ Updated `application.properties` with new database
- ✅ Created new shop/store
- ✅ Added data to tables

---

## 📋 Step-by-Step Next Steps

### Step 1: Restart Backend Server

**Important:** The backend needs to be restarted to connect to the new database.

1. **Stop the current backend** (if running):
   - Go to the terminal where backend is running
   - Press `Ctrl+C` to stop it

2. **Start backend again:**
   ```cmd
   cd Backend
   mvn spring-boot:run
   ```

3. **Wait for:** `Started SakhistoreApplication in X.XXX seconds`

4. **Verify connection:**
   - Check console for database connection messages
   - Should see: `HikariPool-1 - Starting...` and `HikariPool-1 - Start completed`

---

### Step 2: Find Your Seller ID

You need to find the `sellerId` of your newly created shop. Here are 3 ways:

#### Option A: Check Database Directly
```sql
-- Connect to PostgreSQL
psql -U postgres -d newdb

-- Find all sellers
SELECT seller_id, full_name, phone FROM seller_details;

-- Find seller with store
SELECT s.seller_id, s.full_name, st.store_id, st.store_name 
FROM seller_details s 
LEFT JOIN store_details st ON s.seller_id = st.seller_id;
```

#### Option B: Use Backend API
Open in browser:
```
http://localhost:8080/api/stores/allStores
```

This will show all stores with their `sellerId`.

#### Option C: Check Backend Console
When backend starts, it might show SQL queries. Look for `seller_id` values.

---

### Step 3: Test Backend API Endpoints

Test these endpoints in your browser (replace `YOUR_SELLER_ID` with actual ID):

1. **Get Store by Seller ID:**
   ```
   http://localhost:8080/api/stores/seller?sellerId=YOUR_SELLER_ID
   ```

2. **Get Products by Seller ID:**
   ```
   http://localhost:8080/api/products/sellerProducts?sellerId=YOUR_SELLER_ID
   ```

3. **Get All Stores:**
   ```
   http://localhost:8080/api/stores/allStores
   ```

4. **Get All Products:**
   ```
   http://localhost:8080/api/products/allProduct
   ```

**Expected Result:** Should return JSON data, not error pages.

---

### Step 4: Test Customer Website

1. **Start website server** (if not running):
   ```cmd
   cd userwebsite\FrontEnd
   python -m http.server 3000
   ```
   Or use any web server on port 3000.

2. **Open store page with your sellerId:**
   ```
   http://localhost:3000/pages/store.html?sellerId=YOUR_SELLER_ID
   ```

3. **What to check:**
   - ✅ Store name displays
   - ✅ Store logo displays (if uploaded)
   - ✅ Products list displays
   - ✅ No console errors (F12 → Console tab)

---

### Step 5: Verify Data Display

Check these on the website:

- [ ] **Store Information:**
  - Store name appears
  - Store description appears
  - Store logo appears (if uploaded)

- [ ] **Products:**
  - Products are listed
  - Product images load
  - Product prices display
  - "Add to Cart" buttons work

- [ ] **Categories:**
  - Categories are visible (if created)
  - Can filter by category

---

### Step 6: Test Full Flow

1. **Browse Products:**
   - View product list
   - Click on a product to see details

2. **Add to Cart:**
   - Click "Add to Cart" on a product
   - Check cart count increases

3. **View Cart:**
   - Go to cart page
   - Verify items are there

4. **Checkout:**
   - Fill address form
   - Proceed to payment
   - Place order

---

## 🔍 Troubleshooting

### Backend Not Connecting to Database?

**Check:**
1. PostgreSQL is running:
   ```cmd
   netstat -an | findstr :5432
   ```

2. Database exists:
   ```cmd
   psql -U postgres -c "\l" | findstr newdb
   ```

3. Password is correct in `application.properties`

### API Returns Empty Results?

**Check:**
1. Data actually exists in database:
   ```sql
   SELECT COUNT(*) FROM seller_details;
   SELECT COUNT(*) FROM store_details;
   SELECT COUNT(*) FROM products;
   ```

2. Seller ID is correct
3. Products are linked to correct sellerId

### Website Shows "Failed to fetch"?

**Check:**
1. Backend is running on port 8080
2. CORS is configured (already done)
3. Browser console for specific error
4. Try accessing API directly in browser

---

## 📝 Quick Reference

### Your Setup:
- **Database:** `newdb` on `localhost:5432`
- **Backend:** `http://localhost:8080` or `http://192.168.1.84:8080`
- **Website:** `http://localhost:3000`

### Important URLs:
- Store Page: `http://localhost:3000/pages/store.html?sellerId=YOUR_SELLER_ID`
- API Test: `http://localhost:8080/api/stores/seller?sellerId=YOUR_SELLER_ID`

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] Can access API endpoints in browser
- [ ] Store page loads with your shop data
- [ ] Products display correctly
- [ ] Can add items to cart
- [ ] No console errors in browser

---

## 🎯 Next Actions

Once everything works:

1. **Add More Products** - Use the mobile app or backend API
2. **Customize Store** - Update store appearance, logo, banner
3. **Test Orders** - Place test orders to verify order flow
4. **Share Store Link** - Test the shareable store link feature

---

**Need Help?** Check browser console (F12) and backend console for error messages.

