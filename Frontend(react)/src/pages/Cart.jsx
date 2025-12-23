import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES, getRoute } from '../constants/routes';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, cartStoreId, getCartStoreId } = useCart();
  const { storeSlug, currentStore } = useStore();
  const navigate = useNavigate();

  // Filter cart items by cart's locked store (cartStoreId) or current store
  // Priority: cartStoreId (cart's locked store) > currentStore?.storeId > currentStore?.id
  const cartLockedStoreId = cartStoreId || (getCartStoreId ? getCartStoreId() : null);
  const currentStoreId = cartLockedStoreId || currentStore?.storeId || currentStore?.id;
  const currentSellerId = currentStore?.sellerId;

  const filteredCart = React.useMemo(() => {
    // If no store context at all, show all items
    if (!currentStoreId && !currentSellerId && !cartStoreId) {
      console.log('🛒 [Cart] No store filter - showing all items:', cart.length);
      return cart;
    }

    const filtered = cart.filter(item => {
      // Match by storeId or sellerId (cart items might have either)
      const itemStoreId = item.storeId;
      const itemSellerId = item.sellerId;

      // If item has no storeId or sellerId, include it (legacy items or guest cart)
      if (!itemStoreId && !itemSellerId) {
        console.log('🛒 [Cart] Item has no storeId/sellerId, including:', item.name);
        return true;
      }

      // Priority 1: Match by cartStoreId (cart's locked store)
      if (cartStoreId && itemStoreId) {
        const matches = String(itemStoreId) === String(cartStoreId);
        if (matches) return true;
      }

      // Priority 2: Match by currentStoreId
      if (currentStoreId && itemStoreId) {
        const matches = String(itemStoreId) === String(currentStoreId);
        if (matches) return true;
      }

      // Priority 3: Match by sellerId
      if (currentSellerId && itemSellerId) {
        const matches = String(itemSellerId) === String(currentSellerId);
        if (matches) return true;
      }

      // If we have cartStoreId but item doesn't match, exclude it
      // But if we only have currentStoreId (not cartStoreId), be more lenient
      if (cartStoreId && itemStoreId && String(itemStoreId) !== String(cartStoreId)) {
        return false;
      }

      // If no cartStoreId but we have items without storeId, include them
      if (!cartStoreId && !itemStoreId && !itemSellerId) {
        return true;
      }

      return false;
    });

    // If filtering resulted in empty cart but we have items, show all items with a warning
    if (filtered.length === 0 && cart.length > 0) {
      console.warn('🛒 [Cart] Filtering resulted in empty cart but cart has items. Showing all items.');
      console.log('🛒 [Cart] Filtering details:', {
        totalItems: cart.length,
        filteredItems: filtered.length,
        cartStoreId,
        currentStoreId,
        currentSellerId,
        itemStoreIds: cart.map(i => i.storeId),
        itemSellerIds: cart.map(i => i.sellerId),
        itemNames: cart.map(i => i.name)
      });
      // Return all items if filtering is too strict
      return cart;
    }

    console.log('🛒 [Cart] Filtering cart:', {
      totalItems: cart.length,
      filteredItems: filtered.length,
      cartStoreId,
      currentStoreId,
      currentSellerId,
      itemStoreIds: cart.map(i => i.storeId),
      itemSellerIds: cart.map(i => i.sellerId)
    });

    return filtered;
  }, [cart, cartStoreId, currentStoreId, currentSellerId]);

  // Recalculate totals for filtered cart
  const itemTotal = filteredCart.reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.quantity || 1));
  }, 0);
  const deliveryFee = 0; // Free delivery
  const codCharges = 0; // COD charges removed
  const orderTotal = itemTotal + deliveryFee; // No COD charges

  const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);

  // Redirect if no store context but cart has store-specific items
  React.useEffect(() => {
    if (!currentStore && cart.length > 0 && cartStoreId) {
      // If cart has items from a specific store but we're not on a store page, redirect to home
      console.warn('Cart has store-specific items but no store context. Redirecting...');
      navigate(getRoute(ROUTES.HOME, storeSlug));
    }
  }, [currentStore, cart, cartStoreId, navigate, storeSlug]);

  const handleProceedToCheckout = () => {
    // Navigate to checkout/address page
    const checkoutPath = getRoute(ROUTES.CHECKOUT, resolvedSlug || storeSlug);
    navigate(checkoutPath);
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Checkout Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
            <span style={{ fontWeight: '600', color: '#f97316' }}>Cart</span>
          </div>
          <div style={{ width: '60px', height: '2px', background: '#f97316' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #f97316', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>−</div>
            <span style={{ fontWeight: '600', color: '#f97316' }}>Address</span>
          </div>
          <div style={{ width: '60px', height: '2px', background: '#e5e7eb' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #e5e7eb', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>○</div>
            <span style={{ fontWeight: '600', color: '#9ca3af' }}>Payment</span>
          </div>
        </div>
      </div>

      {filteredCart.length === 0 ? (
        <div className="empty-cart-container" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          boxShadow: '0 20px 40px rgba(232, 59, 143, 0.1)',
          border: '1px solid rgba(232, 59, 143, 0.1)',
          margin: '2rem auto',
          maxWidth: '600px'
        }}>
          {/* Animated Shopping Cart Illustration */}
          <div className="empty-cart-icon-wrapper" style={{ marginBottom: '2rem', position: 'relative' }}>
            <div className="pulse-circle" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              backgroundColor: 'rgba(232, 59, 143, 0.1)',
              borderRadius: '50%',
              animation: 'pulse-ring 2s infinite'
            }}></div>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: 'var(--vibrant-pink)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(232, 59, 143, 0.3)',
              position: 'relative',
              zIndex: 1
            }}>
              <svg viewBox="0 0 24 24" width="50" height="50" fill="white">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
          </div>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            color: 'var(--text-color)',
            marginBottom: '0.8rem',
            background: 'linear-gradient(135deg, var(--vibrant-pink) 0%, var(--vibrant-pink-alt) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Your cart is feeling lonely
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '300px'
          }}>
            Explore our latest collections and find something special for yourself.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(getRoute(ROUTES.PRODUCTS, storeSlug))}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, var(--vibrant-pink) 0%, var(--vibrant-pink-alt) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                boxShadow: '0 10px 20px rgba(232, 59, 143, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(232, 59, 143, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(232, 59, 143, 0.2)';
              }}
            >
              Start Shopping
            </button>
            <button
              onClick={() => navigate(getRoute(ROUTES.WISHLIST, storeSlug))}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'var(--vibrant-pink)',
                border: '2px solid var(--vibrant-pink)',
                borderRadius: '50px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(232, 59, 143, 0.05)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              From Wishlist
            </button>
          </div>

          <style>
            {`
              @keyframes pulse-ring {
                0% { transform: translate(-50%, -50%) scale(0.33); opacity: 1; }
                80%, 100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
              }
            `}
          </style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Order Items Section - Left */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Order Items</h2>
              <span style={{ color: '#666', fontSize: '0.95rem' }}>{filteredCart.length} {filteredCart.length === 1 ? 'Item' : 'Items'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredCart.map((item) => {
                const itemSubtotal = item.price * item.quantity;
                const originalPrice = item.originalPrice || item.price;
                const discount = originalPrice > item.price ? Math.round(((originalPrice - item.price) / originalPrice) * 100) : 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '1.25rem',
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(232, 59, 143, 0.08)',
                      borderRadius: '20px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(232, 59, 143, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(232, 59, 143, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(232, 59, 143, 0.08)';
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={item.image || '/assets/products/p1.jpg'}
                        alt={item.name}
                        style={{
                          width: '110px',
                          height: '110px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1a1a1a', margin: '0 0 0.25rem 0' }}>{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                            title="Remove"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>{item.brand || 'Store'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--vibrant-pink)' }}>₹{item.price.toLocaleString('en-IN')}</span>
                          {originalPrice > item.price && (
                            <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: '#999', opacity: 0.7 }}>
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#f8fafc',
                          borderRadius: '50px',
                          padding: '0.2rem',
                          border: '1px solid #e2e8f0'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: '#fff',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            width: '35px',
                            textAlign: 'center',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#334155'
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: '#fff',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                          ₹{itemSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Bill Details - Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Bill Details */}
            <div style={{
              padding: '1.75rem',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(232, 59, 143, 0.1)',
              borderRadius: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1e293b' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Item Total ({filteredCart.length} units)</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>₹{itemTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Delivery Fee</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>FREE</span>
                </div>

                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '0.5rem 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--vibrant-pink)' }}>₹{orderTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              style={{
                padding: '1.15rem 2rem',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, var(--vibrant-pink) 0%, var(--vibrant-pink-alt) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: '0 12px 24px rgba(232, 59, 143, 0.3)',
                fontWeight: '800',
                width: '100%',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(232, 59, 143, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(232, 59, 143, 0.3)';
              }}
            >
              Proceed to Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

