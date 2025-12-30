import { useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';

/**
 * Custom hook to update favicon based on current store's logo
 */
export const useFavicon = () => {
  const { currentStore, loading } = useStore();

  useEffect(() => {
    // Find or create the favicon link element
    let linkElement = document.querySelector("link[rel*='icon']");
    
    if (!linkElement) {
      // Create a new link element if it doesn't exist
      linkElement = document.createElement('link');
      linkElement.rel = 'icon';
      document.head.appendChild(linkElement);
    }

    if (loading) {
      // Use default favicon while loading
      linkElement.href = '/vite.svg';
      linkElement.type = 'image/svg+xml';
      return;
    }

    if (currentStore?.logo) {
      // Use the store's logo as favicon
      linkElement.href = currentStore.logo;
      // Determine type based on file extension
      const logoUrl = currentStore.logo.toLowerCase();
      if (logoUrl.endsWith('.svg')) {
        linkElement.type = 'image/svg+xml';
      } else if (logoUrl.endsWith('.png')) {
        linkElement.type = 'image/png';
      } else if (logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg')) {
        linkElement.type = 'image/jpeg';
      } else {
        linkElement.type = 'image/png'; // Default fallback
      }
    } else {
      // Use default favicon if no store logo
      linkElement.href = '/vite.svg';
      linkElement.type = 'image/svg+xml';
    }
  }, [currentStore?.logo, loading]);
};

export default useFavicon;

