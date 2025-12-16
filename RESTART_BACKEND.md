# 🔄 Restart Backend Server to Fix CORS

## ✅ CORS Configuration Fixed

I've updated `SecurityConfig.java` to properly handle CORS requests. The key changes:

1. **Added CORS to SecurityFilterChain** - CORS is now processed BEFORE authentication
2. **Created CorsConfigurationSource bean** - Properly configured CORS with:
   - All origins allowed (`*`)
   - All methods allowed (GET, POST, PUT, DELETE, OPTIONS, PATCH)
   - All headers allowed
   - Credentials disabled (not needed)

## 🚀 Steps to Restart Backend

### Option 1: If running in terminal
1. Stop the backend server (Ctrl+C)
2. Navigate to backend directory:
   ```bash
   cd Backend
   ```
3. Start the server:
   ```bash
   mvn spring-boot:run
   ```

### Option 2: If using IDE
1. Stop the running application
2. Rebuild the project (if needed)
3. Run `SakhistoreApplication.java` again

### Option 3: Using batch file
If you have a start script, just run it again.

## ✅ Verify CORS is Working

After restarting, test the endpoint:

1. Open browser console (F12)
2. Try saving an address from checkout page
3. Check Network tab - you should see:
   - Response headers include `Access-Control-Allow-Origin: *`
   - No CORS errors
   - Successful API calls

## 🎯 Expected Result

After restart, when you save an address:
- ✅ No CORS errors in console
- ✅ Address saves to database successfully
- ✅ Success message: "✅ Address saved successfully to database!"

## 📝 Note

The backend needs to be restarted for the CORS configuration changes to take effect. Once restarted, all API calls from `http://localhost:5173` will work properly.

