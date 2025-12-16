# Address Save Diagnostic Report

## ✅ Status Checks

### 1. Backend Server Status
- **Status**: ✅ RUNNING
- **Port**: 8080
- **Process ID**: 20280
- **Connection**: LISTENING on 0.0.0.0:8080

### 2. CORS Configuration
- **Status**: ✅ CONFIGURED
- **Allowed Origins**: `*` (all origins allowed)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: `*` (all headers allowed)
- **Credentials**: false (not required)

### 3. Security Configuration
- **Status**: ✅ PERMITTED
- **Authentication Required**: NO (permitAll() is set)
- **CSRF**: Disabled
- **Endpoint Access**: Public (no token required)

### 4. Backend Endpoint
- **Status**: ✅ EXISTS
- **Path**: `/api/user/update-address-by-phone/{phone}`
- **Method**: PUT
- **Controller**: `UserController.java`
- **Service**: `AuthUserService.updateUserAddressByPhone()`

### 5. Frontend API Configuration
- **Base URL**: `http://localhost:8080/api`
- **Timeout**: 10 seconds
- **Function**: `updateUserAddressByPhone()` in `api.js`

## 🔍 Testing Steps

### Step 1: Test Backend Health
Open browser and go to: `http://localhost:8080/api/health`
Expected: `{"status":"OK","message":"Sakhi Store Backend is running"}`

### Step 2: Test Endpoint Directly
I've created `test_address_endpoint.html` file. Open it in your browser to test:
1. Health check
2. Get user by phone
3. Update address by phone

### Step 3: Check Browser Console
When saving address from checkout page, check browser console (F12) for:
- Full API URL being called
- Request payload
- Response status
- Error messages

### Step 4: Check Network Tab
In browser DevTools → Network tab:
1. Filter by "update-address"
2. Click on the request
3. Check:
   - Request URL
   - Request Method (should be PUT)
   - Request Headers
   - Request Payload
   - Response Status
   - Response Body

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch"
**Possible Causes:**
- Backend server not running
- Wrong API URL
- CORS blocking (but CORS is configured correctly)
- Network connectivity issue

**Solution:**
1. Verify backend is running: `netstat -ano | findstr :8080`
2. Check API URL in console logs
3. Test endpoint directly using `test_address_endpoint.html`

### Issue 2: "404 Not Found"
**Possible Causes:**
- Wrong endpoint path
- Backend route not registered

**Solution:**
- Verify endpoint: `/api/user/update-address-by-phone/{phone}`
- Check backend logs for route registration

### Issue 3: "User not found"
**Possible Causes:**
- Phone number doesn't exist in database
- Phone number format mismatch

**Solution:**
- Verify user exists: GET `/api/user/phone/{phone}`
- Check phone number format (should be 10 digits)

### Issue 4: Database Save Fails
**Possible Causes:**
- Database connection issue
- Missing database columns
- Data validation error

**Solution:**
- Check backend logs for database errors
- Verify database schema matches User model
- JPA should auto-create missing columns (ddl-auto=update)

## 📋 Next Steps

1. **Open `test_address_endpoint.html`** in your browser
2. **Test the endpoint** with phone number: `9403697908`
3. **Check browser console** for detailed logs
4. **Check backend logs** for any errors
5. **Verify database** - check if address was saved

## 🔧 Debugging Commands

```bash
# Check if backend is running
netstat -ano | findstr :8080

# Check backend logs (if running in terminal)
# Look for:
# - "Started SakhistoreApplication"
# - Any error messages
# - SQL queries being executed
```

## 📝 Expected Request Format

```json
PUT http://localhost:8080/api/user/update-address-by-phone/9403697908
Headers:
  Content-Type: application/json
  Authorization: Bearer {token} (optional)

Body:
{
  "fullName": "User Name",
  "phone": "9403697908",
  "email": "user@example.com",
  "pincode": "123456",
  "flatOrHouseNo": "123",
  "areaOrStreet": "Test Area",
  "landmark": "Near Test",
  "city": "Test City",
  "state": "Test State",
  "addressType": "Other",
  "whatsappUpdates": true
}
```

## ✅ Expected Response

```json
{
  "id": 1,
  "fullName": "User Name",
  "phone": "9403697908",
  "email": "user@example.com",
  "pincode": "123456",
  "flatOrHouseNo": "123",
  "areaOrStreet": "Test Area",
  "landmark": "Near Test",
  "city": "Test City",
  "state": "Test State",
  "addressType": "Other",
  "whatsappUpdates": true,
  "enabled": true,
  "createdAt": "2025-12-16T12:08:27",
  "updatedAt": "2025-12-16T12:30:00"
}
```

