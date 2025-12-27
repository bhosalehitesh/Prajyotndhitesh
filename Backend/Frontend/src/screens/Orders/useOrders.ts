/**
 * Orders Hook
 * Fetches and manages orders for the seller
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../authentication/storage';
import { getSellerOrders, OrderDto } from '../../utils/orderApi';
import { transformOrders, Order } from './orderUtils';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching seller orders
 */
export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get seller ID from storage
      const userIdRaw = await storage.getItem('userId');
      const sellerId = userIdRaw && !isNaN(Number(userIdRaw)) ? userIdRaw : null;

      if (!sellerId) {
        throw new Error('Seller ID not found. Please login again.');
      }

      console.log('📦 [useOrders] Fetching orders for seller:', sellerId);

      // Fetch orders from backend
      const backendOrders: OrderDto[] = await getSellerOrders(sellerId);

      console.log('📦 [useOrders] Fetched orders from backend:', backendOrders.length);

      // Debug: Log sample order to check OrdersId
      if (backendOrders.length > 0) {
        console.log('📦 [useOrders] Sample order from backend:', {
          OrdersId: backendOrders[0].OrdersId,
          orderStatus: backendOrders[0].orderStatus,
          totalAmount: backendOrders[0].totalAmount,
          creationTime: backendOrders[0].creationTime
        });
      }

      // Transform backend orders to frontend format (this will filter out invalid orders)
      const transformedOrders = transformOrders(backendOrders);

      console.log('📦 [useOrders] Valid orders after transformation:', transformedOrders.length);

      setOrders(transformedOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      console.error('❌ [useOrders] Error fetching orders:', err);
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};
