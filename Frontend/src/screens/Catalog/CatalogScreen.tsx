import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import { fetchProducts, ProductDto } from '../../utils/api';

interface CatalogScreenProps {
  navigation: any;
}

const CatalogScreen: React.FC<CatalogScreenProps> = ({navigation}) => {
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    criticalStock: [] as Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}>,
    lowStock: [] as Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}>,
    outOfStock: [] as Array<{id: string; name: string; stock: number; category?: string; businessCategory?: string}>,
    byCategory: {} as Record<string, Array<{id: string; name: string; stock: number}>>,
  });
  const [selectedView, setSelectedView] = useState<'stock-level' | 'category'>('stock-level');
  const [loading, setLoading] = useState(true);

  const handleNavigation = (screen: string) => {
    if (screen === 'Products' || screen === 'Categories' || screen === 'Collections') {
      navigation.navigate(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  const handleFloatingAction = () => {
    setIsFabExpanded(!isFabExpanded);
  };

  const handleFabOption = (option: string) => {
    setIsFabExpanded(false);
    if (option === 'Product') {
      navigation.navigate('AddProduct');
    } else if (option === 'Category') {
      navigation.navigate('AddCategory');
    } else if (option === 'Collection') {
      navigation.navigate('AddCollection');
    }
  };

  const handleBackdropPress = () => {
    setIsFabExpanded(false);
  };

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
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catalog</Text>
        {/* Notification Button */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('StockNotifications')}>
          <IconSymbol name="notifications" size={24} color="#e61580" />
          {!loading && (stockStats.criticalStock.length + stockStats.lowStock.length + stockStats.outOfStock.length) > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {stockStats.criticalStock.length + stockStats.lowStock.length + stockStats.outOfStock.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerBackground}>
          {/* Background image placeholder */}
          <View style={styles.backgroundImage} />
        </View>
      </View>

      {/* Main Content Card */}
      <View style={styles.contentCard}>
        {/* Products Option */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => handleNavigation('Products')}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol name="bag" size={20} color="#6c757d" />
            </View>
            <Text style={styles.optionText}>Products</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Categories Option */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => handleNavigation('Categories')}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol name="tag" size={20} color="#6c757d" />
            </View>
            <Text style={styles.optionText}>Categories</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Collections Option */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => handleNavigation('Collections')}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol name="folder" size={20} color="#6c757d" />
            </View>
            <Text style={styles.optionText}>Collections</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Backdrop when FAB is expanded */}
      {isFabExpanded && (
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
      )}

      {/* Expanded FAB Options */}
      {isFabExpanded && (
        <View style={styles.fabOptionsContainer}>
          {/* Product Option - Top */}
          <TouchableOpacity
            style={[styles.fabOption, styles.fabOptionTop]}
            onPress={() => handleFabOption('Product')}>
            <View style={styles.fabOptionContent}>
              <IconSymbol name="bag" size={18} color="#6c757d" />
              <Text style={styles.fabOptionText}>Product</Text>
            </View>
          </TouchableOpacity>

          {/* Category Option - Middle */}
          <TouchableOpacity
            style={[styles.fabOption, styles.fabOptionMiddle]}
            onPress={() => handleFabOption('Category')}>
            <View style={styles.fabOptionContent}>
              <IconSymbol name="tag" size={18} color="#6c757d" />
              <Text style={styles.fabOptionText}>Category</Text>
            </View>
          </TouchableOpacity>

          {/* Collection Option - Bottom */}
          <TouchableOpacity
            style={[styles.fabOption, styles.fabOptionBottom]}
            onPress={() => handleFabOption('Collection')}>
            <View style={styles.fabOptionContent}>
              <IconSymbol name="folder" size={18} color="#6c757d" />
              <Text style={styles.fabOptionText}>Collection</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleFloatingAction}>
        <Text style={styles.fabText}>{isFabExpanded ? '✕' : '+'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#e61580',
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    zIndex: 2,
    flex: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#e61580',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    opacity: 0.3,
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: '#dee2e6',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e61580',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  fabOptionsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 2,
    alignItems: 'flex-end',
  },
  fabOption: {
    width: 140,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabOptionTop: {
    marginBottom: 12,
  },
  fabOptionMiddle: {
    marginBottom: 12,
  },
  fabOptionBottom: {
    marginBottom: 0,
  },
  fabOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fabOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
    marginLeft: 8,
  },
  notificationHeader: {
    backgroundColor: '#e61580',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
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
  notificationContent: {
    flex: 1,
  },
  notificationContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  stockSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#dee2e6',
    marginHorizontal: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6c757d',
  },
  toggleButtonTextActive: {
    color: '#e61580',
    fontWeight: '600',
  },
  stockAlertsContainer: {
    marginBottom: 12,
  },
  stockLevelSection: {
    marginBottom: 16,
  },
  stockLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLevelTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 6,
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
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
    marginRight: 8,
  },
  stockItemName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  stockItemCategory: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
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
  stockBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewProductsButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  viewProductsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noAlerts: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAlertsText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default CatalogScreen;
