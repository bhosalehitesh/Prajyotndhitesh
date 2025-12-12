# How to Access Payment Page

## ✅ File Location
The `payment.html` file exists at: `Frontend(user)/pages/payment.html`

## 🚀 Starting the Server

### Option 1: Using npm start (Recommended)
1. Open terminal/command prompt
2. Navigate to the `Frontend(user)` directory:
   ```bash
   cd "Frontend(user)"
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. The server will start on `http://localhost:3000`
5. Access the payment page at: `http://localhost:3000/pages/payment.html`

### Option 2: Using npm run dev
```bash
cd "Frontend(user)"
npm run dev
```

## 🔗 Direct URLs

Once the server is running, you can access:

- **Payment Page**: `http://localhost:3000/pages/payment.html`
- **All Pages**: `http://localhost:3000/pages/all-pages.html`
- **Homepage**: `http://localhost:3000/index.html`
- **Checkout**: `http://localhost:3000/pages/checkout.html`

## ⚠️ Common Issues

### 404 Error
**Problem**: Getting "404 Not Found" error

**Solutions**:
1. **Make sure server is running**: Check terminal for "Server running at http://localhost:3000"
2. **Check you're in the right directory**: Server must run from `Frontend(user)` folder
3. **Verify the URL**: Use `http://localhost:3000/pages/payment.html` (not `/Frontend(user)/pages/payment.html`)
4. **Restart the server**: Stop (Ctrl+C) and restart with `npm start`

### Server Not Starting
**Problem**: `npm start` doesn't work

**Solutions**:
1. Install dependencies first:
   ```bash
   npm install
   ```
2. Check if port 3000 is already in use:
   ```bash
   netstat -ano | findstr :3000
   ```
3. If port is in use, kill the process or use a different port:
   ```bash
   npx http-server . -p 3001 -o
   ```

## 📝 Quick Test

1. Start server: `cd "Frontend(user)" && npm start`
2. Open browser: `http://localhost:3000/pages/payment.html`
3. Should see the payment page with order summary and payment methods

## 🎯 Payment Page Features

- ✅ Razorpay integration (Card/UPI/Wallet)
- ✅ Cash on Delivery (COD)
- ✅ Order summary display
- ✅ Error handling
- ✅ Success messages
- ✅ Redirects to orders page after payment

