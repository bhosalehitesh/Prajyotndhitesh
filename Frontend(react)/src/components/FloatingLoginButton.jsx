import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../contexts/LoginPromptContext';
import { ROUTES } from '../constants/routes';

/**
 * Floating Login Button Component
 * Displays a floating signup/login button on the home page when user is not logged in
 */
const FloatingLoginButton = () => {
  const { user } = useAuth();
  const { promptLogin } = useLoginPrompt();
  const location = useLocation();

  // Only show on homepage
  const isHomePage = location.pathname === ROUTES.HOME || location.pathname === '/' || location.pathname.match(/^\/store\/[^/]+$/);

  // Don't show button if user is already logged in or not on homepage
  if (user || !isHomePage) {
    return null;
  }

  return (
    <button 
      className="floating-login-btn"
      onClick={() => promptLogin(null, 'Please login or sign up to continue')}
      aria-label="Login or Sign Up"
      type="button"
    >
      <svg 
        className="floating-login-icon" 
        viewBox="0 0 24 24" 
        width="20" 
        height="20"
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span>Sign Up</span>
    </button>
  );
};

export default FloatingLoginButton;

