# 🚨 CRITICAL: RESTART YOUR BACKEND SERVER

## The 405 Error Means the Server Needs a Restart!

The payment endpoints are now properly configured, but **Spring Boot must be restarted** to register them.

## Steps to Fix:

### 1. Stop the Current Server
- Find the terminal/command prompt where Spring Boot is running
- Press `Ctrl + C` to stop it
- Wait until it fully stops

### 2. Restart the Server
```bash
cd Backend
mvn clean spring-boot:run
```

**OR if you're using an IDE:**
- Stop the running application
- Clean and rebuild the project
- Run `SakhistoreApplication` again

### 3. Wait for Full Startup
Look for this message in the logs:
```
Started SakhistoreApplication in X.XXX seconds
```

### 4. Verify Endpoints Are Registered
After restart, you should see in the logs something like:
```
Mapped "{[/payment/create-razorpay-order],methods=[POST]}"
```

### 5. Test the Payment Page
- Open `Frontend(user)/razorpay-test.html`
- Enter Order ID: 1
- Enter Amount: 199
- Click "Pay Now"

## ✅ What's Fixed:

1. ✅ PaymentController has `@RestController` annotation
2. ✅ Endpoints are properly mapped
3. ✅ Security config allows `/payment/**`
4. ✅ CORS is configured
5. ✅ Razorpay credentials are set

## 🔍 If Still Not Working After Restart:

1. **Check Backend Logs** - Look for errors during startup
2. **Check Browser Console** (F12) - Look for network errors
3. **Verify Server is Running** - Check `http://192.168.1.21:8080` is accessible
4. **Test with curl/Postman**:
   ```bash
   curl -X POST http://192.168.1.21:8080/payment/create-razorpay-order \
     -H "Content-Type: application/json" \
     -d '{"orderId":1,"amount":199}'
   ```

## ⚠️ Important Notes:

- **DO NOT** skip the restart - it's required!
- The server must be **fully stopped** before restarting
- Wait for the "Started" message before testing
- If you see compilation errors, fix them first

