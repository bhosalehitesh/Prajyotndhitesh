import React from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OrderCard from '../../components/orders/OrderCard';
import { useOrders } from './useOrders';

const AllOrders = () => {
  const navigation = useNavigation();
  const { orders, loading, error, refetch } = useOrders();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleOrderPress = (orderId: string) => {
    // Find the order to get the numeric OrdersId
    const order = orders.find(o => o.id === orderId);
    
    // Check if order exists and has a valid numeric ID
    if (!order) {
      console.error('❌ [AllOrders] Order not found:', orderId);
      return;
    }
    
    // Only navigate if we have a valid numeric order ID (not temp- IDs)
    if (order.ordersId && order.ordersId > 0) {
      navigation.navigate('OrderDetails' as never, { orderId: String(order.ordersId) } as never);
    } else {
      console.error('❌ [AllOrders] Order does not have a valid numeric ID:', {
        orderId,
        ordersId: order.ordersId,
        orderNumber: order.orderNumber
      });
      // Show error to user
      Alert.alert(
        'Invalid Order',
        'This order does not have a valid ID. Please refresh the orders list.',
        [{ text: 'OK' }]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e61580" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Text style={styles.errorSubText}>Pull down to refresh</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => {
          // Always use index to guarantee unique keys, even if id exists
          // This prevents duplicate key errors when multiple orders have id "0" or undefined
          return `order-${item.id || 'no-id'}-${index}`;
        }}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <View style={styles.placeholderCircle} />
        <Text style={styles.noOrdersText}>You don't have any orders yet</Text>
        <Text style={styles.subText}>
          Share your website link with customers to get more orders
        </Text>
      </View>
        }
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    marginBottom: 15,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  subText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF4FA',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#6c757d',
    fontSize: 13,
  },
});

export default AllOrders;
