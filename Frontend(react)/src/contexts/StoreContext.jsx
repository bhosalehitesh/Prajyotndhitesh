import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [currentStore, setCurrentStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeSlug, setStoreSlug] = useState(null);

  // Get store slug from URL
  const getStoreSlugFromPath = () => {
    const path = window.location.pathname;
    const match = path.match(/\/store\/([^/]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const slug = getStoreSlugFromPath();
    setStoreSlug(slug);
    
    if (slug) {
      loadStore(slug);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStore = async (slug) => {
    setLoading(true);
    try {
      // Auto-detect backend URL
      const getBackendUrl = () => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:8080/api';
        }
        
        return `${protocol}//${hostname}:8080/api`;
      };

      const API_BASE = getBackendUrl();
      
      // Try multiple API endpoints
      const endpoints = [
        `${API_BASE}/stores/slug/${encodeURIComponent(slug)}`,
        `${API_BASE}/stores?slug=${encodeURIComponent(slug)}`,
        `${API_BASE}/store/${encodeURIComponent(slug)}`
      ];

      let store = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            store = Array.isArray(data) ? data[0] : data;
            if (store) break;
          }
        } catch (e) {
          console.warn(`Failed to fetch from ${endpoint}:`, e);
        }
      }

      if (store) {
        setCurrentStore({
          id: store.storeId || store.id || store._id,
          name: store.storeName || store.name || store.shopName || 'Store',
          slug: store.slug || slug,
          logo: store.logoUrl || store.logo || '',
          description: store.businessDetails?.businessDescription || store.description || '',
          address: store.address || '',
          phone: store.phone || '',
          sellerId: store.sellerId || store.seller?.id
        });
      } else {
        // Fallback: create a basic store object from slug
        setCurrentStore({
          id: null,
          name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: slug,
          logo: '',
          description: '',
          address: '',
          phone: '',
          sellerId: null
        });
      }
    } catch (error) {
      console.error('Error loading store:', error);
      // Fallback store
      setCurrentStore({
        id: null,
        name: slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Store',
        slug: slug,
        logo: '',
        description: '',
        address: '',
        phone: '',
        sellerId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getApiBase = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    
    return `${protocol}//${hostname}:8080/api`;
  };

  const getStoreId = () => {
    return currentStore?.id || currentStore?.sellerId;
  };

  const value = {
    currentStore,
    storeSlug,
    loading,
    loadStore,
    getApiBase,
    getStoreId
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

