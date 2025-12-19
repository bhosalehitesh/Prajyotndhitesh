/**
 * Order API Functions
 * These functions handle order-related API calls
 */

import { API_BASE_URL } from './api';
import { storage, AUTH_TOKEN_KEY } from '../authentication/storage';

const parseJsonOrText = async (response: Response): Promise<any> => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * Order DTO interface matching backend response
 */
export interface OrderDto {
  OrdersId: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  creationTime: string;
  mobile: number;
  address: string;
  storeId?: number;
  sellerId?: number;
  orderItems?: OrderItemDto[];
  // Customer info from backend getters (customerName, customerPhone, customerId)
  customerName?: string;
  customerPhone?: string;
  customerId?: number;
  // Legacy user object (may not be present due to @JsonIgnore)
  user?: {
    id: number;
    name?: string;
    phone?: string;
  };
}

/**
 * Order Item DTO interface
 */
export interface OrderItemDto {
  OrderItemsId: number;
  quantity: number;
  price: number;
  product?: {
    productId: number;
    productName: string;
    sellingPrice?: number;
    productImages?: string[];
  };
  variant?: {
    variantId: number;
    variantName?: string;
  };
}

/**
 * Get orders by seller ID
 * Backend: GET /orders/seller/{sellerId}
 */
export const getSellerOrders = async (sellerId: string | number): Promise<OrderDto[]> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof sellerId === 'string' ? sellerId : String(sellerId);
  const url = `${API_BASE_URL}/orders/seller/${id}`;

  console.log('📡 [API] Fetching seller orders:', { url, sellerId: id });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to fetch orders';
    console.error('❌ [API] Get seller orders failed:', {
      status: response.status,
      statusText: response.statusText,
      message,
      payload,
    });
    throw new Error(message);
  }

  console.log('✅ [API] Seller orders fetched successfully:', Array.isArray(payload) ? payload.length : 'not array');
  return Array.isArray(payload) ? payload : [];
};

/**
 * Get order by ID
 * Backend: GET /orders/{id}
 */
export const getOrderById = async (orderId: string | number): Promise<OrderDto> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof orderId === 'string' ? orderId : String(orderId);
  const url = `${API_BASE_URL}/orders/${id}`;

  console.log('📡 [API] Fetching order by ID:', { url, orderId: id });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to fetch order';
    console.error('❌ [API] Get order by ID failed:', {
      status: response.status,
      statusText: response.statusText,
      message,
      payload,
      orderId: id,
    });
    throw new Error(message);
  }

  console.log('✅ [API] Order fetched successfully');
  return payload as OrderDto;
};

/**
 * Update order status
 * Backend: PUT /orders/update-status/{id}?status={status}
 */
export const updateOrderStatus = async (
  orderId: string | number,
  status: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
): Promise<OrderDto> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  const id = typeof orderId === 'string' ? orderId : String(orderId);
  const url = `${API_BASE_URL}/orders/update-status/${id}?status=${status}`;

  console.log('📡 [API] Updating order status:', { url, orderId: id, status });

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseJsonOrText(response);

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || 'Failed to update order status';
    console.error('❌ [API] Update order status failed:', {
      status: response.status,
      statusText: response.statusText,
      message,
      payload,
    });
    throw new Error(message);
  }

  console.log('✅ [API] Order status updated successfully');
  return payload as OrderDto;
};

