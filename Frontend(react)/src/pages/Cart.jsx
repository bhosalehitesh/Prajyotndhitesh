import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';

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
    if (!currentStoreId && !currentSellerId && !cartStoreId) {
      console.log('🛒 [Cart] No store filter - showing all items:', cart.length);
      return cart;
    }
    
    const filtered = cart.filter(item => {
      // Match by storeId or sellerId (cart items might have either)
      const itemStoreId = item.storeId;
      const itemSellerId = item.sellerId;
      
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
      
      return false;
    });
    
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
      navigate('/');
    }
  }, [currentStore, cart, cartStoreId, navigate]);

  const handleProceedToCheckout = () => {
    // Navigate to checkout/address page
    const checkoutPath = resolvedSlug ? `/store/${resolvedSlug}/checkout` : '/checkout';
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

      <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>
        {currentStore?.name ? `${currentStore.name} - Cart` : 'Shopping Cart'}
      </h1>

      {filteredCart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            {currentStore?.name 
              ? `Your cart is empty for ${currentStore.name}. Add items to continue.`
              : 'Your cart is empty'}
          </p>
          {currentStore && storeSlug && (
            <button
              onClick={() => navigate(`/store/${storeSlug}/products`)}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Browse Products
            </button>
          )}
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
                      gap: '1rem',
                      padding: '1rem',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <img
                      src={item.image || '/assets/products/p1.jpg'}
                      alt={item.name}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{item.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: '#f97316' }}>₹{item.price.toLocaleString('en-IN')}</span>
                        {originalPrice > item.price && (
                          <>
                            <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: '#999' }}>
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600' }}>{discount}% Off</span>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem' }}>
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: '#f3f4f6',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              updateQuantity(item.id, Math.max(1, qty));
                            }}
                            style={{
                              width: '50px',
                              textAlign: 'center',
                              border: 'none',
                              fontSize: '0.95rem',
                              fontWeight: '600'
                            }}
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: '#f3f4f6',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          🗑️ Remove
                        </button>
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
            <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Bill Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Item Total</span>
                  <span style={{ fontWeight: '600' }}>₹{itemTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Delivery Fee</span>
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>FREE</span>
                </div>
                <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' }}>
                  <span>Order Total</span>
                  <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Add Address / Proceed Button */}
            <button
              onClick={handleProceedToCheckout}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                fontWeight: '700',
                width: '100%'
              }}
            >
              Add Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

