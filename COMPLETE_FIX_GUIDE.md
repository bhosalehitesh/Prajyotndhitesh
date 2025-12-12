# Complete Fix Guide - Payment Endpoint Not Working

## Current Issues
1. ❌ Backend server is NOT running (port 8080 not accessible)
2. ❌ Database connection error (PostgreSQL password mismatch)

## Step-by-Step Fix

### Step 1: Fix Database Password

1. **Open:** `Backend/src/main/resources/application.properties`

2. **Find line 16:**
   ```properties
   spring.datasource.password=root
   ```

3. **Change to your actual PostgreSQL password:**
   ```properties
   spring.datasource.password=YOUR_ACTUAL_PASSWORD
   ```
   
   **OR** if you want to use `root`, reset PostgreSQL password:
   ```sql
   -- Connect to PostgreSQL (using pgAdmin or psql)
   ALTER USER postgres WITH PASSWORD 'root';
   ```

4. **Save the file**

### Step 2: Verify PostgreSQL is Running

**Check if PostgreSQL service is running:**
```powershell
Get-Service -Name postgresql*
```

**If not running, start it:**
```powershell
# Find your PostgreSQL service name first
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Then start it (replace with actual service name)
Start-Service -Name "postgresql-x64-14"  # Example
```

**Or use Services GUI:**
- Press `Win + R`, type `services.msc`
- Find "postgresql" service
- Right-click → Start

### Step 3: Verify Database Exists

**Check if database exists:**
```sql
-- Using pgAdmin or psql
psql -U postgres

-- List databases
\l

-- If sakhistore_hitesh_testing doesn't exist, create it
CREATE DATABASE sakhistore_hitesh_testing;
```

### Step 4: Start Backend Server

1. **Open terminal in Backend directory:**
   ```powershell
   cd C:\Users\Admin\Desktop\Prajyotndhitesh\Backend
   ```

2. **Start the server:**
   ```powershell
   mvn clean spring-boot:run
   ```

3. **Wait for success message:**
   ```
   Started SakhistoreApplication in X.XXX seconds
   ```

4. **Keep this terminal open** - don't close it!

### Step 5: Verify Server is Running

**Test if server is accessible:**
```powershell
# Test connection
Test-NetConnection -ComputerName localhost -Port 8080

# Should show: TcpTestSucceeded : True
```

**Or test in browser:**
- Open: `http://localhost:8080/api/health` (if endpoint exists)
- Or: `http://192.168.1.21:8080/api/health`

### Step 6: Test Payment Endpoint

**Option 1: From Payment Page**
1. Open: `http://localhost:3000/pages/payment.html`
2. Make sure you have items in cart (or it will show empty)
3. Select "Card / UPI / Wallet"
4. Click "Pay Now"
5. Check browser console (F12) for errors

**Option 2: Direct API Test**
```powershell
$body = @{
    orderId = 1
    amount = 199
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://192.168.1.21:8080/payment/create-razorpay-order" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}
```

## Expected Results

### ✅ Server Started Successfully
```
Started SakhistoreApplication in X.XXX seconds
```

### ✅ Payment Endpoint Working
Response should be:
```json
{
  "razorpayOrderId": "order_xxxxx",
  "amount": 199,
  "razorpayKey": "rzp_test_HkFY3rSv7zcCnX",
  "currency": "INR"
}
```

### ✅ Razorpay Checkout Opens
- Payment popup should open
- You can test with Razorpay test cards

## Common Errors & Fixes

### Error: "FATAL: password authentication failed"
**Fix:** Update password in `application.properties` (Step 1)

### Error: "Connection refused" or port 8080 not accessible
**Fix:** Server not running - follow Step 4

### Error: "405 Method Not Allowed"
**Fix:** 
1. Make sure server was restarted after code changes
2. Check SecurityConfig has `/payment/**` in PUBLIC_ENDPOINTS
3. Verify @RestController annotation is on PaymentController

### Error: "Cannot connect to backend"
**Fix:**
1. Check server is running (Step 5)
2. Verify IP address is correct: `192.168.1.21:8080`
3. Check firewall isn't blocking port 8080

## Quick Checklist

- [ ] PostgreSQL password updated in application.properties
- [ ] PostgreSQL service is running
- [ ] Database `sakhistore_hitesh_testing` exists
- [ ] Backend server started successfully
- [ ] Port 8080 is accessible
- [ ] Payment endpoint returns 200 (not 405)
- [ ] Razorpay checkout opens

## Still Not Working?

1. **Check backend logs** - Look for errors in the terminal where server is running
2. **Check browser console** - Press F12, look for errors
3. **Verify Razorpay keys** - Check `application.properties` has correct keys
4. **Test with Postman/curl** - Bypass frontend to test backend directly

## Files to Check

- `Backend/src/main/resources/application.properties` - Database & Razorpay config
- `Backend/src/main/java/com/smartbiz/sakhistore/config/SecurityConfig.java` - Security config
- `Backend/src/main/java/com/smartbiz/sakhistore/modules/payment/controller/PaymentController.java` - Payment endpoints
- `Frontend(user)/pages/payment.html` - Frontend payment page

