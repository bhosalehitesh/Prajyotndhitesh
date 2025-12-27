/**
 * Utility Helper Functions
 * Reusable helper functions across the application
 */

/**
 * Format price with currency symbol
 */
export const formatPrice = (price, currency = '₹') => {
  if (!price && price !== 0) return '';
  return `${currency}${parseFloat(price).toLocaleString('en-IN')}`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Generate unique ID for items
 */
export const generateItemId = (name, size = 'default', color = 'default') => {
  return `${name}_${size}_${color}_${Date.now()}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get image placeholder
 */
export const getImagePlaceholder = (width = 300, height = 300) => {
  return `https://via.placeholder.com/${width}x${height}?text=No+Image`;
};

/**
 * Scroll to top
 */
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Generate store-aware route path
 * @param {string} route - Base route path (e.g., '/categories', '/products')
 * @param {string|null} storeSlug - Store slug if available
 * @returns {string} - Store-aware route path
 * 
 * Examples:
 * - getStoreRoute('/categories', 'mystore') => '/store/mystore/categories'
 * - getStoreRoute('/categories', null) => '/categories'
 * - getStoreRoute('/product/detail', 'mystore') => '/store/mystore/product/detail'
 */
export const getStoreRoute = (route, storeSlug) => {
  if (!storeSlug) {
    return route;
  }
  
  // Remove leading slash if present for consistency
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  
  // Return store-specific route
  return `/store/${storeSlug}/${cleanRoute}`;
};

/**
 * Get store slug from current URL path
 * @returns {string|null} - Store slug if found, null otherwise
 */
export const getSlugFromPath = () => {
  const path = window.location?.pathname || '';
  
  // Try /store/:slug pattern first (preferred)
  let match = path.match(/\/store\/([^/]+)/);
  if (match) return match[1];
  
  // Fallback: try /:slug pattern (but exclude known routes)
  match = path.match(/^\/([^/]+)/);
  if (match) {
    const firstSegment = match[1];
    const excludedRoutes = [
      'categories', 'featured', 'products', 'collections', 
      'cart', 'wishlist', 'orders', 'order-tracking', 'faq', 
      'search', 'product', 'checkout', 'store'
    ];
    if (!excludedRoutes.includes(firstSegment)) {
      return firstSegment;
    }
  }
  
  return null;
};

