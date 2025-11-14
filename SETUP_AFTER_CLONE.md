# 🚀 Setup After Cloning - Quick Reference

## 📋 What You Need After Cloning

When a team member clones this repository, here's what they need to do:

---

## ✅ Step 1: Install Prerequisites (One-Time Setup)

### Required Software:
1. **Java JDK 17+** - For Backend
   - Download: https://adoptium.net/
   - Verify: `java -version`

2. **Node.js 16+** - For Frontend
   - Download: https://nodejs.org/ (LTS version)
   - Verify: `node --version` and `npm --version`

3. **PostgreSQL 16+** - For Database
   - Download: https://www.postgresql.org/download/
   - Default port: `5432`
   - Default password in config: `Thynktech` (can be changed)

4. **Maven** - For Backend builds
   - Usually comes with IDE or download separately
   - Verify: `mvn --version`

5. **Android Studio** - For Android development
   - Download: https://developer.android.com/studio

**📖 Detailed installation:** See `INSTALLATION_GUIDE.md`

---

## ✅ Step 2: Database Setup

### Create PostgreSQL Database:

```cmd
# Connect to PostgreSQL
psql -U postgres

# Enter password when prompted (default: Thynktech)

# Create database
CREATE DATABASE sakhistore;

# Exit
\q
```

### Update Database Password (if different):

**File:** `Backend/store/src/main/resources/application.properties`

```properties
spring.datasource.password=YOUR_PASSWORD_HERE
```

---

## ✅ Step 3: Install Dependencies

### Frontend Dependencies:

```cmd
cd Frontend
npm install
```

This will install all packages listed in `package.json` (creates `node_modules/` folder).

### Backend Dependencies:

**No manual step needed!** Maven will automatically download dependencies when you run:
```cmd
cd Backend/store
mvn spring-boot:run
```

**Note:** `gradle-wrapper.jar` is included, so Gradle will work automatically.

---

## ✅ Step 4: Configure API Connection

### Option A: Use ADB Reverse (Recommended)

```cmd
adb reverse tcp:8080 tcp:8080
```

Then use `http://localhost:8080` in the app.

### Option B: Use IP Address

**File:** `Frontend/src/utils/apiConfig.ts`

```typescript
export const API_BASE_URL_DEV_IP = 'http://YOUR_IP_HERE:8080';
```

Find your IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig`

Then set:
```typescript
export const USE_IP_ADDRESS = true;
```

---

## ✅ Step 5: Run the Application

### Terminal 1: Start Backend

```cmd
cd Backend/store
mvn spring-boot:run
```

**Wait for:** `Started SakhiStoreApplication` message

### Terminal 2: Start Frontend Metro Bundler

```cmd
cd Frontend
npm start
```

**Wait for:** Metro bundler to start (shows QR code)

### Terminal 3: Run Android App

```cmd
cd Frontend
npm run android
```

Or if using ADB reverse:
```cmd
cd Frontend
npm run android-with-adb
```

---

## 📚 Full Documentation

- **Complete Installation:** `INSTALLATION_GUIDE.md`
- **Detailed Running Guide:** `RUNNING_GUIDE.md`
- **Quick Daily Start:** `QUICK_START.md`

---

## ⚠️ Common Issues

### Gradle Error?
- ✅ **Fixed!** `gradle-wrapper.jar` is now included in the repository
- Gradle will work automatically after cloning

### Database Connection Error?
- Check PostgreSQL is running: `netstat -an | findstr :5432`
- Verify database exists: `psql -U postgres -c "\l"`
- Check password in `application.properties`

### Frontend Can't Connect to Backend?
- Check backend is running on port 8080
- Update IP address in `apiConfig.ts` or use ADB reverse
- Check firewall settings

### Node Modules Missing?
- Run: `cd Frontend && npm install`
- This creates the `node_modules/` folder (not in git)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] PostgreSQL is running
- [ ] Database `sakhistore` exists
- [ ] Backend starts without errors
- [ ] Frontend Metro bundler starts
- [ ] Android app builds and runs
- [ ] App can connect to backend API

---

**🎉 You're all set! Happy coding!**

