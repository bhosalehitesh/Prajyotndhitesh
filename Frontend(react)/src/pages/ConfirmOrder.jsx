import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES, getRoute } from '../constants/routes';
import { placeOrder, getCart, addToCartAPI, getStoreBySlug } from '../utils/api';

// Get backend URL - try to match the API_CONFIG pattern
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // For localhost, backend is typically at port 8080 without /api
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  return `${protocol}//${hostname}:8080`;
};

// Get API base URL - try both with and without /api
const getApiBaseUrl = () => {
  const baseUrl = getBackendUrl();
  // Backend endpoints are at root level (not /api) based on PaymentController
  // So we return baseUrl without /api
  return baseUrl;
};

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { storeSlug, currentStore, getStoreId } = useStore();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [address, setAddress] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'RAZORPAY'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const itemTotal = getCartTotal();
  const deliveryFee = 0; // Free delivery
  const codCharges = 10; // Cash on Delivery charges
  const orderTotal = paymentMethod === 'COD' 
    ? itemTotal + deliveryFee + codCharges 
    : itemTotal + deliveryFee;

  // Load address from location state or localStorage
  useEffect(() => {
    setIsLoading(true);
    console.log('ConfirmOrder: Loading address, location.state:', location.state);
    
    if (location.state?.address) {
      console.log('ConfirmOrder: Address found in location.state:', location.state.address);
      setAddress(location.state.address);
      setIsLoading(false);
    } else {
      // Load from localStorage
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        try {
          const parsedAddress = JSON.parse(savedAddress);
          console.log('ConfirmOrder: Address found in localStorage:', parsedAddress);
          setAddress(parsedAddress);
        } catch (e) {
          console.error('Error loading address:', e);
        }
      } else {
        console.log('ConfirmOrder: No address found in location.state or localStorage');
      }
      setIsLoading(false);
    }
  }, [location.state]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const cartPath = getRoute(ROUTES.CART, resolvedSlug);
      navigate(cartPath);
    }
  }, [cart, storeSlug, currentStore, navigate]);

  // Load Razorpay script
  useEffect(() => {
    // Check if already loaded
    if (window.Razorpay) {
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      // Script exists but might not be loaded yet, wait for it
      const checkScript = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkScript);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScript);
      }, 10000);

      return () => clearInterval(checkScript);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };

    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Redirect if no address (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !address && cart.length > 0) {
      console.log('ConfirmOrder: No address found, redirecting to checkout');
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const checkoutPath = getRoute(ROUTES.CHECKOUT, resolvedSlug);
      navigate(checkoutPath);
    }
  }, [isLoading, address, cart, storeSlug, currentStore, navigate]);

  const formatAddress = () => {
    if (!address) return '';
    const parts = [
      address.customerName,
      address.houseNumber,
      address.areaStreet,
      address.landmark,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleRazorpayPayment = async (orderId) => {
    // Wait for Razorpay script to load if not already loaded
    if (!window.Razorpay) {
      // Wait up to 5 seconds for script to load
      let attempts = 0;
      while (!window.Razorpay && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded yet. Please refresh the page and try again.');
      }
    }

    const API_BASE = getBackendUrl();
    const amount = orderTotal;

    try {
      // Step 1: Create Razorpay order on backend
      // Try without /api first (backend controller is at /payment)
      let createOrderApi = `${API_BASE}/payment/create-razorpay-order`;
      console.log('Creating Razorpay order:', { url: createOrderApi, orderId, amount });
      
      let orderResponse = await fetch(createOrderApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(orderId),
          amount: Number(amount),
        }),
      });

      // If 404, try with /api prefix as fallback
      if (orderResponse.status === 404 || orderResponse.status === 0) {
        console.log('Trying with /api prefix...');
        createOrderApi = `${API_BASE}/api/payment/create-razorpay-order`;
        orderResponse = await fetch(createOrderApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: Number(orderId),
            amount: Number(amount),
          }),
        });
      }

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Razorpay order creation failed:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorText,
          url: createOrderApi
        });
        throw new Error(`Failed to create Razorpay order (${orderResponse.status}): ${errorText || orderResponse.statusText}`);
      }

      const orderData = await orderResponse.json();
      if (!orderData.razorpayOrderId) {
        console.error('Invalid response from backend:', orderData);
        throw new Error('Backend did not return razorpayOrderId. Response: ' + JSON.stringify(orderData));
      }

      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount * 100, // paise
        currency: 'INR',
        name: currentStore?.storeName || 'Store',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 2: Verify payment with backend
            let callbackUrl = `${API_BASE}/payment/razorpay-callback`;
            console.log('Verifying payment:', { url: callbackUrl, orderId });
            
            let callbackResponse = await fetch(callbackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: Number(orderId),
                amount: Number(amount),
              }),
            });

            // If 404, try with /api prefix as fallback
            if (callbackResponse.status === 404 || callbackResponse.status === 0) {
              console.log('Trying callback with /api prefix...');
              callbackUrl = `${API_BASE}/api/payment/razorpay-callback`;
              callbackResponse = await fetch(callbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: Number(orderId),
                  amount: Number(amount),
                }),
              });
            }

            if (!callbackResponse.ok) {
              const errorText = await callbackResponse.text();
              console.error('Payment verification failed:', {
                status: callbackResponse.status,
                statusText: callbackResponse.statusText,
                error: errorText,
                url: callbackUrl
              });
              throw new Error(`Payment verification failed (${callbackResponse.status}): ${errorText || callbackResponse.statusText}`);
            }

            const callbackData = await callbackResponse.json();
            console.log('Payment verified:', callbackData);

            // Navigate to success page
            const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
            const successPath = getRoute(ROUTES.ORDER_SUCCESS, resolvedSlug);
            navigate(successPath, { 
              state: { 
                orderId: orderId,
                address: address,
                contactInfo: {
                  phone: address.mobileNumber || user.phone,
                  email: address.emailId || user.email
                }
              } 
            });
          } catch (err) {
            console.error('Payment verification error:', err);
            setError(`Payment succeeded but verification failed: ${err.message}`);
            setIsProcessingPayment(false);
            setIsPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setIsPlacingOrder(false);
            setError('Payment was cancelled. You can try again.');
          },
        },
        theme: { color: '#ff6d2e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      // Show more detailed error message
      const errorMessage = error.message || 'Failed to initiate Razorpay payment. Please check your backend server is running on port 8080.';
      throw new Error(errorMessage);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) {
      alert('Please login to place an order');
      // Note: Login route doesn't exist in this app, redirect to home instead
      navigate(getRoute(ROUTES.HOME, storeSlug));
      return;
    }

    if (!address) {
      alert('Please provide a delivery address');
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const checkoutPath = getRoute(ROUTES.CHECKOUT, resolvedSlug);
      navigate(checkoutPath);
      return;
    }

    setIsPlacingOrder(true);
    setError('');

    try {
      const formattedAddress = formatAddress();
      const mobileNumber = address.mobileNumber || user.phone;
      
      if (!mobileNumber) {
        throw new Error('Mobile number is required');
      }

      // Convert mobile number to number (remove +91 if present, remove spaces)
      const mobileNum = parseInt(mobileNumber.toString().replace(/\+91|\s/g, ''), 10);
      if (isNaN(mobileNum)) {
        throw new Error('Invalid mobile number');
      }

      // Get storeId from multiple sources to ensure it's not null
      let storeId = currentStore?.storeId || currentStore?.id || null;
      
      // Try to get storeId from cart items if currentStore doesn't have it
      if (!storeId && cart.length > 0) {
        storeId = cart[0]?.storeId || null;
      }
      
      // Try to get storeId from StoreContext's getStoreId method
      if (!storeId && getStoreId) {
        storeId = getStoreId() || null;
      }
      
      // If we have a storeSlug but no storeId, fetch the store to get storeId
      if (!storeId && storeSlug) {
        try {
          console.log('Fetching store by slug to get storeId:', storeSlug);
          const store = await getStoreBySlug(storeSlug);
          storeId = store?.storeId || store?.id || null;
          console.log('Retrieved storeId from store slug:', storeId);
        } catch (e) {
          console.warn('Could not fetch store by slug:', e);
        }
      }
      
      // Ensure sellerId is a number, not a string
      let sellerId = cart[0]?.sellerId || null;
      if (sellerId) {
        sellerId = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
        if (isNaN(sellerId)) {
          sellerId = null;
        }
      }
      
      // Validate storeId is not null before proceeding
      if (!storeId) {
        throw new Error('Store ID is required to place an order. Please ensure you are shopping from a valid store page.');
      }

      console.log('Placing order with:', {
        userId: user.userId || user.id,
        address: formattedAddress,
        mobile: mobileNum,
        storeId,
        sellerId,
        paymentMethod,
        cartItems: cart.length
      });

      // Validate cart is not empty
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty. Please add items to cart before placing an order.');
      }

      // Ensure cart exists in backend and sync items before placing order
      try {
        console.log('Ensuring cart exists in backend for user:', user.userId || user.id);
        const backendCart = await getCart(user.userId || user.id);
        console.log('Backend cart verified:', backendCart);
        
        // Extract storeId from backend cart if we don't have it yet
        if (!storeId && backendCart?.storeId) {
          storeId = backendCart.storeId;
          console.log('Found storeId from backend cart:', storeId);
        }
        
        // If still no storeId, try to extract from cart items' products
        if (!storeId && backendItems.length > 0) {
          const firstItem = backendItems[0];
          // Products might have storeId through seller relationship
          // But since Product model doesn't have direct storeId, we'll rely on other sources
          console.log('Checking cart items for storeId...');
        }
        
        // Check if backend cart has items
        const backendItems = backendCart?.items || backendCart?.orderItems || [];
        console.log('Backend cart items count:', backendItems.length, 'Frontend cart items count:', cart.length);
        
        // If backend cart is empty but frontend has items, sync them
        if (backendItems.length === 0 && cart.length > 0) {
          console.log('Backend cart is empty, syncing frontend cart items to backend...');
          for (const item of cart) {
            const productId = item.productId || item.id;
            const quantity = item.quantity || 1;
            if (productId) {
              try {
                await addToCartAPI(user.userId || user.id, productId, quantity);
                console.log('Synced item to backend:', { productId, quantity });
              } catch (syncError) {
                console.error('Error syncing item to backend:', syncError);
                // Continue with other items
              }
            }
          }
          
          // Verify cart again after syncing
          const updatedBackendCart = await getCart(user.userId || user.id);
          const updatedItems = updatedBackendCart?.items || updatedBackendCart?.orderItems || [];
          
          // Try to get storeId from updated backend cart
          if (!storeId && updatedBackendCart?.storeId) {
            storeId = updatedBackendCart.storeId;
            console.log('Found storeId from updated backend cart:', storeId);
          }
          
          if (updatedItems.length === 0) {
            throw new Error('Failed to sync cart items to backend. Please try adding items to cart again.');
          }
          console.log('Cart items synced successfully. Backend now has', updatedItems.length, 'items');
        } else if (backendItems.length === 0) {
          throw new Error('Your cart is empty in the backend. Please add items to cart and try again.');
        }
      } catch (cartError) {
        console.error('Error verifying/syncing cart:', cartError);
        
        // Check if it's a connection error
        if (cartError.message && (cartError.message.includes('Failed to fetch') || cartError.message.includes('NetworkError') || cartError.message.includes('ERR_CONNECTION_REFUSED') || cartError.message.includes('Cannot connect to server'))) {
          throw new Error('Cannot connect to backend server. Please ensure the server is running on port 8080.');
        }
        
        // Re-throw other errors
        throw cartError;
      }
      
      // Final validation: storeId must not be null
      if (!storeId) {
        throw new Error('Store ID is required to place an order. Please ensure you are shopping from a valid store page.');
      }
      
      // Ensure storeId is a number, not a string
      if (typeof storeId === 'string') {
        storeId = parseInt(storeId, 10);
        if (isNaN(storeId)) {
          throw new Error('Invalid Store ID. Please ensure you are shopping from a valid store page.');
        }
      }

      // First, place the order
      const order = await placeOrder(
        user.userId || user.id,
        formattedAddress,
        mobileNum,
        storeId,
        sellerId
      );

      console.log('Order placed successfully:', order);
      const orderId = order.ordersId || order.id || Date.now();

      // If Razorpay, initiate payment
      if (paymentMethod === 'RAZORPAY') {
        setIsProcessingPayment(true);
        await handleRazorpayPayment(orderId);
        return; // Don't navigate yet, wait for payment callback
      }

      // For COD, navigate directly to success page
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const successPath = resolvedSlug ? `/store/${resolvedSlug}/order/success` : '/order/success';
      navigate(successPath, { 
        state: { 
          orderId: orderId,
          address: address,
          contactInfo: {
            phone: mobileNumber,
            email: address.emailId || user.email
          }
        } 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error stack:', error.stack);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Failed to place order. Please try again.';
      
      if (error.message && error.message.includes('Cannot connect to server')) {
        errorMessage = '⚠️ Backend server is not running!\n\nPlease start the backend server on port 8080 and try again.\n\nTo start the server:\n1. Navigate to the Backend directory\n2. Run: mvn spring-boot:run\n3. Wait for server to start\n4. Try placing the order again';
      } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running on port 8080.';
      } else if (error.message && error.message.includes('Server error:')) {
        // Keep the server error message as-is, it already has details
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsPlacingOrder(false);
      setIsProcessingPayment(false);
    }
  };

  const handleChangeAddress = () => {
    const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
    const checkoutPath = resolvedSlug ? `/store/${resolvedSlug}/checkout` : '/checkout';
    navigate(checkoutPath);
  };

  const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
  const isMobile = window.innerWidth <= 968;

  // Show loading state while checking address and cart
  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: isDarkMode ? '#f5f5f5' : '#111' }}>Loading...</div>
      </div>
    );
  }

  // Will redirect if no address or empty cart
  if (!address || cart.length === 0) {
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: isDarkMode ? '#f5f5f5' : '#111',
        marginBottom: '2rem'
      }}>
        Confirm Order
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', 
        gap: '24px' 
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping Address */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Shipping Address
              </h3>
              <button
                onClick={handleChangeAddress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '6px',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#ff6d2e';
                  e.target.style.color = '#ff6d2e';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                  e.target.style.color = isDarkMode ? '#f5f5f5' : '#111';
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Change
              </button>
            </div>
            <div style={{
              fontSize: '0.95rem',
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
              lineHeight: '1.6',
              marginBottom: '12px'
            }}>
              {formatAddress()}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 3h15v13H1zM16 8h4l3 3v11H16z"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Usually delivered in 3-5 Days</span>
            </div>
          </div>

          {/* Order Items */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Order Items
              </h3>
              <span style={{
                fontSize: '0.9rem',
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
              }}>
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => {
                const discount = item.originalPrice && item.price < item.originalPrice
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : 0;

                return (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: isDarkMode ? '#0e0e0e' : '#f5f5f5'
                    }}>
                      <img
                        src={item.image || '/assets/products/p1.jpg'}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = '/assets/products/p1.jpg';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: isDarkMode ? '#f5f5f5' : '#111'
                      }}>
                        {item.name}
                      </div>
                      {item.color && (
                        <div style={{
                          fontSize: '0.9rem',
                          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        }}>
                          {item.color}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: isDarkMode ? '#f5f5f5' : '#111'
                        }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <>
                            <span style={{
                              fontSize: '0.9rem',
                              textDecoration: 'line-through',
                              color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                            }}>
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span style={{
                              fontSize: '0.85rem',
                              color: '#388e3c',
                              fontWeight: '600'
                            }}>
                              {discount}% Off
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                          borderRadius: '6px',
                          padding: '4px'
                        }}>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: 'transparent',
                              color: isDarkMode ? '#f5f5f5' : '#111',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            minWidth: '30px',
                            textAlign: 'center',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: isDarkMode ? '#f5f5f5' : '#111'
                          }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              border: 'none',
                              background: 'transparent',
                              color: isDarkMode ? '#f5f5f5' : '#111',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'transparent',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                            borderRadius: '6px',
                            color: isDarkMode ? '#f5f5f5' : '#111',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = '#ff4444';
                            e.target.style.color = '#ff4444';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
                            e.target.style.color = isDarkMode ? '#f5f5f5' : '#111';
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Bill Details */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: isDarkMode ? '#f5f5f5' : '#111',
              marginBottom: '20px'
            }}>
              Bill Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
              }}>
                <span>Item Total</span>
                <span>₹{itemTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: '#388e3c',
                fontWeight: '600'
              }}>
                <span>Delivery Fee</span>
                <span>FREE</span>
              </div>
              {paymentMethod === 'COD' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.95rem',
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                }}>
                  <span>COD Charges</span>
                  <span>₹{codCharges}</span>
                </div>
              )}
              <div style={{
                height: '1px',
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                margin: '16px 0'
              }}></div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                <span>Order Total:</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div style={{
            background: isDarkMode ? '#1b1b1b' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: isDarkMode ? '#f5f5f5' : '#111',
              marginBottom: '16px'
            }}>
              Payment Method
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: `2px solid ${paymentMethod === 'COD' ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)')}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'COD' ? (isDarkMode ? 'rgba(255, 109, 46, 0.1)' : 'rgba(255, 109, 46, 0.05)') : 'transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('COD')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    marginBottom: '4px'
                  }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    Pay ₹{codCharges} extra when you receive
                  </div>
                </div>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: `2px solid ${paymentMethod === 'RAZORPAY' ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)')}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'RAZORPAY' ? (isDarkMode ? 'rgba(255, 109, 46, 0.1)' : 'rgba(255, 109, 46, 0.05)') : 'transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => setPaymentMethod('RAZORPAY')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    marginBottom: '4px'
                  }}>
                    Razorpay (Online Payment)
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                  }}>
                    Pay securely with cards, UPI, or wallets
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || isProcessingPayment}
            style={{
              width: '100%',
              padding: '16px',
              background: '#ff6d2e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (isPlacingOrder || isProcessingPayment) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: (isPlacingOrder || isProcessingPayment) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isPlacingOrder && !isProcessingPayment) {
                e.target.style.background = '#e55a1f';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 46, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isPlacingOrder && !isProcessingPayment) {
                e.target.style.background = '#ff6d2e';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {isProcessingPayment 
              ? 'Processing Payment...' 
              : isPlacingOrder 
                ? 'Placing Order...' 
                : paymentMethod === 'RAZORPAY' 
                  ? 'Pay & Place Order' 
                  : 'Place Order'}
          </button>

          {error && (
            <div style={{
              padding: '16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '0.9rem',
              marginTop: '16px',
              lineHeight: '1.5'
            }}>
              <strong>Error:</strong> {error}
              <div style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                {error.includes('404') || error.includes('Not Found') ? (
                  <div>
                    <p>Possible issues:</p>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Backend server is not running on port 8080</li>
                      <li>API endpoint path is incorrect</li>
                      <li>Check browser console (F12) for more details</li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;
