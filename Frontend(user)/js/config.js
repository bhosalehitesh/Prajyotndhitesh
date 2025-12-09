// ====== API CONFIGURATION ======
// This file manages the backend API URL for development and production

(function() {
  'use strict';

  // Detect environment
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDevelopment = hostname.includes('192.168.') || isLocalhost;

  // Dynamic backend URL detection
  const getBackendUrl = () => {
    const protocol = window.location.protocol;
    if (isLocalhost) {
      return 'http://localhost:8080';
    }
    // For network IPs, use the same hostname with port 8080
    return `${protocol}//${hostname}:8080`;
  };

  // API Configuration
  const CONFIG = {
    // Development: Use localhost when website is on localhost, otherwise use same hostname
    DEV_API_BASE_LOCALHOST: 'http://localhost:8080',
    
    // Production: Update this with your actual domain
    PROD_API_BASE: 'https://api.yourdomain.com', // Change this to your production API URL
    
    // Current environment
    isDevelopment: isDevelopment,
    
    // Get the appropriate API base URL
    getApiBase: function() {
      if (this.isDevelopment) {
        // Dynamically detect backend URL based on current hostname
        return getBackendUrl();
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

