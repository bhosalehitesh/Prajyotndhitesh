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
 * - Create apiConfig.local.ts (gitignored) with your IP settings
 * - Or run: npm run setup-local-ip (auto-detects your IP)
 */

// Use localhost (ADB reverse) - recommended, works for everyone
export const API_BASE_URL_DEV = 'http://localhost:8080';

// Use IP address (only if USE_IP_ADDRESS is true)
// Updated to current machine IP: 192.168.1.59
export const API_BASE_URL_DEV_IP = 'http://192.168.1.59:8080'; // Current IP address

// Production URL
export const API_BASE_URL_PROD = 'https://your-production-api.com';

// Default: use IP address for mobile/emulator (set true to use IP, false for localhost with ADB reverse)
let USE_IP_ADDRESS_DEFAULT = true; // Using IP address since localhost isn't working
let API_BASE_URL_DEV_IP_OVERRIDE = API_BASE_URL_DEV_IP;

// Try to import local config (if it exists, it will override the defaults)
// Using dynamic import pattern that works with TypeScript
try {
  // @ts-ignore - Local config may not exist
  const localConfig = require('./apiConfig.local');
  console.log('📱 Local API config loaded:', localConfig);
  if (localConfig && localConfig.USE_IP_ADDRESS !== undefined) {
    USE_IP_ADDRESS_DEFAULT = localConfig.USE_IP_ADDRESS;
    console.log('✅ USE_IP_ADDRESS set to:', USE_IP_ADDRESS_DEFAULT);
  }
  if (localConfig && localConfig.API_BASE_URL_DEV_IP) {
    API_BASE_URL_DEV_IP_OVERRIDE = localConfig.API_BASE_URL_DEV_IP;
    console.log('✅ API_BASE_URL_DEV_IP set to:', API_BASE_URL_DEV_IP_OVERRIDE);
  }
} catch (e) {
  // Local config doesn't exist, use defaults - this is expected
  console.log('ℹ️ No local API config found, using defaults');
}

// Export the values (local config overrides defaults if it exists)
export const USE_IP_ADDRESS = USE_IP_ADDRESS_DEFAULT;
export const API_BASE_URL_DEV_IP_FINAL = API_BASE_URL_DEV_IP_OVERRIDE;

// Log the final configuration for debugging
console.log('🔧 [API Config] Final settings:', {
  USE_IP_ADDRESS,
  API_BASE_URL_DEV,
  API_BASE_URL_DEV_IP_FINAL,
  willUse: USE_IP_ADDRESS ? API_BASE_URL_DEV_IP_FINAL : API_BASE_URL_DEV
});

