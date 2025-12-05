/**
 * API Configuration
 * 
 * This file manages the API base URL configuration.
 * 
 * DEFAULT: Uses localhost:8080 (works for all team members - no IP changes needed!)
 * - Just run: npm run setup-adb (or adb reverse tcp:8080 tcp:8080)
 * - No need to change IP address when pulling code
 * 
 * If you need to use IP address instead:
 * - Set USE_IP_ADDRESS = true below
 * - Update API_BASE_URL_DEV_IP with your IP (find it: ipconfig on Windows)
 */

// Use localhost (ADB reverse) - recommended, works for everyone
export const API_BASE_URL_DEV = 'http://localhost:8080';

// Use IP address (only if USE_IP_ADDRESS is true)
export const API_BASE_URL_DEV_IP = 'http://192.168.1.24:8080'; // Change this to your IP if needed

// Production URL
export const API_BASE_URL_PROD = 'https://your-production-api.com';

// Set to true to use IP address, false to use localhost (default)
export const USE_IP_ADDRESS = false; // Default: false (uses localhost - no IP conflicts!)

