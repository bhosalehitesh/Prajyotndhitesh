// ====== API CONFIGURATION ======
// This file manages the backend API URL for development and production

(function() {
  'use strict';

  // Detect environment
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDevelopment = hostname.includes('192.168.') || isLocalhost;

  // API Configuration
  const CONFIG = {
    // Development: Use localhost when website is on localhost, otherwise use IP
    DEV_API_BASE_LOCALHOST: 'http://localhost:8080',
    DEV_API_BASE_NETWORK: 'http://192.168.1.38:8080',
    
    // Production: Update this with your actual domain
    PROD_API_BASE: 'https://api.yourdomain.com', // Change this to your production API URL
    
    // Current environment
    isDevelopment: isDevelopment,
    
    // Get the appropriate API base URL
    getApiBase: function() {
      if (this.isDevelopment) {
        // If website is on localhost, use localhost for backend too
        if (isLocalhost) {
          return this.DEV_API_BASE_LOCALHOST;
        } else {
          return this.DEV_API_BASE_NETWORK;
        }
      } else {
        return this.PROD_API_BASE;
      }
    }
  };

  // Set global API_BASE for backward compatibility
  window.API_BASE = CONFIG.getApiBase();
  window.API_CONFIG = CONFIG;

  // Log configuration (only in development)
  if (CONFIG.isDevelopment) {
    console.log('🔧 API Configuration:', {
      environment: CONFIG.isDevelopment ? 'Development' : 'Production',
      apiBase: window.API_BASE
    });
  }

})();

