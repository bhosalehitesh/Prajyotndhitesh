import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES, getRoute } from '../../constants/routes';

/**
 * Profile Sidebar Component
 * User profile menu with navigation options
 */
const ProfileSidebar = ({ isOpen, onClose, user, storeSlug, onLogout }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const menuItems = [
    { path: ROUTES.ORDERS, label: 'My Orders', icon: 'orders' },
    { path: ROUTES.WISHLIST, label: 'My Wishlist', icon: 'wishlist' },
    { path: ROUTES.CART, label: 'Shopping Cart', icon: 'cart' },
    { path: ROUTES.ORDER_TRACKING, label: 'Track Order', icon: 'location' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      orders: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
      wishlist: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
      cart: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
      location: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  return (
    <>
      <div className="profile-sidebar-overlay" onClick={onClose}></div>
      <div className="profile-sidebar">
        <div className="profile-sidebar-header">
          <button className="profile-sidebar-close" onClick={onClose} aria-label="Close Menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="profile-sidebar-content">
          <div className="profile-sidebar-user">
            <div className="profile-sidebar-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="profile-sidebar-info">
              <div className="profile-sidebar-name">{user ? user.name : 'Hello User'}</div>
              <div className="profile-sidebar-phone">{user ? user.phone : '+1234567890'}</div>
            </div>
          </div>
          <div className="profile-sidebar-menu">
            {menuItems.map((item) => {
              const storePath = getRoute(item.path, storeSlug);
              return (
              <Link 
                key={item.path}
                  to={storePath} 
                className="profile-sidebar-item" 
                onClick={onClose}
              >
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </Link>
              );
            })}
            <div className="profile-sidebar-divider"></div>
            <div className="profile-sidebar-item" onClick={toggleTheme}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                <circle cx="8" cy="12" r="3"></circle>
              </svg>
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <Link to={getRoute(ROUTES.FAQ, storeSlug)} className="profile-sidebar-item" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Help & FAQ</span>
            </Link>
            {user && (
              <div className="profile-sidebar-item" onClick={onLogout} style={{cursor: 'pointer'}}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;

