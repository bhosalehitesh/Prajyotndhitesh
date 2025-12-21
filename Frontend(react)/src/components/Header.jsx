import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useLoginPrompt } from '../contexts/LoginPromptContext';
import { getStoreProducts } from '../utils/api';
import LoginModal from './Header/LoginModal';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { wishlist, getWishlistCountBySeller } = useWishlist();
  const { user, sendOTP, verifyOTP, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { storeSlug, currentStore } = useStore();
  const { showLoginModal, closeLoginModal, executePendingAction, actionMessage, promptLogin } = useLoginPrompt();
  const logoUrl = currentStore?.logo;
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const cartCount = getCartItemCount();
  // Get wishlist count filtered by current store's sellerId
  const wishlistCount = currentStore?.sellerId
    ? getWishlistCountBySeller(currentStore.sellerId)
    : wishlist.length; // Fallback to total count if no store context

  // Note: Login modal is now controlled by LoginPromptContext
  // This useEffect is kept for backward compatibility but won't show modal automatically
  useEffect(() => {
    // Check if user should see login modal on home page
    if (location.pathname === '/' && !user && !localStorage.getItem('hasSeenLogin')) {
      // Modal is now controlled by LoginPromptContext, so we don't set it here
    }
  }, [location.pathname, user]);

  // Fetch products, categories, and collections for search suggestions
  useEffect(() => {
    if (showSearchModal) {
      const slug = storeSlug || currentStore?.slug;
      if (slug) {
        const fetchData = async () => {
          try {
            // Use existing api imports or assume they are available via useStore or local
            const { getStoreProducts, getStoreCategories, getStoreCollections } = await import('../utils/api');

            if (allProducts.length === 0) {
              const prodData = await getStoreProducts(slug);
              if (Array.isArray(prodData)) setAllProducts(prodData);
            }
            if (allCategories.length === 0) {
              const catData = await getStoreCategories(slug);
              if (Array.isArray(catData)) setAllCategories(catData);
            }
            if (allCollections.length === 0) {
              const colData = await getStoreCollections(slug);
              if (Array.isArray(colData)) setAllCollections(colData);
            }
          } catch (error) {
            console.error('Failed to preload search data', error);
          }
        };
        fetchData();
      }
    }
  }, [showSearchModal, storeSlug, currentStore, allProducts.length, allCategories.length, allCollections.length]);

  // Filter suggestions across products, categories, and collections
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const lowerQ = searchQuery.toLowerCase();

      // 1. Match Products
      const productMatches = (allProducts || [])
        .filter(p => {
          const name = (p.name || p.productName || '').toLowerCase();
          const rawCat = p.productCategory || p.category || p.businessCategory;
          const catName = (typeof rawCat === 'object' ? rawCat?.name : String(rawCat || '')).toLowerCase();
          return name.includes(lowerQ) || catName.includes(lowerQ);
        })
        .slice(0, 4)
        .map(p => ({ ...p, type: 'product' }));

      // 2. Match Categories
      const categoryMatches = (allCategories || [])
        .filter(c => (c.name || c.categoryName || '').toLowerCase().includes(lowerQ))
        .slice(0, 2)
        .map(c => ({ ...c, type: 'category' }));

      // 3. Match Collections
      const collectionMatches = (allCollections || [])
        .filter(c => (c.name || c.collectionName || '').toLowerCase().includes(lowerQ))
        .slice(0, 2)
        .map(c => ({ ...c, type: 'collection' }));

      setSuggestions([...categoryMatches, ...collectionMatches, ...productMatches]);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allProducts, allCategories, allCollections]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    // Validate customer name
    if (!customerName || customerName.trim() === '') {
      alert('Please enter your name');
      return;
    }
    
    // Validate phone number
    if (!phone || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      const response = await sendOTP(phone);
      // Extract demo OTP from response if available
      if (response && response.otp) {
        setDemoOtp(response.otp);
        // Auto-fill the OTP input field with demo OTP
        setOtp(response.otp);
        console.log('Demo OTP received:', response.otp);
      } else {
        setDemoOtp('');
      }
      setShowOTPForm(true);
    } catch (error) {
      alert(error.message || 'Failed to send OTP');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use customerName as fullName
      const fullName = customerName.trim();
      await verifyOTP(phone, otp, fullName);
      setShowOTPForm(false);
      setPhone('');
      setCustomerName('');
      setOtp('');
      setDemoOtp('');
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
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const basePath = storeSlug ? `/store/${storeSlug}` : '';
      navigate(`${basePath}/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchModal(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (item) => {
    const slug = storeSlug || currentStore?.slug;
    const basePath = slug ? `/store/${slug}` : '';

    if (item.type === 'category') {
      const catSlug = item.slug || item.categorySlug || item.name || item.categoryName;
      navigate(`${basePath}/products?category=${encodeURIComponent(catSlug)}`);
    } else if (item.type === 'collection') {
      navigate(`${basePath}/collections/${item.id || item.collectionId}`);
    } else {
      const detailPath = `${basePath}/product/detail`;
      const params = new URLSearchParams({
        id: item.id || item.productId,
        name: item.name || item.productName || '',
        price: item.price || item.sellingPrice || '',
        image: item.image || (Array.isArray(item.productImages) ? item.productImages[0] : '')
      });
      navigate(`${detailPath}?${params.toString()}`);
    }

    setShowSearchModal(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <>
      <header className="topbar redesigned-navbar">
        {/* Light pink accent stripe at top */}
        <div className="navbar-accent-stripe"></div>
        
        <div className="topbar-inner container">
          <div className="left-group">
            {/* Mobile menu button - hidden on desktop */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
              <span>☰</span>
            </button>
            
            {/* Profile Icon - Far Left - Opens Sidebar */}
            <button 
              className="profile-icon-btn"
              onClick={() => {
                console.log('Profile icon clicked, opening sidebar');
                setProfileSidebarOpen(true);
              }}
              title="Menu"
              aria-label="Open Menu"
            >
              {user ? (
                <img 
                  src="/assets/default-avatar.png" 
                  alt="Profile" 
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }} 
                />
              ) : null}
              <svg 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                style={{ display: user ? 'none' : 'block' }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            
            {/* Mobile header avatar - for mobile view */}
            <div className="mobile-header-avatar" onClick={() => setMobileMenuOpen(true)}>
              {user ? (
                <img src="/assets/default-avatar.png" alt="Profile" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }} />
              ) : null}
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: user ? 'none' : 'block' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            {/* Logo with Shopping Bag Icon */}
            <Link
              to={storeSlug ? `/store/${storeSlug}` : '/'}
              className="navbar-logo-link"
              aria-label="Home"
            >
              <div className="navbar-logo">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={currentStore?.name || currentStore?.storeName || 'Store logo'}
                    className="navbar-logo-img"
                    onError={(e) => {
                      console.error('Failed to load store logo:', logoUrl);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="navbar-logo-default" style={{ display: logoUrl ? 'none' : 'flex' }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#E83B8F" strokeWidth="1.5">
                    <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round"></path>
                    <circle cx="10" cy="20" r="1.4"></circle>
                    <circle cx="18" cy="20" r="1.4"></circle>
                  </svg>
                </div>
                <span className="navbar-logo-text">{(currentStore?.name || currentStore?.storeName || 'Store').toUpperCase()}</span>
              </div>
            </Link>

            {/* Vertical Separator */}
            <div className="navbar-divider"></div>

            {/* Navigation Links */}
            <nav className="main-nav redesigned-nav" aria-label="Main">
              <Link
                to={storeSlug ? `/store/${storeSlug}/categories` : '/categories'}
                className={`nav-item redesigned-nav-item ${location.pathname.includes('/categories') ? 'active' : ''}`}
              >
                <span>Categories</span>
              </Link>
              <Link
                to={storeSlug ? `/store/${storeSlug}/featured` : '/featured'}
                className={`nav-item redesigned-nav-item ${location.pathname.includes('/featured') ? 'active' : ''}`}
              >
                <span>Featured</span>
              </Link>
              <Link
                to={storeSlug ? `/store/${storeSlug}/products` : '/products'}
                className={`nav-item redesigned-nav-item ${location.pathname.includes('/products') ? 'active' : ''}`}
              >
                <span>Products</span>
              </Link>
            </nav>
          </div>

          {showSearchModal && (
            <div style={{ flex: 1, margin: '0 20px', maxWidth: '600px', position: 'relative' }}>
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f1f3f4',
                  borderRadius: showSearchModal && suggestions.length > 0 ? '8px 8px 0 0' : '8px',
                  padding: '0 12px',
                  height: '40px',
                  width: '100%'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5f6368" strokeWidth="2" style={{ marginRight: '10px' }}>
                    <circle cx="11" cy="11" r="6"></circle>
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round"></path>
                  </svg>

                  <input
                    type="text"
                    className="search-input"
                    placeholder="Try Saree, Kurti or Search by Product Code"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#202124',
                      background: 'transparent',
                      height: '100%'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowSearchModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#5f6368'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </form>

              {/* Auto-suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  borderTop: '1px solid #e8eaed',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 4px 6px rgba(32,33,36,0.28)',
                  zIndex: 2000,
                  overflow: 'hidden',
                  paddingBottom: '8px'
                }}>
                  {suggestions.map((item, idx) => {
                    const itemName = item.name || item.productName || item.categoryName || item.collectionName || '';
                    const itemImage = item.image || (Array.isArray(item.productImages) ? item.productImages[0] : item.categoryImage || item.collectionImage);
                    const itemType = item.type || 'product';
                    const category = item.productCategory || item.category || item.businessCategory;
                    const catName = typeof category === 'object' ? (category.name || '') : String(category || '');

                    return (
                      <div
                        key={`${itemType}-${item.id || item.productId || item.category_id || item.collectionId || idx}`}
                        onClick={() => handleSuggestionClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f3f4'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginRight: '12px',
                          backgroundColor: '#f1f3f4',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {itemImage ? (
                            <img src={itemImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : itemType === 'category' ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="#9aa0a6"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                          ) : itemType === 'collection' ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="#9aa0a6"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9H10.07L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="#9aa0a6"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontSize: '14px', color: '#202124', fontWeight: '500', lineHeight: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {itemName}
                            <span style={{
                              fontSize: '10px',
                              backgroundColor: itemType === 'category' ? '#e8f0fe' : itemType === 'collection' ? '#fef7e0' : '#f1f3f4',
                              color: itemType === 'category' ? '#1967d2' : itemType === 'collection' ? '#b06000' : '#5f6368',
                              padding: '1px 6px',
                              borderRadius: '10px',
                              textTransform: 'uppercase',
                              fontWeight: '700'
                            }}>
                              {itemType}
                            </span>
                          </span>
                          <span style={{ fontSize: '12px', color: '#5f6368' }}>
                            {itemType === 'product' ? (catName || 'Product') : itemType === 'category' ? 'Store Category' : 'Product Collection'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div
                    onClick={handleSearch}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: '#1a73e8',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderTop: '1px solid #f1f3f4',
                      marginTop: '4px'
                    }}
                  >
                    See all results for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="right-group redesigned-right-group">
            {/* Dark Mode Toggle - Oval Switch Style */}
            <div className="dark-mode-toggle-container redesigned-toggle">
              <label className="dark-mode-toggle redesigned-dark-toggle" title="Toggle Dark Mode">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <span className="toggle-track redesigned-toggle-track">
                  <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
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
                  <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span className="toggle-indicator redesigned-toggle-indicator"></span>
                </span>
              </label>
            </div>

            {/* Search Icon */}
            <button 
              className="icon-btn redesigned-icon-btn" 
              onClick={() => setShowSearchModal(true)} 
              title="Search Products"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="6"></circle>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"></path>
              </svg>
            </button>

            {/* Wishlist Icon */}
            <button
              className="icon-btn redesigned-icon-btn"
              onClick={() => navigate(storeSlug ? `/store/${storeSlug}/wishlist` : '/wishlist')}
              title="Wishlist"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round"></path>
              </svg>
              {wishlistCount > 0 && <span className="wishlist-count redesigned-badge">{wishlistCount}</span>}
            </button>

            {/* Cart Icon with Red Badge */}
            <button
              className="icon-btn redesigned-icon-btn redesigned-cart-btn"
              onClick={() => navigate(storeSlug ? `/store/${storeSlug}/cart` : '/cart')}
              title="Cart"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round"></path>
                <circle cx="10" cy="20" r="1.4"></circle>
                <circle cx="18" cy="20" r="1.4"></circle>
              </svg>
              {cartCount > 0 && <span className="cart-count redesigned-badge redesigned-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-sidebar-overlay active" onClick={() => setMobileMenuOpen(false)}></div>
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
                      {(() => {
                        const displayName = user.fullName || user.name || '';
                        return displayName ? displayName.charAt(0).toUpperCase() : 'U';
                      })()}
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
                        {user.fullName || user.name || 'Guest'}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-secondary, #666)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.phone || user.mobileNumber || 'No phone'}
                      </div>
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
                <button className="mobile-sidebar-signin-btn" onClick={() => { promptLogin(null, 'Please login to continue'); setMobileMenuOpen(false); }}>
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
      <LoginModal
        show={showLoginModal}
        showOTPForm={showOTPForm}
        phone={phone}
        customerName={customerName}
        otp={otp}
        demoOtp={demoOtp}
        actionMessage={actionMessage}
        onClose={() => {
          closeLoginModal();
          setShowOTPForm(false);
          setPhone('');
          setOtp('');
          setCustomerName('');
          setDemoOtp('');
        }}
        onPhoneSubmit={handlePhoneSubmit}
        onOTPSubmit={handleOTPSubmit}
        onPhoneChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
        onCustomerNameChange={(e) => setCustomerName(e.target.value)}
        onOtpChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onBack={() => setShowOTPForm(false)}
      />

      {/* Profile Sidebar */}
      {profileSidebarOpen && (
        <>
          <div className="profile-sidebar-overlay active" onClick={() => setProfileSidebarOpen(false)}></div>
          <div className="profile-sidebar active">
            {/* User Profile Details at Absolute Top (if logged in) */}
            {user && (
              <div className="profile-sidebar-user-top" style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                marginBottom: '0'
              }}>
                {/* Close Button at Top Right */}
                <button className="profile-sidebar-close" onClick={() => setProfileSidebarOpen(false)} aria-label="Close Menu" style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                {/* Avatar */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#E83B8F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {user.fullName || user.name ? (
                    (user.fullName || user.name).charAt(0).toUpperCase()
                  ) : (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
                {/* User Info */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '32px' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: '4px',
                    lineHeight: '1.4'
                  }}>
                    {user.fullName || user.name || 'Guest'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    lineHeight: '1.4'
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.6 }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{user.phone || user.mobileNumber || 'No phone'}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Header with Close Button (if not logged in) */}
            {!user && (
              <div className="profile-sidebar-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
              }}>
                <button className="profile-sidebar-close" onClick={() => setProfileSidebarOpen(false)} aria-label="Close Menu" style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
            <div className="profile-sidebar-content" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              height: user ? 'calc(100% - 97px)' : 'calc(100% - 73px)',
              overflowY: 'auto'
            }}>

              {/* Homepage Button - Same style as other items */}
              <Link
                to={storeSlug ? `/store/${storeSlug}` : '/'}
                className={`profile-sidebar-item ${(location.pathname === '/' || location.pathname === `/store/${storeSlug}`) ? 'active' : ''}`}
                onClick={() => setProfileSidebarOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Homepage</span>
              </Link>

              {/* Navigation Links - All with consistent styling */}
              <nav className="profile-sidebar-nav" style={{ marginBottom: '0' }}>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/featured` : '/featured'}
                  className={`profile-sidebar-item ${location.pathname.includes('/featured') ? 'active' : ''}`}
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  <span>Featured Products</span>
                </Link>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/products` : '/products'}
                  className={`profile-sidebar-item ${(location.pathname.includes('/products') && !location.pathname.includes('/product/detail')) ? 'active' : ''}`}
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                  <span>All Products</span>
                </Link>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/categories` : '/categories'}
                  className={`profile-sidebar-item ${location.pathname.includes('/categories') ? 'active' : ''}`}
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span>Categories</span>
                </Link>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/collections` : '/collections'}
                  className={`profile-sidebar-item ${location.pathname.includes('/collections') ? 'active' : ''}`}
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span>Collections</span>
                </Link>
              </nav>


              {/* Existing Menu Items */}
              <div className="profile-sidebar-menu">
                <Link to="/orders" className="profile-sidebar-item" onClick={() => setProfileSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>My Orders</span>
                </Link>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/wishlist` : '/wishlist'}
                  className={`profile-sidebar-item ${location.pathname.includes('/wishlist') ? 'active' : ''}`}
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>My Wishlist</span>
                </Link>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/cart` : '/cart'}
                  className={`profile-sidebar-item ${location.pathname.includes('/cart') ? 'active' : ''}`}
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Shopping Cart</span>
                </Link>
                <Link 
                  to="/order-tracking" 
                  className={`profile-sidebar-item ${location.pathname.includes('/order-tracking') ? 'active' : ''}`} 
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Track Order</span>
                </Link>
                
                {/* Sign In Button at Bottom - Pink Color */}
                {!user && (
                  <>
                    <div className="profile-sidebar-divider"></div>
                    <button 
                      className="profile-sidebar-signin-btn"
                      onClick={() => {
                        promptLogin(null, 'Please login to continue');
                        setProfileSidebarOpen(false);
                      }}
                      style={{
                        margin: '12px 20px',
                        padding: '14px 20px',
                        backgroundColor: '#E83B8F',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: 'calc(100% - 40px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D02B81'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E83B8F'}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Sign In</span>
                    </button>
                  </>
                )}
                
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
                  <div className="profile-sidebar-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
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
    </>
  );
};

export default Header;

