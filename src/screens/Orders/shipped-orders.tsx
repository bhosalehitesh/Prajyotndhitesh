import React, { memo } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Text } from "react-native";
import OrderCard from "../../components/orders/OrderCard";
import type { Order } from "../../components/orders/OrderCard";

// Dummy data for shipped orders
const dummyShippedOrders: Order[] = [
  {
    id: "5",
    orderNumber: "ORD005",
    customerName: "David Brown",
    orderDate: "2025-10-06",
    status: "shipped",
    items: [
      { id: "7", name: "Product 7", quantity: 3, price: 600, totalPrice: 1800 },
      { id: "8", name: "Product 8", quantity: 1, price: 900, totalPrice: 900 },
    ],
    totalAmount: 2700,
    paymentStatus: "paid",
    shippingAddress: "789 Oak Rd, City, Country",
  },
  {
    id: "6",
    orderNumber: "ORD006",
    customerName: "Emily Davis",
    orderDate: "2025-10-06",
    status: "shipped",
    items: [
      { id: "9", name: "Product 9", quantity: 2, price: 800, totalPrice: 1600 },
    ],
    totalAmount: 1600,
    paymentStatus: "paid",
    shippingAddress: "321 Pine St, City, Country",
  },
];

const ShippedOrders = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleOrderPress = (orderId: string) => {
    console.log("Order pressed:", orderId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a data refresh (e.g., API call)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={handleOrderPress} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyShippedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContent,
          dummyShippedOrders.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <View style={styles.placeholderCircle} />
            <View>
              <Text style={styles.emptyText}>No shipped orders yet</Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyList: {
    alignItems: "center",
  },
  placeholderCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    marginBottom: 15,
  },
  emptyText: {
    color: "#6c757d",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default memo(ShippedOrders);
