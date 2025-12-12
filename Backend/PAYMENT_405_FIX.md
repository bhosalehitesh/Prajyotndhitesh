# Fix for 405 Method Not Allowed Error on Payment Endpoint

## Problem
Getting `405 Method Not Allowed` error when calling `/payment/create-razorpay-order`

## Root Cause
Spring Security might be blocking the POST request even though the endpoint is in PUBLIC_ENDPOINTS.

## Solution Applied

### 1. Updated SecurityConfig.java
- Added explicit `.requestMatchers("/payment/**").permitAll()` in SecurityFilterChain
- This ensures payment endpoints are explicitly allowed regardless of HTTP method

### 2. Added OPTIONS Handler
- Added explicit OPTIONS request handler in PaymentController for CORS preflight

## Required Action: RESTART BACKEND SERVER

**CRITICAL:** You MUST restart the Spring Boot server for changes to take effect:

```bash
# Stop the server (Ctrl+C in the terminal)
# Then restart:
cd Backend
mvn clean spring-boot:run
```

Wait for: `Started SakhistoreApplication in X.XXX seconds`

## Verification

After restart, test the endpoint:

```bash
# Using PowerShell
$body = @{
    orderId = 1
    amount = 199
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://192.168.1.21:8080/payment/create-razorpay-order" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Or test from the payment page: `http://localhost:3000/pages/payment.html`

## Expected Response

If working correctly, you should get:
```json
{
  "razorpayOrderId": "order_xxxxx",
  "amount": 199,
  "razorpayKey": "rzp_test_xxxxx",
  "currency": "INR"
}
```

## If Still Getting 405

1. **Verify server restarted**: Check terminal for "Started" message
2. **Check endpoint registration**: Look for "Mapped" messages in server logs
3. **Verify URL**: Should be `http://192.168.1.21:8080/payment/create-razorpay-order` (no `/api` prefix)
4. **Check browser console**: Look for CORS errors or other issues
5. **Test with curl/Postman**: Verify backend is reachable

## Files Modified

- `Backend/src/main/java/com/smartbiz/sakhistore/config/SecurityConfig.java`
- `Backend/src/main/java/com/smartbiz/sakhistore/modules/payment/controller/PaymentController.java`

