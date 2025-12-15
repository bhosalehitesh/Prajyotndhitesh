import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { placeOrder } from '../utils/api';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';

const Checkout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cart, getCartTotal, cartStoreId, cartSellerId, loading: cartLoading } = useCart();
  const { storeSlug, currentStore } = useStore();
  const { user, isAuthenticated } = useAuth();

  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actualSlug = slug || storeSlug;
  const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);

  const itemTotal = getCartTotal();
  const deliveryFee = 0;
  const codCharges = 10;
  const orderTotal = itemTotal + deliveryFee + codCharges;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user?.userId) {
      setError('Please login to place an order');
      return;
    }

    if (!address.trim()) {
      setError('Please enter your delivery address');
      return;
    }

    if (!mobile || mobile.toString().length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storeId = cartStoreId || currentStore?.storeId || currentStore?.id;
      const sellerId = cartSellerId || currentStore?.sellerId;

      console.log('🛒 [Checkout] Placing order:', {
        userId: user.userId,
        storeId,
        sellerId,
        address,
        mobile,
        itemCount: cart.length
      });

      const order = await placeOrder(
        user.userId,
        address,
        Number(mobile),
        storeId ? Number(storeId) : null,
        sellerId ? Number(sellerId) : null
      );

      console.log('✅ [Checkout] Order placed successfully:', order);

      // Navigate to orders page
      const ordersPath = resolvedSlug ? `/store/${resolvedSlug}/orders` : '/orders';
      navigate(ordersPath);
    } catch (err) {
      console.error('❌ [Checkout] Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return <Loading fullScreen text="Loading checkout..." />;
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <ErrorMessage message="Your cart is empty. Add items to cart before checkout." />
      </div>
    );
  }

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
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
            <span style={{ fontWeight: '600', color: '#f97316' }}>Address</span>
          </div>
          <div style={{ width: '60px', height: '2px', background: '#e5e7eb' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #e5e7eb', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>○</div>
            <span style={{ fontWeight: '600', color: '#9ca3af' }}>Payment</span>
          </div>
        </div>
      </div>

      <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>Checkout</h1>

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '8px', 
          marginBottom: '1.5rem' 
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Address Form - Left */}
        <div>
          <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Delivery Address</h2>
            <form onSubmit={handlePlaceOrder}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Full Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Enter your complete delivery address"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  minLength="10"
                  maxLength="10"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your 10-digit mobile number"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  fontWeight: '700'
                }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary - Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Order Items Summary */}
          <div style={{ padding: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontSize: '0.95rem' }}>
                    {item.name} x {item.quantity}
                  </span>
                  <span style={{ fontWeight: '600' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>COD Charges</span>
                <span style={{ fontWeight: '600' }}>₹{codCharges}</span>
              </div>
              <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' }}>
                <span>Order Total</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
