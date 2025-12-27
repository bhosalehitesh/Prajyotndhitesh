import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

// Standalone Razorpay test page converted from razorpay-test.html
// Keeps behavior: create order via backend, open Razorpay popup, send callback

const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  // For production or other environments, use the same hostname but port 8080
  // If frontend is on a different port, backend should be on 8080
  return `${protocol}//${hostname}:8080`;
};

const RazorpayTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { storeSlug } = useStore();
  const [orderId, setOrderId] = useState(() => location.state?.orderId ?? 1);
  const [amount, setAmount] = useState(() => location.state?.amount ?? 199);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const API_BASE = getBackendUrl() || 'http://192.168.1.21:8080';
  
  // Get the store slug from URL params or context
  const currentStoreSlug = slug || storeSlug || 'v'; // Default to 'v' if not found

  // Load Razorpay script once and wait for it to be ready
  useEffect(() => {
    // Check if already loaded
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      // Script exists but might not be loaded yet, wait for it
      const checkScript = setInterval(() => {
        if (window.Razorpay) {
          setIsScriptLoaded(true);
          clearInterval(checkScript);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScript);
        if (!window.Razorpay) {
          setErrorMsg('Razorpay script failed to load. Please refresh the page.');
        }
      }, 10000);

      return () => clearInterval(checkScript);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      setErrorMsg('Failed to load Razorpay script. Please check your internet connection.');
    };

    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Update amount/orderId when navigating with state from checkout
  useEffect(() => {
    if (location.state?.amount) setAmount(location.state.amount);
    if (location.state?.orderId) setOrderId(location.state.orderId);
  }, [location.state]);

  const startPayment = async () => {
    if (!orderId || !amount || Number(amount) <= 0) {
      setErrorMsg('Please enter valid Order ID and Amount');
      return;
    }

    if (!isScriptLoaded || !window.Razorpay) {
      setErrorMsg('Razorpay script is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPaymentDetails(null);

    try {
      // Step 1: create Razorpay order on backend
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
        throw new Error(`Failed to create order (${orderResponse.status}): ${errorText || orderResponse.statusText}`);
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
        name: 'Test Store',
        description: 'Razorpay Test Payment',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
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
              throw new Error(`Callback failed (${callbackResponse.status}): ${errorText || callbackResponse.statusText}`);
            }

            const callbackData = await callbackResponse.json();
            console.log('Callback Saved:', callbackData);
            setSuccessMsg(`Payment Completed Successfully! Payment ID: ${response.razorpay_payment_id}`);
            setPaymentDetails({
              orderId: Number(orderId),
              amount: Number(amount),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              backendStatus: callbackData.status || 'SUCCESS',
              backendData: callbackData,
            });
            
            // Redirect to homepage after 2 seconds
            setTimeout(() => {
              navigate(`/store/${currentStoreSlug}`);
            }, 2000);
          } catch (err) {
            console.error('Callback error:', err);
            setErrorMsg(`Payment succeeded but callback failed: ${err.message}`);
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMsg('Payment was cancelled. You can try again.');
          },
        },
        theme: { color: '#3e66fb' },
      };

      // Double check Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded yet. Please refresh the page and try again.');
      }

      console.log('Opening Razorpay checkout...');
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMsg(error.message || 'Failed to initiate payment. Please check console for details.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h2>Test Razorpay Payment</h2>

        <label style={styles.label}>Order ID (in DB):</label>
        <input
          style={styles.input}
          type="number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />

        <label style={styles.label}>Amount (₹):</label>
        <input
          style={styles.input}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {paymentDetails && (
          <div style={styles.detailsBox}>
            <div style={styles.detailsRow}><strong>Order ID:</strong> {paymentDetails.orderId}</div>
            <div style={styles.detailsRow}><strong>Amount:</strong> ₹{paymentDetails.amount}</div>
            <div style={styles.detailsRow}><strong>Razorpay Order:</strong> {paymentDetails.razorpayOrderId}</div>
            <div style={styles.detailsRow}><strong>Payment ID:</strong> {paymentDetails.razorpayPaymentId}</div>
            <div style={styles.detailsRow}><strong>Signature:</strong> {paymentDetails.razorpaySignature}</div>
            <div style={styles.detailsRow}><strong>Backend Status:</strong> {paymentDetails.backendStatus}</div>
            <pre style={styles.pre}>{JSON.stringify(paymentDetails.backendData, null, 2)}</pre>
          </div>
        )}

        <button 
          style={styles.button} 
          onClick={startPayment} 
          disabled={isProcessing || !isScriptLoaded}
        >
          {!isScriptLoaded ? 'Loading Razorpay...' : (isProcessing ? 'Processing...' : (errorMsg ? 'Retry Payment' : 'Pay Now'))}
        </button>
        <button
          style={{ ...styles.button, background: '#eee', color: '#333', marginTop: '10px' }}
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setPaymentDetails(null);
            setIsProcessing(false);
          }}
          disabled={isProcessing}
        >
          Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    padding: '40px',
    background: '#f5f5f5',
    minHeight: '100vh',
  },
  box: {
    background: 'white',
    padding: '30px',
    maxWidth: '450px',
    margin: 'auto',
    borderRadius: '10px',
    boxShadow: '0 0 15px #cccccc',
  },
  label: {
    display: 'block',
    marginTop: '15px',
    marginBottom: '5px',
    fontWeight: 600,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 22px',
    background: '#3e66fb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    width: '100%',
    marginTop: '20px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
    padding: '10px',
    background: '#ffe6e6',
    borderRadius: '6px',
  },
  success: {
    color: 'green',
    marginTop: '10px',
    padding: '10px',
    background: '#e6ffe6',
    borderRadius: '6px',
  },
  detailsBox: {
    marginTop: '12px',
    padding: '12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#0f172a',
  },
  detailsRow: {
    marginBottom: '6px',
  },
  pre: {
    marginTop: '8px',
    padding: '10px',
    background: '#0f172a',
    color: '#e2e8f0',
    borderRadius: '6px',
    fontSize: '12px',
    overflowX: 'auto',
  },
};

export default RazorpayTest;

