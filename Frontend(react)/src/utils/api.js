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
  
  // Always use localhost when running on same machine (browser on dev machine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIG.BASE_URL; // http://localhost:8080/api
  }
  
  // For remote access (mobile device, other devices on network):
  // Always connect to the backend server IP (where backend is actually running)
  // Update this IP if your backend server's IP changes
  const BACKEND_SERVER_IP = '192.168.1.34'; // Backend server IP - update if changed
  
  // If accessing frontend from any IP (including mobile), use backend server IP
  return `http://${BACKEND_SERVER_IP}:8080/api`;
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
  // Parse JSON response with error handling
  try {
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from server');
    }
    return JSON.parse(text);
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    console.error('Response text (first 500 chars):', (await response.text()).substring(0, 500));
    throw new Error(`Invalid JSON response from server: ${parseError.message}`);
  }
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
  return apiRequest(`/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  });
};

/**
 * Get user by phone number
 * @param {string} phone - Phone number
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} User data
 */
export const getUserByPhone = async (phone, token = null) => {
  return apiRequest(`/user/phone/${phone}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
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
// (Functions moved below to match backend API format)

// ==================== ORDER FUNCTIONS ====================

/**
 * Place an order from cart
 * @param {number} userId - User ID
 * @param {string} address - Shipping address
 * @param {number} mobile - Mobile number
 * @param {number} storeId - Store ID (optional, will be extracted from cart if not provided)
 * @param {number} sellerId - Seller ID (optional, will be extracted from cart if not provided)
 * @returns {Promise<Object>} Created order
 */
export const placeOrder = async (userId, address, mobile, storeId = null, sellerId = null) => {
  if (!userId || !address || !mobile) {
    throw new Error('userId, address, and mobile are required for placing orders');
  }
  
  const params = new URLSearchParams({
    userId: String(userId),
    address: address,
    mobile: String(mobile)
  });
  
  if (storeId) {
    params.append('storeId', String(storeId));
  }
  if (sellerId) {
    params.append('sellerId', String(sellerId));
  }
  
  // Backend endpoint is at /orders/place (not /api/orders/place)
  // So we need to call it directly without the /api prefix
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const baseUrl = (hostname === 'localhost' || hostname === '127.0.0.1') 
    ? 'http://localhost:8080' 
    : `${protocol}//${hostname}:8080`;
  
  const url = `${baseUrl}/orders/place?${params.toString()}`;
  console.log('Placing order at:', url);
  console.log('Order parameters:', { userId, address, mobile, storeId, sellerId });
  
  try {
    // Backend uses @RequestParam, so we send query parameters
    // Don't set Content-Type: application/json for query params
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      // No Content-Type header needed for query parameters
      // Spring will parse @RequestParam from query string
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = response.statusText || 'Unknown error';
      }
      
      console.error('Order placement failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url
      });
      
      // Parse error message from response
      let errorMessage = 'Failed to place order';
      let errorDetails = '';
      
      try {
        if (errorText) {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
          errorDetails = errorJson.details || errorJson.trace || '';
          
          // Log full error for debugging
          console.error('Backend error details:', {
            message: errorMessage,
            details: errorDetails,
            timestamp: errorJson.timestamp,
            path: errorJson.path
          });
        }
      } catch (e) {
        // If not JSON, use the text as is
        if (errorText && errorText.length > 0) {
          errorMessage = errorText.substring(0, 200); // Limit length
        }
      }
      
      // Provide user-friendly error messages
      if (response.status === 500) {
        // Check for specific error patterns
        if (errorMessage.includes('Cart not found') || errorMessage.includes('cart')) {
          throw new Error('Your cart is empty or not found. Please add items to cart and try again.');
        }
        if (errorMessage.includes('NullPointerException') || errorMessage.includes('null')) {
          throw new Error('Server error: Missing required data. Please try refreshing the page and placing the order again.');
        }
        if (errorMessage.includes('LazyInitializationException') || errorMessage.includes('could not initialize')) {
          throw new Error('Server error: Data loading issue. Please try again.');
        }
        
        // Show the actual error message from backend
        const userMessage = errorMessage.length > 100 
          ? errorMessage.substring(0, 100) + '...' 
          : errorMessage;
        throw new Error(`Server error: ${userMessage}. Please check backend logs for details.`);
      }
      
      throw new Error(errorMessage);
    }
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error in placeOrder:', error);
    
    // Handle connection errors
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on port 8080.');
    }
    
    // Re-throw with better message if it's already our custom error
    if (error.message && (error.message.includes('Cart not found') || error.message.includes('cart'))) {
      throw new Error('Your cart is empty. Please add items to cart before placing an order.');
    }
    throw error; // Re-throw the error as-is (it already has a good message)
  }
};

/**
 * Get order by ID (legacy function name, use getOrderById instead)
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrder = async (orderId) => {
  return apiRequest(`/orders/${orderId}`);
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
  
  console.log('updateUserAddress - Full URL:', url);
  console.log('updateUserAddress - Request body:', addressData);
  console.log('updateUserAddress - Has token:', !!token);
  
  return apiRequest(`/user/update-address/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify(addressData),
  });
};

/**
 * Update user address by phone number
 * @param {string} phone - Phone number
 * @param {object} addressData - Address data
 * @param {string} token - JWT token (optional)
 * @returns {Promise<Object>} Updated user
 */
export const updateUserAddressByPhone = async (phone, addressData, token = null) => {
  const API_BASE = getBackendUrl();
  const url = `${API_BASE}/user/update-address-by-phone/${phone}`;
  
  console.log('updateUserAddressByPhone - Full URL:', url);
  console.log('updateUserAddressByPhone - Phone:', phone);
  console.log('updateUserAddressByPhone - Address Data:', JSON.stringify(addressData, null, 2));
  console.log('updateUserAddressByPhone - Has token:', !!token);
  
  try {
    // Since endpoint is public, try with token first if available, but don't require it
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add Authorization header if token exists and is valid
    if (token && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const result = await apiRequest(`/user/update-address-by-phone/${phone}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(addressData),
    });
    console.log('updateUserAddressByPhone - Success:', result);
    return result;
  } catch (error) {
    // If 401 and we had a token, try again without token (endpoint is public)
    if (error.status === 401 && token) {
      console.warn('⚠️ Got 401 with token, retrying without token (endpoint is public)...');
      try {
        const result = await apiRequest(`/user/update-address-by-phone/${phone}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addressData),
        });
        console.log('✅ updateUserAddressByPhone - Success without token:', result);
        return result;
      } catch (retryError) {
        console.error('❌ updateUserAddressByPhone - Retry also failed:', retryError);
        throw retryError;
      }
    }
    
    console.error('updateUserAddressByPhone - Error:', error);
    console.error('updateUserAddressByPhone - Error URL:', url);
    console.error('updateUserAddressByPhone - Error details:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });
    throw error;
  }
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

// ==================== CART FUNCTIONS ====================

/**
 * Get user's cart
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Cart object with items
 */
export const getCart = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  return apiRequest(`/cart/${userId}`);
};

/**
 * Add variant to cart (SmartBiz: preferred method)
 * @param {number} userId - User ID
 * @param {number} variantId - Variant ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} Updated cart
 */
export const addVariantToCartAPI = async (userId, variantId, quantity = 1) => {
  if (!userId || !variantId) throw new Error('User ID and Variant ID are required');
  const params = new URLSearchParams({
    userId: String(userId),
    variantId: String(variantId),
    quantity: String(quantity)
  });
  return apiRequest(`/cart/add-variant?${params.toString()}`, {
    method: 'POST'
  });
};

/**
 * Add product to cart (LEGACY - auto-selects first variant)
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} Updated cart
 */
export const addToCartAPI = async (userId, productId, quantity = 1) => {
  if (!userId || !productId) throw new Error('User ID and Product ID are required');
  const params = new URLSearchParams({
    userId: String(userId),
    productId: String(productId),
    quantity: String(quantity)
  });
  return apiRequest(`/cart/add?${params.toString()}`, {
    method: 'POST'
  });
};

/**
 * Update variant quantity in cart (SmartBiz: preferred method)
 * @param {number} userId - User ID
 * @param {number} variantId - Variant ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart
 */
export const updateVariantCartQuantity = async (userId, variantId, quantity) => {
  if (!userId || !variantId) throw new Error('User ID and Variant ID are required');
  const params = new URLSearchParams({
    userId: String(userId),
    variantId: String(variantId),
    quantity: String(quantity)
  });
  return apiRequest(`/cart/update-variant?${params.toString()}`, {
    method: 'PUT'
  });
};

/**
 * Update cart item quantity (LEGACY - updates first variant of product)
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart
 */
export const updateCartQuantity = async (userId, productId, quantity) => {
  if (!userId || !productId) throw new Error('User ID and Product ID are required');
  const params = new URLSearchParams({
    userId: String(userId),
    productId: String(productId),
    quantity: String(quantity)
  });
  return apiRequest(`/cart/update?${params.toString()}`, {
    method: 'PUT'
  });
};

/**
 * Remove variant from cart (SmartBiz: preferred method)
 * @param {number} userId - User ID
 * @param {number} variantId - Variant ID
 * @returns {Promise<Object>} Updated cart
 */
export const removeVariantFromCartAPI = async (userId, variantId) => {
  if (!userId || !variantId) throw new Error('User ID and Variant ID are required');
  const params = new URLSearchParams({
    userId: String(userId),
    variantId: String(variantId)
  });
  return apiRequest(`/cart/remove-variant?${params.toString()}`, {
    method: 'DELETE'
  });
};

/**
 * Remove product from cart (LEGACY - removes all variants of product)
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Updated cart
 */
export const removeFromCartAPI = async (userId, productId) => {
  if (!userId || !productId) throw new Error('User ID and Product ID are required');
  const params = new URLSearchParams({
    userId: String(userId),
    productId: String(productId)
  });
  return apiRequest(`/cart/remove?${params.toString()}`, {
    method: 'DELETE'
  });
};

/**
 * Clear user's cart
 * @param {number} userId - User ID
 * @returns {Promise<string>} Success message
 */
export const clearCartAPI = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  return apiRequest(`/cart/clear/${userId}`, {
    method: 'DELETE'
  });
};

// ==================== WISHLIST FUNCTIONS ====================

/**
 * Get user's wishlist
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of wishlist items
 */
export const getWishlist = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  return apiRequest(`/wishlist/all/${userId}`);
};

/**
 * Add product to wishlist
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Wishlist item
 */
export const addToWishlistAPI = async (userId, productId) => {
  if (!userId || !productId) throw new Error('User ID and Product ID are required');
  return apiRequest(`/wishlist/add/${userId}/${productId}`, {
    method: 'POST'
  });
};

/**
 * Remove product from wishlist
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise<string>} Success message
 */
export const removeFromWishlistAPI = async (userId, productId) => {
  if (!userId || !productId) throw new Error('User ID and Product ID are required');
  return apiRequest(`/wishlist/remove/${userId}/${productId}`, {
    method: 'DELETE'
  });
};

// ==================== ORDER FUNCTIONS ====================

/**
 * Get user's orders
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of orders
 */
export const getUserOrders = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  return apiRequest(`/orders/user/${userId}`);
};

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required');
  return apiRequest(`/orders/${orderId}`);
};

/**
 * Get orders for a seller (for seller app)
 * @param {number} sellerId - Seller ID
 * @returns {Promise<Array>} Array of orders for this seller
 */
export const getSellerOrders = async (sellerId) => {
  if (!sellerId) throw new Error('Seller ID is required');
  return apiRequest(`/orders/seller/${sellerId}`);
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New order status (PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  if (!orderId || !status) throw new Error('Order ID and status are required');
  const params = new URLSearchParams({ status });
  return apiRequest(`/orders/update-status/${orderId}?${params.toString()}`, {
    method: 'PUT'
  });
};

