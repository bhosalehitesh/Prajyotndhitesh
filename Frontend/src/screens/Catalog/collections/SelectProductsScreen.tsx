import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';

interface SelectProductsScreenProps {
  navigation: any;
  route?: any;
}

interface Product {
  id: string;
  title: string;
  price: number;
  mrp?: number;
  inStock: boolean;
  image?: string;
}

const SelectProductsScreen: React.FC<SelectProductsScreenProps> = ({
  navigation,
  route,
}) => {
  const collectionId = route?.params?.collectionId;
  const existingProductIds = route?.params?.selectedProductIds || [];
  
  // Sample products data - in real app, this would come from API/state
  const [allProducts, setAllProducts] = useState<Product[]>([
    {id: '1', title: 'soap', price: 50, mrp: 60, inStock: false},
    {id: '2', title: 'Shampoo', price: 120, mrp: 150, inStock: true},
    {id: '3', title: 'Toothbrush', price: 30, mrp: 40, inStock: true},
    {id: '4', title: 'Face Cream', price: 200, mrp: 250, inStock: true},
  ]);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(existingProductIds);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // If we have existing products, restore the selection
    if (existingProductIds.length > 0) {
      setSelectedProductIds(existingProductIds);
    }
  }, [existingProductIds]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSave = () => {
    // Pass selected products back to AddCollection screen
    const selectedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));
    navigation.navigate('AddCollection', {
      ...route?.params,
      selectedProducts: selectedProducts,
      selectedProductIds: selectedProductIds,
    });
  };

  const filteredProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedCount = selectedProductIds.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Products</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Products"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selected Count */}
      {selectedCount > 0 && (
        <View style={styles.selectedCountContainer}>
          <Text style={styles.selectedCountText}>
            {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Products List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="search" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          filteredProducts.map(product => {
            const isSelected = selectedProductIds.includes(product.id);
            const discount =
              product.mrp && product.mrp > product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;

            return (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                ]}
                onPress={() => toggleProductSelection(product.id)}>
                <View style={styles.productLeft}>
                  {/* Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxChecked,
                    ]}>
                    {isSelected && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>

                  {/* Product Image */}
                  <View style={styles.productImageContainer}>
                    {product.image ? (
                      <Image
                        source={{uri: product.image}}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <IconSymbol name="image" size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.title}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      {product.mrp && product.mrp > product.price && (
                        <>
                          <Text style={styles.productMrp}>₹{product.mrp}</Text>
                          {discount > 0 && (
                            <Text style={styles.discountBadge}>
                              {discount}% OFF
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                    <View style={styles.stockRow}>
                      <View
                        style={[
                          styles.stockIndicator,
                          product.inStock
                            ? styles.stockIndicatorIn
                            : styles.stockIndicatorOut,
                        ]}
                      />
                      <Text
                        style={[
                          styles.stockText,
                          !product.inStock && styles.stockTextOut,
                        ]}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedCount === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={selectedCount === 0}>
          <Text
            style={[
              styles.saveButtonText,
              selectedCount === 0 && styles.saveButtonTextDisabled,
            ]}>
            Add {selectedCount > 0 ? `${selectedCount} ` : ''}Product
            {selectedCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e61580',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  selectedCountContainer: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productCardSelected: {
    borderColor: '#e61580',
    backgroundColor: '#EFF6FF',
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#e61580',
    borderColor: '#e61580',
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  productMrp: {
    fontSize: 14,
    color: '#6c757d',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stockIndicatorIn: {
    backgroundColor: '#10B981',
  },
  stockIndicatorOut: {
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  stockTextOut: {
    color: '#EF4444',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#e61580',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: '#E5E7EB',
  },
});

export default SelectProductsScreen;

