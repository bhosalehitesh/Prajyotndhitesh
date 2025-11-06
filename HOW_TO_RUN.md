# 🚀 How to Run Sakhi Store - Complete Guide

## ✅ Quick Setup Checklist

- [ ] PostgreSQL database running
- [ ] Java 17+ installed
- [ ] Node.js 16+ installed
- [ ] Maven installed (for backend)
- [ ] Android Studio / Xcode (for mobile app)

---

## 📋 STEP 1: Database Setup (PostgreSQL)

### 1.1 Install PostgreSQL (if not installed)
- Download from: https://www.postgresql.org/download/

### 1.2 Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE sakhistore;

-- Verify
\l
```

### 1.3 Verify Database Connection
The backend will auto-create tables on first run (check `application.properties`).

---

## 🔧 STEP 2: Backend Setup (Spring Boot)

### 2.1 Navigate to Backend Folder
```bash
cd Backend/store
```

### 2.2 Install Dependencies (Maven)
```bash
# Windows PowerShell
mvn clean install

# If Maven not installed, download from: https://maven.apache.org/download.cgi
```

### 2.3 Run Backend Server
```bash
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using Java (after building)
mvn package
java -jar target/store-0.0.1-SNAPSHOT.jar
```

### 2.4 Verify Backend is Running
- ✅ Server starts on: `http://localhost:8080`
- ✅ Check console for: "Started SakhiStoreApplication"
- ✅ Test API: `http://localhost:8080/api/auth/signup` (should return error without body, but server responds)

---

## 📱 STEP 3: Frontend Setup (React Native)

### 3.1 Navigate to Frontend Folder
```bash
cd Frontend
```

### 3.2 Install Dependencies
```bash
npm install
# or
yarn install
```

### 3.3 Start Metro Bundler
```bash
npm start
# or
npx react-native start
```

### 3.4 Run on Device/Emulator

**For Android:**
```bash
npm run android
# Make sure Android emulator is running or device is connected
```

**For iOS (Mac only):**
```bash
npm run ios
# Make sure Xcode is installed and simulator is running
```

---

## 🔐 STEP 4: OTP Configuration (Console Mode)

### ✅ OTP Already Configured for Console!

Your backend is **already set** to show OTP in console. Check `application.properties`:

```properties
sms.dev.mode=true    # ✅ This is ENABLED
sms.enabled=true
```

### 📺 Where to See OTP in Console

When you sign up or request OTP, look at the **backend console** (where you ran `mvn spring-boot:run`):

```
========================================
🔧 [DEV MODE] SMS DISABLED
📱 Phone: 9876543210
🔢 OTP Code: 123456
⏰ Valid for 5 minutes
========================================
```

### 🔍 How to Test OTP Flow

1. **Start Backend** (Terminal 1)
   ```bash
   cd Backend/store
   mvn spring-boot:run
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd Frontend
   npm start
   ```

3. **Run Mobile App** (Terminal 3 or Android Studio)
   ```bash
   npm run android
   ```

4. **Test Signup:**
   - Open app → Sign Up
   - Enter phone number and name
   - Click "Send OTP"
   - **Check backend console** → You'll see the OTP code!

5. **Enter OTP:**
   - Copy OTP from backend console
   - Paste in app
   - Complete signup

---

## 🎯 Complete Running Flow

### Terminal 1: Backend
```bash
cd Backend/store
mvn spring-boot:run
# Wait for: "Started SakhiStoreApplication"
```

### Terminal 2: Frontend Metro
```bash
cd Frontend
npm start
# Metro bundler starts
```

### Terminal 3: Android App (or use Android Studio)
```bash
cd Frontend
npm run android
# App launches on emulator/device
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection failed**
```bash
# Check PostgreSQL is running
# Windows: Check Services → PostgreSQL
# Verify credentials in application.properties match your PostgreSQL setup
```

**Problem: Port 8080 already in use**
```bash
# Change port in application.properties:
server.port=8081
# Then update frontend API_BASE_URL accordingly
```

**Problem: Maven not found**
```bash
# Install Maven or use Maven Wrapper (if available):
./mvnw spring-boot:run  # Linux/Mac
.\mvnw.cmd spring-boot:run  # Windows
```

### Frontend Issues

**Problem: Cannot connect to backend** ⚠️ **PERMANENT SOLUTION AVAILABLE!**

👉 **See `Frontend/BACKEND_CONNECTION_SETUP.md` for complete setup guide!**

**Quick Fix (Recommended):**
```bash
# Use ADB reverse port forwarding (works for emulator AND physical devices)
npm run setup-adb
# OR manually:
adb reverse tcp:8080 tcp:8080
```

**Alternative (Using IP Address):**
1. Edit `Frontend/src/utils/apiConfig.ts`
2. Set `USE_IP_ADDRESS = true`
3. Update `API_BASE_URL_DEV_IP` with your computer's IP (find with `ipconfig`)

**Problem: Metro bundler not starting**
```bash
# Clear cache
npm start -- --reset-cache
```

---

## 📝 Important Notes

1. **OTP Console Mode**: 
   - ✅ Currently enabled (`sms.dev.mode=true`)
   - ✅ OTPs appear in backend console
   - ✅ No real SMS sent

2. **When You Get Kutility Credentials:**
   - Update `Backend/store/src/main/resources/application.properties`:
     ```properties
     sms.kutility.api.key=YOUR_API_KEY
     sms.kutility.api.secret=YOUR_API_SECRET
     sms.dev.mode=false  # Change to false
     ```
   - Restart backend
   - Real SMS will be sent automatically

3. **Database Auto-Creation:**
   - Backend auto-creates tables on first run
   - No manual table creation needed
   - Check console for SQL queries (if `spring.jpa.show-sql=true`)

---

## ✅ Quick Test Checklist

- [ ] Backend running on port 8080
- [ ] Database connected (check backend console)
- [ ] Frontend Metro bundler running
- [ ] Mobile app launched
- [ ] Can see OTP in backend console when signing up
- [ ] Can login with created account

---

## 🎉 You're All Set!

Your app is ready to test. OTPs will appear in the backend console until you configure real SMS provider.




























