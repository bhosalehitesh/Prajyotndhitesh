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

import React, {useState, useEffect, useCallback} from 'react';
import {HomeScreenData, HomeScreenApiResponse} from './types';
import {mockHomeData} from './mockData';
import {storage} from '../../authentication/storage';
import { getCurrentSellerStoreDetails } from '../../utils/api';
import { getSellerOrders } from '../../utils/orderApi';

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
      const storedLogoUrl = await storage.getItem('storeLogoUrl');

      // Try to fetch store details from backend for current seller
      const backendStore = await getCurrentSellerStoreDetails();

      const finalStoreName =
        backendStore?.storeName || storedStoreName || mockHomeData.profile.storeName;
      const finalStoreLink =
        backendStore?.storeLink || storedStoreLink || mockHomeData.profile.storeLink;
      // Use backend logoUrl first, then stored, then null
      // IMPORTANT: Even if backend store is not found, use stored logoUrl if available
      const logoUrl = backendStore?.logoUrl || storedLogoUrl || null;
      
      // Update stored logoUrl if backend has a newer one
      if (backendStore?.logoUrl && backendStore.logoUrl !== storedLogoUrl) {
        await storage.setItem('storeLogoUrl', backendStore.logoUrl);
      }
      
      // If we have a stored logoUrl but backend doesn't have store, log it
      if (!backendStore && storedLogoUrl) {
        console.log('Using stored logoUrl (backend store not found):', storedLogoUrl);
      }

      // Log store status for debugging (only in dev mode)
      if (__DEV__) {
        if (!backendStore) {
          console.log('Home data fetch - No store found in backend. Using stored/mock data.');
          console.log('Stored logoUrl:', storedLogoUrl || 'None');
          console.log('Final logoUrl for display:', logoUrl || 'None');
        } else {
          console.log('Home data fetch - Store found:', {
            storeName: backendStore.storeName,
            storeId: backendStore.storeId,
            backendLogoUrl: backendStore.logoUrl || 'None',
            storedLogoUrl: storedLogoUrl || 'None',
            finalLogoUrl: logoUrl || 'None',
            hasLogo: !!logoUrl,
          });
        }
      }

      // Fetch new orders count for Today's Tasks
      let newOrdersCount = 0;
      try {
        const userIdRaw = await storage.getItem('userId');
        const sellerId = userIdRaw && !isNaN(Number(userIdRaw)) ? userIdRaw : null;
        
        if (sellerId) {
          const orders = await getSellerOrders(sellerId);
          // Count orders with status PLACED or PENDING (new orders)
          newOrdersCount = orders.filter(
            order => order.orderStatus === 'PLACED' || order.orderStatus === 'PENDING'
          ).length;
        }
      } catch (error) {
        console.warn('Could not fetch new orders count:', error);
        // Continue with default count of 0
      }

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
        todaysTasks: {
          newOrdersCount: newOrdersCount,
        },
        discountsCoupons: {
          activeCount: 0, // TODO: Fetch from backend API when available
          totalCount: 0, // TODO: Fetch from backend API when available
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

