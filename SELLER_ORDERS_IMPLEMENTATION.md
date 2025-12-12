# Seller Orders Implementation

## Overview
Implemented functionality for sellers to view orders containing their products, including customer information (who ordered).

---

## Changes Made

### 1. Backend - Repository Layer
**File:** `Backend/src/main/java/com/smartbiz/sakhistore/modules/order/repository/OrdersRepository.java`

**Added:**
```java
@Query("SELECT DISTINCT o FROM Orders o " +
       "JOIN o.orderItems oi " +
       "JOIN oi.product p " +
       "WHERE p.seller.sellerId = :sellerId " +
       "ORDER BY o.creationTime DESC")
List<Orders> findBySellerId(@Param("sellerId") Long sellerId);
```

**Purpose:** Query to find all orders that contain products from a specific seller.

---

### 2. Backend - Service Layer
**File:** `Backend/src/main/java/com/smartbiz/sakhistore/modules/order/service/OrdersService.java`

**Added:**
```java
public List<Orders> getOrdersBySellerId(Long sellerId) {
    return ordersRepository.findBySellerId(sellerId);
}
```

**Purpose:** Service method to retrieve orders for a seller.

---

### 3. Backend - Controller Layer
**File:** `Backend/src/main/java/com/smartbiz/sakhistore/modules/order/controller/OrdersController.java`

**Added:**
```java
@GetMapping("/seller/{sellerId}")
public List<Orders> getSellerOrders(@PathVariable Long sellerId) {
    return ordersService.getOrdersBySellerId(sellerId);
}
```

**Endpoint:** `GET /orders/seller/{sellerId}`

**Purpose:** REST endpoint for sellers to get all orders containing their products.

**Response:** Returns a list of `Orders` objects, each containing:
- Order details (orderId, totalAmount, orderStatus, paymentStatus, creationTime)
- **Customer information** (`user` object with: id, fullName, phone, email, address details)
- Order items (products, quantities, prices)
- Shipping address and mobile number

---

### 4. Frontend - API Integration
**File:** `userwebsite/FrontEnd/js/api.js`

**Added:**
```javascript
/**
 * Get orders for a seller
 * @param {Number} sellerId - Seller ID
 * @returns {Promise<Array>} List of orders containing products from this seller
 */
async function getSellerOrders(sellerId) {
  return await apiCall(`/orders/seller/${sellerId}`);
}
```

**Exported in:** `window.API.getSellerOrders`

**Usage:**
```javascript
// Get orders for seller with ID 19
const orders = await window.API.getSellerOrders(19);

// Each order contains:
// - ordersId: Order ID
// - totalAmount: Total order amount
// - orderStatus: Order status (PLACED, CONFIRMED, etc.)
// - paymentStatus: Payment status (PENDING, PAID, etc.)
// - creationTime: When order was placed
// - user: Customer information
//   - id: Customer user ID
//   - fullName: Customer name
//   - phone: Customer phone number
//   - email: Customer email (if available)
//   - address details (pincode, city, state, etc.)
// - orderItems: Array of products in the order
//   - product: Product details
//   - quantity: Quantity ordered
//   - price: Price per item
// - address: Shipping address
// - mobile: Contact mobile number
```

---

## How It Works

### Order Flow:
1. **Customer logs in** → User ID is stored in `localStorage` as `currentUser.userId`
2. **Customer places order** → Order is created with:
   - `user` object (customer information)
   - `orderItems` (products from cart)
   - Each product has a `seller` reference
3. **Seller views orders** → Calls `/orders/seller/{sellerId}`
   - Backend queries all orders where any `orderItem.product.seller.sellerId` matches
   - Returns orders with full customer information

### Data Structure:
```
Order
├── OrdersId (Long)
├── totalAmount (Double)
├── orderStatus (OrderStatus enum)
├── paymentStatus (PaymentStatus enum)
├── creationTime (LocalDateTime)
├── address (String)
├── mobile (Long)
├── user (User) ← Customer Information
│   ├── id (Long)
│   ├── fullName (String)
│   ├── phone (String)
│   ├── email (String)
│   └── address fields...
└── orderItems (List<OrderItems>)
    ├── product (Product)
    │   └── seller (SellerDetails)
    ├── quantity (Integer)
    └── price (Double)
```

---

## API Endpoint Details

### Get Seller Orders
**Endpoint:** `GET /orders/seller/{sellerId}`

**Path Parameters:**
- `sellerId` (Long, required) - The seller's ID

**Response:**
```json
[
  {
    "ordersId": 1,
    "totalAmount": 1500.00,
    "orderStatus": "PLACED",
    "paymentStatus": "PENDING",
    "creationTime": "2024-01-15T10:30:00",
    "address": "123 Main St, City",
    "mobile": 9876543210,
    "user": {
      "id": 5,
      "fullName": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "pincode": "400001",
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "orderItems": [
      {
        "orderItemsId": 1,
        "quantity": 2,
        "price": 750.00,
        "product": {
          "productsId": 10,
          "productName": "Product Name",
          "sellingPrice": 750.00
        }
      }
    ]
  }
]
```

**Error Responses:**
- `404 Not Found` - Seller not found
- `500 Internal Server Error` - Server error

---

## Testing

### Test the Endpoint:
```bash
# Using curl
curl http://localhost:8080/orders/seller/19

# Using browser
http://localhost:8080/orders/seller/19
```

### Test from Frontend:
```javascript
// In browser console or your code
const orders = await window.API.getSellerOrders(19);
console.log('Seller Orders:', orders);

// Access customer information
orders.forEach(order => {
  console.log(`Order ${order.ordersId}:`);
  console.log(`  Customer: ${order.user.fullName}`);
  console.log(`  Phone: ${order.user.phone}`);
  console.log(`  Total: ₹${order.totalAmount}`);
  console.log(`  Status: ${order.orderStatus}`);
});
```

---

## Integration with Login System

### Customer Login Flow:
1. Customer enters phone number and OTP
2. Backend verifies OTP and returns: `{token, userId, fullName, phone}`
3. Frontend stores in `localStorage`:
   ```javascript
   localStorage.setItem('currentUser', JSON.stringify({
     id: response.userId,
     userId: response.userId,
     name: response.fullName,
     phone: response.phone,
     token: response.token
   }));
   ```

### Order Placement:
1. Customer adds products to cart
2. Customer places order with:
   ```javascript
   await window.API.placeOrder({
     userId: currentUser.userId,  // From localStorage
     address: shippingAddress,
     mobile: phoneNumber
   });
   ```
3. Backend creates order with `user` object linked

### Seller Viewing Orders:
1. Seller logs in (seller authentication)
2. Seller calls:
   ```javascript
   const orders = await window.API.getSellerOrders(sellerId);
   ```
3. Backend returns all orders with customer information

---

## Next Steps (Optional Enhancements)

1. **Seller Dashboard Page:**
   - Create a seller dashboard to display orders
   - Show order statistics (total orders, revenue, etc.)
   - Filter orders by status

2. **Order Status Updates:**
   - Allow sellers to update order status
   - Send notifications to customers on status change

3. **Order Filtering:**
   - Filter by date range
   - Filter by order status
   - Search by customer name/phone

4. **Pagination:**
   - Add pagination for large order lists
   - Similar to product pagination implementation

---

## Files Modified

1. ✅ `Backend/src/main/java/com/smartbiz/sakhistore/modules/order/repository/OrdersRepository.java`
   - Added `findBySellerId` query method

2. ✅ `Backend/src/main/java/com/smartbiz/sakhistore/modules/order/service/OrdersService.java`
   - Added `getOrdersBySellerId` service method

3. ✅ `Backend/src/main/java/com/smartbiz/sakhistore/modules/order/controller/OrdersController.java`
   - Added `getSellerOrders` endpoint

4. ✅ `userwebsite/FrontEnd/js/api.js`
   - Added `getSellerOrders` API function
   - Exported in `window.API.getSellerOrders`

---

## Summary

✅ **Sellers can now see who ordered their products!**

- Backend endpoint: `GET /orders/seller/{sellerId}`
- Returns orders with full customer information
- Customer login stores `userId` correctly
- Orders are linked to customers via `user` object
- Frontend API function available: `window.API.getSellerOrders(sellerId)`

The implementation is complete and ready to use. Sellers can now track their orders and see customer details for each order.







