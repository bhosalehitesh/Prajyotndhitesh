# Razorpay Payment Integration - Setup & Troubleshooting

## ✅ What's Been Implemented

1. **Backend Endpoints:**
   - `POST /payment/create-razorpay-order` - Creates Razorpay order
   - `POST /payment/razorpay-callback` - Verifies and saves payment

2. **Configuration:**
   - Razorpay keys configured in `application.properties`
   - CORS enabled for all origins
   - Payment can work with or without existing orders (for testing)

## 🔧 Setup Steps

### 1. Verify Backend Configuration
Check `Backend/src/main/resources/application.properties`:
```properties
razorpay.key=rzp_test_HkFY3rSv7zcCnX
razorpay.secret=oJlYLpC1hknO5cVqym5ZnNFI
```

### 2. Restart Backend Server
**IMPORTANT:** After any code changes, you MUST restart the Spring Boot server:
```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd Backend
mvn spring-boot:run
```

### 3. Test the Integration
Open `Frontend(user)/test-razorpay.html` in your browser:
- Click "Test Backend Connection" first
- Then try "Pay Now"

## 🐛 Common Issues & Fixes

### Issue 1: 405 Method Not Allowed
**Cause:** Backend server not restarted after code changes
**Fix:** Restart the Spring Boot server

### Issue 2: Razorpay credentials not found
**Cause:** Properties not loaded
**Fix:** 
1. Check `application.properties` has the keys
2. Restart server
3. Check server logs for errors

### Issue 3: CORS errors
**Cause:** Frontend and backend on different origins
**Fix:** Already configured with `@CrossOrigin("*")` - should work

### Issue 4: Payment created but callback fails
**Cause:** Order doesn't exist in database
**Fix:** Code handles this - payment will be created without order

## 📝 Testing

### Test with Existing Order:
1. Enter a valid Order ID from your database
2. Enter amount
3. Click "Pay Now"

### Test without Order:
1. Enter any Order ID (even if it doesn't exist)
2. Enter amount
3. Click "Pay Now"
4. Payment will be saved without linking to order

## 🔍 Debugging

Use `test-razorpay.html` which includes:
- Connection testing
- Detailed logging
- Error messages
- Step-by-step execution logs

Check browser console (F12) for detailed error messages.

## 📞 Next Steps

If still not working:
1. Check backend server logs for errors
2. Verify Razorpay test keys are valid
3. Test with `test-razorpay.html` debug page
4. Check browser console for CORS or network errors

