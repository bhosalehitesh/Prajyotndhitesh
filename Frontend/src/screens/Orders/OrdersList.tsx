/**
 * Shared Orders List Component
 * Displays orders filtered by status with loading and error states
 */

import React from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OrderCard from '../../components/orders/OrderCard';
import { useOrders } from './useOrders';
import { filterOrdersByStatus } from './orderUtils';
import { OrderStatus, Order } from './types';

interface OrdersListProps {
  status: OrderStatus;
  emptyMessage?: string;
}

const OrdersList: React.FC<OrdersListProps> = ({ status, emptyMessage }) => {
  const navigation = useNavigation();
  const { orders, loading, error, refetch } = useOrders();
  const [refreshing, setRefreshing] = React.useState(false);

  const filteredOrders = React.useMemo(() => {
    return filterOrdersByStatus(orders, status);
  }, [orders, status]);

  const handleOrderPress = (orderId: string) => {
    // Find the order to get the numeric OrdersId
    const order = orders.find(o => o.id === orderId);
    const numericId = order?.ordersId || orderId;
    navigation.navigate('OrderDetails' as never, { orderId: String(numericId) } as never);
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
        data={filteredOrders}
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
          filteredOrders.length === 0 && styles.emptyListContainer,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <View style={styles.placeholderCircle} />
            <Text style={styles.emptyText}>
              {emptyMessage || `No ${status} orders yet`}
            </Text>
            <Text style={styles.emptySubText}>
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
  emptyText: {
    color: '#6c757d',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
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

export default OrdersList;

