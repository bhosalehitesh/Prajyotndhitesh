import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import { fetchProducts, ProductDto } from '../../utils/api';

interface StockNotificationsScreenProps {
  navigation: any;
}

const StockNotificationsScreen: React.FC<StockNotificationsScreenProps> = ({navigation}) => {
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    criticalStock: [] as Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}>,
    lowStock: [] as Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}>,
    outOfStock: [] as Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}>,
    byCategory: {} as Record<string, Array<{id: string; name: string; stock: number}>>,
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'stock-level' | 'category'>('stock-level');

  // Fetch products and calculate stock statistics
  const loadStockStats = useCallback(async () => {
    try {
      setLoading(true);
      const products = await fetchProducts();
      
      let totalStock = 0;
      const criticalStock: Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}> = [];
      const lowStock: Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}> = [];
      const outOfStock: Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}> = [];
      const byCategory: Record<string, Array<{id: string; name: string; stock: number}>> = {};
      
      products.forEach((product: ProductDto) => {
        const stock = product.inventoryQuantity || 0;
        totalStock += stock;
        
        const productItem = {
          id: String(product.productsId),
          name: product.productName || 'Unknown Product',
          stock: stock,
          category: product.productCategory || 'Uncategorized',
          businessCategory: product.businessCategory || 'General',
        };
        
        // Segregate by stock levels
        if (stock === 0) {
          outOfStock.push(productItem);
        } else if (stock <= 1) {
          criticalStock.push(productItem);
        } else if (stock < 5) {
          lowStock.push(productItem);
        }
        
        // Group by category
        const categoryKey = product.productCategory || 'Uncategorized';
        if (!byCategory[categoryKey]) {
          byCategory[categoryKey] = [];
        }
        if (stock < 5) {
          byCategory[categoryKey].push({
            id: productItem.id,
            name: productItem.name,
            stock: stock,
          });
        }
      });
      
      setStockStats({
        totalProducts: products.length,
        totalStock: totalStock,
        criticalStock,
        lowStock,
        outOfStock,
        byCategory,
      });
    } catch (error) {
      console.error('Error loading stock stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockStats();
    
    // Refresh when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadStockStats();
    });
    
    return unsubscribe;
  }, [navigation, loadStockStats]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#e61580" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <IconSymbol name="notifications" size={24} color="#e61580" />
          <Text style={styles.headerTitle}>Stock Notifications</Text>
          {(stockStats.criticalStock.length + stockStats.lowStock.length + stockStats.outOfStock.length) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {stockStats.criticalStock.length + stockStats.lowStock.length + stockStats.outOfStock.length}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading stock information...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}>
          {/* Total Stock Summary */}
          <View style={styles.stockSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Products</Text>
              <Text style={styles.summaryValue}>{stockStats.totalProducts}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Stock</Text>
              <Text style={styles.summaryValue}>{stockStats.totalStock}</Text>
            </View>
          </View>

          {/* View Toggle Buttons */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, selectedView === 'stock-level' && styles.toggleButtonActive]}
              onPress={() => setSelectedView('stock-level')}>
              <Text style={[styles.toggleButtonText, selectedView === 'stock-level' && styles.toggleButtonTextActive]}>
                By Stock Level
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, selectedView === 'category' && styles.toggleButtonActive]}
              onPress={() => setSelectedView('category')}>
              <Text style={[styles.toggleButtonText, selectedView === 'category' && styles.toggleButtonTextActive]}>
                By Category
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stock Alerts - Segregated View */}
          {(stockStats.criticalStock.length > 0 || stockStats.lowStock.length > 0 || stockStats.outOfStock.length > 0) ? (
            <View style={styles.stockAlertsContainer}>
              {selectedView === 'stock-level' ? (
                <>
                  {/* Out of Stock */}
                  {stockStats.outOfStock.length > 0 && (
                    <View style={styles.stockLevelSection}>
                      <View style={styles.stockLevelHeader}>
                        <IconSymbol name="alert-circle" size={18} color="#DC2626" />
                        <Text style={[styles.stockLevelTitle, {color: '#DC2626'}]}>
                          Out of Stock ({stockStats.outOfStock.length})
                        </Text>
                      </View>
                      {stockStats.outOfStock.map((item) => (
                        <View key={item.id} style={[styles.stockItem, styles.outOfStockItem]}>
                          <View style={styles.stockItemLeft}>
                            <Text style={styles.stockItemName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            {item.category && (
                              <Text style={styles.stockItemCategory}>{item.category}</Text>
                            )}
                          </View>
                          <View style={[styles.stockBadge, styles.outOfStockBadge]}>
                            <Text style={styles.stockBadgeText}>0</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Critical Stock (1 or less) */}
                  {stockStats.criticalStock.length > 0 && (
                    <View style={styles.stockLevelSection}>
                      <View style={styles.stockLevelHeader}>
                        <IconSymbol name="alert-circle" size={18} color="#EF4444" />
                        <Text style={[styles.stockLevelTitle, {color: '#EF4444'}]}>
                          Critical Stock ({stockStats.criticalStock.length})
                        </Text>
                      </View>
                      {stockStats.criticalStock.map((item) => (
                        <View key={item.id} style={[styles.stockItem, styles.criticalStockItem]}>
                          <View style={styles.stockItemLeft}>
                            <Text style={styles.stockItemName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            {item.category && (
                              <Text style={styles.stockItemCategory}>{item.category}</Text>
                            )}
                          </View>
                          <View style={[styles.stockBadge, styles.criticalStockBadge]}>
                            <Text style={styles.stockBadgeText}>{item.stock} left</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Low Stock (2-4) */}
                  {stockStats.lowStock.length > 0 && (
                    <View style={styles.stockLevelSection}>
                      <View style={styles.stockLevelHeader}>
                        <IconSymbol name="alert-circle" size={18} color="#F59E0B" />
                        <Text style={[styles.stockLevelTitle, {color: '#F59E0B'}]}>
                          Low Stock ({stockStats.lowStock.length})
                        </Text>
                      </View>
                      {stockStats.lowStock.map((item) => (
                        <View key={item.id} style={[styles.stockItem, styles.lowStockItem]}>
                          <View style={styles.stockItemLeft}>
                            <Text style={styles.stockItemName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            {item.category && (
                              <Text style={styles.stockItemCategory}>{item.category}</Text>
                            )}
                          </View>
                          <View style={[styles.stockBadge, styles.lowStockBadge]}>
                            <Text style={styles.stockBadgeText}>{item.stock} left</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                /* By Category View */
                Object.keys(stockStats.byCategory).length > 0 ? (
                  Object.entries(stockStats.byCategory).map(([category, items]) => (
                    items.length > 0 && (
                      <View key={category} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                          <IconSymbol name="tag" size={16} color="#6B7280" />
                          <Text style={styles.categoryTitle}>{category}</Text>
                          <Text style={styles.categoryCount}>({items.length})</Text>
                        </View>
                        {items.map((item) => (
                          <View key={item.id} style={styles.stockItem}>
                            <View style={styles.stockItemLeft}>
                              <Text style={styles.stockItemName} numberOfLines={1}>
                                {item.name}
                              </Text>
                            </View>
                            <View style={[
                              styles.stockBadge,
                              item.stock === 0 ? styles.outOfStockBadge :
                              item.stock <= 1 ? styles.criticalStockBadge :
                              styles.lowStockBadge
                            ]}>
                              <Text style={styles.stockBadgeText}>{item.stock} left</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )
                  ))
                ) : (
                  <View style={styles.noAlerts}>
                    <Text style={styles.noAlertsText}>No low stock items by category</Text>
                  </View>
                )
              )}
            </View>
          ) : (
            <View style={styles.noAlerts}>
              <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.noAlertsText}>All products have sufficient stock!</Text>
            </View>
          )}

          {/* Action Button */}
          {(stockStats.criticalStock.length > 0 || stockStats.lowStock.length > 0 || stockStats.outOfStock.length > 0) && (
            <TouchableOpacity
              style={styles.viewProductsButton}
              onPress={() => {
                navigation.navigate('Products', { filter: 'low-stock' });
              }}>
              <Text style={styles.viewProductsText}>View All Products</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    backgroundColor: '#FFF4FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#FCE7F3',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e61580',
    marginLeft: 8,
  },
  headerSpacer: {
    width: 40,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  stockSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFF4FA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#e61580',
    fontWeight: '600',
  },
  stockAlertsContainer: {
    marginBottom: 12,
  },
  stockLevelSection: {
    marginBottom: 20,
  },
  stockLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockLevelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  outOfStockItem: {
    backgroundColor: '#FEE2E2',
  },
  criticalStockItem: {
    backgroundColor: '#FEF2F2',
  },
  lowStockItem: {
    backgroundColor: '#FFFBEB',
  },
  stockItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  stockItemName: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  stockItemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  stockBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  outOfStockBadge: {
    backgroundColor: '#DC2626',
  },
  criticalStockBadge: {
    backgroundColor: '#EF4444',
  },
  lowStockBadge: {
    backgroundColor: '#F59E0B',
  },
  stockBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noAlerts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#10B981',
    marginTop: 12,
    fontWeight: '500',
  },
  viewProductsButton: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewProductsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StockNotificationsScreen;

