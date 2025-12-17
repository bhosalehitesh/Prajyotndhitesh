import React, {useState, useCallback, useEffect} from 'react';
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
import {fetchCategories, deleteCategory, fetchProducts, CategoryDto, ProductDto} from '../../../utils/api';

interface CategoriesScreenProps {
  navigation: any;
}

interface Category {
  id: string;
  name: string;
  image?: string;
  productCount: number;
  description?: string;
  businessCategory?: string;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [apiCategories, apiProducts]: [CategoryDto[], ProductDto[]] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      const mapped: Category[] = apiCategories.map(cat => {
        const catName = (cat.categoryName || '').toLowerCase().trim();
        const catBusiness = (cat.businessCategory || '').toLowerCase().trim();
        const catId = cat.category_id;

        const count = apiProducts.filter(p => {
          const product = p as any;
          
          // Try multiple possible field names for category ID
          const pCategoryId =
            product.categoryId ??
            product.category_id ??
            product.category?.category_id ??
            product.category?.categoryId ??
            null;

          // Primary: Match by category ID (strongest relationship)
          if (pCategoryId != null && catId != null) {
            const matches = Number(pCategoryId) === Number(catId);
            if (matches) {
              return true;
            }
          }

          // Fallback 1: Match by businessCategory (if both exist)
          const pBusiness = (product.businessCategory || '').toLowerCase().trim();
          if (catBusiness && pBusiness && pBusiness === catBusiness) {
            return true;
          }

          // Fallback 2: Match productCategory text to categoryName
          const pCat = (product.productCategory || '').toLowerCase().trim();
          if (catName && pCat && pCat === catName) {
            return true;
          }

          return false;
        }).length;

        // Debug logging for first category
        if (catId === apiCategories[0]?.category_id) {
          console.log('🔍 [CategoriesScreen] Counting products for category:', {
            categoryId: catId,
            categoryName: cat.categoryName,
            totalProducts: apiProducts.length,
            matchedCount: count,
            sampleProduct: apiProducts[0] ? {
              productId: (apiProducts[0] as any).productsId,
              categoryId: (apiProducts[0] as any).categoryId ?? (apiProducts[0] as any).category_id ?? (apiProducts[0] as any).category?.category_id ?? 'not found',
              businessCategory: (apiProducts[0] as any).businessCategory,
              productCategory: (apiProducts[0] as any).productCategory,
            } : null,
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

      setCategories(mapped);
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

  const handleMenuPress = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setBottomSheetOpen(true);
  };

  const handleEdit = () => {
    setBottomSheetOpen(false);
    navigation.navigate('EditCategory', {
      categoryId: activeCategoryId,
      ...activeCategory,
    });
  };

  const handleAddProducts = () => {
    setBottomSheetOpen(false);
    if (activeCategoryId && activeCategory) {
      console.log('🔵 Navigating to Add Products to Category:', {
        categoryId: activeCategoryId,
        categoryName: activeCategory.name,
      });
      navigation.push('Products', {
        categoryId: activeCategoryId,
        categoryName: activeCategory.name,
        addToCategory: true,
        returnScreen: 'Categories',
      });
    } else {
      console.error('❌ Cannot navigate: missing categoryId or activeCategory', {
        activeCategoryId,
        activeCategory,
      });
    }
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
              style={styles.categoryCard}
              onPress={() =>
                navigation.navigate('Products', {
                  categoryId: category.id,
                  categoryName: category.name,
                  businessCategory: category.businessCategory,
                  returnScreen: 'Categories',
                })
              }
            >
              <View style={styles.categoryImageContainer}>
                {category.image && typeof category.image === 'string' && category.image !== 'placeholder' ? (
                  <Image source={{uri: category.image}} style={styles.categoryImage} />
                ) : (
                  <View style={styles.categoryImagePlaceholder}>
                    <IconSymbol name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.name}
                </Text>
                <Text style={styles.categoryCount}>
                  {category.productCount === 0
                    ? 'No product listed'
                    : `${category.productCount} product${category.productCount > 1 ? 's' : ''} listed`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleMenuPress(category.id)}>
                <IconSymbol name="ellipsis-vertical" size={20} color="#6c757d" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add New Category Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCategory')}>
        <Text style={styles.addButtonText}>Add New Category</Text>
      </TouchableOpacity>

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

            <TouchableOpacity style={styles.actionRow} onPress={handleAddProducts}>
              <Text style={styles.actionRowText}>Add Products</Text>
              <IconSymbol name="add-circle" size={20} color="#111827" />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
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
});

export default CategoriesScreen;

