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

/**
 * Group products by base product ID to avoid showing duplicates for products with variants
 * Returns an array where each product appears only once, with all variants merged
 */
export const groupProductsByBaseId = (products) => {
  if (!Array.isArray(products)) return [];
  
  const productMap = new Map();
  
  products.forEach(product => {
    const backend = product.product || {};
    const productId = product.id || backend.productsId;
    const variants = backend.variants || backend.productVariants || [];
    
    // If product already exists in map, merge variant information
    if (productMap.has(productId)) {
      const existing = productMap.get(productId);
      const existingVariants = existing.product?.variants || existing.product?.productVariants || [];
      
      // Merge variants (avoid duplicates by variantId)
      const variantMap = new Map();
      existingVariants.forEach(v => {
        const vid = v.variantId || v.id;
        if (vid) variantMap.set(vid, v);
      });
      variants.forEach(v => {
        const vid = v.variantId || v.id;
        if (vid && !variantMap.has(vid)) {
          variantMap.set(vid, v);
        }
      });
      
      const allVariants = Array.from(variantMap.values());
      
      // Update product with merged variants
      if (!existing.product) {
        existing.product = {};
      }
      existing.product.variants = allVariants;
      
      // Update price to show lowest price from all variants
      const activeVariants = allVariants.filter(v => v.isActive !== false && (v.stock || 0) > 0);
      if (activeVariants.length > 0) {
        const allPrices = activeVariants.map(v => v.sellingPrice || v.price || 0).filter(p => p > 0);
        const allMrps = activeVariants.map(v => v.mrp || v.originalPrice || 0).filter(p => p > 0);
        
        if (allPrices.length > 0) {
          existing.price = Math.min(...allPrices);
          existing.originalPrice = allMrps.length > 0 ? Math.max(...allMrps) : existing.price;
        }
      }
      
      // Update variant count
      existing.variantCount = allVariants.length;
    } else {
      // First time seeing this product, add it to map
      productMap.set(productId, {
        ...product,
        variantCount: variants.length,
        // Ensure product object has variants
        product: {
          ...backend,
          variants: variants.length > 0 ? variants : backend.variants || backend.productVariants || []
        }
      });
    }
  });
  
  // Convert map to array (now each product appears only once, with all variants)
  return Array.from(productMap.values());
};
