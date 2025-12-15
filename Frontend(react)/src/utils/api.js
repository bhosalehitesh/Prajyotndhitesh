/**
 * API Utility Functions
 * Handles all API calls with error handling and timeout
 */

import { API_CONFIG } from '../constants';

/**
 * Get backend URL based on current hostname
 */
export const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIG.BASE_URL;
  }
  
  return `${protocol}//${hostname}:8080/api`;
};

/**
 * Create a fetch request with timeout
 */
const fetchWithTimeout = (url, options = {}, timeout = API_CONFIG.TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `Server error: ${response.status} ${response.statusText}`,
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Generic API request function
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const API_BASE = getBackendUrl();
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetchWithTimeout(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phone) => {
  return apiRequest('/user/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
};

/**
 * Verify OTP
 */
export const verifyOTP = async (phone, code) => {
  return apiRequest('/user/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
};

/**
 * Get products
 */
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  return apiRequest(`/products/${id}`);
};

/**
 * Get categories
 */
export const getCategories = async () => {
  return apiRequest('/categories');
};

/**
 * Search products
 */
export const searchProducts = async (query) => {
  return apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
};

