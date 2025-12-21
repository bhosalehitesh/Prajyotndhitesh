import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLoginPrompt } from './LoginPromptContext';
import { getCart, addToCartAPI, addVariantToCartAPI, updateCartQuantity, updateVariantCartQuantity, removeFromCartAPI, removeVariantFromCartAPI, clearCartAPI } from '../utils/api';

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
  const { promptLogin } = useLoginPrompt();
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
              variantId: item.variant?.variantId || item.variantId, // SmartBiz: include variant ID
              name: item.product?.productName || item.name || 'Product',
              price: item.variant?.sellingPrice || (item.price ? (item.price / (item.quantity || 1)) : (item.product?.sellingPrice || 0)), // Prefer variant price
              originalPrice: item.variant?.mrp || item.product?.mrp || item.originalPrice,
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
            // No items in backend cart -> fully reset cart state
            console.log('🛒 [Cart] Backend cart is empty. Resetting cart, storeId and sellerId.');
            setCart([]);
            setCartStoreId(null);
            setCartSellerId(null);
          }
        } else {
          // Guest user - load from localStorage
          console.log('🛒 [Cart] Loading cart from localStorage (guest user)');
          const savedCart = localStorage.getItem('cart');
          const savedStoreId = localStorage.getItem('cartStoreId');
          const savedSellerId = localStorage.getItem('cartSellerId');
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              // Ensure all items have storeId/sellerId
              const cartWithStoreIds = parsedCart.map(item => ({
                ...item,
                storeId: item.storeId || savedStoreId || null,
                sellerId: item.sellerId || savedSellerId || null
              }));
              setCart(cartWithStoreIds);
              console.log('🛒 [Cart] Loaded cart from localStorage:', {
                itemCount: cartWithStoreIds.length,
                storeId: savedStoreId,
                sellerId: savedSellerId
              });
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
   * Add item to cart with store locking (SmartBiz: supports variantId)
   * @param {object} item - Item to add (should include variantId if available)
   * @param {number|string} storeId - Store ID (REQUIRED for store locking)
   * @param {number|string} sellerId - Seller ID (REQUIRED for store locking)
   */
  const addToCart = async (item, storeId = null, sellerId = null) => {
    // Check authentication first - show login modal if not authenticated
    if (!isAuthenticated) {
      console.log('🔒 [Cart] User not authenticated, showing login modal');
      promptLogin(
        () => addToCart(item, storeId, sellerId),
        'Please login to add items to your cart'
      );
      return;
    }
    
    console.log('✅ [Cart] User is authenticated, proceeding with add to cart');

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
    const variantId = item.variantId; // SmartBiz: prefer variantId
    const quantity = item.quantity || 1;

    if (isAuthenticated && user?.userId) {
      // Sync to backend (prefer variant-based API if variantId available)
      try {
        let updatedCart;
        if (variantId) {
          console.log('🛒 [Cart] Adding variant to backend cart:', { userId: user.userId, variantId, quantity });
          updatedCart = await addVariantToCartAPI(user.userId, variantId, quantity);
        } else if (productId) {
          console.log('🛒 [Cart] Adding product to backend cart (legacy):', { userId: user.userId, productId, quantity });
          updatedCart = await addToCartAPI(user.userId, productId, quantity);
        } else {
          throw new Error('Either variantId or productId is required');
        }
        
          // Transform and update local state
          const cartItems = updatedCart?.items || updatedCart?.orderItems || [];
          if (Array.isArray(cartItems) && cartItems.length > 0) {
            const transformedCart = cartItems.map(cartItem => ({
              id: cartItem.orderItemsId || cartItem.OrderItemsId || cartItem.id,
              productId: cartItem.product?.productsId || cartItem.productId,
              variantId: cartItem.variant?.variantId || cartItem.variantId, // SmartBiz: include variant ID
              name: cartItem.product?.productName || cartItem.name || 'Product',
              price: cartItem.variant?.sellingPrice || (cartItem.price ? (cartItem.price / (cartItem.quantity || 1)) : (cartItem.product?.sellingPrice || 0)),
              originalPrice: cartItem.variant?.mrp || cartItem.product?.mrp || cartItem.originalPrice,
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
    }
  };

  const addToCartLocal = (item, storeId = null, sellerId = null) => {
    setCart(prevCart => {
      // Create unique ID if not provided
      if (!item.id) {
        item.id = `${item.name}_${item.size || 'default'}_${item.color || 'default'}_${Date.now()}`;
      }

      // Ensure storeId and sellerId are always set
      const finalStoreId = storeId || item.storeId || cartStoreId;
      const finalSellerId = sellerId || item.sellerId || cartSellerId;

      const itemWithStore = {
        ...item,
        storeId: finalStoreId,
        sellerId: finalSellerId
      };

      console.log('🛒 [Cart] Adding item locally:', {
        name: item.name,
        storeId: finalStoreId,
        sellerId: finalSellerId,
        cartStoreId,
        cartSellerId
      });

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
        // Also update storeId/sellerId if they weren't set before
        if (!updatedCart[existingIndex].storeId && finalStoreId) {
          updatedCart[existingIndex].storeId = finalStoreId;
        }
        if (!updatedCart[existingIndex].sellerId && finalSellerId) {
          updatedCart[existingIndex].sellerId = finalSellerId;
        }
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
    const variantId = item?.variantId; // SmartBiz: prefer variantId
    const productId = item?.productId || itemId;

    if (isAuthenticated && user?.userId) {
      try {
        let updatedCart;
        if (variantId) {
          console.log('🛒 [Cart] Removing variant from backend cart:', { userId: user.userId, variantId });
          updatedCart = await removeVariantFromCartAPI(user.userId, variantId);
        } else if (productId) {
          console.log('🛒 [Cart] Removing product from backend cart (legacy):', { userId: user.userId, productId });
          updatedCart = await removeFromCartAPI(user.userId, productId);
        } else {
          throw new Error('Either variantId or productId is required');
        }
        
        const cartItems = updatedCart?.items || updatedCart?.orderItems || [];
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          const transformedCart = cartItems.map(cartItem => ({
            id: cartItem.orderItemsId || cartItem.id,
            productId: cartItem.product?.productsId || cartItem.productId,
            variantId: cartItem.variant?.variantId || cartItem.variantId, // SmartBiz: include variant ID
            name: cartItem.product?.productName || cartItem.name || 'Product',
            price: cartItem.variant?.sellingPrice || (cartItem.price / (cartItem.quantity || 1)),
            originalPrice: cartItem.variant?.mrp || cartItem.product?.mrp || cartItem.originalPrice,
            image: cartItem.product?.productImages?.[0] || cartItem.image || '/assets/products/p1.jpg',
            quantity: cartItem.quantity || 1,
            brand: cartItem.product?.brand || 'Store'
          }));
          setCart(transformedCart);
        } else {
          // Backend cart is now empty after removal -> reset store/seller lock
          console.log('🛒 [Cart] Backend cart empty after removal. Resetting cart, storeId and sellerId.');
          setCart([]);
          setCartStoreId(null);
          setCartSellerId(null);
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
    const variantId = item?.variantId; // SmartBiz: prefer variantId
    const productId = item?.productId || itemId;

    if (isAuthenticated && user?.userId) {
      try {
        let updatedCart;
        if (variantId) {
          console.log('🛒 [Cart] Updating variant quantity in backend cart:', { userId: user.userId, variantId, quantity });
          updatedCart = await updateVariantCartQuantity(user.userId, variantId, quantity);
        } else if (productId) {
          console.log('🛒 [Cart] Updating product quantity in backend cart (legacy):', { userId: user.userId, productId, quantity });
          updatedCart = await updateCartQuantity(user.userId, productId, quantity);
        } else {
          throw new Error('Either variantId or productId is required');
        }
        
        const cartItems = updatedCart?.items || updatedCart?.orderItems || [];
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          const transformedCart = cartItems.map(cartItem => ({
            id: cartItem.orderItemsId || cartItem.id,
            productId: cartItem.product?.productsId || cartItem.productId,
            variantId: cartItem.variant?.variantId || cartItem.variantId, // SmartBiz: include variant ID
            name: cartItem.product?.productName || cartItem.name || 'Product',
            price: cartItem.variant?.sellingPrice || (cartItem.price / (cartItem.quantity || 1)),
            originalPrice: cartItem.variant?.mrp || cartItem.product?.mrp || cartItem.originalPrice,
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
    // Return the number of unique products (by productId), not total quantity or cart items
    // This counts unique products, so if same product has multiple variants, it counts as 1
    const uniqueProductIds = new Set(
      cart
        .map(item => item.productId)
        .filter(id => id != null && id !== undefined)
    );
    return uniqueProductIds.size;
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

