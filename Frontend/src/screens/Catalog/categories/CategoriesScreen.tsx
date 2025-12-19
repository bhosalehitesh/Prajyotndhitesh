import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Image,
  Share,
  Alert,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';
import { fetchCategories, deleteCategory, fetchProducts, CategoryDto, ProductDto } from '../../../utils/api';

interface CategoriesScreenProps {
  navigation: any;
  route?: any;
}

interface Category {
  id: string;
  name: string;
  image?: string;
  productCount: number;
  description?: string;
  businessCategory?: string;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>(route?.params?.selectedProducts || []);

  const addToCollection = route?.params?.addToCollection === true;
  const returnParams = route?.params?.returnParams || {};

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [apiCategories, apiProducts]: [CategoryDto[], ProductDto[]] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      // Debug: Log first product to see what fields are available
      if (apiProducts.length > 0) {
        const firstProduct = apiProducts[0] as any;
        console.log('🔍 [CategoriesScreen] Sample product structure:', {
          productsId: firstProduct.productsId,
          productName: firstProduct.productName,
          categoryId: firstProduct.categoryId,
          category_id: firstProduct.category_id,
          category: firstProduct.category,
          categoryObject: firstProduct.category ? {
            category_id: firstProduct.category.category_id,
            categoryId: firstProduct.category.categoryId,
            categoryName: firstProduct.category.categoryName,
          } : 'no category object',
          allKeys: Object.keys(firstProduct),
        });

        // Check if ANY products have categoryId
        const productsWithCategoryId = apiProducts.filter(p => {
          const pCategoryId = (p as any).categoryId ?? (p as any).category_id ?? (p as any).category?.category_id ?? null;
          return pCategoryId != null;
        });
        console.log('📊 [CategoriesScreen] Products with categoryId:', {
          totalProducts: apiProducts.length,
          productsWithCategoryId: productsWithCategoryId.length,
          productsWithoutCategoryId: apiProducts.length - productsWithCategoryId.length,
          sampleProductIds: productsWithCategoryId.slice(0, 3).map((p: any) => ({
            productId: p.productsId,
            categoryId: (p as any).categoryId ?? (p as any).category_id ?? 'not found',
          })),
        });
      }

      const mapped: Category[] = apiCategories.map(cat => {
        const catName = (cat.categoryName || '').toLowerCase().trim();
        const catBusiness = (cat.businessCategory || '').toLowerCase().trim();
        const catId = cat.category_id;

        // SmartBiz: Count products by categoryId (the actual foreign key relationship)
        // Check if any products have categoryId - if not, use fallback matching
        const hasAnyCategoryIds = apiProducts.some(p => {
          const pCategoryId = (p as any).categoryId ?? (p as any).category_id ?? (p as any).category?.category_id ?? null;
          return pCategoryId != null;
        });

        const count = apiProducts.filter(p => {
          const product = p as any;

          // Try multiple possible field names for category ID
          const pCategoryId =
            product.categoryId ??
            product.category_id ??
            product.category?.category_id ??
            product.category?.categoryId ??
            null;

          // Primary: Match by category ID (the actual database relationship)
          if (pCategoryId != null && catId != null) {
            return Number(pCategoryId) === Number(catId);
          }

          // Fallback: Only use businessCategory matching if NO products have categoryId
          // This handles cases where products haven't been migrated to use categoryId yet
          if (!hasAnyCategoryIds) {
            const pBusiness = (product.businessCategory || '').toLowerCase().trim();
            if (catBusiness && pBusiness && pBusiness === catBusiness) {
              return true;
            }
          }

          return false;
        }).length;

        // Debug logging for categories with products or if count seems wrong
        if (count > 0 || catId === apiCategories[0]?.category_id) {
          console.log('🔍 [CategoriesScreen] Category product count:', {
            categoryId: catId,
            categoryName: cat.categoryName,
            productCount: count,
            // Show sample products that matched this category
            matchedProducts: apiProducts
              .filter(p => {
                const pCategoryId = (p as any).categoryId ?? (p as any).category_id ?? (p as any).category?.category_id ?? null;
                return pCategoryId != null && catId != null && Number(pCategoryId) === Number(catId);
              })
              .map(p => ({
                productId: (p as any).productsId,
                productName: (p as any).productName,
                categoryId: (p as any).categoryId ?? (p as any).category_id ?? 'not found',
              }))
              .slice(0, 3), // Show first 3 matches
          });
        }

        return {
          id: String(cat.category_id),
          name: cat.categoryName,
          image: cat.categoryImage || undefined,
          productCount: count,
          description: cat.description || '',
          businessCategory: cat.businessCategory || '',
        };
      });



      // SmartBiz: Deduplicate categories by name (group similar)
      const uniqueCategoriesMap = mapped.reduce((acc, cat) => {
        const key = cat.name.toLowerCase().trim();
        if (!acc.has(key)) {
          acc.set(key, cat);
        } else {
          // Merge with existing
          const existing = acc.get(key)!;
          // Add counts
          existing.productCount += cat.productCount;
          // If existing has no image but new one does, update it
          if (!existing.image && cat.image) {
            existing.image = cat.image;
          }
          // We keep the ID of the first one found (usually the oldest or first returned)
          // This ensures we have a valid ID for operations, though 'ProductsScreen' 
          // should use name matching to find all products across the duplicate categories.
        }
        return acc;
      }, new Map<string, Category>());

      const uniqueCategories = Array.from(uniqueCategoriesMap.values());
      // Sort alphabetically
      uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCategories();
    });
    return unsubscribe;
  }, [navigation, loadCategories]);

  // SmartBiz: Sync selected products when coming back from ProductsScreen or AddCollection
  useEffect(() => {
    // Check both 'selectedProducts' directly and 'returnParams'
    const newSelected = route?.params?.selectedProducts || route?.params?.returnParams?.selectedProducts;
    if (newSelected) {
      console.log(`📦 [CategoriesScreen] Syncing ${newSelected.length} selected products`);
      setSelectedProducts(newSelected);
    }
  }, [route?.params?.selectedProducts, route?.params?.returnParams?.selectedProducts]);

  const handleMenuPress = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setBottomSheetOpen(true);
  };

  const handleEdit = () => {
    setBottomSheetOpen(false);
    if (!activeCategoryId || !activeCategory) {
      Alert.alert('Error', 'No category selected');
      return;
    }
    console.log('🔄 [CategoriesScreen] Navigating to edit category:', {
      categoryId: activeCategoryId,
      categoryName: activeCategory.name,
      businessCategory: activeCategory.businessCategory,
    });
    navigation.navigate('EditCategory', {
      categoryId: activeCategoryId, // Ensure this is passed
      name: activeCategory.name,
      description: activeCategory.description,
      image: activeCategory.image,
      businessCategory: activeCategory.businessCategory,
    });
  };

  const handleShare = async () => {
    setBottomSheetOpen(false);

    if (!activeCategory) {
      Alert.alert('Error', 'No category selected');
      return;
    }

    // Small delay to ensure bottom sheet closes before share sheet opens
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const shareMessage = `Check out this category: ${activeCategory.name}\n\n${activeCategory.description || 'Explore this category on our app!'}`;

      console.log('Sharing category:', activeCategory.name);

      // Use native Android/iOS share sheet - shows all available apps on the device
      const result = await Share.share({
        message: shareMessage,
        title: activeCategory.name,
      });

      console.log('Share result:', result);

      if (result.action === Share.sharedAction) {
        console.log('Category shared successfully via:', result.activityType || 'unknown');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed by user');
      }
    } catch (error: any) {
      console.error('Error sharing category:', error);
      // Only show error if it's not a user cancellation
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes('User did not share') &&
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('dismissed')) {
        Alert.alert('Error', 'Failed to share category. Please try again.');
      }
    }
  };

  const handleDeletePress = () => {
    setBottomSheetOpen(false);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (activeCategoryId) {
      const idToDelete = activeCategoryId;
      setConfirmDeleteOpen(false);
      setActiveCategoryId(null);
      deleteCategory(idToDelete)
        .then(() => {
          setCategories(prev => prev.filter(c => c.id !== idToDelete));
          // Show success message if you have a toast/alert system
          Alert.alert('Success', 'Category deleted successfully');
        })
        .catch(err => {
          console.error('Failed to delete category', err);
          // Show the actual error message from backend
          const errorMessage = err.message || 'Failed to delete category';
          Alert.alert('Error', errorMessage);
        });
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Categories"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading && categories.length === 0 ? (
          <Text style={styles.emptyText}>Loading categories...</Text>
        ) : !loading && filteredCategories.length === 0 ? (
          <Text style={styles.emptyText}>No categories found. Add your first category.</Text>
        ) : (
          filteredCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryListItem}
              onPress={() => {
                navigation.navigate('Products', {
                  categoryId: category.id,
                  categoryName: category.name,
                  businessCategory: category.businessCategory,
                  // SmartBiz: Always return to Categories so user can pick from multiple categories
                  addToCollection: addToCollection,
                  returnScreen: 'Categories',
                  returnParams: {
                    ...route?.params,
                    selectedProducts: selectedProducts, // Pass current cumulative selection
                  },
                  collectionId: route?.params?.collectionId,
                  collectionName: route?.params?.collectionName,
                  refreshTimestamp: Date.now(),
                });
              }}
            >
              <Text style={styles.categoryNameSimple}>
                {category.name}
              </Text>
              <IconSymbol name="chevron-forward" size={20} color="#008080" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      {!addToCollection && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCategory')}>
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>
      )}

      {/* Continue to Preview Button (Image 1 & 2) */}
      {addToCollection && selectedProducts.length > 0 && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            navigation.navigate('SelectedProductsPreview', {
              selectedProducts: selectedProducts,
              // Metadata to return finally to AddCollection
              returnScreen: route?.params?.returnScreen || 'AddCollection',
              returnParams: route?.params?.returnParams,
            });
          }}>
          <Text style={styles.continueButtonText}>
            Continue to Preview Products ({selectedProducts.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet */}
      <Modal
        transparent
        visible={bottomSheetOpen}
        animationType="slide"
        onRequestClose={() => setBottomSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setBottomSheetOpen(false)}>
          <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Category Title */}
            <Text style={styles.bottomSheetTitle}>{activeCategory?.name}</Text>

            {/* Action Options */}
            <TouchableOpacity style={styles.actionRow} onPress={handleEdit}>
              <Text style={styles.actionRowText}>Edit Category</Text>
              <IconSymbol name="pencil" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleShare}>
              <Text style={styles.actionRowText}>Share Category</Text>
              <IconSymbol name="share" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleDeletePress}>
              <Text style={[styles.actionRowText, styles.deleteText]}>Delete Category</Text>
              <IconSymbol name="trash" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={confirmDeleteOpen}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setConfirmDeleteOpen(false)}>
          <Pressable style={styles.deleteModal} onPress={e => e.stopPropagation()}>
            <Text style={styles.deleteModalTitle}>Delete Category</Text>
            <Text style={styles.deleteModalQuestion}>
              Are you sure you want to delete "{activeCategory?.name}"?
            </Text>
            <TouchableOpacity style={styles.deleteModalButton} onPress={handleDelete}>
              <Text style={styles.deleteModalButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setConfirmDeleteOpen(false)}>
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Changed from #F5F5F5 for cleaner look
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937', // Dark header to match Preview and screenshot
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
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 14,
    marginTop: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Add new styles for the simple list
  categoryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryNameSimple: {
    fontSize: 16,
    color: '#000000',
    flex: 1, // Take remaining space
  },
  categoryImageContainer: {
    marginRight: 12,
  },
  categoryImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  categoryCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  actionRowText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  deleteText: {
    color: '#B91C1C',
  },
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: '100%',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  deleteModalQuestion: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  deleteModalButton: {
    backgroundColor: '#B91C1C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelModalButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#1F2937', // Dark blue/slate like the image
    paddingVertical: 18,
    borderRadius: 30, // Pill shaped
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default CategoriesScreen;

