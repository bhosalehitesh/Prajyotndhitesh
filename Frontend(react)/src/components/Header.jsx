import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, sendOTP, verifyOTP, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { storeSlug, currentStore } = useStore();
  const logoUrl = currentStore?.logo;
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getCartItemCount();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    // Check if user should see login modal on home page
    if (location.pathname === '/' && !user && !localStorage.getItem('hasSeenLogin')) {
      setTimeout(() => setShowLoginModal(true), 500);
    }
  }, [location.pathname, user]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendOTP(phone);
      setShowOTPForm(true);
    } catch (error) {
      alert(error.message || 'Failed to send OTP');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(phone, otp);
      setShowLoginModal(false);
      setShowOTPForm(false);
      setPhone('');
      setOtp('');
      window.location.reload();
    } catch (error) {
      alert(error.message || 'Invalid OTP');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileSidebarOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner container">
          <div className="left-group">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">☰</button>
            <div className="mobile-header-avatar" onClick={() => setMobileMenuOpen(true)}>
              {user ? (
                <img src="/assets/default-avatar.png" alt="Profile" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }} />
              ) : null}
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" style={{display: user ? 'none' : 'block'}}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="avatar desktop-avatar" aria-hidden="true">
              <Link 
                to={storeSlug ? `/store/${storeSlug}` : '/'} 
                style={{
                  textDecoration:'none',
                  color:'inherit',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  width:'100%',
                  height:'100%',
                }}
              >
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={currentStore?.storeName || 'Store logo'}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>
                    {(currentStore?.storeName || 'V').charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            </div>
            <div className="divider"></div>
            <nav className="main-nav" aria-label="Main">
              <Link 
                to={storeSlug ? `/store/${storeSlug}/categories` : '/categories'} 
                className={`nav-item ${location.pathname.includes('/categories') ? 'active' : ''}`}
              >
                Categories
              </Link>
              <Link 
                to={storeSlug ? `/store/${storeSlug}/featured` : '/featured'} 
                className={`nav-item ${location.pathname.includes('/featured') ? 'active' : ''}`}
              >
                Featured
              </Link>
              <Link 
                to={storeSlug ? `/store/${storeSlug}/products` : '/products'} 
                className={`nav-item ${location.pathname.includes('/products') ? 'active' : ''}`}
              >
                Products
              </Link>
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

            <button className="icon-btn" onClick={() => setShowSearchModal(true)} title="Search Products">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="6" strokeWidth="1.6"></circle>
                <path d="M21 21l-4.35-4.35" strokeWidth="1.6" strokeLinecap="round"></path>
              </svg>
            </button>

            <button className="icon-btn" onClick={() => navigate('/wishlist')} title="Wishlist">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" strokeLinejoin="round"></path>
              </svg>
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </button>

            <button className="icon-btn" onClick={() => navigate('/cart')} title="Cart">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M6 6h15l-1.5 9h-12z" strokeWidth="1.5" strokeLinejoin="round"></path>
                <circle cx="10" cy="20" r="1.4" strokeWidth="1.5"></circle>
                <circle cx="18" cy="20" r="1.4" strokeWidth="1.5"></circle>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>

            <button className="icon-btn" onClick={() => setProfileSidebarOpen(true)} title="Profile">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <button className="mobile-login-btn" onClick={() => setShowLoginModal(true)}>Login</button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-sidebar-overlay active" onClick={() => setMobileMenuOpen(false)}></div>
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
              <button className="mobile-sidebar-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close Menu">
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
              <Link 
                to={storeSlug ? `/store/${storeSlug}` : '/'} 
                className={`mobile-sidebar-nav-item ${location.pathname === '/' || location.pathname === `/store/${storeSlug}` ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {(location.pathname === '/' || location.pathname === `/store/${storeSlug}`) && <span className="mobile-nav-indicator"></span>}
                <span>Homepage</span>
              </Link>
              <Link 
                to={storeSlug ? `/store/${storeSlug}/featured` : '/featured'} 
                className={`mobile-sidebar-nav-item ${location.pathname.includes('/featured') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {location.pathname.includes('/featured') && <span className="mobile-nav-indicator"></span>}
                <span>Featured Products</span>
              </Link>
              <Link 
                to={storeSlug ? `/store/${storeSlug}/products` : '/products'} 
                className={`mobile-sidebar-nav-item ${location.pathname.includes('/products') && !location.pathname.includes('/product/detail') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {location.pathname.includes('/products') && !location.pathname.includes('/product/detail') && <span className="mobile-nav-indicator"></span>}
                <span>All Products</span>
              </Link>
              <Link 
                to={storeSlug ? `/store/${storeSlug}/categories` : '/categories'} 
                className={`mobile-sidebar-nav-item ${location.pathname.includes('/categories') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {location.pathname.includes('/categories') && <span className="mobile-nav-indicator"></span>}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span>Categories</span>
              </Link>
              <Link 
                to={storeSlug ? `/store/${storeSlug}/collections` : '/collections'} 
                className={`mobile-sidebar-nav-item ${location.pathname.includes('/collections') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {location.pathname.includes('/collections') && <span className="mobile-nav-indicator"></span>}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span>Collections</span>
              </Link>
            </nav>

            <div className="mobile-sidebar-footer">
              {!user ? (
                <button className="mobile-sidebar-signin-btn" onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}>
                  Sign In
                </button>
              ) : (
                <button className="mobile-sidebar-signin-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay active" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="login-modal-close" onClick={() => setShowLoginModal(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {!showOTPForm ? (
              <div className="login-form-container">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Login or create an account</p>
                <form className="login-form" onSubmit={handlePhoneSubmit}>
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
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  <button type="submit" className="login-submit-btn">Get OTP</button>
                </form>
              </div>
            ) : (
              <div className="login-form-container">
                <h2 className="login-title">Verify OTP</h2>
                <p className="login-subtitle">We have sent a code by SMS to your phone.</p>
                <form className="login-form" onSubmit={handleOTPSubmit}>
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
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px', fontWeight: '600'}}
                    />
                  </div>
                  <button type="submit" className="login-submit-btn">Verify and Continue</button>
                  <button type="button" className="login-back-btn" onClick={() => setShowOTPForm(false)}>Back</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Sidebar */}
      {profileSidebarOpen && (
        <>
          <div className="profile-sidebar-overlay" onClick={() => setProfileSidebarOpen(false)}></div>
          <div className="profile-sidebar">
            <div className="profile-sidebar-header">
              <button className="profile-sidebar-close" onClick={() => setProfileSidebarOpen(false)} aria-label="Close Menu">
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
                <Link to="/orders" className="profile-sidebar-item" onClick={() => setProfileSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="profile-sidebar-item" onClick={() => setProfileSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>My Wishlist</span>
                </Link>
                <Link to="/cart" className="profile-sidebar-item" onClick={() => setProfileSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Shopping Cart</span>
                </Link>
                <Link to="/order-tracking" className="profile-sidebar-item" onClick={() => setProfileSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Track Order</span>
                </Link>
                <div className="profile-sidebar-divider"></div>
                <div className="profile-sidebar-item" onClick={toggleTheme}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                    <circle cx="8" cy="12" r="3"></circle>
                  </svg>
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <Link to="/faq" className="profile-sidebar-item" onClick={() => setProfileSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>Help & FAQ</span>
                </Link>
                {user && (
                  <div className="profile-sidebar-item" onClick={handleLogout} style={{cursor: 'pointer'}}>
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
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="search-modal" style={{display: 'flex'}} onClick={() => setShowSearchModal(false)}>
          <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Search Products</h3>
            <form onSubmit={handleSearch} style={{position: 'relative', marginBottom: '20px'}}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search for products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{width: '100%', padding: '12px 40px 12px 16px', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '1rem'}}
              />
              <button 
                type="button" 
                className="search-close" 
                onClick={() => setShowSearchModal(false)}
                style={{position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
              >
                &times;
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

