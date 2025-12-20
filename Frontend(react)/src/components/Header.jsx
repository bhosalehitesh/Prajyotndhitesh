import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { getStoreProducts } from '../utils/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { wishlist, getWishlistCountBySeller } = useWishlist();
  const { user, sendOTP, verifyOTP, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { storeSlug, currentStore } = useStore();
  const logoUrl = currentStore?.logo;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otp, setOtp] = useState('');
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

  useEffect(() => {
    // Check if user should see login modal on home page
    if (location.pathname === '/' && !user && !localStorage.getItem('hasSeenLogin')) {
      setTimeout(() => setShowLoginModal(true), 500);
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
      await sendOTP(phone);
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
      setShowLoginModal(false);
      setShowOTPForm(false);
      setPhone('');
      setCustomerName('');
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
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: user ? 'none' : 'block' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className={`avatar desktop-avatar ${logoUrl ? 'has-logo' : ''}`} aria-hidden="true">
              <Link
                to={storeSlug ? `/store/${storeSlug}` : '/'}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={currentStore?.name || currentStore?.storeName || 'Store logo'}
                    className="store-logo-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '4px',
                    }}
                    onError={(e) => {
                      console.error('Failed to load store logo:', logoUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>
                    {(currentStore?.name || currentStore?.storeName || 'V').charAt(0).toUpperCase()}
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

            <button
              className="icon-btn"
              onClick={() => navigate(storeSlug ? `/store/${storeSlug}/wishlist` : '/wishlist')}
              title="Wishlist"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" strokeLinejoin="round"></path>
              </svg>
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </button>

            <button
              className="icon-btn"
              onClick={() => navigate(storeSlug ? `/store/${storeSlug}/cart` : '/cart')}
              title="Cart"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M6 6h15l-1.5 9h-12z" strokeWidth="1.5" strokeLinejoin="round"></path>
                <circle cx="10" cy="20" r="1.4" strokeWidth="1.5"></circle>
                <circle cx="18" cy="20" r="1.4" strokeWidth="1.5"></circle>
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>

            {/* Profile icon removed as requested */}
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
                    <label htmlFor="customerName">Customer Name *</label>
                    <input
                      type="text"
                      id="customerName"
                      placeholder="Name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="loginPhone">Mobile Number *</label>
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
                      style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px', fontWeight: '600' }}
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
              {user && (
                <div className="profile-sidebar-user" style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '16px' }}>
                  <div className="profile-sidebar-avatar" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--vibrant-pink, #e83b8f)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="profile-sidebar-info" style={{ textAlign: 'center' }}>
                    <div className="profile-sidebar-name" style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: 'var(--text-color, #333)',
                      marginBottom: '8px'
                    }}>
                      {user.fullName || user.name || 'Guest'}
                    </div>
                    <div className="profile-sidebar-phone" style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-secondary, #666)',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      {user.phone || user.mobileNumber || 'No phone'}
                    </div>
                    {user.email && (
                      <div className="profile-sidebar-email" style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-secondary, #666)',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        {user.email}
                      </div>
                    )}
                    {(user.city || user.state) && (
                      <div className="profile-sidebar-location" style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-secondary, #666)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '8px'
                      }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {[user.city, user.state].filter(Boolean).join(', ') || 'Address not set'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!user && (
                <div className="profile-sidebar-user" style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '16px', textAlign: 'center' }}>
                  <div className="profile-sidebar-avatar" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-secondary, #999)' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="profile-sidebar-info">
                    <div className="profile-sidebar-name" style={{ fontSize: '16px', color: 'var(--text-secondary, #666)' }}>
                      Please sign in to view your profile
                    </div>
                  </div>
                </div>
              )}
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
                  className="profile-sidebar-item"
                  onClick={() => setProfileSidebarOpen(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>My Wishlist</span>
                </Link>
                <Link
                  to={storeSlug ? `/store/${storeSlug}/cart` : '/cart'}
                  className="profile-sidebar-item"
                  onClick={() => setProfileSidebarOpen(false)}
                >
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

