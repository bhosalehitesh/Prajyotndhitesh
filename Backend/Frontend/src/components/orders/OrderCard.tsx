import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Order } from '../../screens/Orders/types';

interface OrderCardProps {
  order: Order;
  onPress?: (orderId: string) => void;
}

const OrderCard = ({ order, onPress }: OrderCardProps) => {
  // Check if order has a valid numeric ID (not temp- IDs)
  const hasValidId = order.id && !order.id.startsWith('temp-') && order.ordersId && order.ordersId > 0;
  
  return (
    <TouchableOpacity 
      style={[styles.card, !hasValidId && styles.cardDisabled]}
      onPress={() => hasValidId ? onPress?.(order.id) : undefined}
      disabled={!hasValidId}
      activeOpacity={hasValidId ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        <Text style={[
          styles.status,
          { color: getStatusColor(order.status) }
        ]}>
          {order.status.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.customerName}>{order.customerName}</Text>
        <Text style={styles.date}>{order.orderDate}</Text>
      </View>

      <View style={styles.itemsSummary}>
        <Text style={styles.itemCount}>{order.items.length} items</Text>
        <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
      </View>

      {order.status === 'rejected' && order.rejectionReason && (
        <View style={styles.rejectionReasonContainer}>
          <Text style={styles.rejectionReasonLabel}>Rejection Reason:</Text>
          <Text style={styles.rejectionReasonText}>{order.rejectionReason}</Text>
        </View>
      )}

      <Text style={styles.paymentStatus}>
        Payment: {order.paymentStatus.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return '#f39c12';
    case 'accepted':
      return '#2ecc71';
    case 'shipped':
      return '#3498db';
    case 'pickup_ready':
      return '#9b59b6';
    case 'delivered':
      return '#27ae60';
    case 'canceled':
      return '#e74c3c';
    case 'rejected':
      return '#c0392b';
    default:
      return '#555';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 13,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  paymentStatus: {
    fontSize: 12,
    color: '#666',
  },
  rejectionReasonContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#c0392b',
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c0392b',
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
  },
});

export default OrderCard;