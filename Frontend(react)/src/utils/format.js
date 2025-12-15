/**
 * Formatting Utility Functions
 */

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format price (alias for formatCurrency)
 */
export const formatPrice = formatCurrency;

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
 * Format date
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Transform backend Product model to frontend format
 * Maps: productsId, productName, sellingPrice, mrp, productCategory, productImages
 */
export const transformProduct = (backendProduct, storeName = 'Store') => {
  if (!backendProduct) return null;
  
  // Get first image from productImages array, or use fallback
  const getImage = () => {
    if (backendProduct.productImages && Array.isArray(backendProduct.productImages) && backendProduct.productImages.length > 0) {
      return backendProduct.productImages[0];
    }
    // Fallback to other possible image fields
    return backendProduct.productImageUrl || 
           backendProduct.imageUrl || 
           backendProduct.image || 
           null;
  };

  return {
    id: backendProduct.productsId || backendProduct.productId || backendProduct.id,
    name: backendProduct.productName || backendProduct.name || 'Product',
    price: backendProduct.sellingPrice || backendProduct.productPrice || backendProduct.price || 0,
    originalPrice: backendProduct.mrp || backendProduct.productOriginalPrice || backendProduct.originalPrice || backendProduct.sellingPrice || 0,
    image: getImage(),
    category: backendProduct.productCategory || backendProduct.businessCategory || backendProduct.category || 'CLOTHING',
    brand: backendProduct.brand || storeName,
    // Keep bestseller flag for UI badges (supports multiple backend key variants)
    isBestseller: backendProduct.isBestseller ?? backendProduct.bestSeller ?? backendProduct.bestseller ?? false,
    product: backendProduct // Keep full product object for detail page
  };
};

/**
 * Transform array of backend products
 */
export const transformProducts = (backendProducts, storeName = 'Store') => {
  if (!Array.isArray(backendProducts)) return [];
  return backendProducts.map(product => transformProduct(product, storeName)).filter(p => p !== null);
};
