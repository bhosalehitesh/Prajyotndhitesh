import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MOBILE_NAV_ITEMS, getRoute } from '../../constants/routes';

/**
 * Mobile Sidebar Component
 * Slide-out navigation menu for mobile devices
 */
const MobileSidebar = ({ isOpen, onClose, user, storeSlug, onSignIn, onSignOut }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-sidebar-overlay active" onClick={onClose}></div>
      <div className="mobile-sidebar active">
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-profile" style={{ flex: 1 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <div className="mobile-sidebar-avatar" style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%',
                  backgroundColor: 'var(--vibrant-pink, #e83b8f)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: 'var(--text-color, #333)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.fullName || user.name || 'User'}
                  </div>
                  {user.phone && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-secondary, #666)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.phone}
                    </div>
                  )}
                  {user.email && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-secondary, #999)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '2px'
                    }}>
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mobile-sidebar-avatar">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-secondary, #999)' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
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
            const storePath = getRoute(item.path, storeSlug);
            const isActive = location.pathname === storePath || location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={storePath} 
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

