# 📱 Frontend Integration Flow - Visual Guide

## 🎯 Complete User Experience Flow

This document shows exactly how the app will work after backend integration, **without making any code changes**.

---

## 📋 Table of Contents
1. [Sign Up Flow](#sign-up-flow)
2. [Sign In Flow](#sign-in-flow)
3. [What Changes After Integration](#what-changes)
4. [Before vs After Comparison](#before-vs-after)

---

## 🔵 SIGN UP FLOW

### Screen 1: Sign Up Form
```
┌─────────────────────────────────────────┐
│          smartbiz                        │
│          by amazon                       │
│                                          │
│          Welcome                         │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  First name    │   Last name    │   │
│  │  [John        ]│   [Doe        ]│   │
│  └─────────────────────────────────┘   │
│                                          │
│  Mobile number                           │
│  ┌──────────┬──────────────────────┐   │
│  │ IN +91   │ [1234567890        ] │   │
│  └──────────┴──────────────────────┘   │
│                                          │
│  Create a password                       │
│  ┌─────────────────────────────────┐   │
│  │ [••••••••••••••]  👁           │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ⓘ Passwords must be at least 6 chars  │
│                                          │
│  ☐ Show password                         │
│                                          │
│  [  Verify mobile number  ]              │
│         (Yellow button)                  │
│                                          │
│  By continuing, you agree to...          │
│  New here? Create account                 │
└─────────────────────────────────────────┘
```

**What happens when user clicks "Verify mobile number":**
- ✅ Form validation (name, phone, password)
- ✅ **Calls backend:** `POST /api/auth/signup`
- ✅ **Backend response:** Returns OTP code in message
- ✅ **App shows alert:** "OTP Sent - Verification code: 123456"
- ✅ **Screen changes** → OTP Verification Screen

---

### Screen 2: OTP Verification
```
┌─────────────────────────────────────────┐
│          smartbiz                        │
│          by amazon                       │
│                                          │
│  Verify mobile number                    │
│                                          │
│  IN +91 1234567890  Change               │
│                                          │
│  We've sent a One Time Password (OTP)   │
│  to the mobile number above. Please     │
│  enter it to complete verification.      │
│                                          │
│  Enter OTP                               │
│  ┌─────────────────────────────────┐   │
│  │ [123456                        ] │   │
│  └─────────────────────────────────┘   │
│                                          │
│  [  Verify and Create Account  ]         │
│         (Yellow button)                 │
│                                          │
│  Resend OTP                              │
└─────────────────────────────────────────┘
```

**What happens:**
- ✅ User enters OTP from alert/backend logs
- ✅ **Calls backend:** `POST /api/auth/verify-otp`
- ✅ **Backend verifies:** Checks OTP in database
- ✅ **Then calls:** `POST /api/auth/login` (automatic)
- ✅ **Backend returns:** JWT token + user info
- ✅ **App shows:** "Success! Account created successfully!"
- ✅ **Screen changes** → Home Screen (logged in)

---

## 🔵 SIGN IN FLOW

### Screen 1: Sign In Form
```
┌─────────────────────────────────────────┐
│          smartbiz                        │
│          by amazon                       │
│                                          │
│          Welcome                         │
│                                          │
│  Already a customer?                     │
│                                          │
│  Mobile number                           │
│  ┌──────────┬──────────────────────┐   │
│  │ IN +91   │ [1234567890        ] │   │
│  └──────────┴──────────────────────┘   │
│                                          │
│  Password                                │
│  ┌─────────────────────────────────┐   │
│  │ [••••••••••••••]  👁           │   │
│  └─────────────────────────────────┘   │
│                                          │
│  Forgot password?                        │
│                                          │
│  Use Password  or  Use OTP               │
│                                          │
│  [  Continue  ]                          │
│     (Orange button)                      │
│                                          │
│  By continuing, you agree to...          │
│  New here? Create account                 │
└─────────────────────────────────────────┘
```

**What happens when user clicks "Continue":**
- ✅ Form validation (phone + password)
- ✅ **Calls backend:** `POST /api/auth/login`
- ✅ **Backend validates:** Phone + password in database
- ✅ **Backend returns:** JWT token + user info
- ✅ **Screen changes** → Home Screen (logged in)

---

## 📊 FLOW DIAGRAMS

### Sign Up Complete Flow
```
┌─────────────┐
│  User Opens │
│     App     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Sign Up Screen │
│  (Enter Details)│
└──────┬──────────┘
       │
       │ User clicks "Verify mobile"
       ▼
┌─────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  Backend       │
│  POST /signup   │     │  Creates User   │
└──────┬──────────┘     │  Generates OTP │
       │                │  Logs OTP      │
       │                └────────┬───────┘
       │                         │
       │◀────────────────────────┘
       │ Response: "OTP Sent (123456)"
       │
       ▼
┌─────────────────┐
│  Alert Shows:    │
│  "OTP: 123456"  │
└──────┬──────────┘
       │
       │ User sees OTP
       ▼
┌─────────────────┐
│  OTP Screen     │
│  (Enter Code)   │
└──────┬──────────┘
       │
       │ User enters OTP & clicks "Verify"
       ▼
┌─────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  Backend       │
│  POST /verify-  │     │  Verifies OTP  │
│       otp       │     │  Enables User  │
└──────┬──────────┘     └────────┬───────┘
       │                         │
       │◀────────────────────────┘
       │ Success
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  Backend       │
│  POST /login   │     │  Returns JWT    │
└──────┬──────────┘     └────────┬───────┘
       │                         │
       │◀────────────────────────┘
       │ Token + User Info
       │
       ▼
┌─────────────────┐
│  Home Screen    │
│  (Logged In!)   │
└─────────────────┘
```

---

### Sign In Complete Flow
```
┌─────────────┐
│  User Opens │
│     App     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Sign In Screen │
│  (Enter Phone +  │
│    Password)     │
└──────┬──────────┘
       │
       │ User clicks "Continue"
       ▼
┌─────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  Backend       │
│  POST /login   │     │  Validates      │
└──────┬──────────┘     │  Password       │
       │                │  Checks User    │
       │                │  Enabled?       │
       │                └────────┬───────┘
       │                         │
       │◀────────────────────────┘
       │ Token + User Info
       │
       ▼
┌─────────────────┐
│  Home Screen    │
│  (Logged In!)   │
└─────────────────┘
```

---

## 🔄 WHAT CHANGES AFTER INTEGRATION

### Before Integration (Current - Local Storage)
```
User Signs Up
    ↓
OTP generated in frontend
    ↓
OTP shown in alert
    ↓
Data saved in phone storage
    ↓
Login checks phone storage
```

### After Integration (Backend)
```
User Signs Up
    ↓
Frontend → Backend API
    ↓
Backend generates OTP
    ↓
Backend saves to PostgreSQL
    ↓
OTP logged (dev mode) / Sent via SMS (production)
    ↓
Backend returns OTP in response
    ↓
Frontend shows OTP from backend
    ↓
User verifies OTP
    ↓
Frontend → Backend API
    ↓
Backend verifies from database
    ↓
Backend enables user
    ↓
Backend returns JWT token
    ↓
Frontend saves token
    ↓
User logged in!
```

---

## 📱 SCREEN-BY-SCREEN EXPERIENCE

### Scenario 1: New User Sign Up

**Step 1:** User opens app
```
App shows: Sign Up screen (default)
```

**Step 2:** User fills form
```
First Name: "Raj"
Last Name: "Kumar"
Mobile: "9876543210"
Password: "mypassword123"
```

**Step 3:** User clicks "Verify mobile number"
```
Loading spinner shows...
↓
Backend processes request
↓
Alert appears:
┌─────────────────────────────┐
│        OTP Sent             │
│                             │
│ Verification code: 456789   │
│                             │
│ Please enter this code to   │
│ verify your mobile number.  │
│                             │
│          [ OK ]              │
└─────────────────────────────┘
```

**Step 4:** Screen changes to OTP verification
```
User sees OTP input field
User enters: 456789
```

**Step 5:** User clicks "Verify and Create Account"
```
Loading spinner shows...
↓
Backend verifies OTP
↓
Backend enables user
↓
Backend logs user in (returns token)
↓
Alert appears:
┌─────────────────────────────┐
│        Success              │
│                             │
│ Account created             │
│ successfully!               │
│                             │
│          [ OK ]              │
└─────────────────────────────┘
```

**Step 6:** User clicks OK
```
App navigates to Home Screen
User is logged in!
```

---

### Scenario 2: Existing User Login

**Step 1:** User opens app
```
App shows: Sign In screen
```

**Step 2:** User enters credentials
```
Mobile: "9876543210"
Password: "mypassword123"
```

**Step 3:** User clicks "Continue"
```
Loading spinner shows...
↓
Backend validates credentials
↓
Backend checks user is enabled
↓
Backend returns JWT token
↓
App navigates to Home Screen
User is logged in!
```

**If password wrong:**
```
Alert appears:
┌─────────────────────────────┐
│        Error                │
│                             │
│ Incorrect password.         │
│ Please try again or use OTP.│
│                             │
│          [ OK ]              │
└─────────────────────────────┘
```

**If user not found:**
```
Alert appears:
┌─────────────────────────────┐
│   Account Not Found         │
│                             │
│ No account found with this  │
│ mobile number. Please sign   │
│ up first.                   │
│                             │
│          [ OK ]              │
└─────────────────────────────┘
```

---

## 🔍 BACKEND LOGS VIEW (What You'll See)

### During Sign Up:
```
========================================
🔧 [DEV MODE] SMS DISABLED
📱 Phone: 9876543210
🔢 OTP Code: 456789
⏰ Valid for 5 minutes
========================================
```

### During Login:
```
Login attempt: { url: 'http://localhost:8080/api/auth/login', phone: '9876543210' }
Login response status: 200
Login success: { userId: 1, phone: '9876543210' }
```

---

## ✅ BENEFITS OF INTEGRATION

### Before (Local Storage):
- ❌ Data lost when app uninstalled
- ❌ No real OTP verification
- ❌ No backend validation
- ❌ Can't sync across devices
- ❌ No real authentication

### After (Backend Integration):
- ✅ Data saved in PostgreSQL database
- ✅ OTP verification with backend
- ✅ Real password validation
- ✅ JWT token authentication
- ✅ Data persists permanently
- ✅ Can sync across devices
- ✅ Ready for production SMS

---

## 🎨 VISUAL USER EXPERIENCE

### Sign Up Flow (Visual Timeline)
```
[User Opens App]
      ↓
[Sign Up Screen]
  ├─ Enter Name
  ├─ Enter Mobile
  └─ Enter Password
      ↓
[Click "Verify Mobile"]
      ↓
[⏳ Loading...]
      ↓
[✅ Alert: "OTP: 456789"]
      ↓
[OTP Verification Screen]
  ├─ Enter OTP: 456789
  └─ Click "Verify and Create Account"
      ↓
[⏳ Loading...]
      ↓
[✅ Alert: "Success!"]
      ↓
[🏠 Home Screen - Logged In!]
```

### Sign In Flow (Visual Timeline)
```
[User Opens App]
      ↓
[Sign In Screen]
  ├─ Enter Mobile: 9876543210
  └─ Enter Password: mypassword123
      ↓
[Click "Continue"]
      ↓
[⏳ Loading...]
      ↓
[✅ Backend Validates]
      ↓
[🏠 Home Screen - Logged In!]
```

---

## 📋 KEY POINTS TO REMEMBER

### 1. OTP Display
- **Current:** OTP shown in alert popup
- **Backend logs:** Also show OTP (for testing)
- **Later:** When Kutility credentials arrive, OTP sent via SMS

### 2. Error Handling
- **Account exists:** "Account already exists. Please sign in."
- **Wrong OTP:** "Incorrect OTP. Please try again."
- **OTP expired:** "OTP expired. Please request a new one."
- **Wrong password:** "Incorrect password. Please try again."
- **Not verified:** "User not verified. Please verify OTP first."

### 3. Loading States
- Button shows "Signing in..." during API call
- Button disabled during loading
- Spinner/loading indicator appears

### 4. Success States
- After signup: Alert shows "Success! Account created successfully!"
- After login: Directly navigates to Home Screen
- Token saved automatically

---

## 🔐 SECURITY FEATURES

### What Backend Provides:
1. ✅ Password hashing (BCrypt)
2. ✅ JWT token authentication
3. ✅ OTP expiration (5 minutes)
4. ✅ OTP attempt limits (max 5 attempts)
5. ✅ Rate limiting (60 second cooldown)
6. ✅ User verification status

---

## 🎯 FINAL RESULT

After integration, users will:
1. ✅ Sign up with real backend validation
2. ✅ Receive OTP (via SMS later, logs now)
3. ✅ Verify OTP with backend
4. ✅ Login with secure password authentication
5. ✅ Get JWT token for API calls
6. ✅ Have data saved in PostgreSQL database

---

## 📝 SUMMARY

**What Changes:**
- Signup/Login now use backend APIs
- Data saved in PostgreSQL (not phone storage)
- OTP verified by backend
- Real password authentication
- JWT tokens for security

**What Stays Same:**
- UI screens look exactly the same
- User experience feels the same
- Flow is the same
- Just backend connected now!

**What You Need to Do:**
1. Start backend server
2. Start frontend Metro bundler
3. Run React Native app
4. Test signup/login flow

---

This is how your app will work after integration! 🚀

