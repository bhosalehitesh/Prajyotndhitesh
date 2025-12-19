import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES, getRoute } from '../constants/routes';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug, currentStore } = useStore();
  const { isDarkMode } = useTheme();
  
  const [orderData, setOrderData] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    // Get order data from location state
    if (location.state?.orderId) {
      setOrderData({
        orderId: location.state.orderId,
        address: location.state.address,
        contactInfo: location.state.contactInfo
      });
      setAddress(location.state.address);
    } else {
      // If no order data, redirect to home
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      navigate(getRoute(ROUTES.HOME, resolvedSlug));
    }
  }, [location.state, navigate, storeSlug, currentStore]);

  const handleContinueShopping = () => {
    const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
    navigate(getRoute(ROUTES.HOME, resolvedSlug));
  };

  const handleViewOrderStatus = () => {
    const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
    navigate(getRoute(ROUTES.ORDERS, resolvedSlug));
  };

  if (!orderData) {
    return null; // Will redirect
  }

  const formatAddress = () => {
    if (!address) return '';
    // Format address similar to the image: "Aryush Homeo, ggg, nm, PUNE - 411030"
    const parts = [];
    
    if (address.customerName) parts.push(address.customerName);
    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.areaStreet) parts.push(address.areaStreet);
    if (address.landmark) parts.push(address.landmark);
    
    // City and state together
    const cityState = [];
    if (address.city) cityState.push(address.city);
    if (address.state) cityState.push(address.state);
    
    if (cityState.length > 0) {
      const cityStateStr = cityState.join(', ');
      if (address.pincode) {
        parts.push(`${cityStateStr} - ${address.pincode}`);
      } else {
        parts.push(cityStateStr);
      }
    } else if (address.pincode) {
      parts.push(address.pincode);
    }
    
    return parts.filter(Boolean).join(', ');
  };

  const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);

  return (
    <div className="container" style={{ 
      padding: '3rem 0', 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Success Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#4caf50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#fff" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      {/* Thank You Message */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: isDarkMode ? '#f5f5f5' : '#111',
        marginBottom: '12px',
        textAlign: 'center'
      }}>
        Thank You!
      </h1>

      <p style={{
        fontSize: '1.2rem',
        color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Your order has been placed
      </p>

      {/* Order ID */}
      <div style={{
        fontSize: '1rem',
        color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        Order ID: #{String(orderData.orderId)}
      </div>

      {/* WhatsApp Confirmation Box */}
      <div style={{
        background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '32px',
        width: '100%',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <p style={{
          fontSize: '0.95rem',
          color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          marginBottom: '16px',
          lineHeight: '1.6'
        }}>
          You will receive a confirmation message on WhatsApp when the seller accepts the order.
        </p>
        <button
          onClick={handleViewOrderStatus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#ff6d2e',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            padding: '8px 0',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          View Order Status
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Order Details */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Shipping Address */}
        <div style={{
          background: isDarkMode ? '#1b1b1b' : '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: isDarkMode ? '#f5f5f5' : '#111',
            marginBottom: '12px'
          }}>
            Shipping Address
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            lineHeight: '1.6',
            margin: 0
          }}>
            {formatAddress()}
          </p>
        </div>

        {/* Contact Information */}
        <div style={{
          background: isDarkMode ? '#1b1b1b' : '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: isDarkMode ? '#f5f5f5' : '#111',
            marginBottom: '12px'
          }}>
            Contact Information
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.95rem',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            lineHeight: '1.6'
          }}>
            {address?.mobileNumber && (
              <div>
                <strong>Phone:</strong> +91{address.mobileNumber}
              </div>
            )}
            {address?.emailId && (
              <div>
                <strong>Email:</strong> {address.emailId}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div style={{
          background: isDarkMode ? '#1b1b1b' : '#fff',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: isDarkMode ? '#f5f5f5' : '#111',
            marginBottom: '12px'
          }}>
            Payment Method
          </h3>
          <p style={{
            fontSize: '0.95rem',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            margin: 0
          }}>
            Cash on Delivery (COD)
          </p>
        </div>
      </div>

      {/* Continue Shopping Button */}
      <button
        onClick={handleContinueShopping}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '16px',
          background: '#ff6d2e',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#e55a1f';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 46, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#ff6d2e';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderSuccess;
