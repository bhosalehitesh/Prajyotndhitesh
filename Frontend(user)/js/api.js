// ====== BACKEND API INTEGRATION ======
// This file contains all API functions to communicate with the Spring Boot backend

(function() {
  'use strict';

  // Ensure config.js is loaded first
  // Dynamic backend URL detection - use localhost for local development
  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    // For network IPs, use the same hostname with port 8080
    return `${protocol}//${hostname}:8080`;
  };
  
  const API_BASE = window.API_BASE || getBackendUrl();

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
   * Get store details by slug (public endpoint)
   */
  async function getStoreBySlug(slug) {
    // Try public endpoint first, fallback to old endpoint
    try {
      console.log('Calling API: /api/public/store/' + slug);
      const result = await apiCall(`/api/public/store/${slug}`);
      console.log('API response:', result);
      return result;
    } catch (e) {
      console.warn('Public endpoint failed, trying fallback:', e);
      // Fallback to old endpoint for backward compatibility
      try {
        return await apiCall(`/api/stores/slug/${slug}`);
      } catch (e2) {
        console.error('Both endpoints failed:', e2);
        throw e2;
      }
    }
  }
  
  /**
   * Get products for a store by slug (public endpoint)
   * @param {String} slug - Store slug
   * @param {String} [category] - Optional category filter
   */
  async function getStoreProductsBySlug(slug, category = null) {
    let endpoint = `/api/public/store/${slug}/products`;
    if (category) {
      endpoint += `?category=${encodeURIComponent(category)}`;
    }
    try {
      const result = await apiCall(endpoint);
      console.log('API call result:', result);
      // Ensure we return an array
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error in getStoreProductsBySlug:', error);
      // Return empty array on error instead of throwing
      return [];
    }
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
   * @param {Number} size - Page size (default: 8)
   */
  async function getProductsBySeller(sellerId, page = 0, size = 8) {
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
   * Get categories for a store by slug (public endpoint)
   * @param {String} slug - Store slug
   */
  async function getStoreCategoriesBySlug(slug) {
    try {
      console.log('Fetching categories for store slug:', slug);
      const result = await apiCall(`/api/public/store/${slug}/categories`);
      console.log('Categories API response:', result);
      if (Array.isArray(result)) {
        console.log(`Found ${result.length} categories for store ${slug}`);
        return result;
      }
      console.warn('API returned non-array result:', result);
      return [];
    } catch (error) {
      console.error('Error in getStoreCategoriesBySlug:', error);
      return [];
    }
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

  /**
   * Get products by category name
   * Searches products by productCategory or businessCategory
   */
  async function getProductsByCategory(categoryName) {
    try {
      // First try to get all products and filter by category
      const allProducts = await getAllProducts();
      if (!Array.isArray(allProducts)) {
        return [];
      }
      
      // Filter products by category name (case-insensitive)
      const categoryLower = categoryName.toLowerCase();
      const filtered = allProducts.filter(p => {
        const productCategory = (p.productCategory || '').toLowerCase();
        const businessCategory = (p.businessCategory || '').toLowerCase();
        const categoryName = (p.category?.categoryName || '').toLowerCase();
        
        return productCategory.includes(categoryLower) || 
               businessCategory.includes(categoryLower) ||
               categoryName.includes(categoryLower);
      });
      
      return filtered;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // ====== COLLECTION APIs ======
  
  /**
   * Get all collections
   */
  async function getAllCollections() {
    return await apiCall('/api/collection/allCollection');
  }

  /**
   * Get collection by ID
   */
  async function getCollectionById(collectionId) {
    return await apiCall(`/api/collection/${collectionId}`);
  }

  /**
   * Get products by collection name
   */
  async function getProductsByCollection(collectionName) {
    try {
      const collections = await getAllCollections();
      const collection = collections.find(c => 
        c.collectionName && c.collectionName.toLowerCase().includes(collectionName.toLowerCase())
      );
      
      if (collection && collection.products) {
        return Array.isArray(collection.products) ? collection.products : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching products by collection:', error);
      return [];
    }
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

  /**
   * Get orders for a seller
   * @param {Number} sellerId - Seller ID
   * @returns {Promise<Array>} List of orders containing products from this seller
   */
  async function getSellerOrders(sellerId) {
    return await apiCall(`/orders/seller/${sellerId}`);
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
    getStoreProductsBySlug,
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
    getProductsByCategory,
    getStoreCategoriesBySlug,
    
    // Collection APIs
    getAllCollections,
    getCollectionById,
    getProductsByCollection,
    
    // Order APIs
    placeOrder,
    getOrderById,
    getUserOrders,
    getSellerOrders,
    
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

