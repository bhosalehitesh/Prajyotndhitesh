import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '../../constants/routes';

/**
 * Mobile Sidebar Component
 * Slide-out navigation menu for mobile devices
 */
const MobileSidebar = ({ isOpen, onClose, user, onSignIn, onSignOut }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-sidebar-overlay active" onClick={onClose}></div>
      <div className="mobile-sidebar active">
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-profile">
            <div className="mobile-sidebar-avatar">
              {user ? (
                <img src="/assets/default-avatar.png" alt="Profile" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }} />
              ) : null}
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" style={{display: user ? 'none' : 'block'}}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <button className="mobile-sidebar-close" onClick={onClose} aria-label="Close Menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mobile-sidebar-delivery">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>Check if we deliver to you</span>
        </div>

        <nav className="mobile-sidebar-nav">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`mobile-sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                {isActive && <span className="mobile-nav-indicator"></span>}
                {item.hasChevron && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mobile-sidebar-footer">
          {!user ? (
            <button className="mobile-sidebar-signin-btn" onClick={onSignIn}>
              Sign In
            </button>
          ) : (
            <button className="mobile-sidebar-signin-btn" onClick={onSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;

