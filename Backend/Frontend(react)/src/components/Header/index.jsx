import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useStore } from '../../contexts/StoreContext';
import { useLoginPrompt } from '../../contexts/LoginPromptContext';
import { NAV_ITEMS } from '../../constants/routes';
import { ROUTES, getRoute } from '../../constants/routes';
import { STORAGE_KEYS } from '../../constants/config';
import LoginModal from './LoginModal';
import MobileSidebar from './MobileSidebar';
import SearchModal from './SearchModal';
import ProfileSidebar from './ProfileSidebar';

/**
 * Header Component
 * Main navigation header with desktop and mobile views
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, sendOTP, verifyOTP, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { storeSlug } = useStore();
  const { showLoginModal, closeLoginModal, executePendingAction, actionMessage, promptLogin } = useLoginPrompt();
  
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getCartItemCount();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    // Show login modal on home page for new users (only if not already shown by LoginPrompt)
    if (location.pathname === ROUTES.HOME && !user && !localStorage.getItem(STORAGE_KEYS.HAS_SEEN_LOGIN) && !showLoginModal) {
      // This is handled by LoginPromptContext now, but keep for backward compatibility
    }
  }, [location.pathname, user, showLoginModal]);

  // Debug: Log when showLoginModal changes
  useEffect(() => {
    console.log('🎯 [Header] showLoginModal changed:', showLoginModal, 'actionMessage:', actionMessage);
  }, [showLoginModal, actionMessage]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendOTP(phone);
      setShowOTPForm(true);
    } catch (error) {
      alert(error.message || 'Failed to send OTP');
    }
  };

  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(phone, otp, customerName || null);
      setShowOTPForm(false);
      setPhone('');
      setOtp('');
      setCustomerName('');
      closeLoginModal();
      
      // Execute pending action (e.g., add to cart/wishlist) after successful login
      setTimeout(() => {
        executePendingAction();
      }, 100);
      
      // Small delay before reload to allow pending action to execute
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      alert(error.message || 'Invalid OTP');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileSidebarOpen(false);
    navigate(getRoute(ROUTES.HOME, storeSlug));
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner container">
          <div className="left-group">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle Menu"
            >
              ☰
            </button>
            <div className="mobile-header-avatar" onClick={() => setMobileMenuOpen(true)}>
              {user ? (
                <img 
                  src="/assets/default-avatar.png" 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }} 
                />
              ) : null}
              <svg 
                viewBox="0 0 24 24" 
                width="32" 
                height="32" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                style={{display: user ? 'none' : 'block'}}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="avatar desktop-avatar" aria-hidden="true">
              <Link 
                to={getRoute(ROUTES.HOME, storeSlug)} 
                style={{
                  textDecoration:'none',
                  color:'inherit',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  width:'100%',
                  height:'100%'
                }}
              >
                <span>V</span>
              </Link>
            </div>
            <div className="divider"></div>
            <nav className="main-nav" aria-label="Main">
              {NAV_ITEMS.map((item) => {
                const storePath = getRoute(item.path, storeSlug);
                return (
                <Link 
                  key={item.path}
                    to={storePath} 
                    className={`nav-item ${location.pathname === storePath || location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
                );
              })}
            </nav>
          </div>
          <div className="right-group">
            <div className="dark-mode-toggle-container">
              <label className="dark-mode-toggle" title="Toggle Dark Mode">
                <input 
                  type="checkbox" 
                  className="toggle-input"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <span className="toggle-track">
                  <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span className="toggle-indicator"></span>
                </span>
              </label>
            </div>

            <button 
              className="icon-btn" 
              onClick={() => setShowSearchModal(true)} 
              title="Search Products"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="6" strokeWidth="1.6"></circle>
                <path d="M21 21l-4.35-4.35" strokeWidth="1.6" strokeLinecap="round"></path>
              </svg>
            </button>

            <button 
              className="icon-btn" 
              onClick={() => navigate(getRoute(ROUTES.WISHLIST, storeSlug))} 
              title="Wishlist"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" strokeLinejoin="round"></path>
              </svg>
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </button>

            <button 
              className="icon-btn" 
              onClick={() => navigate(getRoute(ROUTES.CART, storeSlug))} 
              title="Cart"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M6 6h15l-1.5 9h-12z" strokeWidth="1.5" strokeLinejoin="round"></path>
                <circle cx="10" cy="20" r="1.4" strokeWidth="1.5"></circle>
                <circle cx="18" cy="20" r="1.4" strokeWidth="1.5"></circle>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>

            <button 
              className="icon-btn" 
              onClick={() => setProfileSidebarOpen(true)} 
              title="Profile"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <button 
              className="mobile-login-btn" 
              onClick={() => promptLogin(null, 'Please login to continue')}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        storeSlug={storeSlug}
        onSignIn={() => {
          promptLogin(null, 'Please login to continue');
          setMobileMenuOpen(false);
        }}
        onSignOut={handleLogout}
      />

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        showOTPForm={showOTPForm}
        phone={phone}
        customerName={customerName}
        otp={otp}
        demoOtp={null}
        actionMessage={actionMessage}
        onClose={() => {
          closeLoginModal();
          setShowOTPForm(false);
          setPhone('');
          setOtp('');
          setCustomerName('');
        }}
        onPhoneSubmit={handlePhoneSubmit}
        onOTPSubmit={handleOTPSubmit}
        onPhoneChange={handlePhoneChange}
        onCustomerNameChange={handleCustomerNameChange}
        onOtpChange={handleOtpChange}
        onBack={() => setShowOTPForm(false)}
      />

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={profileSidebarOpen}
        onClose={() => setProfileSidebarOpen(false)}
        user={user}
        storeSlug={storeSlug}
        onLogout={handleLogout}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storeSlug={storeSlug}
      />
    </>
  );
};

export default Header;
