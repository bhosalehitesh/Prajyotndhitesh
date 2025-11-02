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
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setData(mockHomeData);
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

