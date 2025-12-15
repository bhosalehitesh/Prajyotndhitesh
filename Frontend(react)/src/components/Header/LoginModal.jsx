import React from 'react';

/**
 * Login Modal Component
 * Handles phone number login and OTP verification
 */
const LoginModal = ({ 
  show, 
  showOTPForm, 
  phone, 
  otp, 
  onClose, 
  onPhoneSubmit, 
  onOTPSubmit, 
  onPhoneChange, 
  onOtpChange,
  onBack 
}) => {
  if (!show) return null;

  return (
    <div className="login-modal-overlay active" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {!showOTPForm ? (
          <div className="login-form-container">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Login or create an account</p>
            <form className="login-form" onSubmit={onPhoneSubmit}>
              <div className="form-group">
                <label htmlFor="loginPhone">Phone Number</label>
                <input 
                  type="tel" 
                  id="loginPhone" 
                  placeholder="Enter 10-digit phone number" 
                  required 
                  pattern="[0-9]{10}" 
                  maxLength="10" 
                  value={phone}
                  onChange={onPhoneChange}
                />
              </div>
              <button type="submit" className="login-submit-btn">Get OTP</button>
            </form>
          </div>
        ) : (
          <div className="login-form-container">
            <h2 className="login-title">Verify OTP</h2>
            <p className="login-subtitle">We have sent a code by SMS to your phone.</p>
            <form className="login-form" onSubmit={onOTPSubmit}>
              <div className="form-group">
                <label htmlFor="otpInput">Enter OTP</label>
                <input 
                  type="text" 
                  id="otpInput" 
                  placeholder="Enter OTP" 
                  required 
                  pattern="[0-9]{6}" 
                  maxLength="6"
                  value={otp}
                  onChange={onOtpChange}
                  style={{textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px', fontWeight: '600'}}
                />
              </div>
              <button type="submit" className="login-submit-btn">Verify and Continue</button>
              <button type="button" className="login-back-btn" onClick={onBack}>Back</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;

