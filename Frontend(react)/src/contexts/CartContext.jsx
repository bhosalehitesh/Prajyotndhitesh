import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCartAPI, updateCartQuantity, removeFromCartAPI, clearCartAPI } from '../utils/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [cartStoreId, setCartStoreId] = useState(null); // Store ID that cart is locked to
  const [cartSellerId, setCartSellerId] = useState(null); // Seller ID that cart is locked to
  const [loading, setLoading] = useState(true);

  // Load cart from backend (if logged in) or localStorage (if guest)
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && user?.userId) {
          // Fetch cart from backend
          console.log('🛒 [Cart] Loading cart from backend for user:', user.userId);
          const backendCart = await getCart(user.userId);
          console.log('🛒 [Cart] Backend cart response:', backendCart);
          
          // Transform backend cart items to frontend format
          const cartItems = backendCart?.items || backendCart?.orderItems || [];
          if (Array.isArray(cartItems) && cartItems.length > 0) {
            // Extract sellerId and storeId from first product (all items should be from same seller/store)
            const firstItem = cartItems[0];
            const extractedSellerId = firstItem?.product?.seller?.sellerId || firstItem?.product?.sellerId;
            const extractedStoreId = firstItem?.product?.storeId || null; // Products might not have storeId directly
            
            // Set cart-level store/seller IDs from products
            if (extractedSellerId && !cartSellerId) {
              setCartSellerId(String(extractedSellerId));
            }
            
            const transformedCart = cartItems.map(item => ({
              id: item.orderItemsId || item.OrderItemsId || item.id,
              productId: item.product?.productsId || item.productId,
              name: item.product?.productName || item.name || 'Product',
              price: item.price ? (item.price / (item.quantity || 1)) : (item.product?.sellingPrice || 0), // Backend stores total price
              originalPrice: item.product?.mrp || item.originalPrice,
              image: item.product?.productImages?.[0] || item.image || '/assets/products/p1.jpg',
              quantity: item.quantity || 1,
              brand: item.product?.brand || 'Store',
              storeId: backendCart.storeId || extractedStoreId || cartStoreId,
              sellerId: backendCart.sellerId || item.product?.seller?.sellerId || item.product?.sellerId || extractedSellerId || cartSellerId
            }));
            setCart(transformedCart);
            
            // Extract store/seller IDs from cart if available, or from products
            if (backendCart.storeId) {
              setCartStoreId(String(backendCart.storeId));
            } else if (extractedStoreId) {
              setCartStoreId(String(extractedStoreId));
            }
            if (backendCart.sellerId) {
              setCartSellerId(String(backendCart.sellerId));
            } else if (extractedSellerId && !cartSellerId) {
              setCartSellerId(String(extractedSellerId));
            }
          } else {
            setCart([]);
          }
        } else {
          // Guest user - load from localStorage
          console.log('🛒 [Cart] Loading cart from localStorage (guest user)');
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
        }
      } catch (error) {
        console.error('❌ [Cart] Error loading cart:', error);
        // Fallback to localStorage on error
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            setCart([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, user?.userId]);

  // Save cart to backend (if logged in) or localStorage (if guest)
  useEffect(() => {
    if (loading) return; // Don't save during initial load
    
    if (isAuthenticated && user?.userId) {
      // Cart will be saved to backend on each operation (add, update, remove)
      // No need to save here to avoid infinite loops
      console.log('🛒 [Cart] Cart state updated (will sync on next operation)');
    } else {
      // Guest user - save to localStorage
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
    }
  }, [cart, cartStoreId, cartSellerId, isAuthenticated, user?.userId, loading]);

  /**
   * Add item to cart with store locking
   * @param {object} item - Item to add
   * @param {number|string} storeId - Store ID (REQUIRED for store locking)
   * @param {number|string} sellerId - Seller ID (REQUIRED for store locking)
   */
  const addToCart = async (item, storeId = null, sellerId = null) => {
    // CART LOCKING RULE: Cart is locked to one seller/store
    if (cartStoreId && storeId && cartStoreId !== String(storeId)) {
      console.warn('⚠️ Different store detected. Clearing cart and starting fresh.');
      if (isAuthenticated && user?.userId) {
        await clearCartAPI(user.userId);
      }
      setCartStoreId(String(storeId));
      setCartSellerId(sellerId ? String(sellerId) : null);
      setCart([]);
    }

    // If cart is empty, set the store ID and seller ID
    if (cart.length === 0 && storeId) {
      setCartStoreId(String(storeId));
      if (sellerId) {
        setCartSellerId(String(sellerId));
      }
    }

    const productId = item.productId || item.id;
    const quantity = item.quantity || 1;

    if (isAuthenticated && user?.userId && productId) {
      // Sync to backend
      try {
        console.log('🛒 [Cart] Adding to backend cart:', { userId: user.userId, productId, quantity });
        const updatedCart = await addToCartAPI(user.userId, productId, quantity);
        
          // Transform and update local state
          const cartItems = updatedCart?.items || updatedCart?.orderItems || [];
          if (Array.isArray(cartItems) && cartItems.length > 0) {
            const transformedCart = cartItems.map(cartItem => ({
              id: cartItem.orderItemsId || cartItem.OrderItemsId || cartItem.id,
              productId: cartItem.product?.productsId || cartItem.productId,
              name: cartItem.product?.productName || cartItem.name || 'Product',
              price: cartItem.price ? (cartItem.price / (cartItem.quantity || 1)) : (cartItem.product?.sellingPrice || 0),
              originalPrice: cartItem.product?.mrp || cartItem.originalPrice,
              image: cartItem.product?.productImages?.[0] || cartItem.image || '/assets/products/p1.jpg',
              quantity: cartItem.quantity || 1,
              brand: cartItem.product?.brand || 'Store',
              storeId: updatedCart.storeId || storeId,
              sellerId: updatedCart.sellerId || cartItem.product?.seller?.sellerId || sellerId
            }));
          setCart(transformedCart);
          
          // Extract and store sellerId from products if not already set
          const extractedSellerId = cartItems[0]?.product?.seller?.sellerId || cartItems[0]?.product?.sellerId;
          if (extractedSellerId && !cartSellerId) {
            setCartSellerId(String(extractedSellerId));
          }
          
          if (updatedCart.storeId) setCartStoreId(String(updatedCart.storeId));
          if (updatedCart.sellerId) setCartSellerId(String(updatedCart.sellerId));
          if (extractedSellerId && !updatedCart.sellerId) {
            setCartSellerId(String(extractedSellerId));
          }
        }
      } catch (error) {
        console.error('❌ [Cart] Error adding to backend cart:', error);
        // Fallback to local state update
        addToCartLocal(item, storeId, sellerId);
      }
    } else {
      // Guest user - update local state only
      addToCartLocal(item, storeId, sellerId);
    }
  };

  const addToCartLocal = (item, storeId = null, sellerId = null) => {
    setCart(prevCart => {
      // Create unique ID if not provided
      if (!item.id) {
        item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
      }

      const itemWithStore = {
        ...item,
        storeId: storeId || cartStoreId,
        sellerId: sellerId || cartSellerId
      };

      // Check if item already exists
      const existingIndex = prevCart.findIndex(cartItem => 
        cartItem.productId === item.productId || 
        (cartItem.name === item.name && 
         cartItem.size === (item.size || 'default') &&
         (cartItem.color || 'default') === (item.color || 'default'))
      );

      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + (item.quantity || 1);
        return updatedCart;
      } else {
        return [...prevCart, {
          ...itemWithStore,
          quantity: item.quantity || 1
        }];
      }
    });
  };

  const removeFromCart = async (itemId) => {
    const item = cart.find(i => i.id === itemId);
    const productId = item?.productId || itemId;

    if (isAuthenticated && user?.userId && productId) {
      try {
        console.log('🛒 [Cart] Removing from backend cart:', { userId: user.userId, productId });
        const updatedCart = await removeFromCartAPI(user.userId, productId);
        
        const cartItems = updatedCart?.items || updatedCart?.orderItems || [];
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          const transformedCart = cartItems.map(cartItem => ({
            id: cartItem.orderItemsId || cartItem.id,
            productId: cartItem.product?.productsId || cartItem.productId,
            name: cartItem.product?.productName || cartItem.name || 'Product',
            price: cartItem.price / (cartItem.quantity || 1),
            originalPrice: cartItem.product?.mrp || cartItem.originalPrice,
            image: cartItem.product?.productImages?.[0] || cartItem.image || '/assets/products/p1.jpg',
            quantity: cartItem.quantity || 1,
            brand: cartItem.product?.brand || 'Store'
          }));
          setCart(transformedCart);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error('❌ [Cart] Error removing from backend cart:', error);
        setCart(prevCart => prevCart.filter(i => i.id !== itemId));
      }
    } else {
      setCart(prevCart => prevCart.filter(i => i.id !== itemId));
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const item = cart.find(i => i.id === itemId);
    const productId = item?.productId || itemId;

    if (isAuthenticated && user?.userId && productId) {
      try {
        console.log('🛒 [Cart] Updating quantity in backend cart:', { userId: user.userId, productId, quantity });
        const updatedCart = await updateCartQuantity(user.userId, productId, quantity);
        
        const cartItems = updatedCart?.items || updatedCart?.orderItems || [];
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          const transformedCart = cartItems.map(cartItem => ({
            id: cartItem.orderItemsId || cartItem.id,
            productId: cartItem.product?.productsId || cartItem.productId,
            name: cartItem.product?.productName || cartItem.name || 'Product',
            price: cartItem.price / (cartItem.quantity || 1),
            originalPrice: cartItem.product?.mrp || cartItem.originalPrice,
            image: cartItem.product?.productImages?.[0] || cartItem.image || '/assets/products/p1.jpg',
            quantity: cartItem.quantity || 1,
            brand: cartItem.product?.brand || 'Store'
          }));
          setCart(transformedCart);
        }
      } catch (error) {
        console.error('❌ [Cart] Error updating backend cart:', error);
        setCart(prevCart =>
          prevCart.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          )
        );
      }
    } else {
      setCart(prevCart =>
        prevCart.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && user?.userId) {
      try {
        console.log('🛒 [Cart] Clearing backend cart for user:', user.userId);
        await clearCartAPI(user.userId);
      } catch (error) {
        console.error('❌ [Cart] Error clearing backend cart:', error);
      }
    }
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
    loading,
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

