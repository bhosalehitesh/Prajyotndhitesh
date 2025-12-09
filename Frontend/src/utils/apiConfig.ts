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
export const API_BASE_URL_DEV_IP = 'http://192.168.1.16:8080'; // Change this to your IP if needed

// Production URL
export const API_BASE_URL_PROD = 'https://your-production-api.com';

// Default: use localhost (requires ADB reverse port forwarding)
let USE_IP_ADDRESS_DEFAULT = false;
let API_BASE_URL_DEV_IP_OVERRIDE = API_BASE_URL_DEV_IP;

// Try to import local config (if it exists, it will override the defaults)
// Using dynamic import pattern that works with TypeScript
try {
  // @ts-ignore - Local config may not exist
  const localConfig = require('./apiConfig.local');
  if (localConfig && localConfig.USE_IP_ADDRESS !== undefined) {
    USE_IP_ADDRESS_DEFAULT = localConfig.USE_IP_ADDRESS;
  }
  if (localConfig && localConfig.API_BASE_URL_DEV_IP) {
    API_BASE_URL_DEV_IP_OVERRIDE = localConfig.API_BASE_URL_DEV_IP;
  }
} catch (e) {
  // Local config doesn't exist, use defaults - this is expected
}

// Export the values (local config overrides defaults if it exists)
export const USE_IP_ADDRESS = USE_IP_ADDRESS_DEFAULT;
export const API_BASE_URL_DEV_IP_FINAL = API_BASE_URL_DEV_IP_OVERRIDE;

