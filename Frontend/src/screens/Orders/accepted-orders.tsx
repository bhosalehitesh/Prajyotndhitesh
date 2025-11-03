import OrderCard from '../../components/orders/OrderCard';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { Order } from '../../components/orders/OrderCard';

// Dummy data for accepted orders
const dummyAcceptedOrders: Order[] = [
  {
    id: '3',
    orderNumber: 'ORD003',
    customerName: 'Michael Johnson',
    orderDate: '2025-10-07',
    status: 'accepted',
    items: [
      { id: '4', name: 'Product 4', quantity: 1, price: 1200, totalPrice: 1200 },
      { id: '5', name: 'Product 5', quantity: 2, price: 400, totalPrice: 800 },
    ],
    totalAmount: 2000,
    paymentStatus: 'paid',
  },
  {
    id: '4',
    orderNumber: 'ORD004',
    customerName: 'Sarah Wilson',
    orderDate: '2025-10-08',
    status: 'accepted',
    items: [
      { id: '6', name: 'Product 6', quantity: 1, price: 1500, totalPrice: 1500 },
    ],
    totalAmount: 1500,
    paymentStatus: 'paid',
  },
];

const AcceptedOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Accepted Order pressed:', orderId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyAcceptedOrders}
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

export default AcceptedOrders;

