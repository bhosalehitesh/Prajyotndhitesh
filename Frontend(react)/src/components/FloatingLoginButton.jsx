import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './Header/LoginModal';

/**
 * Floating Login Button Component
 * Displays a floating login button on the home page when user is not logged in
 */
const FloatingLoginButton = () => {
  const { user, sendOTP, verifyOTP } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  // Debug: Log user state changes
  useEffect(() => {
    console.log('FloatingLoginButton - User state changed:', user);
  }, [user]);

  // Handle floating login button click
  const handleFloatingLoginClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Floating login button clicked');
    console.log('Current showLoginModal state:', showLoginModal);
    setShowLoginModal(true);
    setShowOTPForm(false);
    setPhone('');
    setOtp('');
    console.log('Set showLoginModal to true');
  };

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('Modal state changed - showLoginModal:', showLoginModal, 'showOTPForm:', showOTPForm);
  }, [showLoginModal, showOTPForm]);

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phone || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending OTP to:', phone);
      const response = await sendOTP(phone);
      console.log('OTP response:', response);
      
      // Extract OTP from response (backend returns it for testing)
      if (response && response.otp) {
        setDemoOtp(response.otp);
        console.log('Demo OTP received:', response.otp);
      }
      
      setShowOTPForm(true);
      console.log('OTP sent successfully');
      // Show success message with demo OTP
      if (response && response.otp) {
        alert(`OTP sent successfully!\n\nDemo OTP: ${response.otp}\n\n(For testing purposes)`);
      } else {
        alert('OTP sent successfully! Please check your phone.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Verifying OTP for phone:', phone, 'OTP:', otp);
      // Pass default fullName (backend requires it for new users)
      // Using "User" + last 4 digits as default
      const defaultFullName = `User ${phone.slice(-4)}`;
      console.log('Sending fullName:', defaultFullName);
      const userData = await verifyOTP(phone, otp, defaultFullName);
      console.log('OTP verified successfully, user:', userData);
      setShowLoginModal(false);
      setShowOTPForm(false);
      setPhone('');
      setOtp('');
      // Show success message
      alert(`Login successful! Welcome ${userData.fullName || userData.name || 'User'}!`);
      // Note: User state is updated in AuthContext, component will re-render automatically
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.message || 'Invalid OTP. Please try again.';
      alert(errorMessage);
      // Clear OTP on error so user can retry
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setShowOTPForm(false);
    setPhone('');
    setOtp('');
    setDemoOtp('');
  };

  // Handle back to phone form
  const handleBackToPhone = () => {
    setShowOTPForm(false);
    setOtp('');
  };

  // Don't show button if user is already logged in
  if (user) {
    return null;
  }

  return (
    <>
      {/* Floating Login Button */}
      <button 
        className="floating-login-btn"
        onClick={handleFloatingLoginClick}
        aria-label="Login or Sign Up"
        type="button"
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          visibility: 'visible',
          opacity: 1
        }}
      >
        <svg 
          className="floating-login-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Login / Sign Up</span>
      </button>

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        showOTPForm={showOTPForm}
        phone={phone}
        otp={otp}
        demoOtp={demoOtp}
        onClose={handleCloseLoginModal}
        onPhoneSubmit={handlePhoneSubmit}
        onOTPSubmit={handleOTPSubmit}
        onPhoneChange={(e) => {
          const value = e.target.value.replace(/\D/g, ''); // Only allow digits
          setPhone(value);
        }}
        onOtpChange={(e) => {
          const value = e.target.value.replace(/\D/g, ''); // Only allow digits
          setOtp(value);
        }}
        onBack={handleBackToPhone}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '8px',
          fontSize: '16px'
        }}>
          {showOTPForm ? 'Verifying OTP...' : 'Sending OTP...'}
        </div>
      )}
    </>
  );
};

export default FloatingLoginButton;

