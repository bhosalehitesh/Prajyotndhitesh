import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Error loading wishlist:', e);
        setWishlist([]);
      }
    }
  }, []);

  useEffect(() => {
    // Save wishlist to localStorage whenever it changes
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (item) => {
    setWishlist(prevWishlist => {
      // Create unique ID if not provided
      if (!item.id) {
        item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
      }

      // Check if item already exists
      const existingIndex = prevWishlist.findIndex(wishlistItem => 
        wishlistItem.id === item.id ||
        (wishlistItem.name === item.name && 
         wishlistItem.size === (item.size || 'default') &&
         (wishlistItem.color || 'default') === (item.color || 'default'))
      );

      if (existingIndex === -1) {
        // Add new item
        return [...prevWishlist, {
          ...item,
          addedAt: new Date().toISOString()
        }];
      }

      return prevWishlist;
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== itemId));
  };

  const isInWishlist = (itemId) => {
    return wishlist.some(item => item.id === itemId);
  };

  const value = {
    wishlist,
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

