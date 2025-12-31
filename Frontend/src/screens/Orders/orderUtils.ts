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
    case 'REJECTED':
      return 'rejected';
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
  // Use unitPrice from database (preferred), fallback to price field
  const unitPrice = item.unitPrice ?? item.price ?? 0;
  const quantity = item.quantity || 0;

  return {
    id: String(item.OrderItemsId || index),
    name: productName,
    quantity: quantity,
    price: unitPrice, // Use unit price (from database)
    totalPrice: unitPrice * quantity, // Calculate total correctly: unitPrice * quantity
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
    rejectionReason: backendOrder.rejectionReason,
  };
};

/**
 * Transform array of backend orders to frontend orders
 * Filters out orders without valid IDs (OrdersId must be a positive number)
 * This prevents "Invalid order ID" errors when clicking on orders
 * 
 * Note: Invalid orders typically indicate data issues in the backend database
 * (corrupted/old records) and should be cleaned up
 */
export const transformOrders = (backendOrders: OrderDto[]): Order[] => {
  // Log backend orders to debug invalid IDs
  const invalidBackendOrders = backendOrders.filter(order => {
    const ordersId = order.OrdersId ?? order.orderId;
    return !ordersId || ordersId <= 0;
  });
  
  if (invalidBackendOrders.length > 0) {
    console.warn(
      `⚠️ [transformOrders] Backend returned ${invalidBackendOrders.length} order(s) with invalid OrdersId. ` +
      `These orders will be filtered out. (This typically indicates data issues in the backend database)`,
      invalidBackendOrders.map(o => {
        const ordersId = o.OrdersId ?? o.orderId;
        return {
          OrdersId: ordersId ?? 'NULL/UNDEFINED',
          totalAmount: o.totalAmount,
          orderStatus: o.orderStatus,
          creationTime: o.creationTime,
          customerName: o.customerName || 'N/A'
        };
      })
    );
  }
  
  // Transform all orders
  const transformed = backendOrders.map((order, index) => transformOrder(order, index));
  
  // Filter out orders with invalid IDs (temp- IDs or missing ordersId)
  const validOrders = transformed.filter((order) => {
    const hasValidId = order.ordersId && order.ordersId > 0 && !order.id.startsWith('temp-');
    if (!hasValidId) {
      console.warn('⚠️ [transformOrders] Filtering out order with invalid ID:', {
        id: order.id,
        ordersId: order.ordersId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        reason: order.id.startsWith('temp-') ? 'Temporary ID (invalid OrdersId)' : 'Missing or invalid OrdersId'
      });
    }
    return hasValidId;
  });
  
  if (transformed.length !== validOrders.length) {
    const filtered = transformed.length - validOrders.length;
    console.warn(
      `⚠️ [transformOrders] Filtered out ${filtered} order(s) with invalid IDs out of ${transformed.length} total. ` +
      `These should be cleaned up in the backend database.`
    );
  } else if (validOrders.length > 0) {
    console.log(`✅ [transformOrders] All ${validOrders.length} orders have valid IDs`);
  } else {
    console.warn(`⚠️ [transformOrders] No valid orders found`);
  }
  
  return validOrders;
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
