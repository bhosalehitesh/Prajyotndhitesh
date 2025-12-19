/**
 * Order transformation utilities
 * Maps backend order format to frontend order format
 */

import { OrderDto, OrderItemDto } from '../../utils/orderApi';
import { Order, OrderItem, OrderStatus, PaymentStatus } from './types';

/**
 * Map backend order status to frontend order status
 */
const mapOrderStatus = (backendStatus: OrderDto['orderStatus']): OrderStatus => {
  switch (backendStatus) {
    case 'PLACED':
      return 'pending';
    case 'PROCESSING':
      return 'accepted';
    case 'SHIPPED':
      return 'shipped';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'canceled';
    default:
      return 'pending';
  }
};

/**
 * Map backend payment status to frontend payment status
 */
const mapPaymentStatus = (backendStatus: OrderDto['paymentStatus']): PaymentStatus => {
  switch (backendStatus) {
    case 'PAID':
      return 'paid';
    case 'PENDING':
      return 'pending';
    case 'FAILED':
      return 'unpaid';
    default:
      return 'pending';
  }
};

/**
 * Transform backend order item to frontend order item
 */
const transformOrderItem = (item: OrderItemDto, index: number): OrderItem => {
  const productName = item.product?.productName || item.variant?.variantName || `Product ${index + 1}`;
  const price = item.price || 0;
  const quantity = item.quantity || 0;

  return {
    id: String(item.OrderItemsId || index),
    name: productName,
    quantity: quantity,
    price: price,
    totalPrice: price * quantity,
  };
};

/**
 * Transform backend order to frontend order format
 */
export const transformOrder = (backendOrder: OrderDto, index?: number): Order => {
  const orderItems: OrderItem[] = (backendOrder.orderItems || []).map((item, itemIndex) =>
    transformOrderItem(item, itemIndex)
  );

  // Get customer name from backend getters (customerName, customerPhone) or fallback to mobile
  // Backend now provides customerName and customerPhone via getter methods
  // Priority: customerName > customerPhone > mobile (formatted) > order ID
  const formatPhoneNumber = (phone: number | string | undefined | null): string => {
    // Check explicitly for null/undefined (not just falsy, since 0 could be valid)
    if (phone === null || phone === undefined) return '';
    const phoneStr = String(phone);
    if (phoneStr.length >= 10) {
      // For privacy, show last 4 digits: "Customer (XXXX)"
      return `Customer (${phoneStr.slice(-4)})`;
    }
    return `Customer ${phoneStr}`;
  };

  const mobile = backendOrder.mobile;
  const customerName =
    backendOrder.customerName || // From backend getter (user.getFullName())
    backendOrder.customerPhone || // From backend getter (user.getPhone())
    backendOrder.user?.name || // Legacy fallback
    backendOrder.user?.phone || // Legacy fallback
    (mobile != null ? formatPhoneNumber(mobile) : `Customer #${backendOrder.OrdersId ?? 'N/A'}`);

  // Format order date
  const orderDate = backendOrder.creationTime
    ? new Date(backendOrder.creationTime).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : new Date().toLocaleDateString();

  // Ensure OrdersId is always a valid number/string, use index as fallback for uniqueness
  // Check explicitly for null/undefined, not just falsy (since 0 is valid but falsy)
  const orderId = backendOrder.OrdersId ?? backendOrder.orderId ?? null;
  // Use index to ensure uniqueness when OrdersId is missing, null, or 0
  const uniqueId = (orderId !== null && orderId !== undefined && orderId !== 0) 
    ? String(orderId) 
    : `temp-${index ?? 0}`;
  
  return {
    id: uniqueId,
    ordersId: (orderId !== null && orderId !== undefined && orderId !== 0) ? Number(orderId) : undefined,
    orderNumber: (orderId !== null && orderId !== undefined && orderId !== 0) 
      ? `ORD${String(orderId).padStart(4, '0')}` 
      : `ORD-TEMP-${index ?? 0}`,
    customerName: customerName,
    orderDate: orderDate,
    status: mapOrderStatus(backendOrder.orderStatus),
    items: orderItems,
    totalAmount: backendOrder.totalAmount || 0,
    paymentStatus: mapPaymentStatus(backendOrder.paymentStatus),
    shippingAddress: backendOrder.address,
  };
};

/**
 * Transform array of backend orders to frontend orders
 */
export const transformOrders = (backendOrders: OrderDto[]): Order[] => {
  return backendOrders.map((order, index) => transformOrder(order, index));
};

/**
 * Filter orders by status
 */
export const filterOrdersByStatus = (orders: Order[], status: OrderStatus): Order[] => {
  return orders.filter((order) => order.status === status);
};

/**
 * Get all orders grouped by status
 */
export const groupOrdersByStatus = (orders: Order[]) => {
  return {
    pending: filterOrdersByStatus(orders, 'pending'),
    accepted: filterOrdersByStatus(orders, 'accepted'),
    shipped: filterOrdersByStatus(orders, 'shipped'),
    pickup_ready: filterOrdersByStatus(orders, 'pickup_ready'),
    delivered: filterOrdersByStatus(orders, 'delivered'),
    canceled: filterOrdersByStatus(orders, 'canceled'),
    rejected: filterOrdersByStatus(orders, 'rejected'),
  };
};

