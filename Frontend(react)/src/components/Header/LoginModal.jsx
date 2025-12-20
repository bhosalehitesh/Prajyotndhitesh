import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Login Modal Component
 * Handles phone number login and OTP verification
 */
const LoginModal = ({ 
  show, 
  showOTPForm, 
  phone, 
  customerName,
  otp, 
  demoOtp,
  onClose, 
  onPhoneSubmit, 
  onOTPSubmit, 
  onPhoneChange, 
  onCustomerNameChange,
  onOtpChange,
  onBack 
}) => {
  console.log('LoginModal render - show:', show, 'showOTPForm:', showOTPForm, 'phone:', phone, 'otp:', otp);
  console.log('LoginModal props:', { show, showOTPForm, phone, otp, onClose: !!onClose, onPhoneSubmit: !!onPhoneSubmit, onOTPSubmit: !!onOTPSubmit });
  
  if (!show) {
    console.log('LoginModal: show is false, returning null');
    return null;
  }
  
  console.log('LoginModal: Rendering modal');

  const modalContent = (
    <div 
      className="login-modal-overlay active" 
      onClick={onClose}
      style={{
        display: 'flex',
        position: 'fixed',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 99999,
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'visible',
        opacity: 1,
        margin: 0,
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="login-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 100000,
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '0',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          transform: 'scale(1)',
          overflow: 'visible'
        }}
      >
        <button 
          className="login-modal-close" 
          onClick={onClose} 
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {!showOTPForm ? (
          <div style={{ 
            display: 'block', 
            visibility: 'visible', 
            opacity: 1, 
            padding: '40px 32px 32px 32px', 
            minHeight: '300px',
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 1
          }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: '#1a73e8', 
              margin: '0 0 8px 0', 
              textAlign: 'center',
              display: 'block',
              visibility: 'visible',
              lineHeight: '1.2'
            }}>Welcome Back</h2>
            <p style={{ 
              fontSize: '0.95rem', 
              color: '#1a73e8', 
              margin: '0 0 24px 0', 
              textAlign: 'center',
              display: 'block',
              visibility: 'visible',
              lineHeight: '1.4'
            }}>Login or create an account</p>
            <form 
              className="login-form" 
              onSubmit={(e) => {
                console.log('Form submitted, onPhoneSubmit exists:', !!onPhoneSubmit);
                if (onPhoneSubmit) {
                  onPhoneSubmit(e);
                } else {
                  e.preventDefault();
                  alert('onPhoneSubmit handler not provided');
                }
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <label htmlFor="customerName" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a73e8', display: 'block' }}>Customer Name *</label>
                <input 
                  type="text" 
                  id="customerName" 
                  placeholder="Name" 
                  required 
                  value={customerName || ''}
                  onChange={(e) => {
                    console.log('Customer name input changed:', e.target.value);
                    if (onCustomerNameChange) {
                      onCustomerNameChange(e);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#333',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <label htmlFor="loginPhone" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a73e8', display: 'block' }}>Mobile Number *</label>
                <input 
                  type="tel" 
                  id="loginPhone" 
                  placeholder="Enter 10-digit phone number" 
                  required 
                  pattern="[0-9]{10}" 
                  maxLength="10" 
                  value={phone || ''}
                  onChange={(e) => {
                    console.log('Phone input changed:', e.target.value);
                    if (onPhoneChange) {
                      onPhoneChange(e);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#333',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'var(--vibrant-pink)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '10px',
                  display: 'block',
                  visibility: 'visible',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(232, 59, 143, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--vibrant-pink-alt)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 59, 143, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--vibrant-pink)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 59, 143, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get OTP
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'block', visibility: 'visible', opacity: 1, padding: '40px 32px 32px 32px', minHeight: '300px', width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a73e8', margin: '0 0 8px 0', textAlign: 'center', display: 'block', visibility: 'visible', lineHeight: '1.2' }}>Verify OTP</h2>
            <p style={{ fontSize: '0.95rem', color: '#1a73e8', margin: '0 0 16px 0', textAlign: 'center', display: 'block', visibility: 'visible', lineHeight: '1.4' }}>We have sent a code by SMS to your phone.</p>
            {demoOtp && (
              <div style={{
                backgroundColor: '#e3f2fd',
                border: '2px solid #1a73e8',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 8px 0', fontWeight: 600 }}>Demo OTP (for testing):</p>
                <p style={{ fontSize: '1.5rem', color: '#1a73e8', margin: 0, fontWeight: 700, letterSpacing: '4px', fontFamily: 'monospace' }}>{demoOtp}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (onOtpChange) {
                      const syntheticEvent = { target: { value: demoOtp } };
                      onOtpChange(syntheticEvent);
                    }
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Use This OTP
                </button>
              </div>
            )}
            <form onSubmit={(e) => {
              console.log('OTP Form submitted, onOTPSubmit exists:', !!onOTPSubmit);
              if (onOTPSubmit) {
                onOTPSubmit(e);
              } else {
                e.preventDefault();
                alert('onOTPSubmit handler not provided');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <label htmlFor="otpInput" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a73e8', display: 'block' }}>Enter OTP</label>
                <input 
                  type="text" 
                  id="otpInput" 
                  placeholder="Enter OTP" 
                  required 
                  pattern="[0-9]{6}" 
                  maxLength="6"
                  value={otp || ''}
                  onChange={(e) => {
                    console.log('OTP input changed:', e.target.value);
                    if (onOtpChange) {
                      onOtpChange(e);
                    }
                  }}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    letterSpacing: '8px',
                    fontWeight: 600,
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    color: '#333',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'var(--vibrant-pink)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'block',
                  visibility: 'visible',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(232, 59, 143, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--vibrant-pink-alt)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 59, 143, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--vibrant-pink)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 59, 143, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Verify and Continue
              </button>
              <button 
                type="button" 
                onClick={onBack} 
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'block',
                  visibility: 'visible'
                }}
              >
                Back
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at the root level and not affected by parent z-index
  return createPortal(modalContent, document.body);
};

export default LoginModal;

