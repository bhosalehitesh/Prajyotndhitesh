import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'shipped'
  | 'pickup_ready'
  | 'delivered'
  | 'canceled'
  | 'rejected';

type PaymentStatus = 'paid' | 'pending' | 'unpaid' | 'refunded';

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  shippingAddress?: string;
};

interface OrderCardProps {
  order: Order;
  onPress?: (orderId: string) => void;
}

const OrderCard = ({ order, onPress }: OrderCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress?.(order.id)}
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
});

export default OrderCard;