import OrderCard from '../../components/orders/OrderCard';
import type { Order } from '../../components/orders/OrderCard';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

// Dummy data for rejected orders
const dummyRejectedOrders: Order[] = [
  {
    id: '5',
    orderNumber: 'ORD005',
    customerName: 'Jane Doe',
    orderDate: '2025-10-06',
    status: 'rejected',
    items: [
      { id: '7', name: 'Product 7', quantity: 1, price: 1000, totalPrice: 1000 },
    ],
    totalAmount: 1000,
    paymentStatus: 'pending',
    shippingAddress: '789 Elm St, City, Country',
  },
  {
    id: '6',
    orderNumber: 'ORD006',
    customerName: 'Bob Smith',
    orderDate: '2025-10-06',
    status: 'rejected',
    items: [
      { id: '8', name: 'Product 8', quantity: 2, price: 500, totalPrice: 1000 },
      { id: '9', name: 'Product 9', quantity: 1, price: 300, totalPrice: 300 },
    ],
    totalAmount: 1300,
    paymentStatus: 'pending',
    shippingAddress: '321 Oak St, City, Country',
  },
];

const RejectedOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Rejected order pressed:', orderId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyRejectedOrders}
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
    backgroundColor: '#f8f9fa', // unified app background
  },
  listContent: {
    paddingVertical: 8,
  },
});

export default RejectedOrders;
