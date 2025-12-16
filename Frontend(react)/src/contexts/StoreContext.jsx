import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getStoreBySlug } from '../utils/api';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const location = useLocation();
  const params = useParams();
  const [currentStore, setCurrentStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeSlug, setStoreSlug] = useState(null);
  const [error, setError] = useState(null);

  // Get store slug from URL - prioritize /store/:slug format
  const getStoreSlugFromPath = (path, routeParams) => {
    // First check route params (from React Router)
    if (routeParams?.slug) {
      console.log('✅ [SLUG] Found slug from route params:', routeParams.slug);
      return routeParams.slug;
    }
    
    // Then check /store/:slug pattern
    let match = path.match(/\/store\/([^/]+)/);
    if (match) {
      const slug = match[1];
      console.log('✅ [SLUG] Found slug from /store/:slug pattern:', slug);
      return slug;
    }
    
    // Finally check /:slug (root level slug)
    match = path.match(/^\/([^/]+)(?:\/|$)/);
    if (match && match[1] !== '') {
      const slug = match[1];
      // Exclude known routes
      const excludedRoutes = ['categories', 'featured', 'products', 'collections', 'cart', 'wishlist', 'orders', 'order-tracking', 'faq', 'search', 'product', 'checkout'];
      if (!excludedRoutes.includes(slug)) {
        console.log('✅ [SLUG] Found slug from /:slug pattern:', slug);
        return slug;
      } else {
        // This is an excluded route, return null silently (no error)
        return null;
      }
    }
    
    // Only log error if path doesn't match any pattern and isn't root or an excluded route
    const excludedRoutes = ['categories', 'featured', 'products', 'collections', 'cart', 'wishlist', 'orders', 'order-tracking', 'faq', 'search', 'product', 'checkout'];
    const firstSegment = path.split('/').filter(Boolean)[0];
    if (path !== '/' && path !== '' && !excludedRoutes.includes(firstSegment)) {
      console.log('❌ [SLUG] No slug found in path:', path);
    }
    return null;
  };

  // Listen for route changes
  useEffect(() => {
    const slug = getStoreSlugFromPath(location.pathname, params);
    setStoreSlug(slug);
    
    if (slug) {
      loadStore(slug);
    } else {
      setCurrentStore(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, params?.slug]);

  const loadStore = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [StoreContext] Loading store for slug:', slug);
      const store = await getStoreBySlug(slug);
      
      if (store) {
        // Log full store object for debugging
        console.log('📦 [StoreContext] Full store response:', JSON.stringify(store, null, 2));
        console.log('✅ [StoreContext] Store found:', store.storeName || store.name, 'storeId:', store.storeId, 'sellerId:', store.sellerId);
        
        // Validate store has required data
        if (!store.storeId && !store.id) {
          console.warn('⚠️ [StoreContext] Store found but missing storeId');
        }
        if (!store.sellerId) {
          console.error('❌ [StoreContext] CRITICAL: Store missing sellerId - products will NOT load!');
          console.error('❌ [StoreContext] Store object keys:', Object.keys(store));
          console.error('❌ [StoreContext] Check database: store_id =', store.storeId, 'should have seller_id linked');
          console.error('❌ [StoreContext] Run SQL: SELECT store_id, store_name, seller_id FROM store_details WHERE store_id =', store.storeId);
        } else {
          console.log('✅ [StoreContext] sellerId found:', store.sellerId, '- products should load');
        }
        
        setCurrentStore({
          id: store.storeId || store.id,
          storeId: store.storeId || store.id, // Explicit storeId
          name: store.storeName || store.name || store.shopName || 'Store',
          slug: store.slug || slug,
          logo: store.logoUrl || store.logo || '',
          description: store.businessDetails?.businessDescription || store.description || '',
          address: store.address || '',
          phone: store.phone || '',
          sellerId: store.sellerId, // Should now be available from backend after fix
          storeLink: store.storeLink, // Keep original storeLink for debugging
        });
        setError(null);
      } else {
        throw new Error('Store not found - API returned null/undefined');
      }
    } catch (error) {
      console.error('❌ [StoreContext] Error loading store:', error);
      console.error('❌ [StoreContext] Error details:', {
        message: error.message,
        slug: slug,
        url: `${window.location.origin}/store/${slug}`
      });
      
      // Set detailed error message
      let errorMessage = 'Store not found';
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = `Store with slug "${slug}" not found. Please check:\n1. Store exists in database\n2. Store's store_link field contains the slug\n3. Backend is running`;
      } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check if backend is running on http://localhost:8080';
      } else {
        errorMessage = error.message || 'Unknown error loading store';
      }
      
      setError({
        message: errorMessage,
        slug: slug,
        type: error.message.includes('404') ? 'NOT_FOUND' : 'NETWORK_ERROR'
      });
      setCurrentStore(null);
    } finally {
      setLoading(false);
    }
  };

  const getStoreId = () => {
    return currentStore?.storeId || currentStore?.id;
  };

  const getSellerId = () => {
    return currentStore?.sellerId;
  };

  const value = {
    currentStore,
    storeSlug,
    loading,
    error,
    loadStore,
    getStoreId,
    getSellerId,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

