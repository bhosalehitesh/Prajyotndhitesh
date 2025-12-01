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

      // TODO: Replace with actual API call
      // For now, using mock data but loading store name from storage
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Load store name from storage if available
      const storedStoreName = await storage.getItem('storeName');
      const storedStoreLink = await storage.getItem('storeLink');
      const storedUserName = await storage.getItem('userName');
      
      // Create data with stored values or fallback to mock
      const homeData: HomeScreenData = {
        ...mockHomeData,
        profile: {
          ...mockHomeData.profile,
          name: storedUserName || mockHomeData.profile.name,
          storeName: storedStoreName || mockHomeData.profile.storeName,
          storeLink: storedStoreLink || mockHomeData.profile.storeLink,
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

