import OrderCard from '../../components/orders/OrderCard';
import type { Order } from '../../components/orders/OrderCard';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

// Dummy data for pickup-ready orders
const dummyPickupReadyOrders: Order[] = [
  {
    id: '5',
    orderNumber: 'ORD005',
    customerName: 'Emma Brown',
    orderDate: '2025-10-08',
    status: 'pickup_ready',
    items: [
      { id: '7', name: 'Product 7', quantity: 2, price: 300, totalPrice: 600 },
    ],
    totalAmount: 600,
    paymentStatus: 'paid',
    shippingAddress: '789 Market St, City, Country',
  },
  {
    id: '6',
    orderNumber: 'ORD006',
    customerName: 'John Smith',
    orderDate: '2025-10-08',
    status: 'pickup_ready',
    items: [
      { id: '8', name: 'Product 8', quantity: 1, price: 1000, totalPrice: 1000 },
      { id: '9', name: 'Product 9', quantity: 3, price: 200, totalPrice: 600 },
    ],
    totalAmount: 1600,
    paymentStatus: 'paid',
    shippingAddress: '321 Elm St, City, Country',
  },
];

const PickupReadyOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Pickup Ready Order pressed:', orderId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyPickupReadyOrders}
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

export default PickupReadyOrders;
