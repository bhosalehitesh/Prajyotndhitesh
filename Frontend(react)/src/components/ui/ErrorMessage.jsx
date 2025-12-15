import React from 'react';

/**
 * Error Message Component
 * Displays error messages in a user-friendly way
 */
const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>Oops! Something went wrong</h3>
      <p>{message || 'An unexpected error occurred. Please try again later.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-btn">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

