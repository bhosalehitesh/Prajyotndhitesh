import OrderCard from '../../components/orders/OrderCard';
import type { Order } from '../../components/orders/OrderCard';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

// Dummy data for canceled orders
const dummyCanceledOrders: Order[] = [
  {
    id: '7',
    orderNumber: 'ORD007',
    customerName: 'Alice Walker',
    orderDate: '2025-10-06',
    status: 'canceled',
    items: [
      { id: '10', name: 'Product 10', quantity: 1, price: 750, totalPrice: 750 },
    ],
    totalAmount: 750,
    paymentStatus: 'paid',
    shippingAddress: '654 Oak St, City, Country',
  },
  {
    id: '8',
    orderNumber: 'ORD008',
    customerName: 'August Will',
    orderDate: '2025-10-11',
    status: 'canceled',
    items: [
      { id: '11', name: 'Product 11', quantity: 2, price: 400, totalPrice: 800 },
      { id: '12', name: 'Product 12', quantity: 1, price: 1200, totalPrice: 1200 },
    ],
    totalAmount: 2000,
    paymentStatus: 'paid',
    shippingAddress: '987 Pine St, City, Country',
  },
];

const CanceledOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Canceled Order pressed:', orderId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyCanceledOrders}
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

export default CanceledOrders;
