import React, {useState, useEffect, useRef} from 'react';
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
  Alert,
  PermissionsAndroid,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';
import {launchCamera, launchImageLibrary, CameraOptions, ImagePickerResponse} from 'react-native-image-picker';
import ViewShot, {captureRef} from 'react-native-view-shot';
import { createProduct, uploadProductWithImages, updateProduct, fetchCollectionsWithCounts, addProductToCollection, CollectionWithCountDto, fetchCategories, CategoryDto } from '../../../utils/api';
import { storage } from '../../../authentication/storage';

interface AddProductScreenProps {
  navigation: any;
  route?: any;
}

const AddProductScreen: React.FC<AddProductScreenProps> = ({navigation, route}) => {
  const isEditMode = route?.params?.mode === 'edit';
  const existing = route?.params?.product;

  const [name, setName] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [mrp, setMrp] = useState(
    existing?.mrp != null && !isNaN(existing.mrp) ? String(existing.mrp) : '',
  );
  const [price, setPrice] = useState(
    existing?.price != null && !isNaN(existing.price) ? String(existing.price) : '',
  );
  const [businessCategory, setBusinessCategory] = useState(
    existing?.businessCategory || '',
  );
  const [productCategory, setProductCategory] = useState(
    existing?.productCategory || '',
  );
  const [quantity, setQuantity] = useState(
    existing?.inventoryQuantity != null && !isNaN(existing.inventoryQuantity)
      ? String(existing.inventoryQuantity)
      : '',
  );
  const [sku, setSku] = useState(existing?.sku || '');
  const [colors, setColors] = useState<string[]>(
    existing?.color
      ? existing.color
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c)
      : [],
  );
  const [size, setSize] = useState(existing?.size || '');
  const [hsn, setHsn] = useState(existing?.hsnCode || '');
  const [bestSeller, setBestSeller] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sizeChartPickerOpen, setSizeChartPickerOpen] = useState(false);
  const [sizeChartImage, setSizeChartImage] = useState<string | null>(null);
  const [colorChartPickerOpen, setColorChartPickerOpen] = useState(false);
  const [colorChartImage, setColorChartImage] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productCategoryOpen, setProductCategoryOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [images, setImages] = useState<string[]>(existing?.images || []);
  const [shotUri, setShotUri] = useState<string | null>(null);
  const screenShotRef = useRef<ViewShot | null>(null);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);
  const [collections, setCollections] = useState<Array<{id: string; name: string}>>([]);
  const [selectedCollections, setSelectedCollections] = useState<Record<string, boolean>>({});
  const [databaseCategories, setDatabaseCategories] = useState<CategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    existing?.categoryId || existing?.category_id || null
  );
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const categoryList = [
    'Appliances','Baby','Beauty and Personal Care','Books and Stationery','Clothing','Electronics','Food and Grocery','Footwear','Furniture','General','Health Supplements','Home and Kitchen','Home Care','Jewelry','Lawn and Garden','Luggage and Bags','Multipurpose','Pet Products','Sports and Fitness','Toys and games','Watches',
  ];

  const productCategoryMap: Record<string, string[]> = {
    'Appliances': ['Air Conditioners','Microwave & Oven','Other Appliances','Refrigerators','Small Kitchen Appliances','Televisions','Washing machines'],
    'Baby': ['Baby Bath and skin care','Baby Clothing and accessories','Baby Stroller & Gear','Baby toys & playtime','Bedding and Nursery','Diapers and accessories','Feeding','Other Baby products'],
    'Beauty and Personal Care': ['Covid essentials','Feminine Hygiene','Fragrance','Grooming appliances','Hair care','Health & Wellness','Make up and nails','Oral Care','Other Beauty and Personal Care','Personal care Appliances','Skin care'],
    'Books and Stationery': ['Art & Craft supplies','Calculators & organizers','Children\'s books','Entrance exam books','Files & Folders','Literature & Fiction books','Non fiction books','Notebooks & Diaries','Office products','Other Books & Stationery','School textbooks & guides','Writing supplies'],
    'Clothing': ["Dresses & Jumpsuits","Kid's clothing","Kurtis & Salwar Suits","Men's Casual Wear","Men's Formal Wear","Men's Indian Wear","Men's Innerwear and Loungewear","Men's Jeans and Trousers","Men's Sports Clothing","Men's T-shirts & Polos","Men's Winterwear","Other Clothing","Saree","Women's Indian wear","Women's Innerwear & Loungewear","Women's Jeans and Trousers","Women's Skirts & Shorts","Women's Tops, Tees & Shirts"],
    'Electronics': ['Cameras','Computer & Phone accessories','Laptops, Desktops & Tablets','Mobile','Other Electronics','Speakers & Headphones'],
    'Food and Grocery': ['Appetizers','Baby food','Bakery','Beverages','Chocolates and ice-cream','Dairy','Desserts','Eggs, Meat & Seafood','Food grains, Oil & Masala','Fruits & Vegetables','Gourmet Food','Health food','Instant Food','Mains','Mithai (Indian Sweets)','Namkeen, Snacks & Biscuits','Other Food and Grocery','Pet food'],
    'Footwear': ["Heels","Kid's footwear","Men's Casual Shoes","Men's Flip flops & Sandals","Men's Formal Shoes","Men's Sports shoes","Other Footwear","Women's Casual shoes","Women's Flipflops & Sandals","Women's Sport shoes"],
    'Furniture': ['Bedroom furniture','Dining furniture','Living room furniture','Other furniture','Outdoor furniture','Study furniture','Wardrobes'],
    'General': ['Assorted'],
    'Health Supplements': ['Herbal Supplements & Ayurveda','Other health supplements','Probiotics','Proteins & Immunity Boosters','Vitamins & Minerals'],
    'Home and Kitchen': ['Bedding','Candles','Home & Bath Linen','Home Decor','Home storage and Organization','Kitchen & Dining','Kitchen Linen','Lighting','Other Home and Kitchen'],
    'Home Care': ['Dishwashing supplies','Freshener & Repellents','Kitchen & Surface cleaners','Laundry detergents','Mops, Brushes & Scrubs','Other Home Care','Pooja essentials','Toilet cleaners'],
    'Jewelry': ['Bangles & Bracelets','Earrings','Hair accessories','Necklace and Jewellery Sets','Other Jewelry','Rings'],
    'Lawn and Garden': ['Barbeque','Fertilizer and Soil','Gardening Tools','Live Plants','Other Lawn and Garden items','Outdoor Decor','Pots and Planters','Seeds','Solar Lamps and Lights','Watering Equipment'],
    'Luggage and Bags': ['Backpacks','Duffel Bags','Handbags & Clutches','Laptop bags','Other Luggage & Bags','School bags','Suitcases & trolleys','Wallets'],
    'Multipurpose': ['Assorted'],
    'Pet Products': ['Bird nest and cages','Fish Aquarium & Accessories','Pet Care and Grooming','Pet Clothing','Pet Dens, beds and feeders','Pet Food','Pet Toys'],
    'Sports and Fitness': ['Badminton','Camping & Hiking','Cricket','Cycling','Excercise & Fitness','Football','Indoor Sports','Other Sports products','Yoga'],
    'Toys and games': ['Games','Other Toys and games','Puzzles','Toys'],
    'Watches': ["Men's watches","Other Watches","Smartwatches","Women's watches"],
  };

  useEffect(() => {
    // Reset product category when business category changes
    setProductCategory('');
  }, [businessCategory]);

  // Load collections when screen mounts
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const apiCollections: CollectionWithCountDto[] = await fetchCollectionsWithCounts();
        const mapped: Array<{id: string; name: string}> = apiCollections.map(col => ({
          id: String(col.collectionId),
          name: col.collectionName,
        }));
        setCollections(mapped);
        
        // Auto-select the first collection if only one exists
        if (mapped.length === 1 && !isEditMode) {
          setSelectedCollections({ [mapped[0].id]: true });
          console.log('Auto-selected single collection:', mapped[0].name);
        }
      } catch (error) {
        console.error('Failed to load collections', error);
      }
    };
    if (!isEditMode) {
      loadCollections();
    }
  }, [isEditMode]);

  // Load database categories when screen mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategories();
        setDatabaseCategories(categories);
        console.log('Loaded categories:', categories.length);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    loadCategories();
  }, []);

  // Require at least name, price, one image. Collections are optional.
  const canSubmit = name.trim().length > 0 && 
                    price.trim().length > 0 && 
                    images.length > 0;

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera permission to take photos');
      return;
    }

    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });
      
      if (res.didCancel) {
        console.log('User cancelled camera picker');
      } else if (res.errorCode) {
        console.log('ImagePicker Error: ', res.errorMessage);
        Alert.alert('Error', res.errorMessage || 'Failed to open camera');
      } else if (res.assets?.[0]?.uri) {
        const {fileSize, type, uri} = res.assets[0];
        if (fileSize && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Image too large', 'Please select an image less than 10MB');
          return;
        }
        if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) {
          Alert.alert('Unsupported format', 'Use JPG, PNG, WEBP, GIF, HEIC, HEIF');
          return;
        }
        const newImages = [...images, uri!];
        if (newImages.length <= 6) {
          setImages(newImages);
        } else {
          Alert.alert('Limit Reached', 'You can add up to 6 images only');
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
    setPickerOpen(false);
  };

  const handleScreenshot = async () => {
    try {
      const uri = await captureRef(screenShotRef, {format: 'jpg', quality: 0.9} as any);
      if (uri) {
        setShotUri(uri as string);
        const newImages = [...images, uri as string];
        if (newImages.length <= 6) {
          setImages(newImages);
          Alert.alert('Screenshot captured', 'Preview added to images.');
        } else {
          Alert.alert('Limit Reached', 'You can add up to 6 images only');
        }
      }
    } catch (e) {
      console.warn('ViewShot error', e);
      Alert.alert('Error', 'Unable to capture screenshot');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    // Check userId before submitting
    try {
      const userIdRaw = await storage.getItem('userId');
      console.log('AddProductScreen - userId check:', userIdRaw, 'type:', typeof userIdRaw);
      
      if (!userIdRaw || isNaN(Number(userIdRaw)) || Number(userIdRaw) <= 0) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please logout and login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Profile'),
            },
          ],
        );
        return;
      }
    } catch (error) {
      console.error('Error checking userId:', error);
      Alert.alert(
        'Authentication Error',
        'Unable to verify your session. Please logout and login again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Profile'),
          },
        ],
      );
      return;
    }

    try {
      const common = {
        productName: name.trim(),
        description: description.trim() || undefined,
        mrp: mrp ? Number(mrp) : undefined,
        sellingPrice: Number(price),
        businessCategory: businessCategory || undefined,
        productCategory: productCategory || undefined,
        inventoryQuantity: quantity ? Number(quantity) : undefined,
        customSku: sku || undefined,
        color: colors.length > 0 ? colors.join(', ') : undefined,
        size: size || undefined,
        hsnCode: hsn || undefined,
        bestSeller: bestSeller,
        categoryId: selectedCategoryId || undefined, // Add categoryId from database category selection
      };

      let productId: string | null = null;
      let addedToCollectionsCount = 0;

      if (isEditMode && existing?.id) {
        // For now, update textual fields / pricing / inventory; images stay as-is in backend.
        await updateProduct(existing.id, common);
        productId = existing.id;
      } else {
        let createdProduct;
        if (images.length > 0) {
          createdProduct = await uploadProductWithImages({
            ...common,
            imageUris: images,
          });
        } else {
          // Fallback (should not happen because canSubmit enforces image)
          createdProduct = await createProduct(common);
        }
        
        // Extract product ID from response
        // Backend returns ProductDto with productsId field
        if (createdProduct && typeof createdProduct === 'object') {
          productId = String(
            createdProduct.productsId || 
            createdProduct.id || 
            createdProduct.productId ||
            (createdProduct as any).products_id
          );
        }

        // Add product to selected collections automatically
        if (productId) {
          const selectedCollectionIds = Object.keys(selectedCollections).filter(
            id => selectedCollections[id],
          );
          
          if (selectedCollectionIds.length > 0) {
            try {
              for (const collectionId of selectedCollectionIds) {
                await addProductToCollection(collectionId, productId);
              }
              addedToCollectionsCount = selectedCollectionIds.length;
              console.log(`Product automatically added to ${addedToCollectionsCount} collection(s)`);
            } catch (collectionError) {
              console.error('Failed to add product to collections', collectionError);
              // Don't fail the whole operation if collection assignment fails
            }
          }
        }
      }
      
      // Show success message with collection info
      const collectionMessage = addedToCollectionsCount > 0
        ? ` and automatically added to ${addedToCollectionsCount} collection(s)`
        : '';
      
      Alert.alert(
        'Success', 
        isEditMode 
          ? 'Product updated successfully' 
          : `Product added successfully${collectionMessage}`,
        [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
        ],
      );
    } catch (error) {
      console.error('Add/Update product error', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save product. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Update Product' : 'Add Product'}</Text>
        <TouchableOpacity style={styles.headerRight} onPress={handleScreenshot}>
          <IconSymbol name="download-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ViewShot ref={screenShotRef} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Multiple Image picker */}
        <Text style={styles.sectionLabel}>Product Images</Text>
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{uri}} style={styles.previewImg} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImages(prev => prev.filter((_, i) => i !== index));
                }}
              >
                <IconSymbol name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 6 && (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={() => setPickerOpen(true)}>
              <IconSymbol name="add" size={28} color="#6c757d" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.imageHint}>Add up to 6 images (max 10MB each, 1 image mandatory)</Text>

        {/* Product Name */}
        <Text style={styles.sectionLabel}>Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.helper}>Maximum 200 characters</Text>

        {/* Product Description */}
        <Text style={styles.sectionLabel}>Product Description <Text style={styles.optional}>(Optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Press here to type"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.helper}>Maximum 2000 characters</Text>

        {/* Prices */}
        <View style={styles.row2}>
          <View style={styles.boxField}>
            <View style={styles.boxLeftIcon}><Text style={styles.currency}>₹</Text></View>
            <TextInput
              style={styles.boxInput}
              placeholder="MRP"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              value={mrp}
              onChangeText={setMrp}
            />
          </View>
          <View style={styles.boxField}>
            <View style={styles.boxLeftIcon}><Text style={styles.currency}>₹</Text></View>
            <TextInput
              style={styles.boxInput}
              placeholder="Selling Price"
              placeholderTextColor="#6c757d"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* Business Category */}
        <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryOpen(true)}>
          <Text style={{color: businessCategory ? '#111827' : '#6c757d'}}>
            {businessCategory || 'Business Category'}
          </Text>
        </TouchableOpacity>

        {/* Product Category */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            if (!businessCategory) {
              Alert.alert('Select Business Category', 'Please choose a business category first');
              return;
            }
            setProductCategoryOpen(true);
          }}
        >
          <Text style={{color: productCategory ? '#111827' : '#6c757d'}}>
            {productCategory || 'Product Category'}
          </Text>
        </TouchableOpacity>

        {/* Database Category Selection */}
        <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryPickerOpen(true)}>
          <Text style={{color: selectedCategoryId ? '#111827' : '#6c757d'}}>
            {selectedCategoryId 
              ? databaseCategories.find(c => c.category_id === selectedCategoryId)?.categoryName || 'Category Selected'
              : 'Select Category (from your categories)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addSecondary} onPress={() => setNewCategoryOpen(true)}>
          <IconSymbol name="add" size={18} color="#e61580" />
          <Text style={styles.addSecondaryText}>Add New Product Category</Text>
        </TouchableOpacity>

        {/* Size Chart + Image guidelines */}
        <Text style={styles.subTitle}>Size Chart <Text style={styles.optional}>(Optional)</Text></Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => setSizeChartPickerOpen(true)}>
          <IconSymbol name="add" size={18} color="#111827" />
          <Text style={styles.uploadText}>{sizeChartImage ? 'Change Size Chart' : 'Upload Size Chart'}</Text>
        </TouchableOpacity>
        {sizeChartImage && (
          <View style={styles.sizeChartPreview}>
            <Image source={{uri: sizeChartImage}} style={styles.sizeChartImage} resizeMode="contain" />
            <TouchableOpacity
              style={styles.removeSizeChartBtn}
              onPress={() => setSizeChartImage(null)}
            >
              <IconSymbol name="close" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineTitle}>Image Guidelines:</Text>
          <Text style={styles.guidelineBody}>Recommended Minimum Width for Size Chart: 800px</Text>
        </View>

        {/* Inventory */}
        <Text style={styles.sectionHeader}>Inventory <Text style={styles.optional}>(Optional)</Text></Text>
        <Text style={styles.helperBody}>Add and manage product inventory</Text>
        <TextInput style={styles.input} placeholder="Enter Available Quantity" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

        {/* SKU */}
        <Text style={styles.sectionHeader}>Stock Keeping Unit <Text style={styles.optional}>(Optional)</Text></Text>
        <Text style={styles.helperBody}>Add the SKU for this product</Text>
        <TextInput style={styles.input} placeholder="SKU" placeholderTextColor="#9CA3AF" value={sku} onChangeText={setSku} />
        <Text style={styles.helper}>Maximum 40 characters</Text>

        {/* Features */}
        <Text style={styles.sectionHeader}>Features</Text>
        <Text style={styles.helperBody}>Add color and size information about this product</Text>
        
        {/* Color Selection */}
        <Text style={[styles.sectionLabel, {marginTop: 12}]}>Colors</Text>
        <Text style={styles.helperBody}>Select one or more colors for this product</Text>
        
        {/* Selected Colors Display */}
        {colors.length > 0 && (
          <View style={styles.selectedColorsContainer}>
            {colors.map((selectedColor, index) => (
              <View key={index} style={styles.colorChip}>
                <Text style={styles.colorChipText}>{selectedColor}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newColors = colors.filter((_, i) => i !== index);
                    setColors(newColors);
                  }}
                  style={styles.colorChipRemove}
                >
                  <IconSymbol name="close" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity style={styles.dropdown} onPress={() => setColorPickerOpen(true)}>
          <Text style={{color: '#6c757d'}}>
            {colors.length > 0 ? 'Add More Colors' : 'Select Colors'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helper}>You can select multiple colors</Text>

        {/* Color Chart */}
        <Text style={[styles.subTitle, {marginTop: 20}]}>Color Chart <Text style={styles.optional}>(Optional)</Text></Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => setColorChartPickerOpen(true)}>
          <IconSymbol name="add" size={18} color="#111827" />
          <Text style={styles.uploadText}>{colorChartImage ? 'Change Color Chart' : 'Upload Color Chart'}</Text>
        </TouchableOpacity>
        {colorChartImage && (
          <View style={styles.sizeChartPreview}>
            <Image source={{uri: colorChartImage}} style={styles.sizeChartImage} resizeMode="contain" />
            <TouchableOpacity
              style={styles.removeSizeChartBtn}
              onPress={() => setColorChartImage(null)}
            >
              <IconSymbol name="close" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineTitle}>Image Guidelines:</Text>
          <Text style={styles.guidelineBody}>Recommended Minimum Width for Color Chart: 800px</Text>
        </View>
        
        {/* Size Input */}
        <Text style={[styles.sectionLabel, {marginTop: 20}]}>Size</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Size" 
          placeholderTextColor="#9CA3AF" 
          value={size} 
          onChangeText={setSize}
          maxLength={50}
        />
        <Text style={styles.helper}>Maximum 50 characters</Text>

        {/* Variants / Tax */}
        <Text style={styles.sectionHeader}>Variants</Text>
        <Text style={styles.helperBody}>Add different size and color options</Text>
        <TouchableOpacity
          style={styles.addSecondary}
          onPress={() => {
            if (!isEditMode || !existing) {
              Alert.alert(
                'Save product first',
                'Please add the product to your catalog. After it is added, open it from the Products list and use Add New Variant.',
              );
              return;
            }
            navigation.navigate('AddVariant', {
              baseProduct: existing,
            });
          }}>
          <IconSymbol name="add" size={18} color="#e61580" />
          <Text style={styles.addSecondaryText}>Add New Variant</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Tax Details <Text style={styles.optional}>(Optional)</Text></Text>
        <Text style={styles.helperBody}>Enter a valid HSN code with 2, 4, 6 or 8 digits.</Text>
        <TouchableOpacity><Text style={styles.link}>List of HSN Codes</Text></TouchableOpacity>
        <TextInput style={styles.input} placeholder="Enter HSN" placeholderTextColor="#9CA3AF" value={hsn} onChangeText={setHsn} maxLength={8} />

        {/* Best Seller */}
        <TouchableOpacity style={styles.checkRow} onPress={() => setBestSeller(!bestSeller)}>
          <View style={[styles.checkbox, bestSeller && styles.checkboxChecked]} />
          <Text style={styles.checkLabel}>Mark as Best Seller</Text>
        </TouchableOpacity>

        {/* Collection Selection (only for new products, optional) */}
        {!isEditMode && (
          <>
            <Text style={styles.sectionHeader}>Collections <Text style={styles.optional}>(Optional)</Text></Text>
            <Text style={styles.helperBody}>
              {collections.length === 0 
                ? 'Create a collection first to add products to it'
                : 'Select collection(s) to add this product to (optional)'}
            </Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setCollectionPickerOpen(true)}>
              <Text style={{color: Object.keys(selectedCollections).filter(id => selectedCollections[id]).length > 0 ? '#111827' : '#6c757d'}}>
                {Object.keys(selectedCollections).filter(id => selectedCollections[id]).length > 0
                  ? `${Object.keys(selectedCollections).filter(id => selectedCollections[id]).length} collection(s) selected`
                  : 'Select Collections'}
              </Text>
            </TouchableOpacity>
            {Object.keys(selectedCollections).filter(id => selectedCollections[id]).length > 0 && (
              <View style={styles.selectedCollectionsContainer}>
                {Object.keys(selectedCollections)
                  .filter(id => selectedCollections[id])
                  .map(collectionId => {
                    const collection = collections.find(c => c.id === collectionId);
                    return collection ? (
                      <View key={collectionId} style={styles.collectionChip}>
                        <Text style={styles.collectionChipText}>{collection.name}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedCollections(prev => ({
                              ...prev,
                              [collectionId]: false,
                            }));
                          }}
                          style={styles.collectionChipRemove}>
                          <IconSymbol name="close" size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ) : null;
                  })}
              </View>
            )}
          </>
        )}

        {/* Category quick actions (edit mode) */}
        {isEditMode && (
          <TouchableOpacity
            style={[styles.submitBtn, styles.secondaryBtn]}
            onPress={() => navigation.navigate('Categories')}>
            <Text style={[styles.submitText, styles.secondaryBtnText]}>Edit Categories</Text>
          </TouchableOpacity>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>{isEditMode ? 'Update Product' : 'Add Product'}</Text>
        </TouchableOpacity>
      </ScrollView>
      </ViewShot>

      {/* Image Picker Modal */}
      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.pickRow}>
              <TouchableOpacity style={styles.pickBox} onPress={handleCamera}>
                <IconSymbol name="camera-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickBox} onPress={async () => {
                const remainingSlots = 6 - images.length;
                const res = await launchImageLibrary({
                  mediaType: 'photo',
                  selectionLimit: remainingSlots,
                  quality: 0.8,
                });
                if (res.assets && res.assets.length > 0) {
                  const validImages: string[] = [];
                  for (const asset of res.assets) {
                    if (asset.uri) {
                      const {fileSize, type, uri} = asset;
                      if (fileSize && fileSize > 10 * 1024 * 1024) {
                        Alert.alert('Image too large', `Image "${asset.fileName || 'image'}" is larger than 10MB. Skipping.`);
                        continue;
                      }
                      if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) {
                        Alert.alert('Unsupported format', `Image "${asset.fileName || 'image'}" format not supported. Skipping.`);
                        continue;
                      }
                      validImages.push(uri!);
                    }
                  }
                  if (validImages.length > 0) {
                    const newImages = [...images, ...validImages].slice(0, 6);
                    setImages(newImages);
                    if (validImages.length < res.assets.length) {
                      Alert.alert('Partial Success', `Added ${validImages.length} image(s). Some images were skipped due to size or format issues.`);
                    }
                  }
                }
                setPickerOpen(false);
              }}>
                <IconSymbol name="image-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 12}}>
              <Text>{'• Make sure Image size is less than  10 MB'}</Text>
              <Text>{'• Supported formats: JPG, PNG, WEBP, GIF, HEIC, HEIF'}</Text>
              <Text>{'• Recommended Aspect Ratio for Showcase Theme: 1:1 (600x600px)'}</Text>
              <Text>{'• Recommended Aspect Ratio for Limelight Theme: 3:4 (600x800px)'}</Text>
              <Text>{'• Unsupported formats: SVG, MP4'}</Text>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setPickerOpen(false)}>
              <Text style={{fontWeight:'bold', fontSize: 28}}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Business Category Modal */}
      <Modal transparent visible={categoryOpen} animationType="slide" onRequestClose={() => setCategoryOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}> 
              <Text style={styles.listTitle}>Business Category</Text>
              <TouchableOpacity onPress={() => setCategoryOpen(false)}><Text style={{fontSize:28, fontWeight:'bold'}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {categoryList.map(item => (
                <TouchableOpacity key={item} style={styles.listItem} onPress={() => { setBusinessCategory(item); setCategoryOpen(false); }}>
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Category Modal */}
      <Modal transparent visible={productCategoryOpen} animationType="slide" onRequestClose={() => setProductCategoryOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}> 
              <Text style={styles.listTitle}>Product Category</Text>
              <TouchableOpacity onPress={() => setProductCategoryOpen(false)}><Text style={{fontSize:28, fontWeight:'bold'}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {(productCategoryMap[businessCategory] || []).map(item => (
                <TouchableOpacity key={item} style={styles.listItem} onPress={() => { setProductCategory(item); setProductCategoryOpen(false); }}>
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Database Category Picker Modal */}
      <Modal transparent visible={categoryPickerOpen} animationType="slide" onRequestClose={() => setCategoryPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryPickerOpen(false)}>
                <Text style={{fontSize:28, fontWeight:'bold', color: '#FFFFFF'}}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{maxHeight: 400}}>
              {databaseCategories.length === 0 ? (
                <View style={styles.listItem}>
                  <Text style={styles.listItemText}>No categories found. Create one first.</Text>
                </View>
              ) : (
                databaseCategories.map(category => (
                  <TouchableOpacity 
                    key={category.category_id} 
                    style={[
                      styles.listItem,
                      selectedCategoryId === category.category_id && {backgroundColor: '#ECFEFF'}
                    ]} 
                    onPress={() => { 
                      setSelectedCategoryId(category.category_id); 
                      setCategoryPickerOpen(false);
                      console.log('Selected category:', category.categoryName, 'ID:', category.category_id);
                    }}
                  >
                    <Text style={styles.listItemText}>
                      {category.categoryName}
                      {category.businessCategory && ` (${category.businessCategory})`}
                    </Text>
                    {selectedCategoryId === category.category_id && (
                      <Text style={{color: '#e61580', fontWeight: 'bold', marginLeft: 8}}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Category Modal */}
      <Modal transparent visible={newCategoryOpen} animationType="slide" onRequestClose={() => setNewCategoryOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.createCategoryCard}>
            <Text style={styles.createCategoryTitle}>Create a Category</Text>
            
            <View style={{marginTop: 16}}>
              <Text style={styles.categoryLabel}>Category Name*</Text>
              <TextInput
                style={styles.categoryInput}
                placeholder="Enter Category Name"
                placeholderTextColor="#9CA3AF"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                maxLength={30}
              />
              <Text style={{textAlign: 'right', color: '#9CA3AF', marginTop: 4}}>
                {newCategoryName.length}/30
              </Text>
            </View>

            <View style={styles.createCategoryButtons}>
              <TouchableOpacity
                style={[styles.createCategoryBtn, !newCategoryName.trim() && styles.createCategoryBtnDisabled]}
                onPress={() => {
                  if (newCategoryName.trim()) {
                    setProductCategory(newCategoryName.trim());
                    setNewCategoryName('');
                    setNewCategoryOpen(false);
                    Alert.alert('Success', 'Category added successfully');
                  }
                }}
                disabled={!newCategoryName.trim()}
              >
                <Text style={[styles.createCategoryBtnText, !newCategoryName.trim() && styles.createCategoryBtnTextDisabled]}>
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Color Selection Modal */}
      <Modal transparent visible={colorPickerOpen} animationType="slide" onRequestClose={() => setColorPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}> 
              <Text style={styles.listTitle}>Select Colors</Text>
              <TouchableOpacity onPress={() => setColorPickerOpen(false)}><Text style={{fontSize:28, fontWeight:'bold'}}>×</Text></TouchableOpacity>
            </View>
            <ScrollView>
              {[
                'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 'White', 
                'Gray', 'Brown', 'Beige', 'Navy', 'Maroon', 'Teal', 'Cyan', 'Magenta', 'Lime',
                'Gold', 'Silver', 'Bronze', 'Turquoise', 'Coral', 'Salmon', 'Khaki', 'Olive',
                'Violet', 'Indigo', 'Crimson', 'Aqua'
              ].map(item => {
                const isSelected = colors.includes(item);
                return (
                  <TouchableOpacity 
                    key={item} 
                    style={[styles.listItem, isSelected && styles.listItemSelected]} 
                    onPress={() => { 
                      if (isSelected) {
                        // Remove color if already selected
                        setColors(colors.filter(c => c !== item));
                      } else {
                        // Add color if not selected
                        setColors([...colors, item]);
                      }
                    }}
                  >
                    <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>{item}</Text>
                    {isSelected && <IconSymbol name="checkmark" size={20} color="#e61580" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setColorPickerOpen(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Size Chart Image Picker Modal */}
      <Modal transparent visible={sizeChartPickerOpen} animationType="fade" onRequestClose={() => setSizeChartPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.pickRow}>
              <TouchableOpacity style={styles.pickBox} onPress={async () => {
                const hasPermission = await requestCameraPermission();
                if (!hasPermission) {
                  Alert.alert('Permission Required', 'Please grant camera permission to take photos');
                  return;
                }
                const res = await launchCamera({mediaType:'photo',quality:0.8});
                if (res.assets?.[0]?.uri) {
                  const {fileSize, type, uri} = res.assets[0];
                  if (fileSize && fileSize > 10 * 1024 * 1024) { 
                    Alert.alert('Image too large','Please select an image less than 10MB'); 
                    return; 
                  }
                  if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) { 
                    Alert.alert('Unsupported format','Use JPG, PNG, WEBP, GIF, HEIC, HEIF'); 
                    return; 
                  }
                  setSizeChartImage(uri!);
                  setSizeChartPickerOpen(false);
                }
              }}>
                <IconSymbol name="camera-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickBox} onPress={async () => {
                const res = await launchImageLibrary({mediaType:'photo',selectionLimit:1,quality:0.8});
                if (res.assets?.[0]?.uri) {
                  const {fileSize, type, uri} = res.assets[0];
                  if (fileSize && fileSize > 10 * 1024 * 1024) { 
                    Alert.alert('Image too large','Please select an image less than 10MB'); 
                    return; 
                  }
                  if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) { 
                    Alert.alert('Unsupported format','Use JPG, PNG, WEBP, GIF, HEIC, HEIF'); 
                    return; 
                  }
                  setSizeChartImage(uri!);
                  setSizeChartPickerOpen(false);
                }
              }}>
                <IconSymbol name="image-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 12}}>
              <Text>{'• Make sure Image size is less than 10 MB'}</Text>
              <Text>{'• Supported formats: JPG, PNG, WEBP, GIF, HEIC, HEIF'}</Text>
              <Text>{'• Recommended Minimum Width: 800px'}</Text>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSizeChartPickerOpen(false)}>
              <Text style={{fontWeight:'bold', fontSize: 28}}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Collection Picker Modal */}
      <Modal transparent visible={collectionPickerOpen} animationType="slide" onRequestClose={() => setCollectionPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Select Collections</Text>
              <TouchableOpacity onPress={() => setCollectionPickerOpen(false)}>
                <Text style={{fontSize: 28, fontWeight: 'bold'}}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {collections.length === 0 ? (
                <View style={styles.emptyCollectionsContainer}>
                  <Text style={styles.emptyCollectionsText}>No collections available</Text>
                  <TouchableOpacity
                    style={styles.addCollectionButton}
                    onPress={() => {
                      setCollectionPickerOpen(false);
                      navigation.navigate('AddCollection');
                    }}>
                    <IconSymbol name="add" size={18} color="#e61580" />
                    <Text style={styles.addCollectionButtonText}>Create Collection</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                collections.map(collection => {
                  const isSelected = selectedCollections[collection.id] || false;
                  return (
                    <TouchableOpacity
                      key={collection.id}
                      style={[styles.listItem, isSelected && styles.listItemSelected]}
                      onPress={() => {
                        setSelectedCollections(prev => ({
                          ...prev,
                          [collection.id]: !prev[collection.id],
                        }));
                      }}>
                      <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                        {collection.name}
                      </Text>
                      {isSelected && <IconSymbol name="checkmark" size={20} color="#e61580" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
            {collections.length > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setCollectionPickerOpen(false)}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Color Chart Image Picker Modal */}
      <Modal transparent visible={colorChartPickerOpen} animationType="fade" onRequestClose={() => setColorChartPickerOpen(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.pickRow}>
              <TouchableOpacity style={styles.pickBox} onPress={async () => {
                const hasPermission = await requestCameraPermission();
                if (!hasPermission) {
                  Alert.alert('Permission Required', 'Please grant camera permission to take photos');
                  return;
                }
                const res = await launchCamera({mediaType:'photo',quality:0.8});
                if (res.assets?.[0]?.uri) {
                  const {fileSize, type, uri} = res.assets[0];
                  if (fileSize && fileSize > 10 * 1024 * 1024) { 
                    Alert.alert('Image too large','Please select an image less than 10MB'); 
                    return; 
                  }
                  if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) { 
                    Alert.alert('Unsupported format','Use JPG, PNG, WEBP, GIF, HEIC, HEIF'); 
                    return; 
                  }
                  setColorChartImage(uri!);
                  setColorChartPickerOpen(false);
                }
              }}>
                <IconSymbol name="camera-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickBox} onPress={async () => {
                const res = await launchImageLibrary({mediaType:'photo',selectionLimit:1,quality:0.8});
                if (res.assets?.[0]?.uri) {
                  const {fileSize, type, uri} = res.assets[0];
                  if (fileSize && fileSize > 10 * 1024 * 1024) { 
                    Alert.alert('Image too large','Please select an image less than 10MB'); 
                    return; 
                  }
                  if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) { 
                    Alert.alert('Unsupported format','Use JPG, PNG, WEBP, GIF, HEIC, HEIF'); 
                    return; 
                  }
                  setColorChartImage(uri!);
                  setColorChartPickerOpen(false);
                }
              }}>
                <IconSymbol name="image-outline" size={36} color="#111827" />
                <Text style={styles.pickLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 12}}>
              <Text>{'• Make sure Image size is less than 10 MB'}</Text>
              <Text>{'• Supported formats: JPG, PNG, WEBP, GIF, HEIC, HEIF'}</Text>
              <Text>{'• Recommended Minimum Width: 800px'}</Text>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setColorChartPickerOpen(false)}>
              <Text style={{fontWeight:'bold', fontSize: 28}}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB'},
  backButton: {width: 30},
  headerTitle: {flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#111827'},
  headerRight: {width: 30},

  content: {padding: 16, paddingBottom: 40},
  imageRow: {marginBottom: 16},
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  imageItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  previewImg: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  imageHint: {color: '#6c757d', marginTop: 8, fontSize: 12},

  sectionLabel: {fontWeight: 'bold', color: '#111827', marginTop: 12},
  optional: {color: '#9CA3AF', fontWeight: 'normal'},
  input: {borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, marginTop: 8, color: '#111827'},
  textarea: {height: 160, textAlignVertical: 'top'},
  helper: {color: '#9CA3AF', marginTop: 6},
  helperBody: {color: '#6c757d', marginTop: 6},

  row2: {flexDirection: 'row', gap: 16, marginTop: 8},
  boxField: {flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, overflow: 'hidden'},
  boxLeftIcon: {width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRightWidth: 1, borderRightColor: '#dee2e6'},
  currency: {fontWeight: 'bold', color: '#111827'},
  boxInput: {flex: 1, paddingHorizontal: 12, color: '#111827'},

  dropdown: {borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, marginTop: 12, color: '#111827'},
  addSecondary: {marginTop: 10, borderWidth: 1, borderColor: '#C7F2F9', backgroundColor: '#ECFEFF', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8},
  addSecondaryText: {color: '#e61580', fontWeight: '600'},

  subTitle: {marginTop: 16, fontWeight: 'bold', color: '#111827'},
  uploadBtn: {marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, padding: 12, alignSelf: 'flex-start'},
  uploadText: {color: '#111827'},
  guidelineCard: {marginTop: 12, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8},
  guidelineTitle: {fontWeight: '600', marginBottom: 4, color: '#111827'},
  guidelineBody: {color: '#6c757d'},

  sectionHeader: {marginTop: 18, fontWeight: 'bold', color: '#111827'},

  link: {color: '#e61580', marginTop: 6},
  checkRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12},
  checkbox: {width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#9CA3AF'},
  checkboxChecked: {backgroundColor: '#e61580', borderColor: '#e61580'},
  checkLabel: {color: '#111827'},

  submitBtn: {marginTop: 16, backgroundColor: '#e61580', padding: 14, borderRadius: 10},
  submitBtnDisabled: {backgroundColor: '#D1D5DB'},
  submitText: {textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'},
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e61580',
    marginTop: 16,
  },
  secondaryBtnText: {
    color: '#e61580',
  },

  // Modals
  centerOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16},
  sheetCard: {backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '100%'},
  pickRow: {flexDirection:'row', justifyContent: 'space-between'},
  pickBox: {flex:1, borderWidth:1, borderColor:'#E5E7EB', borderRadius:8, padding:16, alignItems:'center', marginHorizontal:6},
  pickLabel: {marginTop:8, fontWeight:'600', color:'#111827'},
  modalClose: {position:'absolute', top:8, right:12},

  listCard: {backgroundColor:'#FFFFFF', borderRadius:12, paddingBottom:8, width:'100%', maxHeight:'80%'},
  listHeader: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, backgroundColor:'#111827', borderTopLeftRadius:12, borderTopRightRadius:12},
  listTitle: {color:'#FFFFFF', fontWeight:'600'},
  listItem: {paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#dee2e6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  listItemText: {color:'#111827', fontSize:16, flex: 1},
  selectedListItem: {backgroundColor: '#ECFEFF'},
  selectedListItemText: {color: '#e61580', fontWeight: '600'},
  checkmark: {color: '#e61580', fontWeight: 'bold', fontSize: 18},
  emptyText: {padding: 20, textAlign: 'center', color: '#6c757d'},

  // Create Category Modal
  createCategoryCard: {backgroundColor:'#FFFFFF', borderRadius:12, padding:20, width:'90%'},
  createCategoryTitle: {fontSize:18, fontWeight:'bold', color:'#111827'},
  categoryLabel: {fontWeight:'600', color:'#111827', marginBottom:8},
  categoryInput: {borderWidth:1, borderColor:'#E5E7EB', borderRadius:8, padding:12, color:'#111827'},
  createCategoryButtons: {marginTop:20, gap:12},
  createCategoryBtn: {backgroundColor:'#e61580', padding:14, borderRadius:8, alignItems:'center'},
  createCategoryBtnDisabled: {backgroundColor:'#D1D5DB'},
  createCategoryBtnText: {color:'#FFFFFF', fontWeight:'bold'},
  createCategoryBtnTextDisabled: {color:'#9CA3AF'},

  // Size Chart Preview
  sizeChartPreview: {marginTop: 12, position: 'relative', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#dee2e6'},
  sizeChartImage: {width: '100%', height: 200, backgroundColor: '#f8f9fa'},
  removeSizeChartBtn: {position: 'absolute', top: 8, right: 8, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 4},

  // Selected Colors
  selectedColorsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8},
  colorChip: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFEFF', borderWidth: 1, borderColor: '#C7F2F9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6},
  colorChipText: {color: '#e61580', fontWeight: '600', fontSize: 14},
  colorChipRemove: {marginLeft: 4},

  // Color Selection Modal
  listItemSelected: {backgroundColor: '#ECFEFF', borderLeftWidth: 3, borderLeftColor: '#e61580'},
  listItemTextSelected: {color: '#e61580', fontWeight: '600'},
  modalFooter: {padding: 16, borderTopWidth: 1, borderTopColor: '#dee2e6'},
  doneButton: {backgroundColor: '#e61580', padding: 14, borderRadius: 8, alignItems: 'center'},
  doneButtonText: {color: '#FFFFFF', fontWeight: 'bold', fontSize: 16},

  // Selected Collections
  selectedCollectionsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8},
  collectionChip: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFEFF', borderWidth: 1, borderColor: '#C7F2F9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6},
  collectionChipText: {color: '#e61580', fontWeight: '600', fontSize: 14},
  collectionChipRemove: {marginLeft: 4},
  
  // Empty Collections
  emptyCollectionsContainer: {padding: 32, alignItems: 'center'},
  emptyCollectionsText: {color: '#6c757d', marginBottom: 16, fontSize: 16},
  addCollectionButton: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFEFF', borderWidth: 1, borderColor: '#C7F2F9', borderRadius: 8, padding: 12, gap: 8},
  addCollectionButtonText: {color: '#e61580', fontWeight: '600'},
});

export default AddProductScreen;


