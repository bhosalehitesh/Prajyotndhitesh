import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import OrderCard from '../../components/orders/OrderCard';
import type { Order } from '../../components/orders/OrderCard';
// import Icon from "react-native-vector-icons/Ionicons";

// Dummy data for pending orders
const dummyAllOrders: Order[] = [
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
    status: 'shipped',
    items: [
      { id: '3', name: 'Product 3', quantity: 3, price: 300, totalPrice: 900 },
    ],
    totalAmount: 900,
    paymentStatus: 'paid',
  },
];

const AllOrders = () => {
  const handleOrderPress = (orderId: string) => {
    // Handle order press
    console.log('Order pressed:', orderId);
  };

  const renderEmptyState = () => (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.centerContent}>
        <TouchableOpacity style={styles.refreshButton}>
          <Text>🔄</Text>
        </TouchableOpacity>
        <Text style={styles.noOrdersText}>You don't have any orders yet</Text>
        <Text style={styles.subText}>
          Share your website link with customers to get more orders
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {dummyAllOrders.length > 0 ? (
        <FlatList
          data={dummyAllOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleOrderPress} />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  refreshButton: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 50,
    marginBottom: 20,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  subText: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },
});

export default AllOrders;
