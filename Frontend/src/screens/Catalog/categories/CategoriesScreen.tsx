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
import { fetchCategories, deleteCategory, fetchProducts, CategoryDto, ProductDto, updateCategoryTrendingStatus } from '../../../utils/api';

interface CategoriesScreenProps {
  navigation: any;
  route?: any;
}

interface Category {
  id: string;
  categoryId: number | null; // Store the actual backend category_id
  name: string;
  image?: string;
  productCount: number;
  description?: string;
  businessCategory?: string;
  isTrending?: boolean;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>(route?.params?.selectedProducts || []);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

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

      // Debug: Log raw category structure to see what backend is returning
      if (apiCategories.length > 0) {
        console.log('🔍 [CategoriesScreen] Raw category data sample:', JSON.stringify(apiCategories[0], null, 2));
      }

      // Debug: Check if products have categoryId (only log if there's an issue)
      if (apiProducts.length > 0 && apiCategories.length > 0) {
        const productsWithCategoryId = apiProducts.filter(p => {
          const pCategoryId = (p as any).categoryId ?? (p as any).category_id ?? (p as any).category?.category_id ?? null;
          return pCategoryId != null;
        });
        
        // Log summary for debugging
        const categoriesWithId = apiCategories.filter(cat => {
          const id = (cat as any).categoryId ?? cat.category_id;
          return id != null;
        }).length;
        console.log(`📊 [CategoriesScreen] Data Summary: ${apiProducts.length} products (${productsWithCategoryId.length} with categoryId), ${apiCategories.length} categories (${categoriesWithId} with categoryId/category_id)`);
        
        // Only log warning if there's a potential issue
        if (productsWithCategoryId.length === 0 && apiProducts.length > 0) {
          console.warn('⚠️ [CategoriesScreen] No products have categoryId assigned - will use name matching');
        }
        if (categoriesWithId === 0 && apiCategories.length > 0) {
          console.warn('⚠️ [CategoriesScreen] No categories have categoryId/category_id - all filtering will use name matching');
        }
      }

      const mapped: Category[] = apiCategories.map((cat, index) => {
        const catName = (cat.categoryName || '').toLowerCase().trim();
        const catBusiness = (cat.businessCategory || '').toLowerCase().trim();
        // Backend returns categoryId (camelCase) via @JsonProperty, but DTO might have category_id (snake_case)
        // Check multiple possible field names to handle different serialization formats
        const catAny = cat as any;
        const catId = 
          catAny.categoryId ??           // Expected: @JsonProperty("categoryId")
          catAny.category_id ??          // Snake case fallback
          catAny.id ??                   // Generic id field
          catAny.categoryId ??           // Try again with different casing
          (typeof catAny.category?.category_id !== 'undefined' ? catAny.category.category_id : null) ?? // Nested category object
          null;

        // SmartBiz: Count products by categoryId (the actual foreign key relationship)
        // Check if any products have categoryId - if not, use fallback matching
        const hasAnyCategoryIds = apiProducts.some(p => {
          const pCategoryId = (p as any).categoryId ?? (p as any).category_id ?? (p as any).category?.category_id ?? null;
          return pCategoryId != null;
        });

        // Count products for this category
        // IMPORTANT: A product matches if ANY of these conditions are true (OR logic)
        // Priority: 1) categoryId match, 2) productCategory name match, 3) businessCategory match (only if no categoryIds exist)
        let count = 0;
        let matchedById = 0;
        let matchedByName = 0;
        let matchedByBusiness = 0;
        
        for (const product of apiProducts) {
          const p = product as any;
          let matched = false;

          // Try multiple possible field names for category ID
          const pCategoryId =
            p.categoryId ??
            p.category_id ??
            p.category?.category_id ??
            p.category?.categoryId ??
            null;

          // PRIMARY MATCH: Match by category ID (the actual database foreign key relationship)
          // This is the most accurate way to match products to categories
          if (pCategoryId != null && catId != null) {
            const productCatId = Number(pCategoryId);
            const categoryCatId = Number(catId);
            if (!isNaN(productCatId) && !isNaN(categoryCatId) && productCatId === categoryCatId) {
              matched = true;
              matchedById++;
            }
          }

          // FALLBACK 1: Match by productCategory name (for products without categoryId set or if ID didn't match)
          // Only use this if we haven't matched yet
          // Use case-insensitive matching with partial support for better compatibility
          if (!matched && catName) {
            const pProductCategory = (p.productCategory || '').toLowerCase().trim();
            if (pProductCategory) {
              // Exact match
              if (pProductCategory === catName) {
                matched = true;
                matchedByName++;
              }
              // Partial match (handles slight name variations)
              else if (pProductCategory.includes(catName) || catName.includes(pProductCategory)) {
                matched = true;
                matchedByName++;
              }
            }
          }

          // FALLBACK 2: Match by businessCategory (only if NO products in the entire dataset have categoryId)
          // This is a legacy fallback for old products
          if (!matched && !hasAnyCategoryIds && catBusiness) {
            const pBusiness = (p.businessCategory || '').toLowerCase().trim();
            if (pBusiness && pBusiness === catBusiness) {
              matched = true;
              matchedByBusiness++;
            }
          }

          if (matched) {
            count++;
          }
        }
        
        // Debug: Log category counts for troubleshooting (only log first 5 categories to see patterns)
        if (index < 5) {
          if (count > 0) {
            console.log(`📦 [CategoriesScreen] "${cat.categoryName}" (ID: ${catId}): ${count} products (by ID: ${matchedById}, by name: ${matchedByName}, by business: ${matchedByBusiness})`);
          } else if (apiProducts.length > 0) {
            // Log categories with 0 products to help debug
            console.log(`⚠️ [CategoriesScreen] "${cat.categoryName}" (ID: ${catId}): 0 products - check if products have matching categoryId or productCategory name`);
          }
        }

        // Only log if there's a mismatch (category exists but no products found when there should be)
        // Removed excessive logging for better performance

        // Ensure categoryId is always valid - use fallback if missing
        // Check both categoryId (camelCase from backend) and category_id (legacy snake_case)
        const categoryId = (cat as any).categoryId ?? cat.category_id ?? null;
        // Create a unique ID that will never be undefined
        const uniqueId = (categoryId != null && categoryId !== undefined) 
          ? String(categoryId) 
          : `category-${index}-${(cat.categoryName || 'unnamed').replace(/\s+/g, '-')}`;

        return {
          id: uniqueId, // This will always be a valid string, never undefined
          categoryId: categoryId, // Store the actual numeric category_id for filtering
          name: cat.categoryName,
          image: cat.categoryImage || undefined,
          productCount: count,
          description: cat.description || '',
          businessCategory: cat.businessCategory || '',
          isTrending: (cat as any).isTrending ?? false,
        };
      });



      // SmartBiz: Deduplicate categories by name (group similar categories with same name)
      // IMPORTANT: When merging categories with the same name, prefer the one with:
      // 1. Valid categoryId (for proper filtering)
      // 2. Higher product count (more likely to be the correct/primary category)
      const uniqueCategoriesMap = mapped.reduce((acc, cat) => {
        const key = cat.name.toLowerCase().trim();
        if (!acc.has(key)) {
          acc.set(key, { ...cat }); // Create a copy to avoid mutation
        } else {
          // Merge with existing category that has the same name
          const existing = acc.get(key)!;
          
          // Determine which category to keep based on priority:
          // Priority 1: Has categoryId (needed for proper filtering)
          // Priority 2: Higher product count (more likely to be correct)
          const newHasId = cat.categoryId != null;
          const existingHasId = existing.categoryId != null;
          
          let shouldReplace = false;
          
          if (newHasId && !existingHasId) {
            // New has ID, existing doesn't - prefer new
            shouldReplace = true;
          } else if (!newHasId && existingHasId) {
            // Existing has ID, new doesn't - keep existing
            shouldReplace = false;
          } else if (newHasId && existingHasId) {
            // Both have ID - prefer the one with more products
            shouldReplace = cat.productCount > existing.productCount;
          } else {
            // Neither has ID - prefer the one with more products
            shouldReplace = cat.productCount > existing.productCount;
          }
          
          if (shouldReplace) {
            // Replace with the better category
            acc.set(key, { ...cat });
          } else {
            // Keep existing, but update count if needed (use max to avoid double counting)
            // Note: If categories have same name, products matching that name will match both
            // So we use max to avoid inflating the count
            existing.productCount = Math.max(existing.productCount, cat.productCount);
            // Update image if existing doesn't have one
            if (!existing.image && cat.image) {
              existing.image = cat.image;
            }
          }
        }
        return acc;
      }, new Map<string, Category>());

      const uniqueCategories = Array.from(uniqueCategoriesMap.values());
      // Sort alphabetically
      uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
      
      // Ensure all categories have valid IDs (should already be set, but double-check)
      uniqueCategories.forEach((cat, idx) => {
        if (!cat.id || cat.id === 'undefined' || cat.id === 'null') {
          cat.id = `category-${idx}-${(cat.name || 'unnamed').replace(/\s+/g, '-')}`;
        }
      });

      // Final summary: Log if there are potential issues
      const categoriesWithZeroProducts = uniqueCategories.filter(cat => cat.productCount === 0);
      const categoriesWithProducts = uniqueCategories.filter(cat => cat.productCount > 0);
      const categoriesWithoutId = uniqueCategories.filter(cat => !cat.categoryId);
      
      if (categoriesWithZeroProducts.length > 0 && categoriesWithProducts.length === 0) {
        console.warn('⚠️ [CategoriesScreen] All categories show 0 products. This might indicate a data mismatch.');
      } else if (categoriesWithoutId.length > 0) {
        console.warn(`⚠️ [CategoriesScreen] ${categoriesWithoutId.length} categories don't have categoryId. They will use name-based filtering.`);
      }

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

      // Use native Android/iOS share sheet - shows all available apps on the device
      await Share.share({
        message: shareMessage,
        title: activeCategory.name,
      });
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

  const handleToggleTrending = async () => {
    setBottomSheetOpen(false);
    
    if (!activeCategoryId || !activeCategory) {
      Alert.alert('Error', 'No category selected');
      return;
    }

    const categoryId = activeCategory.categoryId;
    if (!categoryId) {
      Alert.alert('Error', 'Category ID not found');
      return;
    }

    const newTrendingStatus = !activeCategory.isTrending;

    try {
      await updateCategoryTrendingStatus(categoryId, newTrendingStatus);
      
      // Update local state
      setCategories(prev => prev.map(c => 
        c.id === activeCategoryId 
          ? { ...c, isTrending: newTrendingStatus }
          : c
      ));
      
      Alert.alert(
        'Success', 
        newTrendingStatus 
          ? 'Category marked as trending' 
          : 'Category removed from trending'
      );
    } catch (error: any) {
      console.error('Failed to update trending status', error);
      Alert.alert('Error', error.message || 'Failed to update trending status');
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
        <IconSymbol name="search" size={20} color="#6c757d" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Categories"
          placeholderTextColor="#6c757d"
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
          filteredCategories.map((category, index) => {
            // Ensure unique key - use category.id if available, otherwise use index-based fallback
            const uniqueKey = (category.id && category.id !== 'undefined' && category.id !== 'null') 
              ? String(category.id) 
              : `category-${index}-${(category.name || 'unnamed').replace(/\s+/g, '-')}`;
            
            const productCount = category.productCount || 0;
            const productCountText = productCount === 1 
              ? '1 product listed' 
              : `${productCount} products listed`;
            
            return (
            <TouchableOpacity
              key={uniqueKey}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => {
                try {
                  // Get the numeric categoryId - this should be the backend category_id
                  // If it's null, we'll use name-based filtering in ProductsScreen
                  const numericCategoryId = category.categoryId;
                  
                  // CRITICAL: Always pass categoryName for name-based filtering fallback
                  // This ensures products can be filtered even if categoryId is null
                  navigation.navigate('Products', {
                    // Pass numeric categoryId if available (for ID-based filtering)
                    // If null, ProductsScreen will use categoryName for name-based filtering
                    categoryId: numericCategoryId != null && numericCategoryId !== undefined 
                      ? String(numericCategoryId) 
                      : undefined, // Use undefined instead of null to trigger name-based filtering
                    categoryName: category.name, // CRITICAL: Always pass for name-based filtering
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
                } catch (error: any) {
                  console.error('Error navigating to products:', error);
                  Alert.alert('Error', 'Failed to open category. Please try again.');
                }
              }}
            >
              {/* Category Image */}
              <View style={styles.categoryImageContainer}>
                {category.image && !failedImages.has(category.id) ? (
                  <Image 
                    source={{ uri: category.image }} 
                    style={styles.categoryImage}
                    onError={() => {
                      // Mark this image as failed to load
                      setFailedImages(prev => new Set(prev).add(category.id));
                    }}
                  />
                ) : (
                  <View style={styles.categoryImagePlaceholder}>
                    <IconSymbol name="image" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>

              {/* Category Info */}
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.name}
                </Text>
                <Text style={styles.categoryCount}>
                  {productCountText}
                </Text>
              </View>

              {/* Options Menu */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMenuPress(category.id);
                }}
              >
                <IconSymbol name="ellipsis-vertical" size={20} color="#6c757d" />
              </TouchableOpacity>
            </TouchableOpacity>
            );
          })
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
              <IconSymbol name="share" size={20} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleToggleTrending}>
              <Text style={styles.actionRowText}>
                {activeCategory?.isTrending ? 'Remove from Trending' : 'Mark as Trending Category'}
              </Text>
              <IconSymbol 
                name={activeCategory?.isTrending ? "star" : "star-outline"} 
                size={20} 
                color={activeCategory?.isTrending ? "#F59E0B" : "#333333"} 
              />
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
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 12,
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
    marginHorizontal: 0,
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
    borderBottomColor: '#dee2e6',
  },
  categoryNameSimple: {
    fontSize: 16,
    color: '#333333',
    flex: 1, // Take remaining space
  },
  categoryImageContainer: {
    marginRight: 12,
  },
  categoryImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#e61580',
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

