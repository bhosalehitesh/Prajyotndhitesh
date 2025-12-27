import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`toast ${type}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        background: '#fff',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: `4px solid ${
          type === 'success' ? '#4caf50' :
          type === 'error' ? '#e53935' :
          type === 'info' ? '#2196f3' : '#ff9800'
        }`,
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div style={{
        flexShrink: 0,
        color: type === 'success' ? '#4caf50' :
               type === 'error' ? '#e53935' :
               type === 'info' ? '#2196f3' : '#ff9800'
      }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, color: '#333', fontSize: '0.95rem', lineHeight: '1.5' }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          color: '#999',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#333'}
        onMouseLeave={(e) => e.target.style.color = '#999'}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;

