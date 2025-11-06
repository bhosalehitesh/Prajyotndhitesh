/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import { Platform } from 'react-native';
import { API_BASE_URL_DEV, API_BASE_URL_DEV_IP, API_BASE_URL_PROD, USE_IP_ADDRESS } from './apiConfig';

// Determine the API base URL based on environment and configuration
const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return API_BASE_URL_PROD;
  }

  // In development, use the configured URL
  if (USE_IP_ADDRESS) {
    return API_BASE_URL_DEV_IP;
  }

  // Default to localhost (requires ADB reverse port forwarding)
  return API_BASE_URL_DEV;
};

const API_BASE_URL = getApiBaseUrl();

interface SignupRequest {
  fullName: string;
  phone: string;
  password: string;
}

interface VerifyOtpRequest {
  phone: string;
  code: string;
}

interface LoginRequest {
  phone: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  phone: string;
}

/**
 * Sign up a new user
 * @param data Signup data
 * @returns Promise with OTP code (for testing)
 */
export const signup = async (data: SignupRequest): Promise<string> => {
  const url = `${API_BASE_URL}/api/auth/signup`;
  console.log('Signup attempt:', { url, phone: data.phone, platform: Platform.OS });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Signup response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Signup error response:', errorText);
      throw new Error(errorText || 'Signup failed');
    }

    const result = await response.text();
    console.log('Signup success response:', result);
    // Extract OTP from response message for testing
    const otpMatch = result.match(/\(for testing: (\d+)\)/);
    return otpMatch ? otpMatch[1] : '';
  } catch (error) {
    console.error('Signup exception:', error);
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        if (USE_IP_ADDRESS) {
          throw new Error(
            `Cannot connect to server at ${url}.\n\n` +
            `Troubleshooting:\n` +
            `1. Ensure backend is running: cd Backend/store && mvn spring-boot:run\n` +
            `2. Check your IP address is correct in src/utils/apiConfig.ts\n` +
            `3. Ensure phone and computer are on the same WiFi network\n` +
            `4. Check Windows Firewall allows port 8080\n` +
            `5. Try using ADB reverse instead: adb reverse tcp:8080 tcp:8080\n`
          );
        } else {
          throw new Error(
            `Cannot connect to server at ${url}.\n\n` +
            `Troubleshooting:\n` +
            `1. Setup ADB reverse: adb reverse tcp:8080 tcp:8080\n` +
            `2. Ensure backend is running: cd Backend/store && mvn spring-boot:run\n` +
            `3. Verify device is connected: adb devices\n` +
            `4. If ADB reverse doesn't work, use IP address in src/utils/apiConfig.ts\n`
          );
        }
      }
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Verify OTP code
 * @param data OTP verification data
 * @returns Promise<void>
 */
export const verifyOtp = async (data: VerifyOtpRequest): Promise<void> => {
  const url = `${API_BASE_URL}/api/auth/verify-otp`;
  console.log('Verify OTP attempt:', { url, phone: data.phone });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Verify OTP response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Verify OTP error response:', errorText);
      throw new Error(errorText || 'OTP verification failed');
    }
    
    console.log('OTP verified successfully');
  } catch (error) {
    console.error('Verify OTP exception:', error);
    if (error instanceof Error) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        if (USE_IP_ADDRESS) {
          throw new Error(`Cannot connect to server at ${url}. Check backend is running and IP is correct in apiConfig.ts`);
        } else {
          throw new Error(`Cannot connect to server at ${url}. Run: adb reverse tcp:8080 tcp:8080`);
        }
      }
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Login user
 * @param data Login credentials
 * @returns Promise with AuthResponse containing token and user info
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const url = `${API_BASE_URL}/api/auth/login`;
    console.log('Login attempt:', { url, phone: data.phone });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error response:', errorText);
      throw new Error(errorText || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    console.log('Login success:', { userId: result.userId, phone: result.phone });
    return result;
  } catch (error) {
    console.error('Login exception:', error);
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        if (USE_IP_ADDRESS) {
          throw new Error('Cannot connect to server. Check backend is running and IP is correct in apiConfig.ts');
        } else {
          throw new Error('Cannot connect to server. Run: adb reverse tcp:8080 tcp:8080');
        }
      }
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};





