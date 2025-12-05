/**
 * API Configuration
 * 
 * This file manages the API base URL configuration.
 * 
 * For development:
 * - Use ADB reverse port forwarding (recommended): adb reverse tcp:8080 tcp:8080
 *   Then use: http://localhost:8080
 * - Or use your computer's IP address: http://YOUR_IP:8080
 *   Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
 * 
 * For production:
 * - Update the production URL below
 */

// Option 1: Use ADB reverse (recommended - works for emulator and USB-connected devices)
// Run: adb reverse tcp:8080 tcp:8080
export const API_BASE_URL_DEV = 'http://localhost:8080';

// Option 2: Use your computer's IP address (use this if ADB reverse doesn't work)
// Replace with your actual IP address (find it using: ipconfig on Windows)
// Example: export const API_BASE_URL_DEV_IP = 'http://192.168.1.100:8080';
// NOTE: This was last updated based on your current Wi‑Fi IPv4 address from `ipconfig`.
export const API_BASE_URL_DEV_IP = 'http://192.168.1.14:8080'; // Updated with your actual local IP

// Production URL
export const API_BASE_URL_PROD = 'https://your-production-api.com';

// Choose which dev URL to use
// Set to true to use IP address (more reliable), false to use localhost (requires ADB reverse)
export const USE_IP_ADDRESS = true; // Using IP address (more reliable - works even if ADB reverse disconnects)

