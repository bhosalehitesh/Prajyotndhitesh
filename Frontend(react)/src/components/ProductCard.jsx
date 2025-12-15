import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useStore } from '../contexts/StoreContext';
import { formatPrice, calculateDiscount } from '../utils/format';
import Card from './ui/Card';

/**
 * Product Card Component
 */
const ProductCard = ({ product, showQuickAdd = true }) => {
  const navigate = useNavigate();
  const { addToCart, cartStoreId } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { currentStore, storeSlug } = useStore();

  const handleProductClick = () => {
    const params = new URLSearchParams({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      brand: product.brand || 'V Store',
      category: product.category
    });

    // Prefer store-scoped detail route when slug is known
    const detailPath = storeSlug
      ? `/store/${storeSlug}/product/detail`
      : '/product/detail';

    navigate(`${detailPath}?${params.toString()}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    // Get store ID and seller ID (REQUIRED for cart locking and orders)
    const storeId = currentStore?.storeId || currentStore?.id;
    const sellerId = currentStore?.sellerId;
    
    if (!storeId) {
      console.warn('No store ID available. Cannot add to cart.');
      alert('Store information not available. Please refresh the page.');
      return;
    }
    
    // Check if adding from different store (cart locking rule)
    if (cartStoreId && storeId && cartStoreId !== String(storeId)) {
      const confirmClear = window.confirm(
        `Your cart contains items from a different store. Adding this item will clear your current cart. Continue?`
      );
      if (!confirmClear) {
        return;
      }
    }
    
    addToCart({
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand || currentStore?.name || 'Store',
      quantity: 1,
      productId: product.id, // Product ID for backend
    }, storeId, sellerId);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        ...product,
        id: product.id || `${product.name}_${Date.now()}`,
      });
    }
  };

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  return (
    <Card className="product-card" hover onClick={handleProductClick}>
      <div className="product-card-image-wrapper">
        {product.isBestseller && (
          <div
            className="product-badge bestseller"
            style={{ position: 'absolute', top: '14px', left: '14px' }}
          >
            Bestseller
          </div>
        )}
        <img src={product.image} alt={product.name} className="product-card-image" />
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
              className="product-card-add-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
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

