import React, { useEffect, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useCart } from '../contexts/CartContext';

/**
 * Component to sync cart with store changes
 * Enforces cart locking rule: Cart is locked to one seller/store
 * 
 * Note: Cart is cleared when user tries to add items from a different store
 * (handled in ProductCard). This component just tracks store changes.
 */
const CartStoreSync = () => {
  const { currentStore, storeSlug } = useStore();
  const { cartStoreId } = useCart();
  const previousStoreIdRef = useRef(null);

  useEffect(() => {
    // Get current store identifier (prefer store ID, fallback to slug)
    const currentStoreId = currentStore?.id || currentStore?.sellerId || storeSlug;

    // Track store changes (cart clearing happens in ProductCard when adding items)
    if (currentStoreId && currentStoreId !== previousStoreIdRef.current) {
      // Store changed - cart will be cleared when user tries to add items
      // This is handled in ProductCard's handleAddToCart
      console.log('Store changed:', previousStoreIdRef.current, '->', currentStoreId);
    }

    // Update previous store ID
    previousStoreIdRef.current = currentStoreId;
  }, [currentStore, storeSlug, cartStoreId]);

  // This component doesn't render anything
  return null;
};

export default CartStoreSync;

