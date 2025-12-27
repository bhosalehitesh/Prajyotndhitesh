import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useStore } from '../contexts/StoreContext';
import { ROUTES, getRoute } from '../constants/routes';

const MobileBottomNav = ({ onSearchClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getCartItemCount } = useCart();
    const { wishlist } = useWishlist();
    const { storeSlug } = useStore();

    const cartCount = getCartItemCount();
    const wishlistCount = wishlist.length;

    const isActive = (path) => {
        const fullPath = getRoute(path, storeSlug);
        return location.pathname === fullPath || (path === ROUTES.HOME && (location.pathname === '/' || location.pathname === `/store/${storeSlug}`));
    };

    return (
        <div className="mobile-bottom-nav">
            <Link to={getRoute(ROUTES.HOME, storeSlug)} className={`bottom-nav-item ${isActive(ROUTES.HOME) ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
            </Link>

            <button onClick={onSearchClick} className={`bottom-nav-item ${location.pathname.includes('search') ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Search</span>
            </button>

            <Link to={getRoute(ROUTES.WISHLIST, storeSlug)} className={`bottom-nav-item ${isActive(ROUTES.WISHLIST) ? 'active' : ''}`}>
                <div className="icon-with-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {wishlistCount > 0 && <span className="bottom-badge">{wishlistCount}</span>}
                </div>
                <span>Wishlist</span>
            </Link>

            <Link to={getRoute(ROUTES.CART, storeSlug)} className={`bottom-nav-item ${isActive(ROUTES.CART) ? 'active' : ''}`}>
                <div className="icon-with-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                        <path d="M3 6h18"></path>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    {cartCount > 0 && <span className="bottom-badge">{cartCount}</span>}
                </div>
                <span>Cart</span>
            </Link>

            <Link to={getRoute(ROUTES.ORDERS, storeSlug)} className={`bottom-nav-item ${isActive(ROUTES.ORDERS) ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Account</span>
            </Link>
        </div>
    );
};

export default MobileBottomNav;
