import OrderCard from '../../components/orders/OrderCard';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { Order } from '../../components/orders/OrderCard';

// Dummy data for delivered orders
const dummyDeliveredOrders: Order[] = [
  {
    id: '9',
    orderNumber: 'ORD009',
    customerName: 'Rahul Sharma',
    orderDate: '2025-10-03',
    status: 'delivered',
    items: [
      { id: '13', name: 'Smartphone', quantity: 1, price: 15000, totalPrice: 15000 },
      { id: '14', name: 'Phone Case', quantity: 1, price: 500, totalPrice: 500 },
    ],
    totalAmount: 15500,
    paymentStatus: 'paid',
    shippingAddress: '101 MG Road, Bengaluru, India',
  },
  {
    id: '10',
    orderNumber: 'ORD010',
    customerName: 'Priya Mehta',
    orderDate: '2025-10-02',
    status: 'delivered',
    items: [
      { id: '15', name: 'Laptop', quantity: 1, price: 55000, totalPrice: 55000 },
    ],
    totalAmount: 55000,
    paymentStatus: 'paid',
    shippingAddress: '22 Nehru Street, Ahmedabad, India',
  },
  {
    id: '11',
    orderNumber: 'ORD011',
    customerName: 'Amitabh Joshi',
    orderDate: '2025-10-01',
    status: 'delivered',
    items: [
      { id: '16', name: 'Bluetooth Speaker', quantity: 1, price: 2500, totalPrice: 2500 },
      { id: '17', name: 'USB Cable', quantity: 2, price: 300, totalPrice: 600 },
    ],
    totalAmount: 3100,
    paymentStatus: 'paid',
    shippingAddress: '56 Residency Road, Pune, India',
  },
];

const DeliveredOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Delivered Order pressed:', orderId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyDeliveredOrders}
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

export default DeliveredOrders;
