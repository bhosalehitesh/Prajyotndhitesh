import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLoginPrompt } from './LoginPromptContext';
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
  const { promptLogin } = useLoginPrompt();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from backend (if logged in) or localStorage (if guest)
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      
      // Clear localStorage for authenticated users to avoid stale data
      if (isAuthenticated && user?.userId) {
        localStorage.removeItem('wishlist');
      }
      
      try {
        if (isAuthenticated && user?.userId) {
          // Always fetch fresh data from backend for authenticated users
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
            // Immediately update state with backend data
            setWishlist(transformedWishlist);
            console.log('✅ [Wishlist] Wishlist updated from backend:', transformedWishlist.length, 'items');
          } else {
            setWishlist([]);
            console.log('✅ [Wishlist] Backend wishlist is empty');
          }
        } else {
          // Guest user - load from localStorage
          console.log('❤️ [Wishlist] Loading wishlist from localStorage (guest user)');
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            try {
              const parsedWishlist = JSON.parse(savedWishlist);
              setWishlist(parsedWishlist);
              console.log('✅ [Wishlist] Loaded from localStorage:', parsedWishlist.length, 'items');
            } catch (e) {
              console.error('Error loading wishlist:', e);
              setWishlist([]);
            }
          } else {
            setWishlist([]);
          }
        }
      } catch (error) {
        console.error('❌ [Wishlist] Error loading wishlist:', error);
        // For authenticated users, don't fallback to localStorage - keep empty
        if (isAuthenticated && user?.userId) {
          setWishlist([]);
          console.log('⚠️ [Wishlist] Backend error - cleared wishlist for authenticated user');
        } else {
          // Guest user - fallback to localStorage on error
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            try {
              setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
              setWishlist([]);
            }
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
    try {
      // Check authentication first - show login modal if not authenticated
      if (!isAuthenticated) {
        console.log('🔒 [Wishlist] User not authenticated, showing login modal');
        promptLogin(
          () => addToWishlist(item),
          'Please login to add items to your wishlist'
        );
        return;
      }
      
      console.log('✅ [Wishlist] User is authenticated, proceeding with add to wishlist');

      const productId = item?.productId || item?.id;
      
      if (!productId) {
        console.error('❌ [Wishlist] Cannot add item: missing productId or id');
        return;
      }

      // Check if item already exists
      const alreadyExists = wishlist.some(w => 
        String(w.productId) === String(productId) || String(w.id) === String(productId)
      );
      
      if (alreadyExists) {
        return;
      }

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
    
      // Update UI immediately and capture the new wishlist
      const previousWishlist = [...wishlist];
      const updatedWishlist = [...wishlist, optimisticItem];
      
      setWishlist(updatedWishlist);

      // Sync to backend for authenticated users
      if (isAuthenticated && user?.userId && productId) {
        // Convert productId to number if it's a string
        const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      
        if (isNaN(numericProductId)) {
          console.error('❌ [Wishlist] Invalid productId:', productId);
          // Revert optimistic update on error
          setWishlist(prevWishlist => 
            prevWishlist.filter(w => String(w.productId) !== String(productId) && String(w.id) !== String(productId))
          );
          return;
        }

        // Sync to backend in background
        try {
          const result = await addToWishlistAPI(user.userId, numericProductId);
          
          // Optionally refresh to get server-generated ID, but don't block UI
          getWishlist(user.userId).then(backendWishlist => {
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
          // Revert optimistic update on error
          setWishlist(prevWishlist => 
            prevWishlist.filter(w => String(w.productId) !== String(productId) && String(w.id) !== String(productId))
          );
        }
      }
    } catch (error) {
      console.error('❌ [Wishlist] Unexpected error in addToWishlist:', error);
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
    try {
      console.log('🗑️ [Wishlist] Remove request for itemId:', itemId);
      console.log('🗑️ [Wishlist] Current wishlist:', wishlist);
      
      // Find the item to remove
      const item = wishlist.find(i => 
        String(i.id) === String(itemId) || 
        String(i.productId) === String(itemId)
      );
      
      if (!item) {
        console.warn('⚠️ [Wishlist] Item not found in wishlist:', itemId);
        return;
      }
      
      console.log('🗑️ [Wishlist] Found item to remove:', item);
      const productId = item.productId || itemId;
      console.log('🗑️ [Wishlist] Product ID to remove:', productId);

      // IMMEDIATELY update UI - remove from state synchronously for instant feedback
      const previousWishlist = [...wishlist];
      const updatedWishlist = wishlist.filter(i => 
        String(i.id) !== String(itemId) && 
        String(i.productId) !== String(itemId)
      );
      
      console.log('🗑️ [Wishlist] Filtered wishlist count:', updatedWishlist.length, 'Previous:', previousWishlist.length);
      
      setWishlist(updatedWishlist);

      // For guest users, immediately update localStorage
      if (!isAuthenticated) {
        try {
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          console.log('✅ [Wishlist] Updated localStorage for guest user');
        } catch (error) {
          console.error('❌ [Wishlist] Error updating localStorage:', error);
          // Revert on error
          setWishlist(previousWishlist);
          return;
        }
      }

      // Sync to backend in background (non-blocking) for authenticated users
      if (isAuthenticated && user?.userId && productId) {
        // Convert productId to number if it's a string
        const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
        
        if (isNaN(numericProductId)) {
          console.error('❌ [Wishlist] Invalid productId:', productId);
          // Revert on error
          setWishlist(previousWishlist);
          return;
        }

        console.log('🗑️ [Wishlist] Calling backend API to remove:', { userId: user.userId, productId: numericProductId });

        // Don't await - let it run in background for instant UI response
        removeFromWishlistAPI(user.userId, numericProductId)
          .then(() => {
            console.log('✅ [Wishlist] Successfully removed from backend');
            // Refresh from backend to sync state
            return getWishlist(user.userId);
          })
          .then(backendWishlist => {
            console.log('🔄 [Wishlist] Backend wishlist after removal:', backendWishlist);
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
              // Only update if the item is actually removed from backend
              const stillInBackend = transformedWishlist.some(w => 
                String(w.productId) === String(productId) || String(w.id) === String(productId)
              );
              if (!stillInBackend) {
                setWishlist(transformedWishlist);
                console.log('✅ [Wishlist] Synced with backend. Item removed successfully');
              } else {
                console.warn('⚠️ [Wishlist] Item still in backend, keeping local removal');
                // Keep the local removal - don't overwrite with backend data
              }
            } else {
              setWishlist([]);
            }
          })
          .catch(error => {
            console.error('❌ [Wishlist] Error removing from backend wishlist:', error);
            // Don't revert - keep the optimistic update since UI already updated
            // The item will be removed from UI even if backend call fails
          });
      }
    } catch (error) {
      console.error('❌ [Wishlist] Unexpected error in removeFromWishlist:', error);
    }
  };

  const isInWishlist = (itemId) => {
    if (!itemId) return false;
    const checkId = String(itemId);
    const found = wishlist.some(item => {
      const itemIdMatch = String(item.id) === checkId;
      const productIdMatch = String(item.productId) === checkId;
      return itemIdMatch || productIdMatch;
    });
    return found;
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

