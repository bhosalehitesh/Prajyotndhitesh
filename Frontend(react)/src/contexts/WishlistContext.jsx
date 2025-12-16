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
            const transformedWishlist = backendWishlist.map(item => {
              const productId = item.product?.productsId || item.productId || item.id;
              // Extract sellerId from product (product.seller.sellerId or product.sellerId)
              const sellerId = item.product?.seller?.sellerId || item.product?.sellerId || item.sellerId;
              return {
                id: item.wishlistItemId || item.id || productId,
                productId: productId, // Always ensure productId is set
                name: item.product?.productName || item.name || 'Product',
                price: item.product?.sellingPrice || item.price || 0,
                originalPrice: item.product?.mrp || item.originalPrice,
                image: item.product?.productImages?.[0] || item.image || '/assets/products/p1.jpg',
                brand: item.product?.brand || 'Store',
                sellerId: sellerId, // Add sellerId for store filtering
                addedAt: item.createdAt || item.addedAt || new Date().toISOString()
              };
            });
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

    // Optimistically update UI immediately for instant feedback
    const optimisticItem = {
      id: item.id || productId,
      productId: productId,
      name: item.name || item.productName || 'Product',
      price: item.price || item.sellingPrice || 0,
      originalPrice: item.originalPrice || item.mrp,
      image: item.image || item.productImages?.[0] || '/assets/products/p1.jpg',
      brand: item.brand || 'Store',
      sellerId: item.sellerId || item.seller?.sellerId, // Include sellerId for filtering
      addedAt: new Date().toISOString()
    };
    
    // Update UI immediately
    setWishlist(prevWishlist => {
      const exists = prevWishlist.some(w => 
        String(w.productId) === String(productId) || String(w.id) === String(productId)
      );
      if (exists) return prevWishlist;
      return [...prevWishlist, optimisticItem];
    });

    if (isAuthenticated && user?.userId && productId) {
      // Sync to backend in background
      try {
        console.log('💾 [Wishlist] Saving to backend - userId:', user.userId, 'productId:', productId);
        const result = await addToWishlistAPI(user.userId, productId);
        console.log('✅ [Wishlist] Successfully saved to backend:', result);
        
        // Optionally refresh to get server-generated ID, but don't block UI
        getWishlist(user.userId).then(backendWishlist => {
          console.log('🔄 [Wishlist] Refreshed from backend:', backendWishlist);
          if (Array.isArray(backendWishlist)) {
            const transformedWishlist = backendWishlist.map(wishlistItem => {
              const sellerId = wishlistItem.product?.seller?.sellerId || wishlistItem.product?.sellerId || wishlistItem.sellerId;
              return {
                id: wishlistItem.wishlistItemId || wishlistItem.id || wishlistItem.product?.productsId,
                productId: wishlistItem.product?.productsId || wishlistItem.productId || wishlistItem.productId,
                name: wishlistItem.product?.productName || wishlistItem.name || 'Product',
                price: wishlistItem.product?.sellingPrice || wishlistItem.price || 0,
                originalPrice: wishlistItem.product?.mrp || wishlistItem.originalPrice,
                image: wishlistItem.product?.productImages?.[0] || wishlistItem.image || '/assets/products/p1.jpg',
                brand: wishlistItem.product?.brand || 'Store',
                sellerId: sellerId, // Add sellerId for store filtering
                addedAt: wishlistItem.createdAt || wishlistItem.addedAt || new Date().toISOString()
              };
            });
            setWishlist(transformedWishlist);
          }
        }).catch(err => console.error('❌ [Wishlist] Background refresh error:', err));
      } catch (error) {
        console.error('❌ [Wishlist] Error adding to backend wishlist:', error);
        console.error('❌ [Wishlist] Error details:', {
          message: error.message,
          userId: user.userId,
          productId: productId,
          stack: error.stack
        });
        // Revert optimistic update on error
        setWishlist(prevWishlist => 
          prevWishlist.filter(w => String(w.productId) !== String(productId) && String(w.id) !== String(productId))
        );
      }
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
    const item = wishlist.find(i => String(i.id) === String(itemId) || String(i.productId) === String(itemId));
    const productId = item?.productId || itemId;

    // Optimistically update UI immediately
    const previousWishlist = [...wishlist];
    setWishlist(prevWishlist => 
      prevWishlist.filter(i => String(i.id) !== String(itemId) && String(i.productId) !== String(itemId))
    );

    if (isAuthenticated && user?.userId && productId) {
      try {
        console.log('🗑️ [Wishlist] Removing from backend - userId:', user.userId, 'productId:', productId);
        await removeFromWishlistAPI(user.userId, productId);
        console.log('✅ [Wishlist] Successfully removed from backend');
        
        // Optionally refresh in background, but don't block UI
        getWishlist(user.userId).then(backendWishlist => {
          console.log('🔄 [Wishlist] Refreshed from backend after removal:', backendWishlist);
          if (Array.isArray(backendWishlist)) {
            const transformedWishlist = backendWishlist.map(wishlistItem => {
              const sellerId = wishlistItem.product?.seller?.sellerId || wishlistItem.product?.sellerId || wishlistItem.sellerId;
              return {
                id: wishlistItem.wishlistItemId || wishlistItem.id || wishlistItem.product?.productsId,
                productId: wishlistItem.product?.productsId || wishlistItem.productId || wishlistItem.productId,
                name: wishlistItem.product?.productName || wishlistItem.name || 'Product',
                price: wishlistItem.product?.sellingPrice || wishlistItem.price || 0,
                originalPrice: wishlistItem.product?.mrp || wishlistItem.originalPrice,
                image: wishlistItem.product?.productImages?.[0] || wishlistItem.image || '/assets/products/p1.jpg',
                brand: wishlistItem.product?.brand || 'Store',
                sellerId: sellerId, // Add sellerId for store filtering
                addedAt: wishlistItem.createdAt || wishlistItem.addedAt || new Date().toISOString()
              };
            });
            setWishlist(transformedWishlist);
          } else {
            setWishlist([]);
          }
        }).catch(err => console.error('❌ [Wishlist] Background refresh error:', err));
      } catch (error) {
        console.error('❌ [Wishlist] Error removing from backend wishlist:', error);
        console.error('❌ [Wishlist] Error details:', {
          message: error.message,
          userId: user.userId,
          productId: productId,
          stack: error.stack
        });
        // Revert optimistic update on error
        setWishlist(previousWishlist);
      }
    }
  };

  const isInWishlist = (itemId) => {
    if (!itemId) return false;
    const checkId = String(itemId);
    return wishlist.some(item => 
      String(item.id) === checkId || 
      String(item.productId) === checkId ||
      (item.productId && String(item.productId) === checkId)
    );
  };

  /**
   * Get wishlist count filtered by sellerId (for store-specific badge count)
   * @param {number|string} sellerId - Seller ID to filter by
   * @returns {number} Count of wishlist items for the given seller
   */
  const getWishlistCountBySeller = (sellerId) => {
    if (!sellerId) return wishlist.length; // If no sellerId, return total count
    return wishlist.filter(item => {
      const itemSellerId = item.sellerId;
      if (!itemSellerId) return false; // Exclude items without sellerId
      return String(itemSellerId) === String(sellerId);
    }).length;
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCountBySeller
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

