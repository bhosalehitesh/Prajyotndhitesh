import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI } from '../utils/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from backend (if logged in) or localStorage (if guest)
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && user?.userId) {
          // Fetch wishlist from backend
          console.log('❤️ [Wishlist] Loading wishlist from backend for user:', user.userId);
          const backendWishlist = await getWishlist(user.userId);
          console.log('❤️ [Wishlist] Backend wishlist response:', backendWishlist);
          
          // Transform backend wishlist items to frontend format
          if (Array.isArray(backendWishlist)) {
            const transformedWishlist = backendWishlist.map(item => ({
              id: item.id || item.wishlistItemId || item.product?.productsId,
              productId: item.product?.productsId || item.productId,
              name: item.product?.productName || item.name || 'Product',
              price: item.product?.sellingPrice || item.price || 0,
              originalPrice: item.product?.mrp || item.originalPrice,
              image: item.product?.productImages?.[0] || item.image || '/assets/products/p1.jpg',
              brand: item.product?.brand || 'Store',
              addedAt: item.createdAt || item.addedAt || new Date().toISOString()
            }));
            setWishlist(transformedWishlist);
          } else {
            setWishlist([]);
          }
        } else {
          // Guest user - load from localStorage
          console.log('❤️ [Wishlist] Loading wishlist from localStorage (guest user)');
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            try {
              setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
              console.error('Error loading wishlist:', e);
              setWishlist([]);
            }
          }
        }
      } catch (error) {
        console.error('❌ [Wishlist] Error loading wishlist:', error);
        // Fallback to localStorage on error
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          try {
            setWishlist(JSON.parse(savedWishlist));
          } catch (e) {
            setWishlist([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, user?.userId]);

  // Save wishlist to localStorage for guest users
  useEffect(() => {
    if (loading) return; // Don't save during initial load
    
    if (!isAuthenticated) {
      // Guest user - save to localStorage
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated, loading]);

  const addToWishlist = async (item) => {
    const productId = item.productId || item.id;

    if (isAuthenticated && user?.userId && productId) {
      // Sync to backend
      try {
        console.log('❤️ [Wishlist] Adding to backend wishlist:', { userId: user.userId, productId });
        await addToWishlistAPI(user.userId, productId);
        
        // Reload wishlist from backend
        const backendWishlist = await getWishlist(user.userId);
        if (Array.isArray(backendWishlist)) {
          const transformedWishlist = backendWishlist.map(wishlistItem => ({
            id: wishlistItem.wishlistItemId || wishlistItem.id || wishlistItem.product?.productsId,
            productId: wishlistItem.product?.productsId || wishlistItem.productId,
            name: wishlistItem.product?.productName || wishlistItem.name || 'Product',
            price: wishlistItem.product?.sellingPrice || wishlistItem.price || 0,
            originalPrice: wishlistItem.product?.mrp || wishlistItem.originalPrice,
            image: wishlistItem.product?.productImages?.[0] || wishlistItem.image || '/assets/products/p1.jpg',
            brand: wishlistItem.product?.brand || 'Store',
            addedAt: wishlistItem.addedAt || new Date().toISOString()
          }));
          setWishlist(transformedWishlist);
        }
      } catch (error) {
        console.error('❌ [Wishlist] Error adding to backend wishlist:', error);
        // Fallback to local state update
        addToWishlistLocal(item);
      }
    } else {
      // Guest user - update local state only
      addToWishlistLocal(item);
    }
  };

  const addToWishlistLocal = (item) => {
    setWishlist(prevWishlist => {
      // Create unique ID if not provided
      if (!item.id) {
        item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
      }

      // Check if item already exists
      const existingIndex = prevWishlist.findIndex(wishlistItem => 
        wishlistItem.productId === item.productId ||
        wishlistItem.id === item.id ||
        (wishlistItem.name === item.name && 
         wishlistItem.size === (item.size || 'default') &&
         (wishlistItem.color || 'default') === (item.color || 'default'))
      );

      if (existingIndex === -1) {
        return [...prevWishlist, {
          ...item,
          addedAt: new Date().toISOString()
        }];
      }

      return prevWishlist;
    });
  };

  const removeFromWishlist = async (itemId) => {
    const item = wishlist.find(i => i.id === itemId || i.productId === itemId);
    const productId = item?.productId || itemId;

    if (isAuthenticated && user?.userId && productId) {
      try {
        console.log('❤️ [Wishlist] Removing from backend wishlist:', { userId: user.userId, productId });
        await removeFromWishlistAPI(user.userId, productId);
        
        // Reload wishlist from backend
        const backendWishlist = await getWishlist(user.userId);
        if (Array.isArray(backendWishlist)) {
          const transformedWishlist = backendWishlist.map(wishlistItem => ({
            id: wishlistItem.wishlistItemId || wishlistItem.id || wishlistItem.product?.productsId,
            productId: wishlistItem.product?.productsId || wishlistItem.productId,
            name: wishlistItem.product?.productName || wishlistItem.name || 'Product',
            price: wishlistItem.product?.sellingPrice || wishlistItem.price || 0,
            originalPrice: wishlistItem.product?.mrp || wishlistItem.originalPrice,
            image: wishlistItem.product?.productImages?.[0] || wishlistItem.image || '/assets/products/p1.jpg',
            brand: wishlistItem.product?.brand || 'Store',
            addedAt: wishlistItem.addedAt || new Date().toISOString()
          }));
          setWishlist(transformedWishlist);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error('❌ [Wishlist] Error removing from backend wishlist:', error);
        setWishlist(prevWishlist => prevWishlist.filter(i => i.id !== itemId && i.productId !== productId));
      }
    } else {
      setWishlist(prevWishlist => prevWishlist.filter(i => i.id !== itemId));
    }
  };

  const isInWishlist = (itemId) => {
    return wishlist.some(item => item.id === itemId || item.productId === itemId);
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

