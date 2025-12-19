import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  Dimensions,
  Animated,
  Share,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import IconSymbol from '../../../components/IconSymbol';
import { fetchProducts, fetchProductsByCollection, ProductDto, deleteProduct as deleteProductApi, updateProductStock, fetchCollectionsWithCounts, addProductToCollection, CollectionWithCountDto, updateProduct, updateProductStatus, saveCollectionProducts } from '../../../utils/api';
import { storage } from '../../../authentication/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductsScreenProps {
  navigation: any;
  route?: any;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation, route }) => {
  // SmartBiz: Parse navigation params for different modes
  const params = route?.params || {};
  const {
    returnScreen,
    returnParams,
    collectionName,
    viewCollectionProducts,
    // other params used for init
  } = params;

  const targetCollectionId = params.collectionId;
  const addToCollectionMode = params.addToCollection === true || (!!targetCollectionId && returnScreen === 'EditCollection');

  const addToCategoryMode = params.addProductsToCategory === true || params.addToCategory === true;
  const targetCategoryId = params.categoryId;
  const targetCategoryName = params.categoryName;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([]);
  const [storeName, setStoreName] = useState('My Store');
  const [storeLink, setStoreLink] = useState<string | null>(null);
  const [storeOpen, setStoreOpen] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState<Record<string, boolean>>({});

  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'Inventory' | 'Status' | 'Discount' | 'Price Range'>('Inventory');
  const [inventory, setInventory] = useState<'all' | 'in' | 'out'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [discounts, setDiscounts] = useState<{ [key: string]: boolean }>({});
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [sortBy, setSortBy] = useState<'title-az' | 'title-za' | 'price-low' | 'price-high' | 'disc-low' | 'disc-high'>('title-az');

  const [categoryFilter, setCategoryFilter] = useState<string | null>(params.categoryName ?? null);
  const [businessFilter, setBusinessFilter] = useState<string | null>(params.businessCategory ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // New state to manage selected products for collection addition
  const [selectedProductsMap, setSelectedProductsMap] = useState<Map<string, any>>(new Map());

  // Legacy states for "Add to Category"
  const [selectedForCategory, setSelectedForCategory] = useState<Record<string, boolean>>({});
  const [addingToCategory, setAddingToCategory] = useState(false);
  const [alreadyAddedToCategory, setAlreadyAddedToCategory] = useState<Record<string, boolean>>({});
  const [navBusy, setNavBusy] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const prepopulatedRef = useRef(false);

  // Initialize selection from params (when coming from AddCollection screen or Categories)
  useEffect(() => {
    if (returnParams?.selectedProducts) {
      console.log(`📦 [ProductsScreen] Initializing/Refreshing selection from params with ${returnParams.selectedProducts.length} items`);
      const initialMap = new Map();
      returnParams.selectedProducts.forEach((p: any) => initialMap.set(p.id, p));
      setSelectedProductsMap(initialMap);
      prepopulatedRef.current = true;
    }
  }, [returnParams?.selectedProducts]);

  // Pre-populate selection map when viewing an existing collection's products (VIEW mode only)
  useEffect(() => {
    // ONLY pre-populate from the list if we are in VIEW mode (which fetches only the collection products)
    // AND we haven't already pre-populated from returnParams
    if (viewCollectionProducts && !addToCollectionMode && !addToCategoryMode && products.length > 0 && !prepopulatedRef.current) {
      console.log(`📦 [ProductsScreen] Pre-populating selection map with ${products.length} existing products in VIEW mode`);
      const initialMap = new Map();
      products.forEach(p => initialMap.set(p.id, p));
      setSelectedProductsMap(initialMap);
      prepopulatedRef.current = true;
    }
  }, [viewCollectionProducts, addToCollectionMode, addToCategoryMode, products]);

  // Animation for refresh button
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Load store info (name/link)
  useEffect(() => {
    const loadStoreInfo = async () => {
      try {
        const name = (await storage.getItem('storeName')) || 'My Store';
        const link = await storage.getItem('storeLink');
        setStoreName(name);
        setStoreLink(link);
      } catch (e) {
        // ignore
      }
    };
    loadStoreInfo();
  }, []);

  // When in add-to-collection or add-to-category mode, reset filters/search so all products show
  useEffect(() => {
    if (addToCollectionMode || addToCategoryMode) {
      console.log('🔄 Resetting filters for add-to-collection/category mode');
      setInventory('all');
      setDiscounts({});
      setPriceRange({ min: 0, max: 0 });
      setSortBy('title-az');
      setFilterTab('Inventory');
      setSearchQuery('');
      setCategoryFilter(null);
      setBusinessFilter(null);
    }
  }, [addToCollectionMode, addToCategoryMode]);

  const handleAddProduct = () => {
    if (navBusy) return;
    setNavBusy(true);
    navigation.navigate('AddProduct');
    // small delay to prevent double-tap spam; navigation will replace anyway
    setTimeout(() => setNavBusy(false), 800);
    console.log('Navigate to Add Product screen');
  };

  const activeProduct = useMemo(() => products.find(p => p.id === activeProductId) || null, [products, activeProductId]);

  const loadCollectionsForSheet = React.useCallback(async () => {
    try {
      const apiCollections = await fetchCollectionsWithCounts();
      const mapped = apiCollections.map(col => ({
        id: String(col.collectionId),
        name: col.collectionName,
      }));
      setCollections(mapped);
    } catch (error) {
      console.error('Failed to load collections for Add to Collection', error);
    }
  }, []);

  const handleShare = async () => {
    if (!activeProduct) {
      Alert.alert('Error', 'No product selected');
      setActionSheetOpen(false);
      return;
    }

    // Close action sheet first
    setActionSheetOpen(false);

    // Small delay to ensure action sheet closes before share sheet opens
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Get store link from storage
      const storeLink = await storage.getItem('storeLink');
      const storeName = await storage.getItem('storeName') || 'My Store';

      // Build product share message
      let shareMessage = `🛍️ ${activeProduct.title}\n\n`;

      // Add price information
      if (activeProduct.mrp && activeProduct.mrp > activeProduct.price) {
        const discount = Math.round(((activeProduct.mrp - activeProduct.price) / activeProduct.mrp) * 100);
        shareMessage += `💰 Price: ₹${activeProduct.price}\n`;
        shareMessage += `💵 MRP: ₹${activeProduct.mrp}\n`;
        shareMessage += `🎉 ${discount}% OFF\n\n`;
      } else {
        shareMessage += `💰 Price: ₹${activeProduct.price}\n\n`;
      }

      // Add description if available
      if (activeProduct.description) {
        shareMessage += `${activeProduct.description}\n\n`;
      }

      // Add stock status
      if (activeProduct.inStock) {
        shareMessage += `✅ In Stock\n`;
      } else {
        shareMessage += `❌ Out of Stock\n`;
      }

      // Add store link
      if (storeLink) {
        shareMessage += `\n🏪 Shop at: ${storeLink}`;
      } else {
        shareMessage += `\n🏪 Shop at: ${storeName}`;
      }

      console.log('Sharing product:', activeProduct.title);
      console.log('Share message:', shareMessage);

      // Use native Android/iOS share sheet
      // This will show the native share sheet with all available apps on the device
      const result = await Share.share({
        message: shareMessage,
        title: activeProduct.title,
      });

      console.log('Share result:', result);

      // Log result for debugging
      if (result.action === Share.sharedAction) {
        console.log('Product shared successfully via:', result.activityType || 'unknown');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed by user');
      }
    } catch (error: any) {
      console.error('Error sharing product:', error);
      // Only show error if it's not a user cancellation
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes('User did not share') &&
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('dismissed')) {
        Alert.alert('Error', 'Failed to share product. Please try again.');
      }
    }
  };

  const toggleSelection = (product: any) => {
    setSelectedProductsMap(prev => {
      const newMap = new Map(prev);
      if (newMap.has(product.id)) {
        newMap.delete(product.id);
      } else {
        newMap.set(product.id, product);
      }
      return newMap;
    });
  };

  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);

      // Start continuous rotation animation
      const startRotation = () => {
        rotateAnim.setValue(0);
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      };
      startRotation();

      // Determine filters
      const isActiveParam =
        statusFilter === 'active' ? true :
          statusFilter === 'hidden' ? false :
            undefined;

      let apiProducts: ProductDto[] = [];
      if (addToCollectionMode || addToCategoryMode) {
        // In add-to-collection or add-to-category picker, always show all products to pick from
        console.log('✅ Fetching ALL products for add-to-collection/category mode');

        // SmartBiz: If we have a targetCollectionId, also fetch current collection products to pre-populate
        if (addToCollectionMode && targetCollectionId && !prepopulatedRef.current && (!returnParams?.selectedProducts || returnParams.selectedProducts.length === 0)) {
          try {
            const [allProducts, collectionProducts] = await Promise.all([
              fetchProducts(),
              fetchProductsByCollection(targetCollectionId)
            ]);
            apiProducts = allProducts;

            console.log(`📦 [ProductsScreen] Pre-populating selection map with ${collectionProducts.length} EXISTING products for collection ${targetCollectionId}`);
            const initialMap = new Map();
            collectionProducts.forEach((p: any) => {
              // Map backend product to frontend format for selection map
              initialMap.set(String(p.productsId), {
                id: String(p.productsId),
                title: p.productName,
                price: p.sellingPrice ?? 0,
                imageUrl: (p.productImages && p.productImages[0]) || (p.socialSharingImage ?? undefined),
                // include other basic fields needed for display in summary/preview
              });
            });
            setSelectedProductsMap(initialMap);
            prepopulatedRef.current = true;
          } catch (err) {
            console.warn('⚠️ [ProductsScreen] Failed to fetch existing collection products for pre-population:', err);
            apiProducts = await fetchProducts();
          }
        } else {
          apiProducts = await fetchProducts();
        }
      } else if (viewCollectionProducts && targetCollectionId) {
        // Viewing a specific collection
        try {
          apiProducts = await fetchProductsByCollection(targetCollectionId);
        } catch (err: any) {
          console.error('❌ [ProductsScreen] Failed to load collection products:', err);
          // If collection doesn't exist or access denied, show empty list instead of crashing
          if (err.message?.includes('not found') || err.message?.includes('own collections')) {
            apiProducts = [];
            setProducts([]);
            setLoading(false);
            rotateAnim.stopAnimation();
            rotateAnim.setValue(0);
            return; // Exit early to avoid further processing
          }
          // Re-throw other errors
          throw err;
        }
      } else {
        // Default: all products (with status filter if set)
        apiProducts = await fetchProducts();
      }

      // Debug: Log first product to see what fields are available
      if (apiProducts.length > 0) {
        console.log('🔍 [ProductsScreen] Sample product from API:', {
          productsId: apiProducts[0].productsId,
          productName: apiProducts[0].productName,
          categoryId: (apiProducts[0] as any).categoryId,
          category_id: (apiProducts[0] as any).category_id,
          allKeys: Object.keys(apiProducts[0] || {}),
        });
      }

      const mapped = apiProducts.map(p => {
        // Extract categoryId from multiple possible sources
        const categoryIdValue = (p as any).categoryId ??
          (p as any).category_id ??
          null;

        return {
          id: String(p.productsId),
          title: p.productName,
          price: p.sellingPrice ?? 0,
          mrp: p.mrp ?? undefined,
          inStock: (p.inventoryQuantity ?? 0) > 0,
          imageUrl:
            (p.productImages && p.productImages[0]) ||
            (p.socialSharingImage ?? undefined),
          images: p.productImages ?? [],
          isActive: typeof (p as any).isActive === 'boolean' ? (p as any).isActive : undefined,
          businessCategory: p.businessCategory,
          productCategory: p.productCategory,
          description: p.description,
          inventoryQuantity: p.inventoryQuantity,
          sku: p.customSku,
          color: p.color,
          size: p.size,
          hsnCode: p.hsnCode,
          bestSeller: p.bestSeller ?? false,
          // Include categoryId for filtering by category
          categoryId: categoryIdValue,
          category_id: categoryIdValue,
        };
      });
      setProducts(mapped);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load products';
      console.error('❌ [ProductsScreen] Failed to load products:', error);
      
      // If it's a collection products error, show a more specific message
      if (errorMessage.includes('collection products')) {
        console.warn('⚠️ [ProductsScreen] Collection products error - this may be expected if collection is empty or invalid');
        // Set empty products instead of crashing
        setProducts([]);
      } else {
        // For other errors, still set empty to prevent crash
        setProducts([]);
      }
    } finally {
      setLoading(false);
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [rotateAnim, addToCollectionMode, addToCategoryMode, viewCollectionProducts, targetCollectionId, statusFilter]);

  // Comprehensive refresh function that resets everything and reloads
  const refreshScreen = React.useCallback(async () => {
    try {
      setLoading(true);

      // Start continuous rotation animation
      const startRotation = () => {
        rotateAnim.setValue(0);
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      };
      startRotation();

      // Reset all filters and state
      setInventory('all');
      setDiscounts({});
      setPriceRange({ min: 0, max: 0 });
      setSortBy('title-az');
      setFilterTab('Inventory');
      setActiveProductId(null);

      // Close all modals
      setIsFilterOpen(false);
      setIsSortOpen(false);
      setActionSheetOpen(false);
      setConfirmDeleteOpen(false);
      setCollectionSheetOpen(false);

      // Reload products (mirror the logic in loadProducts)
      let apiProducts: ProductDto[] = [];
      if (addToCollectionMode || addToCategoryMode) {
        apiProducts = await fetchProducts();
      } else if (viewCollectionProducts && targetCollectionId) {
        try {
          apiProducts = await fetchProductsByCollection(targetCollectionId);
        } catch (err: any) {
          console.error('❌ [ProductsScreen] Failed to load collection products in refresh:', err);
          // If collection doesn't exist or access denied, show empty list instead of crashing
          if (err.message?.includes('not found') || err.message?.includes('own collections')) {
            apiProducts = [];
          } else {
            // For other errors, fall back to all products
            apiProducts = await fetchProducts();
          }
        }
      } else {
        apiProducts = await fetchProducts();
      }

      // Debug: Log first product to see what fields are available
      if (apiProducts.length > 0) {
        console.log('🔍 [ProductsScreen] Sample product from API:', {
          productsId: apiProducts[0].productsId,
          productName: apiProducts[0].productName,
          categoryId: (apiProducts[0] as any).categoryId,
          category_id: (apiProducts[0] as any).category_id,
          allKeys: Object.keys(apiProducts[0] || {}),
        });
      }

      const mapped = apiProducts.map(p => {
        // Extract categoryId from multiple possible sources
        const categoryIdValue = p.categoryId ??
          p.category_id ??
          (p as any).categoryId ??
          (p as any).category_id ??
          null;

        const mappedProduct = {
          id: String(p.productsId),
          title: p.productName,
          price: p.sellingPrice ?? 0,
          mrp: p.mrp ?? undefined,
          inStock: (p.inventoryQuantity ?? 0) > 0,
          imageUrl: (p.productImages && p.productImages[0]) || (p.socialSharingImage ?? undefined),
          images: p.productImages ?? [],
          isActive: typeof (p as any).isActive === 'boolean' ? (p as any).isActive : undefined,
          businessCategory: p.businessCategory,
          productCategory: p.productCategory,
          description: p.description,
          inventoryQuantity: p.inventoryQuantity,
          sku: p.customSku,
          color: p.color,
          size: p.size,
          hsnCode: p.hsnCode,
          bestSeller: p.bestSeller ?? false,
          // SmartBiz: Include categoryId for edit mode (required for validation)
          categoryId: categoryIdValue,
          category_id: categoryIdValue,
        };

        // Debug: Log if categoryId is missing
        if (!categoryIdValue) {
          console.warn('⚠️ [ProductsScreen] Product missing categoryId:', {
            productId: mappedProduct.id,
            productName: mappedProduct.title,
            availableKeys: Object.keys(p),
          });
        }

        return mappedProduct;
      });
      setProducts(mapped);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to refresh products';
      console.error('❌ [ProductsScreen] Failed to refresh products:', error);
      
      // If it's a collection products error, show empty list instead of crashing
      if (errorMessage.includes('collection products')) {
        console.warn('⚠️ [ProductsScreen] Collection products error during refresh - showing empty list');
        setProducts([]);
      } else {
        // For other errors, still set empty to prevent crash
        setProducts([]);
      }
    } finally {
      setLoading(false);
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [rotateAnim, addToCollectionMode, addToCategoryMode, viewCollectionProducts, targetCollectionId]);

  // Load products whenever screen gains focus - always reload to show latest products
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('👁️ Screen focused, reloading products immediately...', {
        addToCollectionMode,
        addToCategoryMode,
        targetCategoryId,
        categoryId: route?.params?.categoryId,
        routeParams: route?.params,
      });
      // Always reload products when screen gains focus to show latest data
      // This ensures newly added products appear immediately
      loadProducts();
      // Refresh collections when returning from AddCollection
      loadCollectionsForSheet();
    });
    return unsubscribe;
  }, [navigation, loadProducts, loadCollectionsForSheet]);

  // Auto-reload when route params change (e.g., when navigating to a different category)
  // Also watch for refreshTimestamp to force reload when clicking category again
  React.useEffect(() => {
    if (route?.params?.categoryId || route?.params?.categoryName) {
      console.log('🔄 Category route params detected, reloading products...', {
        categoryId: route?.params?.categoryId,
        categoryName: route?.params?.categoryName,
        refreshTimestamp: route?.params?.refreshTimestamp,
      });
      loadProducts();
    }
  }, [route?.params?.categoryId, route?.params?.categoryName, route?.params?.refreshTimestamp, loadProducts]);

  // If coming from Categories to view products, seed category/business filters (view mode)
  React.useEffect(() => {
    if (!addToCategoryMode) {
      if (route?.params?.categoryName) {
        setCategoryFilter(route.params.categoryName);
      }
      // Only set businessFilter if there's no categoryId (categoryId takes priority)
      if (route?.params?.businessCategory && !route?.params?.categoryId) {
        setBusinessFilter(route.params.businessCategory);
      } else if (route?.params?.categoryId) {
        // Clear businessFilter when viewing a category (categoryId is more specific)
        setBusinessFilter(null);
      }
    }
  }, [addToCategoryMode, route?.params?.categoryName, route?.params?.businessCategory, route?.params?.categoryId]);


  // Also load products on mount
  React.useEffect(() => {
    console.log('🚀 Component mounted, loading products...', {
      addToCollectionMode,
      addToCategoryMode,
      routeParams: route?.params,
    });
    loadProducts();
  }, []);

  // Compute absolute price bounds from product data
  const absoluteMinPrice = useMemo(() => {
    if (!products.length) return 0;
    const prices = products.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p) && p >= 0);
    return prices.length ? Math.min(...prices) : 0;
  }, [products]);

  const absoluteMaxPrice = useMemo(() => {
    if (!products.length) return 0;
    const prices = products.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p) && p >= 0);
    return prices.length ? Math.max(...prices) : 0;
  }, [products]);

  // Initialize/keep price range in bounds when products change
  React.useEffect(() => {
    if (isNaN(absoluteMinPrice) || isNaN(absoluteMaxPrice) || absoluteMinPrice < 0 || absoluteMaxPrice < 0) {
      return;
    }
    setPriceRange(prev => {
      // If range is not initialized (both are 0), set to full range
      if (prev.min === 0 && prev.max === 0) {
        return {
          min: absoluteMinPrice,
          max: absoluteMaxPrice,
        };
      }
      // Otherwise, keep existing values but ensure they're in bounds
      const nextMin = Math.min(Math.max(prev.min || absoluteMinPrice, absoluteMinPrice), prev.max || absoluteMaxPrice);
      const nextMax = Math.max(Math.min(prev.max || absoluteMaxPrice, absoluteMaxPrice), nextMin);
      return {
        min: isNaN(nextMin) ? absoluteMinPrice : nextMin,
        max: isNaN(nextMax) ? absoluteMaxPrice : nextMax,
      };
    });
  }, [absoluteMinPrice, absoluteMaxPrice]);

  // Initialize price range when Price Range tab is selected
  React.useEffect(() => {
    if (filterTab === 'Price Range') {
      if (!isNaN(absoluteMinPrice) && !isNaN(absoluteMaxPrice) && absoluteMinPrice >= 0 && absoluteMaxPrice >= 0 && absoluteMinPrice <= absoluteMaxPrice) {
        setPriceRange(prev => {
          // Only initialize if both are 0
          if (prev.min === 0 && prev.max === 0) {
            return {
              min: absoluteMinPrice,
              max: absoluteMaxPrice,
            };
          }
          // If one is set but the other is 0, fix the 0 one
          if (prev.min === 0 && prev.max > 0) {
            return {
              min: absoluteMinPrice,
              max: prev.max,
            };
          }
          if (prev.max === 0 && prev.min > 0) {
            return {
              min: prev.min,
              max: absoluteMaxPrice,
            };
          }
          return prev;
        });
      }
    }
  }, [filterTab, absoluteMinPrice, absoluteMaxPrice]);

  // Helpers for discount calculation
  const getDiscountPercent = (p: { price: number; mrp?: number }) => {
    if (!p.mrp || p.mrp <= 0 || p.mrp <= p.price) return 0;
    return Math.round((1 - (p.price / p.mrp)) * 100);
  };

  // Build filtered and sorted list based on current filter state
  const filteredProducts = useMemo(() => {
    // In add-to-category picker, always show all products (ignore filters/search)
    if (addToCategoryMode) {
      return products;
    }

    let items = products.slice();

    // SmartBiz: Filter by selection if requested
    if (showSelectedOnly && addToCollectionMode) {
      items = items.filter(p => selectedProductsMap.has(p.id));
    }
    // Text search
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.productCategory || '').toLowerCase().includes(q) ||
        (p.businessCategory || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q),
      );
    }
    // Category filter (when navigated from Categories screen)
    // Priority: categoryId > categoryName > businessFilter
    if (targetCategoryId && !addToCategoryMode) {
      // Filter by categoryId if targetCategoryId is present (most accurate)
      const targetId = Number(targetCategoryId);
      const targetName = (route?.params?.categoryName || '').toLowerCase().trim();

      // SmartBiz: Filter by ID *OR* Name to handle duplicate categories
      items = items.filter(p => {
        // Check by ID
        const pCategoryId = (p as any).categoryId ?? (p as any).category_id ?? null;
        if (pCategoryId != null && Number(pCategoryId) === targetId) return true;

        // Check by Name (Inclusive OR)
        if (targetName) {
          const pCatName = (p.productCategory || '').toLowerCase().trim();
          if (pCatName === targetName) return true;
        }

        return false;
      });

      console.log(`🔍 Category filter applied (ID: ${targetId}, Name: ${targetName}), results: ${items.length}`);
    } else if (categoryFilter) {
      // Category name matching
      const cat = categoryFilter.toLowerCase().trim();
      items = items.filter(p => (p.productCategory || '').toLowerCase().trim() === cat);
      console.log(`🔍 Category filter applied: ${cat}, results: ${items.length}`);
    } else if (businessFilter) {
      // Apply business filter when no category filter is active
      const b = businessFilter.toLowerCase().trim();
      items = items.filter(p => (p.businessCategory || '').toLowerCase().trim() === b);
      console.log(`🔍 Business filter applied: ${b}, results: ${items.length}`);
    }
    // Inventory filter
    if (inventory === 'in') items = items.filter(p => p.inStock);
    if (inventory === 'out') items = items.filter(p => !p.inStock);
    // Price filter - only apply if range is set (both values > 0)
    if (priceRange.min > 0 || priceRange.max > 0) {
      const minPrice = priceRange.min > 0 ? priceRange.min : absoluteMinPrice;
      const maxPrice = priceRange.max > 0 ? priceRange.max : absoluteMaxPrice;
      items = items.filter(p => p.price >= minPrice && p.price <= maxPrice);
    }
    // Discount filter
    const selectedRanges = Object.keys(discounts).filter(k => discounts[k]);
    if (selectedRanges.length) {
      items = items.filter(p => {
        const d = getDiscountPercent(p);
        return selectedRanges.some(r => {
          // r like '0 - 20%' or '81% and above'
          if (r.includes('and above')) {
            const low = parseInt(r, 10);
            if (!isNaN(low)) {
              return d >= low;
            }
            return false;
          }
          const [lo, hi] = r.replace('%', '').split(' - ').map(x => parseInt(x, 10)).filter(x => !isNaN(x));
          if (lo != null && hi != null) {
            return d >= lo && d <= hi;
          }
          return false;
        });
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      switch (sortBy) {
        case 'title-az':
          return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
        case 'title-za':
          return (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' });
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'disc-low': {
          const discA = getDiscountPercent(a);
          const discB = getDiscountPercent(b);
          return discA - discB;
        }
        case 'disc-high': {
          const discA = getDiscountPercent(a);
          const discB = getDiscountPercent(b);
          return discB - discA;
        }
        default:
          return 0;
      }
    });

    return items;
  }, [products, addToCollectionMode, addToCategoryMode, searchQuery, inventory, priceRange, discounts, categoryFilter, businessFilter, sortBy, targetCategoryId, route?.params?.categoryName, showSelectedOnly, selectedProductsMap, statusFilter]);

  // Counts for filter UI
  const inventoryCounts = useMemo(() => ({
    all: products.length,
    in: products.filter(p => p.inStock).length,
    out: products.filter(p => !p.inStock).length,
  }), [products]);

  const selectedCount = useMemo(() => {
    if (addToCategoryMode) {
      return Object.values(selectedForCategory).filter(Boolean).length;
    }
    return selectedProductsMap.size; // Use the new Map for collection selection count
  }, [selectedProductsMap, selectedForCategory, addToCategoryMode]);

  const discountRanges = ['0 - 20%', '21 - 40%', '41 - 60%', '61 - 80%', '81% and above'];
  const discountCounts = useMemo(() => {
    const map: { [k: string]: number } = {};
    for (const r of discountRanges) map[r] = 0;
    for (const p of products) {
      const d = getDiscountPercent(p);
      for (const r of discountRanges) {
        if (r.includes('and above')) {
          const low = parseInt(r, 10);
          if (!isNaN(low) && d >= low) {
            map[r] += 1;
          }
        } else {
          const parts = r.replace('%', '').split(' - ').map(x => parseInt(x, 10)).filter(x => !isNaN(x));
          if (parts.length === 2 && d >= parts[0] && d <= parts[1]) {
            map[r] += 1;
            break;
          }
        }
      }
    }
    return map;
  }, [products]);

  // Group variants by base product (name + categories) so variants are treated as one product
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, { base: any; variants: any[] }>();

    filteredProducts.forEach(p => {
      const key = `${(p.title || '').toLowerCase().trim()}|${(p.businessCategory || '').toLowerCase().trim()}|${(p.productCategory || '').toLowerCase().trim()}`;
      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, { base: p, variants: [p] });
      } else {
        existing.variants.push(p);
        // Use lowest price as representative
        if ((p.price ?? 0) < (existing.base.price ?? 0)) {
          existing.base = p;
        }
      }
    });

    return Array.from(groups.values()).map(({ base, variants }) => {
      const prices = variants
        .map(v => v.price)
        .filter(v => typeof v === 'number' && !isNaN(v) && v >= 0);
      const minPrice = prices.length ? Math.min(...prices) : base.price;

      // find mrp corresponding to min price variant (if available)
      const minVariant = variants.find(v => v.price === minPrice) || base;

      return {
        ...base,
        price: minPrice,
        mrp: minVariant.mrp ?? base.mrp,
        variantCount: variants.length,
        variants,
      };
    });
  }, [filteredProducts, addToCollectionMode, addToCategoryMode]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // If in addToCollectionMode, we want the back button to go back to category list if we came from there
            if (returnScreen && !addToCollectionMode) {
              navigation.navigate(returnScreen);
            } else {
              navigation.goBack();
            }
          }}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {addToCollectionMode
            ? 'Add Products to Collection'
            : addToCategoryMode
              ? 'Add Products to Category'
              : viewCollectionProducts && collectionName
                ? collectionName
                : (categoryFilter ?? businessFilter ?? 'All Products')}
        </Text>
        <View style={styles.headerRight}>
          {viewCollectionProducts && targetCollectionId && !addToCollectionMode ? (
            // Show "Add" button when viewing collection products
            <TouchableOpacity
              style={styles.headerAddButton}
              onPress={() => {
                if (navBusy) return;
                setNavBusy(true);
                navigation.push('Products', {
                  collectionId: targetCollectionId,
                  collectionName: collectionName,
                  addToCollection: true,
                  returnScreen: 'Products',
                  returnParams: {
                    collectionId: targetCollectionId,
                    collectionName: collectionName,
                    viewCollectionProducts: true,
                  },
                  // Pass currently selected products to pre-populate selection in add mode
                  selectedProducts: Array.from(selectedProductsMap.values()),
                });
                setTimeout(() => setNavBusy(false), 800);
              }}
              activeOpacity={0.7}>
              <IconSymbol name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.headerRefreshButton}
            onPress={refreshScreen}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }}
            >
              <IconSymbol name="refresh" size={22} color={loading ? "#CCCCCC" : "#FFFFFF"} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Store header and counters */}
      {!addToCollectionMode && !addToCategoryMode && (
        <View style={styles.storeHeader}>
          <View style={styles.storeRow}>
            <View>
              <Text style={styles.storeName}>{storeName}</Text>
              <Text style={styles.storeStatus}>Catalog overview</Text>
            </View>
            <TouchableOpacity
              style={styles.statusBadge}
              onPress={() => setStoreOpen(prev => !prev)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusDot, { backgroundColor: storeOpen ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.statusText}>{storeOpen ? 'Open' : 'Closed'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.countersRow}>
            <View style={styles.counterCard}>
              <Text style={styles.counterValue}>{inventoryCounts.all}</Text>
              <Text style={styles.counterLabel}>Total</Text>
            </View>
            <View style={styles.counterCard}>
              <Text style={styles.counterValue}>{inventoryCounts.in}</Text>
              <Text style={styles.counterLabel}>Active/In Stock</Text>
            </View>
            <View style={styles.counterCard}>
              <Text style={styles.counterValue}>{inventoryCounts.out}</Text>
              <Text style={styles.counterLabel}>Out of Stock</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <IconSymbol name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {addToCollectionMode && (
            <TouchableOpacity
              onPress={() => setShowSelectedOnly(!showSelectedOnly)}
              style={{
                marginLeft: 8,
                padding: 4,
                backgroundColor: showSelectedOnly ? '#e61580' : 'transparent',
                borderRadius: 6,
              }}
            >
              <IconSymbol
                name={showSelectedOnly ? "checkmark-circle" : "checkmark-circle-outline"}
                size={22}
                color={showSelectedOnly ? "#FFFFFF" : "#6B7280"}
              />
            </TouchableOpacity>
          )}
        </View>

        {!addToCollectionMode && !addToCategoryMode && (
          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterOpen(true)}>
              <IconSymbol name="options-outline" size={20} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterButton, styles.sortButton]} onPress={() => setIsSortOpen(true)}>
              <IconSymbol name="swap-vertical" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content - Product List */}
      <ScrollView style={styles.content}>
        {loading && groupedProducts.length === 0 && (
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <Text style={{ color: '#6c757d' }}>Loading products...</Text>
          </View>
        )}
        {groupedProducts
          .filter(item => {
            if (statusFilter === 'active') return item.isActive !== false;
            if (statusFilter === 'hidden') return item.isActive === false;
            return true;
          })
          .slice(0, pageSize)
          .map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {
                // If in "add to collection" mode, just toggle selection (bulk add via bottom button)
                if (addToCollectionMode) {
                  toggleSelection(item);
                  return;
                }

                // Add to category logic
                if (addToCategoryMode) {
                  const newSel = { ...selectedForCategory };
                  if (newSel[item.id]) delete newSel[item.id];
                  else newSel[item.id] = true;
                  setSelectedForCategory(newSel);
                  return;
                }

                // Normal mode - navigate to edit product
                navigation.navigate('AddProduct', {
                  mode: 'edit',
                  product: item,
                });
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <IconSymbol name="image-outline" size={18} color="#9CA3AF" />
                  </View>
                )}

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                  {addToCollectionMode ? (
                    <Text style={styles.variantCountText}>
                      {item.variantCount && item.variantCount > 0
                        ? `${item.variantCount} variant${item.variantCount > 1 ? 's' : ''}`
                        : '1 Variant'}
                    </Text>
                  ) : (
                    <>
                      {item.variantCount && item.variantCount > 0 ? (
                        <Text style={styles.variantCountText}>
                          {item.variantCount} variant{item.variantCount > 1 ? 's' : ''} • {item.variants?.filter((v: any) => v.inStock).length ?? 0} in stock
                        </Text>
                      ) : (
                        <Text style={styles.variantCountText}>
                          {item.inStock ? 'In stock' : 'Out of stock'}
                        </Text>
                      )}
                    </>
                  )}
                </View>

                {/* Status or Selection indicator */}
                {!addToCollectionMode && !addToCategoryMode && typeof item.isActive === 'boolean' && (
                  <View style={[styles.statusChip, item.isActive ? styles.statusChipActive : styles.statusChipDisabled]}>
                    <View style={[styles.statusDotSmall, { backgroundColor: item.isActive ? '#10B981' : '#9CA3AF' }]} />
                    <Text style={[styles.statusChipText, { color: item.isActive ? '#065F46' : '#4B5563' }]}>
                      {item.isActive ? 'Active' : 'Hidden'}
                    </Text>
                  </View>
                )}

                {addToCollectionMode ? (
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.selectionCheckbox,
                      selectedProductsMap.has(item.id) && styles.selectionCheckboxSelected
                    ]}>
                      {selectedProductsMap.has(item.id) && (
                        <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                ) : addToCategoryMode ? (
                  <IconSymbol
                    name={selectedForCategory[item.id] ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={selectedForCategory[item.id] ? '#10B981' : '#9CA3AF'}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.kebab}
                    onPress={() => {
                      setActiveProductId(item.id);
                      setActionSheetOpen(true);
                    }}>
                    <IconSymbol name="ellipsis-vertical" size={18} color="#111827" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}

        {/* Add Product Button (bottom) */}
        {
          addToCollectionMode ? (
            <TouchableOpacity
              style={[
                styles.saveSelectionButton,
                { alignSelf: 'center', marginVertical: 24 }
              ]}
              onPress={async () => {
                if (navBusy) return;
                setNavBusy(true);

                const updatedSelection = Array.from(selectedProductsMap.values());
                const productIds = updatedSelection.map(p => Number(p.id));

                try {
                  // SmartBiz: If we have a target collection and aren't returning to the creation screen,
                  // we should save the products NOW.
                  if (targetCollectionId && returnScreen !== 'AddCollection' && returnScreen !== 'EditCollection') {
                    console.log(`🔗 [ProductsScreen] Saving ${productIds.length} products to collection ${targetCollectionId}`);
                    await saveCollectionProducts(Number(targetCollectionId), productIds);
                    Alert.alert('Success', `Added ${productIds.length} product(s) to collection`);
                  }

                  if (returnScreen) {
                    const params = {
                      ...(route?.params?.returnParams || {}),
                      selectedProducts: updatedSelection,
                      refreshTimestamp: Date.now(), // Signal refresh
                    };
                    navigation.navigate(returnScreen, params);
                  } else {
                    navigation.goBack();
                  }
                } catch (err: any) {
                  console.error('Failed to save collection products:', err);
                  Alert.alert('Error', err?.message || 'Failed to save selection');
                } finally {
                  setNavBusy(false);
                }
              }}>
              <Text style={styles.saveSelectionButtonText}>Save Selection</Text>
            </TouchableOpacity>
          ) : addToCategoryMode ? (
            <TouchableOpacity
              style={[
                styles.addButton,
                { alignSelf: 'center', marginVertical: 24 },
                (selectedCount === 0 || addingToCategory) && styles.addButtonDisabled
              ]}
              disabled={selectedCount === 0 || addingToCategory}
              onPress={async () => {
                if (addingToCategory) return; // extra guard against double-tap
                if (!targetCategoryId || !targetCategoryName) return;
                const ids = Array.from(new Set(Object.keys(selectedForCategory).filter(id => selectedForCategory[id])));
                if (ids.length === 0) return;
                setAddingToCategory(true);
                try {
                  // SmartBiz: Update each product with categoryId (the actual foreign key)
                  // This links the product to the category in the database
                  const categoryIdNum = targetCategoryId ? Number(targetCategoryId) : null;
                  if (!categoryIdNum) {
                    Alert.alert('Error', 'Category ID is missing. Cannot add products to category.');
                    setAddingToCategory(false);
                    return;
                  }

                  console.log('🔄 [ProductsScreen] Adding products to category:', {
                    categoryId: categoryIdNum,
                    categoryName: targetCategoryName,
                    productIds: ids,
                  });

                  for (const pid of ids) {
                    if (alreadyAddedToCategory[pid]) continue;
                    const product = products.find(p => p.id === pid);
                    if (product) {
                      console.log('🔄 [ProductsScreen] Updating product with categoryId:', {
                        productId: pid,
                        productName: product.title,
                        categoryId: categoryIdNum,
                      });
                      await updateProduct(pid, {
                        productName: product.title,
                        sellingPrice: product.price,
                        productCategory: targetCategoryName, // Keep for backward compatibility
                        businessCategory: product.businessCategory || '',
                        description: product.description || '',
                        mrp: product.mrp,
                        inventoryQuantity: product.inventoryQuantity || 0,
                        customSku: product.sku,
                        color: product.color,
                        size: product.size,
                        hsnCode: product.hsnCode,
                        categoryId: categoryIdNum, // SmartBiz: CRITICAL - link product to category via foreign key
                      });
                      setAlreadyAddedToCategory(prev => ({ ...prev, [pid]: true }));
                    }
                  }
                  Alert.alert('Success', `Added ${ids.length} product(s) to category "${targetCategoryName}"`);
                  setSelectedForCategory({});
                  navigation.goBack();
                } catch (e: any) {
                  console.error('Failed to add products to category', e);
                  Alert.alert('Error', e?.message || 'Failed to add products to category');
                } finally {
                  setAddingToCategory(false);
                }
              }}>
              <Text style={styles.addButtonText}>{addingToCategory ? 'Adding...' : `Add to Category (${selectedCount})`}</Text>
            </TouchableOpacity>
          ) : viewCollectionProducts && targetCollectionId ? (
            // When viewing collection products, show "Add Products to Collection" button
            <TouchableOpacity
              style={[styles.addButton, { alignSelf: 'center', marginVertical: 24 }]}
              onPress={() => {
                if (navBusy) return;
                setNavBusy(true);
                // Navigate to all products in "add to collection" mode
                navigation.navigate('Products', {
                  collectionId: targetCollectionId,
                  collectionName: collectionName,
                  addToCollection: true,
                  returnScreen: 'Products', // Return to this screen after adding
                  returnParams: {
                    collectionId: targetCollectionId,
                    collectionName: collectionName,
                    viewCollectionProducts: true,
                    selectedProducts: products, // Pass currently viewed products as selected
                  },
                });
                setTimeout(() => setNavBusy(false), 800);
              }}>
              <Text style={styles.addButtonText}>+ Add Products to Collection</Text>
            </TouchableOpacity>
          ) : targetCategoryId ? (
            // When viewing a category, don't show any add button
            null
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { alignSelf: 'center', marginVertical: 24 }]}
              onPress={handleAddProduct}>
              <Text style={styles.addButtonText}>Add New Product</Text>
            </TouchableOpacity>
          )
        }
        {
          groupedProducts.length === 0 && (
            <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 50 }}>
              <Text style={{ color: '#6c757d' }}>No products match your filters</Text>
            </View>
          )
        }

        {
          groupedProducts.length > pageSize && (
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity
                style={[styles.addButton, { alignSelf: 'center', marginVertical: 12 }]}
                onPress={() => setPageSize(prev => prev + 20)}>
                <Text style={styles.addButtonText}>Load more</Text>
              </TouchableOpacity>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>
                Showing {Math.min(pageSize, groupedProducts.length)} of {groupedProducts.length}
              </Text>
            </View>
          )
        }
      </ScrollView >

      {/* Filter Bottom Sheet */}
      <Modal transparent visible={isFilterOpen} animationType="slide" onRequestClose={() => setIsFilterOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsFilterOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Filter</Text>
            <TouchableOpacity onPress={() => {
              setInventory('all');
              setDiscounts({});
              setPriceRange({ min: 0, max: 0 });
              setStatusFilter('all');
              setCategoryFilter(null);
              setBusinessFilter(null);
            }}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sheetBody}>
            <View style={styles.sheetTabs}>
              {['Inventory', 'Status', 'Discount', 'Price Range'].map(tab => (
                <TouchableOpacity key={tab} style={[styles.tabItem, filterTab === tab && styles.tabItemActive]} onPress={() => setFilterTab(tab as any)}>
                  <Text style={[styles.tabText, filterTab === tab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sheetContent}>
              {filterTab === 'Inventory' && (
                <>
                  {[{ key: 'all', label: 'Show All' }, { key: 'in', label: 'In Stock only' }, { key: 'out', label: 'Out of Stock only' }].map(opt => (
                    <TouchableOpacity key={opt.key} style={styles.optionRow} onPress={() => setInventory(opt.key as any)}>
                      <View style={[styles.radioOuter, inventory === opt.key && styles.radioOuterActive]}>
                        {inventory === opt.key && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionCount}>
                        {opt.key === 'all' ? inventoryCounts.all : opt.key === 'in' ? inventoryCounts.in : inventoryCounts.out}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filterTab === 'Status' && (
                <>
                  {[{ key: 'all', label: 'Show All' }, { key: 'active', label: 'Active' }, { key: 'hidden', label: 'Hidden' }].map(opt => (
                    <TouchableOpacity key={opt.key} style={styles.optionRow} onPress={() => setStatusFilter(opt.key as any)}>
                      <View style={[styles.radioOuter, statusFilter === opt.key && styles.radioOuterActive]}>
                        {statusFilter === opt.key && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filterTab === 'Discount' && (
                <>
                  {discountRanges.map(r => (
                    <TouchableOpacity key={r} style={styles.optionRow} onPress={() => setDiscounts(p => ({ ...p, [r]: !p[r] }))}>
                      <View style={[styles.checkbox, discounts[r] && styles.checkboxChecked]} />
                      <Text style={styles.optionLabel}>{r}</Text>
                      <Text style={styles.optionCount}>{discountCounts[r] || 0}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filterTab === 'Price Range' && (
                <>
                  <View style={styles.priceRangeContainer}>
                    <View style={styles.priceDisplayRow}>
                      <View style={styles.priceDisplay}>
                        <Text style={styles.priceLabel}>Minimum</Text>
                        <Text style={styles.priceValue}>₹{priceRange.min > 0 ? priceRange.min : (absoluteMinPrice > 0 ? absoluteMinPrice : 0)}</Text>
                      </View>
                      <View style={styles.priceDisplay}>
                        <Text style={styles.priceLabel}>Maximum</Text>
                        <Text style={styles.priceValue}>₹{priceRange.max > 0 ? priceRange.max : (absoluteMaxPrice > 0 ? absoluteMaxPrice : 0)}</Text>
                      </View>
                    </View>

                    {/* Range Slider */}
                    {absoluteMinPrice >= 0 && absoluteMaxPrice > absoluteMinPrice && (
                      <View style={styles.rangeSliderWrapper}>
                        <MultiSlider
                          values={[
                            Math.max(absoluteMinPrice, priceRange.min > 0 ? priceRange.min : absoluteMinPrice),
                            Math.min(absoluteMaxPrice, priceRange.max > 0 ? priceRange.max : absoluteMaxPrice)
                          ]}
                          sliderLength={SCREEN_WIDTH - 180}
                          onValuesChange={(values) => {
                            const [minVal, maxVal] = values;
                            const newMin = Math.round(Math.max(absoluteMinPrice, Math.min(minVal, maxVal)));
                            const newMax = Math.round(Math.min(absoluteMaxPrice, Math.max(minVal, maxVal)));
                            setPriceRange({
                              min: newMin,
                              max: newMax,
                            });
                          }}
                          min={absoluteMinPrice}
                          max={absoluteMaxPrice}
                          step={1}
                          allowOverlap={false}
                          snapped
                          selectedStyle={{
                            backgroundColor: '#10B981',
                          }}
                          unselectedStyle={{
                            backgroundColor: '#E5E7EB',
                          }}
                          containerStyle={styles.multiSliderContainer}
                          trackStyle={styles.multiSliderTrack}
                          markerStyle={styles.multiSliderMarker}
                          pressedMarkerStyle={styles.multiSliderMarkerPressed}
                        />
                      </View>
                    )}
                    {(!absoluteMinPrice || absoluteMaxPrice <= absoluteMinPrice) && (
                      <Text style={styles.sliderErrorText}>No products available to set price range</Text>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.primaryCta} onPress={() => setIsFilterOpen(false)}>
            <Text style={styles.primaryCtaText}>Show All Products</Text>
          </TouchableOpacity>
        </View>
      </Modal >

      {/* Sort Bottom Sheet */}
      < Modal transparent visible={isSortOpen} animationType="slide" onRequestClose={() => setIsSortOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsSortOpen(false)} />
        <View style={styles.sheet}>
          <Text style={[styles.sheetTitle, { marginBottom: 10 }]}>Sort By</Text>
          {[
            { key: 'title-az', label: 'Title(A-Z)' },
            { key: 'title-za', label: 'Title(Z-A)' },
            { key: 'price-low', label: 'Price (Low to High)' },
            { key: 'price-high', label: 'Price (High to Low)' },
            { key: 'disc-low', label: 'Discount (Low to High)' },
            { key: 'disc-high', label: 'Discount (High to Low)' },
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={styles.optionRow}
              onPress={() => {
                setSortBy(item.key as any);
                setIsSortOpen(false); // Close modal after selection
              }}
            >
              <View style={[styles.radioOuter, sortBy === item.key && styles.radioOuterActive]}>
                {sortBy === item.key && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal >

      {/* Actions Bottom Sheet */}
      < Modal transparent visible={actionSheetOpen} animationType="slide" onRequestClose={() => setActionSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setActionSheetOpen(false)} />
        <View style={styles.actionSheet}>
          {activeProduct?.inStock ? (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={async () => {
                if (!activeProductId) {
                  setActionSheetOpen(false);
                  return;
                }
                try {
                  await updateProductStock(activeProductId, 0);
                  await loadProducts();
                } catch (e) {
                  console.error('Failed to mark out of stock', e);
                } finally {
                  setActionSheetOpen(false);
                }
              }}>
              <Text style={styles.actionText}>Mark as Out of Stock</Text>
              <IconSymbol name="chevron-forward" size={18} color="#10B981" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={async () => {
                if (!activeProductId) {
                  setActionSheetOpen(false);
                  return;
                }
                try {
                  // Simple rule: bring product back with stock = 1
                  await updateProductStock(activeProductId, 1);
                  await loadProducts();
                } catch (e) {
                  console.error('Failed to mark in stock', e);
                } finally {
                  setActionSheetOpen(false);
                }
              }}>
              <Text style={styles.actionText}>Mark as In Stock</Text>
              <IconSymbol name="chevron-forward" size={18} color="#10B981" />
            </TouchableOpacity>
          )}
          {typeof activeProduct?.isActive === 'boolean' && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={async () => {
                console.log('🔀 Toggling status', { activeProductId, current: activeProduct?.isActive });
                if (!activeProductId) {
                  setActionSheetOpen(false);
                  return;
                }
                try {
                  await updateProductStatus(activeProductId, !activeProduct.isActive);
                  await loadProducts();
                } catch (e) {
                  console.error('Failed to update status', e);
                  Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update product status');
                } finally {
                  setActionSheetOpen(false);
                }
              }}>
              <Text style={styles.actionText}>{activeProduct.isActive ? 'Disable (Hide)' : 'Enable (Show)'}</Text>
              <IconSymbol name="chevron-forward" size={18} color="#10B981" />
            </TouchableOpacity>
          )}
          {/* Best Seller Toggle */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              if (!activeProductId || !activeProduct) {
                setActionSheetOpen(false);
                return;
              }
              const currentBestSeller = activeProduct.bestSeller || false;
              setActionSheetOpen(false);
              try {
                await updateProduct(activeProductId, {
                  productName: activeProduct.title,
                  sellingPrice: activeProduct.price,
                  businessCategory: activeProduct.businessCategory || '',
                  description: activeProduct.description || '',
                  mrp: activeProduct.mrp,
                  inventoryQuantity: activeProduct.inventoryQuantity || 0,
                  customSku: activeProduct.sku,
                  color: activeProduct.color,
                  size: activeProduct.size,
                  hsnCode: activeProduct.hsnCode,
                  bestSeller: !currentBestSeller,
                });
                await loadProducts();
                Alert.alert(
                  'Success',
                  !currentBestSeller
                    ? 'Product marked as Best Seller'
                    : 'Product unmarked from Best Seller'
                );
              } catch (e) {
                console.error('Failed to toggle best seller', e);
                Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update best seller status');
              }
            }}>
            <Text style={styles.actionText}>
              {activeProduct?.bestSeller ? 'Unmark Best Seller' : 'Mark as Best Seller'}
            </Text>
            <IconSymbol name="chevron-forward" size={18} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              setActionSheetOpen(false);
              // slight delay to allow sheet close animation
              await new Promise(res => setTimeout(res, 200));
              if (!storeLink) {
                Alert.alert('Store link not set', 'Add your store link in settings to view on website.');
                return;
              }
              try {
                await Linking.openURL(storeLink);
              } catch (e) {
                Alert.alert('Error', 'Unable to open store link.');
              }
            }}>
            <Text style={styles.actionText}>View on Website</Text>
            <IconSymbol name="chevron-forward" size={18} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => { setActionSheetOpen(false); setConfirmDeleteOpen(true); }}>
            <Text style={styles.actionText}>Delete</Text>
            <IconSymbol name="chevron-forward" size={18} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={async () => {
              if (!activeProductId) {
                setActionSheetOpen(false);
                return;
              }
              try {
                await loadCollectionsForSheet();
                setCollectionSheetOpen(true);
              } catch (e) {
                // already logged in loader
              } finally {
                setActionSheetOpen(false);
              }
            }}>
            <Text style={styles.actionText}>Add to Collection</Text>
            <IconSymbol name="chevron-forward" size={18} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleShare}>
            <Text style={styles.actionText}>Share Product</Text>
            <IconSymbol name="share" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>
      </Modal >

      {/* Delete Confirm Modal */}
      < Modal transparent visible={confirmDeleteOpen} animationType="fade" onRequestClose={() => setConfirmDeleteOpen(false)}>
        <View style={[styles.backdrop, { justifyContent: 'flex-end' }]}>
          <View style={styles.deleteCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sheetTitle}>Delete Product</Text>
              <TouchableOpacity onPress={() => setConfirmDeleteOpen(false)}><IconSymbol name="close" size={20} color="#6c757d" /></TouchableOpacity>
            </View>
            <Text style={styles.deleteQuestion}>Are you sure you want to delete {activeProduct?.title}?</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={async () => {
                if (!activeProductId) {
                  setConfirmDeleteOpen(false);
                  return;
                }
                try {
                  await deleteProductApi(activeProductId);
                  // Refresh from backend to keep state consistent
                  await loadProducts();
                  Alert.alert('Success', 'Product deleted successfully');
                } catch (e) {
                  console.error('Failed to delete product', e);
                  const errorMessage =
                    e instanceof Error && e.message
                      ? e.message
                      : 'Failed to delete product';

                  // Check if product is used in orders (common reason for deletion failure)
                  // The backend error message is: "Cannot delete this product because it is already used in orders or other records. Please mark it as Hidden instead of deleting."
                  const errorLower = errorMessage.toLowerCase();
                  const isOrderRelatedError =
                    errorLower.includes('already used in orders') ||
                    errorLower.includes('used in orders') ||
                    errorLower.includes('used in other records') ||
                    (errorLower.includes('cannot delete') && errorLower.includes('orders')) ||
                    (errorLower.includes('cannot delete') && errorLower.includes('records'));

                  console.log('🔍 [ProductsScreen] Delete error analysis:', {
                    errorMessage,
                    isOrderRelatedError,
                    activeProductId,
                    hasActiveProduct: !!activeProduct,
                  });

                  if (isOrderRelatedError) {
                    Alert.alert(
                      'Cannot Delete Product',
                      'This product cannot be deleted because it is already used in orders or other records.\n\nTo hide it from customers, use the "Hide Product Instead" button below or the "Disable (Hide)" option from the product menu.',
                      [
                        {
                          text: 'Hide Product Instead',
                          onPress: async () => {
                            try {
                              if (activeProductId && activeProduct) {
                                console.log('🔄 [ProductsScreen] Hiding product instead of deleting:', activeProductId);
                                await updateProductStatus(activeProductId, false);
                                await loadProducts();
                                Alert.alert('Success', 'Product has been hidden successfully. It will no longer appear on the website.');
                              } else {
                                Alert.alert('Error', 'Product information is missing. Please try again.');
                              }
                            } catch (hideError) {
                              console.error('❌ [ProductsScreen] Failed to hide product', hideError);
                              Alert.alert('Error', 'Failed to hide product. Please try again.');
                            }
                          },
                          style: 'default',
                        },
                        {
                          text: 'OK',
                          style: 'cancel',
                        },
                      ],
                    );
                  } else {
                    Alert.alert('Error', errorMessage);
                  }
                } finally {
                  setConfirmDeleteOpen(false);
                }
              }}>
              <Text style={styles.deleteBtnText}>Delete Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmDeleteOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal >

      {/* Select Collection Bottom Sheet */}
      < Modal
        transparent
        visible={collectionSheetOpen}
        animationType="slide"
        onRequestClose={() => setCollectionSheetOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setCollectionSheetOpen(false)}
        />
        <View style={styles.collectionSheet}>
          <Text style={[styles.sheetTitle, { marginBottom: 8 }]}>
            Select a Collection
          </Text>
          <TouchableOpacity
            style={styles.addCollectionRow}
            onPress={() => {
              // Pass productId so it can be added to the new collection
              navigation.navigate('AddCollection', {
                productIdToAdd: activeProductId,
              });
              setCollectionSheetOpen(false);
            }}>
            <IconSymbol name="add" size={18} color="#e61580" />
            <Text
              style={{
                color: '#e61580',
                marginLeft: 8,
                fontWeight: '600',
              }}>
              Add a Collection
            </Text>
          </TouchableOpacity>
          {collections.map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.collectionRow}
              onPress={() =>
                setSelectedCollections(p => ({
                  ...p,
                  [c.id]: !p[c.id],
                }))
              }>
              <Text style={styles.collectionName}>{c.name}</Text>
              <View
                style={[
                  styles.checkBox,
                  selectedCollections[c.id] && styles.checkBoxChecked,
                ]}
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.primaryCta, { marginTop: 16 }]}
            onPress={async () => {
              if (!activeProductId) {
                setCollectionSheetOpen(false);
                return;
              }
              const selectedIds = Object.keys(selectedCollections).filter(
                id => selectedCollections[id],
              );
              try {
                for (const collectionId of selectedIds) {
                  await addProductToCollection(collectionId, activeProductId);
                }
              } catch (e) {
                console.error('Failed to add product to collections', e);
              } finally {
                setCollectionSheetOpen(false);
              }
            }}>
            <Text style={styles.primaryCtaText}>Add to Selected Collections</Text>
          </TouchableOpacity>
        </View>
      </Modal >
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    backgroundColor: '#e61580',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAddButton: {
    padding: 4,
  },
  headerRefreshButton: {
    padding: 4,
  },
  storeHeader: { padding: 16, paddingTop: 12 },
  storeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  storeName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  storeStatus: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { color: '#065F46', fontWeight: '600', fontSize: 12 },
  countersRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  counterCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  counterValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  counterLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  searchSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sortButton: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  content: {
    flex: 1,
  },
  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbImage: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  thumbPlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600', color: '#111827' },
  variantCountText: { marginTop: 2, fontSize: 13, color: '#6c757d' },
  price: { fontWeight: 'bold', color: '#111827' },
  mrp: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  kebab: { padding: 8 },
  stockBadgeRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  outOfStockBadge: { backgroundColor: '#F3E8E2', color: '#6c757d', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  updateInventory: { color: '#B91C1C', fontWeight: '600' },
  addToCollectionHint: {
    fontSize: 12,
    color: '#008080',
    fontWeight: '500',
  },
  // SmartBiz: New Selection UI Styles
  checkboxContainer: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111827', // Dark border
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#111827', // Dark fill
    borderColor: '#111827',
  },
  saveSelectionButton: {
    backgroundColor: '#111827', // Dark button from screenshot
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30, // Pill shape
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveSelectionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusChipActive: { backgroundColor: '#ECFDF3' },
  statusChipDisabled: { backgroundColor: '#F3F4F6' },
  statusDotSmall: { width: 8, height: 8, borderRadius: 4 },
  statusChipText: { fontSize: 12, fontWeight: '600' },
  addButton: {
    backgroundColor: '#e61580',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  actionSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  actionText: { color: '#111827', fontSize: 16 },
  sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  clearAll: { color: '#10B981', fontWeight: '600' },
  sheetBody: { flexDirection: 'row', minHeight: 260 },
  sheetTabs: { width: 120, borderRightWidth: 1, borderRightColor: '#dee2e6' },
  tabItem: { paddingVertical: 14, paddingHorizontal: 12 },
  tabItemActive: { backgroundColor: '#D1FAE5' },
  tabText: { color: '#111827' },
  tabTextActive: { color: '#10B981', fontWeight: 'bold' },
  sheetContent: { flex: 1, paddingHorizontal: 16 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  optionLabel: { flex: 1, color: '#4B5563', fontSize: 16, marginLeft: 10 },
  optionCount: { color: '#9CA3AF' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: '#e61580' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e61580' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#9CA3AF' },
  checkboxChecked: { backgroundColor: '#e61580', borderColor: '#e61580' },
  priceRangeContainer: { marginBottom: 16 },
  priceDisplayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  priceDisplay: { alignItems: 'center' },
  priceLabel: { color: '#6c757d', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  priceValue: { color: '#111827', fontSize: 18, fontWeight: '600' },
  rangeSliderWrapper: {
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  multiSliderContainer: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiSliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  multiSliderMarker: {
    backgroundColor: '#FFFFFF',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  multiSliderMarkerPressed: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  sliderErrorText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  sliderTrackContainer: {
    height: 4,
    position: 'absolute',
    left: 10,
    right: 10,
    top: 23,
    zIndex: 1,
  },
  sliderTrackBackground: {
    position: 'absolute',
    height: 4,
    left: 0,
    right: 0,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  sliderTrackFilled: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  sliderOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
    zIndex: 2,
  },
  rangeSlider: {
    width: '100%',
    height: 50,
  },
  primaryCta: { backgroundColor: '#e61580', paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  primaryCtaText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' },
  deleteCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  deleteQuestion: { fontSize: 16, color: '#111827', marginVertical: 16 },
  deleteBtn: { backgroundColor: '#B91C1C', paddingVertical: 14, borderRadius: 12, marginBottom: 10 },
  deleteBtnText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold' },
  cancelBtn: { borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 14, borderRadius: 12 },
  cancelBtnText: { textAlign: 'center', color: '#111827', fontWeight: '600' },
  collectionSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '70%' },
  addCollectionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  collectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  collectionName: { color: '#111827' },
  checkBox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#9CA3AF' },
  checkBoxChecked: { backgroundColor: '#e61580', borderColor: '#e61580' },
});

export default ProductsScreen;

