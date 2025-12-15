import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice, calculateDiscount } from '../utils/format';
import Card from './ui/Card';

/**
 * Product Card Component
 */
const ProductCard = ({ product, showQuickAdd = true }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleProductClick = () => {
    const params = new URLSearchParams({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      brand: product.brand || 'V Store',
    });
    navigate(`/product/detail?${params.toString()}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand || 'V Store',
      quantity: 1,
    });
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
        <img src={product.image} alt={product.name} className="product-card-image" />
        {discount > 0 && (
          <span className="product-card-discount">{discount}% OFF</span>
        )}
        <button
          className="product-card-wishlist"
          onClick={handleWishlistToggle}
          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="product-card-content">
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">
          <span className="product-card-current-price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {showQuickAdd && (
          <button
            className="product-card-add-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;

