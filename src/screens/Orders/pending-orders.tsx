import OrderCard from '../../components/orders/OrderCard';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { Order } from '../../components/orders/OrderCard';

// Dummy data for pending orders
const dummyPendingOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    customerName: 'John Doe',
    orderDate: '2025-10-07',
    status: 'pending',
    items: [
      { id: '1', name: 'Product 1', quantity: 2, price: 500, totalPrice: 1000 },
      { id: '2', name: 'Product 2', quantity: 1, price: 750, totalPrice: 750 },
    ],
    totalAmount: 1750,
    paymentStatus: 'pending',
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    customerName: 'Jane Smith',
    orderDate: '2025-10-07',
    status: 'pending',
    items: [
      { id: '3', name: 'Product 3', quantity: 3, price: 300, totalPrice: 900 },
    ],
    totalAmount: 900,
    paymentStatus: 'paid',
  },
];

const PendingOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Order pressed:', orderId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyPendingOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingVertical: 8,
  },
});

export default PendingOrders;
