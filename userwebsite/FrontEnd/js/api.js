// ====== BACKEND API INTEGRATION ======
// This file contains all API functions to communicate with the Spring Boot backend

(function() {
  'use strict';

  // Ensure config.js is loaded first
  const API_BASE = window.API_BASE || 'http://192.168.1.38:8080';

  // ====== API HELPER FUNCTIONS ======
  
  /**
   * Generic fetch function with error handling
   */
  async function apiCall(endpoint, options = {}) {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  }

  // ====== STORE APIs ======
  
  /**
   * Get store details by store ID
   */
  async function getStoreById(storeId) {
    return await apiCall(`/api/stores/${storeId}`);
  }

  /**
   * Get store details by seller ID
   */
  async function getStoreBySellerId(sellerId) {
    return await apiCall(`/api/stores/seller?sellerId=${sellerId}`);
  }

  /**
   * Get store details by slug
   */
  async function getStoreBySlug(slug) {
    return await apiCall(`/api/stores/slug/${slug}`);
  }

  /**
   * Get all stores
   */
  async function getAllStores() {
    return await apiCall('/api/stores/allStores');
  }

  // ====== PRODUCT APIs ======
  
  /**
   * Get all products
   */
  async function getAllProducts() {
    return await apiCall('/api/products/allProduct');
  }

  /**
   * Get products by seller ID
   * @param {Number} sellerId - Seller ID
   * @param {Number} page - Page number (0-indexed, default: 0)
   * @param {Number} size - Page size (default: 20)
   */
  async function getProductsBySeller(sellerId, page = 0, size = 20) {
    const params = new URLSearchParams({
      sellerId: sellerId,
      page: page,
      size: size
    });
    return await apiCall(`/api/products/sellerProducts?${params.toString()}`);
  }
  
  /**
   * Get products by seller ID (all products - for backward compatibility)
   */
  async function getAllProductsBySeller(sellerId) {
    return await apiCall(`/api/products/sellerProducts?sellerId=${sellerId}`);
  }

  /**
   * Get product by ID
   */
  async function getProductById(productId) {
    return await apiCall(`/api/products/${productId}`);
  }

  /**
   * Search products by name
   */
  async function searchProductsByName(productName) {
    return await apiCall(`/api/products/Find By Product Name?name=${encodeURIComponent(productName)}`);
  }

  // ====== CATEGORY APIs ======
  
  /**
   * Get all categories
   */
  async function getAllCategories() {
    return await apiCall('/api/category/allCategory');
  }

  /**
   * Get category by ID
   */
  async function getCategoryById(categoryId) {
    return await apiCall(`/api/category/${categoryId}`);
  }

  /**
   * Get categories by business category
   */
  async function getCategoriesByBusiness(businessCategory) {
    return await apiCall(`/api/category/FindByBusinessCategory?businessCategory=${encodeURIComponent(businessCategory)}`);
  }

  // ====== ORDER APIs ======
  
  /**
   * Place an order from cart
   * @param {Object} orderData - { userId, address, mobile, items }
   */
  async function placeOrder(orderData) {
    // Note: Backend expects userId, address, mobile as query params
    // Cart items should be in user's cart in backend
    const params = new URLSearchParams({
      userId: orderData.userId,
      address: orderData.address,
      mobile: orderData.mobile
    });
    
    return await apiCall(`/orders/place?${params.toString()}`, {
      method: 'POST'
    });
  }

  /**
   * Get order by ID
   */
  async function getOrderById(orderId) {
    return await apiCall(`/orders/${orderId}`);
  }

  /**
   * Get all orders for a user
   */
  async function getUserOrders(userId) {
    return await apiCall(`/orders/user/${userId}`);
  }

  // ====== USER/CUSTOMER APIs ======
  
  /**
   * Send OTP to phone number
   */
  async function sendOTP(phoneNumber) {
    return await apiCall('/api/user/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber })
    });
  }

  /**
   * Verify OTP
   */
  async function verifyOTP(phoneNumber, otp) {
    return await apiCall('/api/user/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber, otp: otp })
    });
  }

  // ====== EXPORT API FUNCTIONS ======
  
  window.API = {
    // Store APIs
    getStoreById,
    getStoreBySellerId,
    getStoreBySlug,
    getAllStores,
    
    // Product APIs
    getAllProducts,
    getProductsBySeller,
    getAllProductsBySeller,
    getProductById,
    searchProductsByName,
    
    // Category APIs
    getAllCategories,
    getCategoryById,
    getCategoriesByBusiness,
    
    // Order APIs
    placeOrder,
    getOrderById,
    getUserOrders,
    
    // User APIs
    sendOTP,
    verifyOTP,
    
    // Utility
    apiCall,
    API_BASE
  };

  // Log API initialization
  console.log('✅ API Integration loaded. Base URL:', API_BASE);

})();

