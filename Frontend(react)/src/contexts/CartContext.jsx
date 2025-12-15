import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartStoreId, setCartStoreId] = useState(null); // Store ID that cart is locked to
  const [cartSellerId, setCartSellerId] = useState(null); // Seller ID that cart is locked to

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const savedStoreId = localStorage.getItem('cartStoreId');
    const savedSellerId = localStorage.getItem('cartSellerId');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
        setCart([]);
      }
    }
    if (savedStoreId) {
      setCartStoreId(savedStoreId);
    }
    if (savedSellerId) {
      setCartSellerId(savedSellerId);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cartStoreId) {
      localStorage.setItem('cartStoreId', cartStoreId);
    } else {
      localStorage.removeItem('cartStoreId');
    }
    if (cartSellerId) {
      localStorage.setItem('cartSellerId', cartSellerId);
    } else {
      localStorage.removeItem('cartSellerId');
    }
  }, [cart, cartStoreId, cartSellerId]);

  /**
   * Add item to cart with store locking
   * @param {object} item - Item to add
   * @param {number|string} storeId - Store ID (REQUIRED for store locking)
   * @param {number|string} sellerId - Seller ID (REQUIRED for store locking)
   */
  const addToCart = (item, storeId = null, sellerId = null) => {
    setCart(prevCart => {
      // CART LOCKING RULE: Cart is locked to one seller/store
      // If adding item from different store, clear cart and start fresh
      if (cartStoreId && storeId && cartStoreId !== String(storeId)) {
        console.warn('⚠️ Different store detected. Clearing cart and starting fresh.');
        // Different store - clear cart and set new store
        setCartStoreId(String(storeId));
        setCartSellerId(sellerId ? String(sellerId) : null);
        // Start fresh cart with new item
        const newItem = {
          ...item,
          id: item.id || `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`,
          quantity: item.quantity || 1,
          storeId: storeId,
          sellerId: sellerId
        };
        return [newItem];
      }

      // If cart is empty, set the store ID and seller ID
      if (prevCart.length === 0 && storeId) {
        setCartStoreId(String(storeId));
        if (sellerId) {
          setCartSellerId(String(sellerId));
        }
      }

      // Create unique ID if not provided
      if (!item.id) {
        item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
      }

      // Add storeId and sellerId to item
      const itemWithStore = {
        ...item,
        storeId: storeId || cartStoreId,
        sellerId: sellerId || cartSellerId
      };

      // Check if item already exists (same name, size, color)
      const existingIndex = prevCart.findIndex(cartItem => 
        cartItem.name === item.name && 
        cartItem.size === (item.size || 'default') &&
        (cartItem.color || 'default') === (item.color || 'default')
      );

      if (existingIndex !== -1) {
        // Update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + (item.quantity || 1);
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, {
          ...itemWithStore,
          quantity: item.quantity || 1
        }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartStoreId(null);
    setCartSellerId(null);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getCartStoreId = () => {
    return cartStoreId;
  };

  const getCartSellerId = () => {
    return cartSellerId;
  };

  const value = {
    cart,
    cartStoreId,
    cartSellerId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getCartStoreId,
    getCartSellerId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

