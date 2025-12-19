/**
 * Order Details Screen
 * Displays full order information with accept/reject functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOrderById, updateOrderStatus, OrderDto } from '../../utils/orderApi';
import { transformOrder } from './orderUtils';
import { Order } from './types';

interface RouteParams {
  orderId: string;
}

const OrderDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = (route.params as RouteParams) || {};

  const [order, setOrder] = useState<Order | null>(null);
  const [backendOrder, setBackendOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate orderId - must be numeric, not "temp-X"
      if (!orderId || orderId.startsWith('temp-')) {
        throw new Error('Invalid order ID. Please select a valid order.');
      }
      
      // Ensure orderId is numeric
      const numericId = isNaN(Number(orderId)) ? orderId : Number(orderId);
      
      console.log('🔍 [OrderDetails] Fetching order:', { orderId, numericId });
      const orderDto: OrderDto = await getOrderById(numericId);
      setBackendOrder(orderDto);
      const transformedOrder = transformOrder(orderDto);
      setOrder(transformedOrder);
    } catch (err: any) {
      console.error('❌ [OrderDetails] Error fetching order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'PROCESSING' | 'CANCELLED') => {
    if (!order) return;

    const statusText = newStatus === 'PROCESSING' ? 'accept' : 'reject';
    const confirmMessage = `Are you sure you want to ${statusText} this order?`;

    Alert.alert(
      `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} Order`,
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: statusText.charAt(0).toUpperCase() + statusText.slice(1),
          onPress: async () => {
            try {
              setUpdating(true);
              await updateOrderStatus(orderId, newStatus);
              Alert.alert('Success', `Order ${statusText}ed successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || `Failed to ${statusText} order`);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${cleanPhone}`);
  };

  const getStatusSteps = () => {
    if (!order) return [];
    const statuses = ['pending', 'accepted', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    return statuses.map((status, index) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const formatDateTime = (dateString: string) => {
    try {
      // Handle both ISO string and formatted date string
      const date = dateString.includes('T') || dateString.includes('-') 
        ? new Date(dateString) 
        : new Date();
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      return `${day}-${month}-${year} ${displayHours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e61580" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error || 'Order not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Timeline */}
        <View style={styles.statusContainer}>
          {statusSteps.map((step, index) => (
            <View key={index} style={styles.statusStep}>
              <View
                style={[
                  styles.statusCircle,
                  step.completed && styles.statusCircleCompleted,
                  step.current && styles.statusCircleCurrent,
                ]}
              />
              {index < statusSteps.length - 1 && (
                <View
                  style={[
                    styles.statusLine,
                    step.completed && styles.statusLineCompleted,
                  ]}
                />
              )}
              <Text
                style={[
                  styles.statusLabel,
                  step.current && styles.statusLabelCurrent,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Info */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order Id:</Text>
            <Text style={styles.orderInfoValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>
              {backendOrder?.creationTime 
                ? formatDateTime(backendOrder.creationTime) 
                : formatDateTime(order.orderDate)}
            </Text>
            <Text style={[styles.statusBadge, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)} Order
            </Text>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <Text style={styles.customerName}>
            {order.customerName || 'Customer'}
          </Text>

          <View style={styles.contactRow}>
            <Text style={styles.contactInfo}>
              {backendOrder?.customerPhone || (backendOrder?.mobile ? String(backendOrder.mobile) : 'N/A')}
            </Text>
            <View style={styles.contactIcons}>
              <TouchableOpacity
                onPress={() => handleWhatsApp(backendOrder?.customerPhone || String(backendOrder?.mobile || ''))}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCall(backendOrder?.customerPhone || String(backendOrder?.mobile || ''))}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="phone" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.address}>{order.shippingAddress || 'No address provided'}</Text>
          <Text style={styles.shippingOption}>
            Shipping Option: <Text style={styles.shippingOptionValue}>Delivery</Text>
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodBadge}>
            <Text style={styles.paymentMethodText}>
              {order.paymentStatus === 'paid' ? 'Paid Online' : 'Cash on Delivery'}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Text style={styles.itemCount}>{order.items.length} Item{order.items.length !== 1 ? 's' : ''}</Text>
          </View>

          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemImagePlaceholder}>
                <MaterialCommunityIcons name="image" size={40} color="#ccc" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>Qty : {item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Cost Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Item</Text>
            <Text style={styles.costValue}>₹{order.totalAmount}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Discount</Text>
            <Text style={[styles.costValue, styles.discountValue]}>- ₹0</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Delivery Fee</Text>
            <Text style={styles.costValue}>₹0</Text>
          </View>
          {order.paymentStatus !== 'paid' && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>COD charges</Text>
              <Text style={styles.costValue}>₹10</Text>
            </View>
          )}
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>
              ₹{order.totalAmount + (order.paymentStatus !== 'paid' ? 10 : 0)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleUpdateStatus('CANCELLED')}
              disabled={updating}
            >
              <Text style={styles.rejectButtonText}>Reject Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleUpdateStatus('PROCESSING')}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept Order</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#f39c12';
    case 'accepted':
      return '#2ecc71';
    case 'shipped':
      return '#3498db';
    case 'delivered':
      return '#27ae60';
    case 'canceled':
      return '#e74c3c';
    default:
      return '#555';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e61580',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF4FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e61580',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statusStep: {
    flex: 1,
    alignItems: 'center',
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginBottom: 4,
  },
  statusCircleCompleted: {
    backgroundColor: '#e61580',
  },
  statusCircleCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e61580',
  },
  statusLine: {
    position: 'absolute',
    top: 6,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#ddd',
    zIndex: -1,
  },
  statusLineCompleted: {
    backgroundColor: '#e61580',
  },
  statusLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  statusLabelCurrent: {
    color: '#e61580',
    fontWeight: '600',
  },
  orderInfoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  shippingOption: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  shippingOptionValue: {
    color: '#9b59b6',
    fontWeight: '600',
  },
  paymentMethodBadge: {
    backgroundColor: '#FFF4FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },
  quantityBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
  },
  discountValue: {
    color: '#e74c3c',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e61580',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#e5e7eb',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#e61580',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OrderDetailsScreen;
