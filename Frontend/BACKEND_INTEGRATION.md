# Backend API Integration Guide

This guide explains how the React Native frontend connects to the Spring Boot backend for authentication.

## Overview

The frontend now uses real backend APIs instead of mock authentication. The integration includes:

- **API Service** (`src/services/api.ts`) - Centralized HTTP client for backend communication
- **Authentication Flow** - Updated to use backend endpoints for signup, OTP verification, and login
- **Android Network Configuration** - Configured to allow HTTP connections for development

## Backend API Endpoints

The backend exposes the following authentication endpoints:

### 1. Sign Up (Create Account)
- **Endpoint**: `POST /api/auth/signup`
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "phone": "1234567890",
    "password": "password123"
  }
  ```
- **Response**: `"OTP sent successfully to {phone} (for testing: {otp})"`
- **Note**: In development mode, the response includes the OTP for testing

### 2. Verify OTP
- **Endpoint**: `POST /api/auth/verify-otp`
- **Request Body**:
  ```json
  {
    "phone": "1234567890",
    "code": "123456"
  }
  ```
- **Response**: `"OTP verified successfully. User enabled!"`

### 3. Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "phone": "1234567890",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_string",
    "userId": 1,
    "fullName": "John Doe",
    "phone": "1234567890"
  }
  ```

## Configuration

### Backend URL Configuration

The API base URL is configured in `src/services/api.ts`:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8080/api' // Android emulator default
  : 'https://your-production-url.com/api'; // Production URL
```

#### For Android Emulator
- Use `http://10.0.2.2:8080/api` (default)
- `10.0.2.2` is the special IP that maps to `localhost` on your development machine

#### For Physical Android Device
- Replace `10.0.2.2` with your computer's local IP address
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Example: `http://192.168.1.100:8080/api`

#### For iOS Simulator
- Use `http://localhost:8080/api`

#### For Production
- Update the production URL in `api.ts`
- Ensure HTTPS is enabled

### Changing Backend URL at Runtime

You can also set a custom base URL programmatically:

```typescript
import { apiService } from './src/services/api';

// Set custom URL
apiService.setBaseUrl('http://your-custom-url:8080/api');
```

## Android Network Configuration

The Android app is configured to allow HTTP connections for development:

1. **Network Security Config** (`android/app/src/main/res/xml/network_security_config.xml`)
   - Allows cleartext traffic for `10.0.2.2`, `localhost`, and `127.0.0.1`

2. **AndroidManifest.xml**
   - Added `android:usesCleartextTraffic="true"` for development
   - Added `android:networkSecurityConfig` reference

**Note**: For production, remove cleartext traffic permissions and use HTTPS only.

## Testing the Integration

### Prerequisites

1. **Backend Running**
   - Start the Spring Boot backend on port 8080
   - Ensure database is configured and running
   - Check backend logs to confirm it's listening

2. **Frontend Setup**
   - Install dependencies: `npm install`
   - Ensure Android emulator/device is connected

### Test Sign Up Flow

1. Open the app
2. Enter first name, last name, mobile number, and password
3. Tap "Verify mobile number"
4. Check backend logs for OTP (or see it in the alert in dev mode)
5. Enter the OTP code
6. Tap "Verify and Create Account"
7. User should be logged in and redirected to main app

### Test Login Flow

1. Open the app
2. Switch to "Sign In" tab
3. Enter mobile number and password
4. Tap "Continue"
5. User should be logged in and redirected to main app

### Troubleshooting

#### "Network request failed"
- Ensure backend is running on port 8080
- Check that Android emulator can reach your computer (use `10.0.2.2` for emulator)
- For physical device, verify IP address is correct
- Check firewall settings

#### "User with this phone already exists"
- Use a different phone number for testing
- Or delete the user from database

#### "OTP expired" or "Invalid OTP"
- OTP expires after 5 minutes
- Request a new OTP

#### "Max attempts exceeded"
- Maximum 5 attempts per OTP
- Request a new OTP

## Development Notes

### OTP in Development Mode

The backend returns the OTP in the response message for testing:
```
"OTP sent successfully to 1234567890 (for testing: 123456)"
```

The frontend extracts and displays this OTP automatically. In production, OTPs will be sent via SMS only.

### Current Limitations

1. **OTP-based Sign In**: Not yet implemented in backend. Users must use password for sign-in.
2. **Password Reset**: Not yet implemented in backend.
3. **Resend OTP**: Currently calls signup endpoint again (may create duplicate user if not handled properly).

### Future Enhancements

- Add OTP-based sign-in endpoint
- Add password reset functionality
- Add resend OTP endpoint
- Implement JWT token refresh
- Add API request interceptors for automatic token refresh
- Add request/response logging for debugging

## File Structure

```
Frontend/
├── src/
│   ├── services/
│   │   └── api.ts              # API service (HTTP client)
│   └── authentication/
│       ├── AuthContext.tsx     # Auth context provider
│       ├── UnifiedAuthScreen.tsx # Auth UI (updated for backend)
│       └── storage.ts          # Local storage utilities
└── android/
    └── app/
        └── src/
            └── main/
                ├── AndroidManifest.xml
                └── res/
                    └── xml/
                        └── network_security_config.xml
```

## Security Considerations

1. **Development**: HTTP is allowed for local development
2. **Production**: 
   - Use HTTPS only
   - Remove cleartext traffic permissions
   - Implement proper certificate pinning
   - Use secure token storage (consider using Keychain/Keystore)

3. **API Security**:
   - JWT tokens are stored securely using AsyncStorage
   - Tokens are included in Authorization header for authenticated requests
   - Backend validates tokens on protected endpoints

