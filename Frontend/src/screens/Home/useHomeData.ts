/**
 * Home Data Hook
 * 
 * This hook handles fetching home screen data from the backend.
 * 
 * BACKEND INTEGRATION POINT:
 * Replace the mock data fetching with actual API calls here.
 * 
 * Expected API endpoint:
 * - GET /api/home
 * 
 * Returns:
 * - data: Home screen data object
 * - loading: Loading state
 * - error: Error state
 * - refetch: Function to refetch data
 */

import {useState, useEffect, useCallback} from 'react';
import {HomeScreenData, HomeScreenApiResponse} from './types';
import {mockHomeData} from './mockData';
import {storage} from '../../authentication/storage';
import { getCurrentSellerStoreDetails } from '../../utils/api';

interface UseHomeDataReturn {
  data: HomeScreenData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching home screen data
 * 
 * @returns Home screen data with loading and error states
 */
export const useHomeData = (): UseHomeDataReturn => {
  const [data, setData] = useState<HomeScreenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch home screen data
   * 
   * TODO: Backend team - Replace this function with actual API call
   * 
   * Example implementation:
   * 
   * const fetchData = async () => {
   *   try {
   *     setLoading(true);
   *     setError(null);
   * 
   *     const response = await fetch('/api/home');
   *     const result: HomeScreenApiResponse = await response.json();
   * 
   *     if (result.success && result.data) {
   *       setData(result.data);
   *     } else {
   *       setError(result.error || 'Failed to fetch home data');
   *       setData(null);
   *     }
   *   } catch (err) {
   *     setError(err instanceof Error ? err.message : 'Unknown error');
   *     setData(null);
   *   } finally {
   *     setLoading(false);
   *   }
   * };
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay slightly
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load basic identity from storage
      const storedStoreName = await storage.getItem('storeName');
      const storedStoreLink = await storage.getItem('storeLink');
      const storedUserName = await storage.getItem('userName');

      // Try to fetch store details from backend for current seller
      const backendStore = await getCurrentSellerStoreDetails();

      const finalStoreName =
        backendStore?.storeName || storedStoreName || mockHomeData.profile.storeName;
      const finalStoreLink =
        backendStore?.storeLink || storedStoreLink || mockHomeData.profile.storeLink;
      const logoUrl = backendStore?.logoUrl || null;

      console.log('Home data fetch - logoUrl:', logoUrl);
      console.log('Home data fetch - backendStore:', backendStore);

      // Create data with per-seller profile values or fallback to mock
      const homeData: HomeScreenData = {
        ...mockHomeData,
        profile: {
          ...mockHomeData.profile,
          name: storedUserName || mockHomeData.profile.name,
          storeName: finalStoreName,
          storeLink: finalStoreLink,
          logoUrl: logoUrl || undefined,
        },
      };

      setData(homeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

