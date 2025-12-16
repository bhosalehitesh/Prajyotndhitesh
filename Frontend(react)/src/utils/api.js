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
    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        if (text) errorMessage = text.substring(0, 200);
      } catch (e2) {
        // Keep default error message
      }
    }
    
    // Add status code to error for better debugging
    const error = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;
    throw error;
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
 * Get user by ID
 * @param {number} userId - User ID
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId, token = null) => {
  const API_BASE = getBackendUrl();
  const url = `${API_BASE}/user/${userId}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Get products
 */
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get banners for a store by slug (public endpoint)
 */
export const getStoreBanners = async (slug, activeOnly = true) => {
  if (!slug) return [];
  return apiRequest(`/public/store/${encodeURIComponent(slug)}/banners?activeOnly=${activeOnly}`);
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

// ==================== STORE-RELATED FUNCTIONS (SELLER-WISE) ====================

/**
 * Get store details by slug
 * @param {string} storeSlug - Store slug (e.g., 'brownn_boys')
 * @returns {Promise<Object>} Store details with store_id, seller_id, etc.
 */
export const getStoreBySlug = async (storeSlug) => {
  if (!storeSlug || storeSlug.trim() === '') {
    throw new Error('Store slug is required');
  }
  
  // Normalize slug (backend does this too, but let's be consistent)
  const normalizedSlug = storeSlug.trim();
  console.log('📡 [API] Fetching store for slug:', normalizedSlug);
  
  try {
    const store = await apiRequest(`/public/store/${encodeURIComponent(normalizedSlug)}`);
    console.log('✅ [API] Store fetched successfully:', store?.storeName || store?.name);
    return store;
  } catch (error) {
    console.error('❌ [API] Error fetching store:', {
      slug: normalizedSlug,
      error: error.message,
      status: error.status
    });
    throw error;
  }
};

/**
 * Get products for a specific store by slug
 * @param {string} storeSlug - Store slug
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of products
 */
export const getStoreProducts = async (storeSlug, category = null) => {
  let endpoint = `/public/store/${encodeURIComponent(storeSlug)}/products`;
  if (category) {
    endpoint += `?category=${encodeURIComponent(category)}`;
  }
  return apiRequest(endpoint);
};

/**
 * Get featured (bestseller) products for a store by slug
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Array>} Array of featured products
 */
export const getStoreFeatured = async (storeSlug) => {
  if (!storeSlug || storeSlug.trim() === '') {
    throw new Error('Store slug is required');
  }
  const normalizedSlug = storeSlug.trim();
  const endpoint = `/public/store/${encodeURIComponent(normalizedSlug)}/featured`;
  const API_BASE = getBackendUrl();
  const fullUrl = `${API_BASE}${endpoint}`;
  
  console.log('📡 [API] Fetching featured products:', {
    slug: normalizedSlug,
    endpoint: endpoint,
    fullUrl: fullUrl
  });
  
  try {
    const products = await apiRequest(endpoint);
    console.log('✅ [API] Featured products fetched:', {
      isArray: Array.isArray(products),
      count: Array.isArray(products) ? products.length : 0,
      sample: Array.isArray(products) && products.length > 0 ? products[0] : null
    });
    return products;
  } catch (error) {
    console.error('❌ [API] Error fetching featured products:', {
      slug: normalizedSlug,
      error: error.message,
      status: error.status,
      url: fullUrl
    });
    throw error;
  }
};

/**
 * Get categories for a specific store by slug
 * @param {string} storeSlug - Store slug
 * @returns {Promise<Array>} Array of categories
 */
export const getStoreCategories = async (storeSlug) => {
  if (!storeSlug || storeSlug.trim() === '') {
    throw new Error('Store slug is required');
  }
  const normalizedSlug = storeSlug.trim();
  const endpoint = `/public/store/${encodeURIComponent(normalizedSlug)}/categories`;
  const API_BASE = getBackendUrl();
  const fullUrl = `${API_BASE}${endpoint}`;
  
  console.log('📡 [API] Fetching store categories:', {
    slug: normalizedSlug,
    endpoint: endpoint,
    fullUrl: fullUrl
  });
  
  try {
    const categories = await apiRequest(endpoint);
    console.log('✅ [API] Store categories fetched:', {
      isArray: Array.isArray(categories),
      count: Array.isArray(categories) ? categories.length : 0,
      sample: Array.isArray(categories) && categories.length > 0 ? categories[0] : null
    });
    return categories;
  } catch (error) {
    console.error('❌ [API] Error fetching store categories:', {
      slug: normalizedSlug,
      error: error.message,
      status: error.status,
      url: fullUrl
    });
    throw error;
  }
};

// ==================== CART FUNCTIONS ====================

/**
 * Get user's cart from backend
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of cart items
 */
export const getCart = async (userId) => {
  return apiRequest(`/cart/${userId}`);
};

/**
 * Add item to cart (backend)
 * @param {object} cartItem - Cart item data { userId, productId, quantity, ... }
 * @returns {Promise<Object>} Updated cart item
 */
export const addToCartAPI = async (cartItem) => {
  return apiRequest('/cart/add', {
    method: 'POST',
    body: JSON.stringify(cartItem),
  });
};

/**
 * Update cart item (backend)
 * @param {object} cartItem - Updated cart item data
 * @returns {Promise<Object>} Updated cart item
 */
export const updateCartAPI = async (cartItem) => {
  return apiRequest('/cart/update', {
    method: 'PUT',
    body: JSON.stringify(cartItem),
  });
};

/**
 * Remove item from cart (backend)
 * @param {object} cartItem - Cart item to remove { userId, productId }
 * @returns {Promise<void>}
 */
export const removeFromCartAPI = async (cartItem) => {
  return apiRequest('/cart/remove', {
    method: 'DELETE',
    body: JSON.stringify(cartItem),
  });
};

/**
 * Clear user's cart (backend)
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
export const clearCartAPI = async (userId) => {
  return apiRequest(`/cart/clear/${userId}`, {
    method: 'DELETE',
  });
};

// ==================== WISHLIST FUNCTIONS ====================

/**
 * Get user's wishlist from backend
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of wishlist items
 */
export const getWishlist = async (userId) => {
  return apiRequest(`/wishlist/all/${userId}`);
};

/**
 * Add product to wishlist (backend)
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Wishlist item
 */
export const addToWishlistAPI = async (userId, productId) => {
  return apiRequest(`/wishlist/add/${userId}/${productId}`, {
    method: 'POST',
  });
};

/**
 * Remove product from wishlist (backend)
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<void>}
 */
export const removeFromWishlistAPI = async (userId, productId) => {
  return apiRequest(`/wishlist/remove/${userId}/${productId}`, {
    method: 'DELETE',
  });
};

/**
 * Move wishlist item to cart (backend)
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Cart item
 */
export const moveWishlistToCartAPI = async (userId, productId) => {
  return apiRequest(`/wishlist/move-to-cart/${userId}/${productId}`, {
    method: 'POST',
  });
};

// ==================== ORDER FUNCTIONS ====================

/**
 * Place an order (MUST include store_id and seller_id)
 * @param {object} orderData - Order data { 
 *   userId, 
 *   storeId,      // REQUIRED: Store ID
 *   sellerId,    // REQUIRED: Seller ID
 *   items, 
 *   totalAmount, 
 *   shippingAddress, 
 *   ... 
 * }
 * @returns {Promise<Object>} Created order
 */
export const placeOrder = async (orderData) => {
  // Validate required fields
  if (!orderData.storeId || !orderData.sellerId) {
    throw new Error('storeId and sellerId are required for placing orders');
  }
  
  return apiRequest('/orders/place', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrder = async (orderId) => {
  return apiRequest(`/orders/${orderId}`);
};

/**
 * Get user's orders
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of orders
 */
export const getUserOrders = async (userId) => {
  return apiRequest(`/orders/user/${userId}`);
};

/**
 * Update user address
 * @param {number} userId - User ID
 * @param {object} addressData - Address data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Updated user
 */
export const updateUserAddress = async (userId, addressData, token) => {
  const API_BASE = getBackendUrl();
  const url = `${API_BASE}/user/update-address/${userId}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(addressData),
  });
  
  if (!response.ok) {
    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch (e) {
      try {
        const text = await response.text();
        if (text) errorMessage = text.substring(0, 200);
      } catch (e2) {
        // Keep default error message
      }
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  return apiRequest(`/orders/update-status/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// ==================== PAYMENT FUNCTIONS ====================

/**
 * Create payment
 * @param {object} paymentData - Payment data
 * @returns {Promise<Object>} Payment details
 */
export const createPayment = async (paymentData) => {
  return apiRequest('/payment/create', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

/**
 * Create Razorpay order
 * @param {object} orderData - Order data for Razorpay { amount, currency, ... }
 * @returns {Promise<Object>} Razorpay order details
 */
export const createRazorpayOrder = async (orderData) => {
  return apiRequest('/payment/create-razorpay-order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Capture payment
 * @param {object} paymentData - Payment capture data { paymentId, ... }
 * @returns {Promise<Object>} Payment confirmation
 */
export const capturePayment = async (paymentData) => {
  return apiRequest('/payment/capture', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// ==================== PINCODE FUNCTIONS ====================

/**
 * Validate pincode
 * @param {string} pincode - Pincode to validate
 * @returns {Promise<Object>} Pincode validation result
 */
export const validatePincode = async (pincode) => {
  return apiRequest(`/pincode/validate?pincode=${encodeURIComponent(pincode)}`);
};

/**
 * Get pincode details
 * @param {string} pincode - Pincode
 * @returns {Promise<Object>} Pincode details (state, district, city)
 */
export const getPincodeDetails = async (pincode) => {
  return apiRequest(`/pincode/${encodeURIComponent(pincode)}`);
};

