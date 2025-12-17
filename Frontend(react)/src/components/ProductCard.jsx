import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useStore } from '../contexts/StoreContext';
import { formatPrice, calculateDiscount } from '../utils/format';
import Card from './ui/Card';

/**
 * Product Card Component
 */
const ProductCard = ({ product, showQuickAdd = true }) => {
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { currentStore, storeSlug } = useStore();

  const [slideIndex, setSlideIndex] = useState(0);
  const slideIntervalRef = useRef(null);

  const handleProductClick = () => {
    // Derive slug from context, storeLink, or current URL to ensure store-scoped routing
    // Priority: storeSlug (from context) > slug from URL > slug from storeLink
    const slugFromStoreLink = currentStore?.storeLink
      ? currentStore.storeLink.split('/').filter(Boolean).pop()
      : null;
    const slugFromUrl = (() => {
      const path = window.location?.pathname || '';
      // Try /store/:slug pattern first
      let match = path.match(/\/store\/([^/]+)/);
      if (match) return match[1];
      // Fallback: try /:slug pattern (but exclude known routes)
      match = path.match(/^\/([^/]+)/);
      if (match) {
        const firstSegment = match[1];
        const excludedRoutes = ['categories', 'featured', 'products', 'collections', 'cart', 'wishlist', 'orders', 'order-tracking', 'faq', 'search', 'product', 'checkout'];
        if (!excludedRoutes.includes(firstSegment)) {
          return firstSegment;
        }
      }
      return null;
    })();
    
    const slugToUse = storeSlug || slugFromUrl || slugFromStoreLink;
    
    console.log('🛍️ [ProductCard] Navigation:', {
      storeSlug,
      slugFromUrl,
      slugFromStoreLink,
      slugToUse,
      currentPath: window.location?.pathname
    });

    // Keep minimal params for faster load; include name/price/image as fallback
    const params = new URLSearchParams({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      brand: product.brand || currentStore?.name || 'Store',
      category: product.category
    });

    // ALWAYS use /store/:slug/product/detail pattern if we have a slug
    // This ensures consistent routing
    const detailPath = slugToUse
      ? `/store/${slugToUse}/product/detail`
      : '/product/detail';

    console.log('🛍️ [ProductCard] Navigating to:', detailPath);
    navigate(`${detailPath}?${params.toString()}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default behavior
    
    // Immediately remove/add - function handles optimistic updates
    if (isInWishlist(product.id)) {
      // Remove immediately - state updates synchronously
      removeFromWishlist(product.id);
    } else {
      // Add immediately - state updates synchronously
      addToWishlist({
        ...product,
        id: product.id || `${product.name}_${Date.now()}`,
        sellerId: currentStore?.sellerId, // Include sellerId for filtering
      });
    }
  };

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const images = useMemo(() => {
    const rawImages = Array.isArray(product?.product?.productImages)
      ? product.product.productImages
      : [];

    const candidates = [product?.image, ...rawImages].filter(Boolean);
    const unique = [];
    const seen = new Set();
    for (const src of candidates) {
      const key = String(src);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(src);
      if (unique.length >= 8) break;
    }
    return unique;
  }, [product]);

  const stopImageSlide = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
    setSlideIndex(0);
  };

  const startImageSlide = () => {
    if (!images || images.length <= 1) return;
    if (slideIntervalRef.current) return;
    slideIntervalRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % images.length);
    }, 1100);
  };

  useEffect(() => {
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card
      className="product-card"
      hover
      onClick={handleProductClick}
      onMouseEnter={startImageSlide}
      onMouseLeave={stopImageSlide}
    >
      <div className="product-card-image-wrapper">
        {product.isBestseller && (
          <div
            className="product-badge bestseller"
            style={{ position: 'absolute', top: '14px', left: '14px' }}
          >
            Bestseller
          </div>
        )}
        {images.length > 1 ? (
          <div
            className="product-card-image-track"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {images.map((src, idx) => (
              <div className="product-card-image-slide" key={`${product.id}_${idx}`}> 
                <img src={src} alt={product.name} className="product-card-image" />
              </div>
            ))}
          </div>
        ) : (
          <img src={product.image} alt={product.name} className="product-card-image" />
        )}
      </div>
      <div className="product-card-content">
        {product.category && (
          <span className="product-card-category">{product.category.toUpperCase()}</span>
        )}
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">
          <span className="product-card-current-price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="product-card-original-price">
                {formatPrice(product.originalPrice)}
              </span>
              {discount > 0 && (
                <span className="product-card-discount-text">({discount}% OFF)</span>
              )}
            </>
          )}
        </div>
        {showQuickAdd && (
          <div className="product-card-actions">
            <button
              className="product-card-wishlist-btn"
              onClick={handleWishlistToggle}
              aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;

