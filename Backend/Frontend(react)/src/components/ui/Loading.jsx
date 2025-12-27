import React from 'react';

/**
 * Loading Component
 * Reusable loading spinner
 */
const Loading = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large',
  };

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner ${sizeClasses[size]}`}>
          <div className="spinner"></div>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;
