import { useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';

/**
 * Custom hook to update document title based on current store
 * Format: "{storeName} | Smartbiz sakhi store"
 */
export const useDocumentTitle = () => {
  const { currentStore, loading } = useStore();

  useEffect(() => {
    if (loading) {
      document.title = 'Smartbiz sakhi store';
      return;
    }

    if (currentStore?.name) {
      document.title = `${currentStore.name} | Smartbiz sakhi store`;
    } else {
      document.title = 'Smartbiz sakhi store';
    }
  }, [currentStore?.name, loading]);
};

export default useDocumentTitle;
