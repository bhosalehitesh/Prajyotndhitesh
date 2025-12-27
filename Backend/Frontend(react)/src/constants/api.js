/**
 * API Configuration Constants
 * Centralized API endpoints and configuration
 */

export const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }
  
  return `${protocol}//${hostname}:8080/api`;
};

export const API_ENDPOINTS = {
  USER: {
    SEND_OTP: '/user/send-otp',
    VERIFY_OTP: '/user/verify-otp',
  },
  STORES: {
    // Public store endpoints (correct endpoints)
    BY_SLUG: (slug) => `/public/store/${encodeURIComponent(slug)}`,
    PRODUCTS: (slug) => `/public/store/${encodeURIComponent(slug)}/products`,
    CATEGORIES: (slug) => `/public/store/${encodeURIComponent(slug)}/categories`,
    FEATURED: (slug) => `/public/store/${encodeURIComponent(slug)}/featured`,
    BANNERS: (slug) => `/public/store/${encodeURIComponent(slug)}/banners`,
    // Legacy endpoints (fallback)
    BY_QUERY: (slug) => `/stores?slug=${encodeURIComponent(slug)}`,
    BY_ID: (slug) => `/stores/slug/${encodeURIComponent(slug)}`,
  },
};

export const API_BASE = getBackendUrl();
