# 🌐 Website Integration Testing Guide

## ✅ Current Status

- ✅ Backend running on port 8080
- ✅ Store linked to seller_id = 1
- ✅ API integration files created (config.js, api.js)
- ✅ All HTML pages updated with API files
- ✅ loadStorePage() function exposed globally
- ✅ CORS configured for localhost:3000

---

## 🧪 Step-by-Step Testing

### Step 1: Start Website Server

**Option A: Using Python (if installed)**
```cmd
cd userwebsite\FrontEnd
python -m http.server 3000
```

**Option B: Using Node.js http-server**
```cmd
cd userwebsite\FrontEnd
npx http-server -p 3000
```

**Option C: Using VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

---

### Step 2: Test Store API Directly

Before testing the website, verify APIs work:

**Test Store API:**
```
http://localhost:8080/api/stores/seller?sellerId=1
```

**Expected Response:**
```json
{
  "storeId": 1,
  "storeName": "hiteshbhosale",
  "storeLink": "https://thynktech.com/hiteshbhosale",
  "logoUrl": null
}
```

**Test Products API:**
```
http://localhost:8080/api/products/sellerProducts?sellerId=1
```

**Expected Response:**
```json
[
  {
    "productId": 1,
    "productName": "Product Name",
    "sellingPrice": 100.0,
    ...
  }
]
```
*(May be empty array if no products added yet)*

---

### Step 3: Test Store Page

**Open in browser:**
```
http://localhost:3000/pages/store.html?sellerId=1
```

**What to Check:**

1. **Browser Console (F12):**
   - Should see: `✅ API Integration loaded. Base URL: http://192.168.1.84:8080`
   - Should see: `Fetching products for sellerId: 1`
   - Should see: `Products fetched: X products`
   - **No errors** like "Failed to fetch" or "loadStorePage() not found"

2. **Page Content:**
   - Store name "hiteshbhosale" should display
   - Products grid should display (if products exist)
   - No "Failed to load" messages

3. **Debug Section:**
   - Click "Load Store" button
   - Should load store data without errors
   - Click "Fetch Store (raw)" button
   - Should show store JSON in console
   - Click "Fetch Products (raw)" button
   - Should show products array in console

---

### Step 4: Test Other Pages

**Homepage:**
```
http://localhost:3000/index.html
```

**Categories:**
```
http://localhost:3000/pages/categories.html
```

**Cart:**
```
http://localhost:3000/pages/cart.html
```

**Checkout:**
```
http://localhost:3000/pages/checkout.html
```

---

## 🔍 Troubleshooting

### Issue: "Failed to fetch" Error

**Possible Causes:**
1. Backend not running
2. CORS issue
3. Wrong API URL

**Solutions:**
1. Check backend is running: `netstat -an | findstr :8080`
2. Verify CORS includes `http://localhost:3000` (already done)
3. Check browser console for exact error
4. Try accessing API directly in browser

### Issue: "loadStorePage() not found"

**Solution:**
- Hard refresh page: `Ctrl+F5` or `Ctrl+Shift+R`
- Clear browser cache
- Check that `app.js` is loaded (F12 → Network tab)

### Issue: Products Not Displaying

**Check:**
1. Do products exist for sellerId=1?
   - Test: `http://localhost:8080/api/products/sellerProducts?sellerId=1`
2. Check browser console for API errors
3. Verify product data structure matches expected format

### Issue: Store Name Not Displaying

**Check:**
1. Store API returns data:
   - Test: `http://localhost:8080/api/stores/seller?sellerId=1`
2. Check browser console for store fetch errors
3. Verify store data structure

---

## ✅ Testing Checklist

### API Tests
- [ ] Store API works: `/api/stores/seller?sellerId=1`
- [ ] Products API works: `/api/products/sellerProducts?sellerId=1`
- [ ] All Stores API works: `/api/stores/allStores`
- [ ] All Products API works: `/api/products/allProduct`

### Website Tests
- [ ] Store page loads: `store.html?sellerId=1`
- [ ] Store name displays correctly
- [ ] Products list displays (if products exist)
- [ ] No console errors
- [ ] "Load Store" button works
- [ ] "Fetch Store (raw)" button works
- [ ] "Fetch Products (raw)" button works

### Integration Tests
- [ ] API calls use correct URL (`http://192.168.1.84:8080`)
- [ ] CORS headers present in responses
- [ ] Data flows from backend to frontend
- [ ] Error handling works (shows user-friendly messages)

---

## 🎯 Expected Behavior

### When Store Has Products:
- Store page shows store name
- Products grid displays all products
- Each product shows: image, name, price
- "Add to Cart" buttons work

### When Store Has No Products:
- Store page shows store name
- Products grid shows: "No products found for this store."
- No errors in console

---

## 📝 Quick Test Commands

**Test Store API:**
```bash
# Browser
http://localhost:8080/api/stores/seller?sellerId=1

# Or PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/stores/seller?sellerId=1"
```

**Test Products API:**
```bash
# Browser
http://localhost:8080/api/products/sellerProducts?sellerId=1

# Or PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/products/sellerProducts?sellerId=1"
```

**Test Store Page:**
```
http://localhost:3000/pages/store.html?sellerId=1
```

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Add Products** - Use mobile app or API to add products for sellerId=1
2. **Test Full Flow** - Browse → Add to Cart → Checkout → Order
3. **Test Other Features** - Categories, Search, Filters
4. **Customize Store** - Add logo, banner, description
5. **Production Setup** - Update config.js with production API URL

---

## 📞 Need Help?

**Check:**
1. Browser console (F12) for errors
2. Backend console for API errors
3. Network tab (F12) for failed requests
4. This guide for troubleshooting steps

**Common Issues:**
- Backend not running → Start backend
- CORS errors → Already configured, check if backend restarted
- API 404 → Check endpoint URLs
- Empty data → Add products to database

---

**Ready to test!** 🎉

