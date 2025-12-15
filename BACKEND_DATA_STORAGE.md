# Backend Data Storage - Complete Guide

## Overview
All cart, wishlist, and order data is now stored in the backend database, ensuring sellers can see all details in their app.

---

## 📦 Cart Data Storage

### Backend Structure
- **Table:** `cart`
- **Fields:** `cart_id`, `user_id`
- **Items:** Stored in `order_items` table linked to cart via `cart_id`

### Data Flow
1. **Adding to Cart:**
   - Frontend calls: `POST /api/cart/add?userId={id}&productId={id}&quantity={qty}`
   - Backend stores: Product ID, quantity, price in `order_items` table
   - Seller ID is extracted from product's seller relationship

2. **Loading Cart:**
   - Frontend calls: `GET /api/cart/{userId}`
   - Backend returns: Cart with all items and product details
   - Frontend extracts `sellerId` from `item.product.seller.sellerId`

3. **Store/Seller Tracking:**
   - `storeId` and `sellerId` are tracked in frontend `CartContext`
   - When placing order, these are sent to backend
   - Backend `OrdersService` stores them in the `Orders` table

---

## ❤️ Wishlist Data Storage

### Backend Structure
- **Table:** `wishlist_items`
- **Fields:** `id`, `user_id`, `product_id`, `created_at`

### Data Flow
1. **Adding to Wishlist:**
   - Frontend calls: `POST /wishlist/add/{userId}/{productId}`
   - Backend stores: User ID, Product ID, timestamp

2. **Loading Wishlist:**
   - Frontend calls: `GET /wishlist/all/{userId}`
   - Backend returns: All wishlist items with product details

3. **Removing from Wishlist:**
   - Frontend calls: `DELETE /wishlist/remove/{userId}/{productId}`
   - Backend removes: The wishlist item

---

## 🛒 Order Data Storage

### Backend Structure
- **Table:** `orders`
- **Fields:** 
  - `orders_id` (Primary Key)
  - `user_id` (Customer)
  - `store_id` ✅ **Stored for seller visibility**
  - `seller_id` ✅ **Stored for seller visibility**
  - `total_amount`
  - `address`
  - `mobile`
  - `order_status` (PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  - `payment_status` (PENDING, PAID, FAILED)
  - `creation_time`

### Data Flow
1. **Placing Order:**
   - Frontend calls: `POST /orders/place?userId={id}&address={addr}&mobile={num}&storeId={id}&sellerId={id}`
   - Backend `OrdersService.placeOrder()`:
     - Creates order with `storeId` and `sellerId`
     - Moves all cart items to order items
     - Calculates total amount
     - Clears cart
     - **If `sellerId` not provided, extracts from products**

2. **Seller Viewing Orders:**
   - Seller app calls: `GET /orders/seller/{sellerId}`
   - Backend returns: All orders containing products from this seller
   - Includes: Customer details, order items, status, amounts

3. **Order Details:**
   - Frontend calls: `GET /orders/{orderId}`
   - Backend returns: Complete order with all items and customer info

---

## 🔑 Key Points for Sellers

### What Sellers Can See:
1. **All Orders:** `/orders/seller/{sellerId}` returns all orders for their products
2. **Order Details:** Each order includes:
   - Customer name and contact (from `user` relationship)
   - Delivery address and mobile
   - All products ordered (with quantities and prices)
   - Order status and payment status
   - Total amount
   - Creation timestamp

### Data Persistence:
- ✅ All cart operations sync to backend (for logged-in users)
- ✅ All wishlist operations sync to backend (for logged-in users)
- ✅ All orders are stored with `storeId` and `sellerId`
- ✅ Sellers can query orders by `sellerId`
- ✅ Guest users' data stored in localStorage (migrates to backend on login)

---

## 📊 API Endpoints Summary

### Cart APIs
- `GET /api/cart/{userId}` - Get user's cart
- `POST /api/cart/add?userId={id}&productId={id}&quantity={qty}` - Add to cart
- `PUT /api/cart/update?userId={id}&productId={id}&quantity={qty}` - Update quantity
- `DELETE /api/cart/remove?userId={id}&productId={id}` - Remove from cart
- `DELETE /api/cart/clear/{userId}` - Clear cart

### Wishlist APIs
- `GET /wishlist/all/{userId}` - Get user's wishlist
- `POST /wishlist/add/{userId}/{productId}` - Add to wishlist
- `DELETE /wishlist/remove/{userId}/{productId}` - Remove from wishlist

### Order APIs
- `POST /orders/place?userId={id}&address={addr}&mobile={num}&storeId={id}&sellerId={id}` - Place order
- `GET /orders/{orderId}` - Get order details
- `GET /orders/user/{userId}` - Get user's orders
- `GET /orders/seller/{sellerId}` - **Get seller's orders** (for seller app)
- `PUT /orders/update-status/{orderId}?status={status}` - Update order status

---

## ✅ Verification Checklist

- [x] Cart data stored in backend (`cart` and `order_items` tables)
- [x] Wishlist data stored in backend (`wishlist_items` table)
- [x] Orders stored with `storeId` and `sellerId` fields
- [x] Seller can query orders by `sellerId`
- [x] Frontend sends `storeId` and `sellerId` when placing orders
- [x] Backend extracts `sellerId` from products if not provided
- [x] All order details visible to sellers (customer info, products, amounts)

---

## 🚀 Next Steps for Seller App

The seller app should use:
- `GET /orders/seller/{sellerId}` to fetch all orders
- `PUT /orders/update-status/{orderId}?status={status}` to update order status

All order data including customer details, products, and amounts are already stored and accessible!
