import React, {useState, useRef, useEffect} from 'react';
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
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {uploadCategoryWithImages, updateCategory, fetchProducts, updateProduct} from '../../../utils/api';

interface AddCategoryScreenProps {
  navigation: any;
  route?: any;
}

const AddCategoryScreen: React.FC<AddCategoryScreenProps> = ({
  navigation,
  route,
}) => {
  // SmartBiz: Check if we're in edit mode (categoryId must be present)
  const categoryIdFromRoute = route?.params?.categoryId;
  const isEditMode = !!(categoryIdFromRoute && (categoryIdFromRoute !== '' && categoryIdFromRoute !== null && categoryIdFromRoute !== undefined));
  
  // Debug: Log route params on mount
  useEffect(() => {
    console.log('🔍 [AddCategoryScreen] Screen mounted/updated:', {
      routeName: route?.name,
      hasParams: !!route?.params,
      categoryId: categoryIdFromRoute,
      isEditMode,
      allParams: route?.params,
    });
  }, [route?.params, categoryIdFromRoute, isEditMode]);
  const [categoryImage, setCategoryImage] = useState<string | null>(
    route?.params?.image || null,
  );
  const [categoryName, setCategoryName] = useState(
    route?.params?.name || '',
  );
  const [categoryDescription, setCategoryDescription] = useState(
    route?.params?.description || '',
  );
  const [businessCategory, setBusinessCategory] = useState(
    route?.params?.businessCategory || '',
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use ref for immediate synchronous check (prevents race conditions)
  const isSubmittingRef = useRef(false);

  const categoryList = [
    'Appliances','Baby','Beauty and Personal Care','Books and Stationery','Clothing','Electronics','Food and Grocery','Footwear','Furniture','General','Health Supplements','Home and Kitchen','Home Care','Jewelry','Lawn and Garden','Luggage and Bags','Multipurpose','Pet Products','Sports and Fitness','Toys and games','Watches',
  ];

  const canSave =
    categoryName.trim().length > 0 &&
    categoryName.length <= 30 &&
    businessCategory.length > 0;

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
        },
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
      Alert.alert(
        'Permission Required',
        'Please grant camera permission to take photos',
      );
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
          Alert.alert(
            'Unsupported format',
            'Please use JPG, PNG, WEBP, GIF, HEIC, or HEIF format',
          );
          return;
        }
        setCategoryImage(uri!);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
    setPickerOpen(false);
  };

  const handleImageLibrary = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.errorCode) {
        console.log('ImagePicker Error: ', res.errorMessage);
        Alert.alert('Error', res.errorMessage || 'Failed to open image library');
      } else if (res.assets?.[0]?.uri) {
        const {fileSize, type, uri} = res.assets[0];
        if (fileSize && fileSize > 10 * 1024 * 1024) {
          Alert.alert('Image too large', 'Please select an image less than 10MB');
          return;
        }
        if (type && !/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(type)) {
          Alert.alert(
            'Unsupported format',
            'Please use JPG, PNG, WEBP, GIF, HEIC, or HEIF format',
          );
          return;
        }
        setCategoryImage(uri!);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open image library');
    }
    setPickerOpen(false);
  };

  const handleSave = async () => {
    // IMMEDIATE synchronous check using ref (prevents race conditions from rapid clicks)
    if (isSubmittingRef.current) {
      console.log('⚠️ [AddCategory] Submission already in progress, ignoring duplicate click');
      return;
    }

    // Also check state (double protection)
    if (isSubmitting) {
      console.log('⚠️ [AddCategory] Submission already in progress (state check), ignoring duplicate click');
      return;
    }

    if (!canSave) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Set BOTH ref and state IMMEDIATELY (synchronously) before any async operation
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    const categoryId = route?.params?.categoryId;
    console.log('🔄 [AddCategory] Starting category save...', {
      isEditMode,
      categoryId,
      categoryName,
      businessCategory,
      hasImage: !!categoryImage,
    });

    try {
      if (isEditMode && categoryId) {
        // Update existing category (SmartBiz: same as collections)
        const categoryIdNum = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
        
        if (isNaN(categoryIdNum)) {
          throw new Error(`Invalid category ID: ${categoryId}`);
        }
        
        console.log('🔄 [AddCategory] UPDATING existing category:', {
          categoryId: categoryIdNum,
          categoryName,
          businessCategory,
          description: categoryDescription,
          hasImage: !!categoryImage,
          imageUrl: categoryImage ? (categoryImage.length > 50 ? categoryImage.substring(0, 50) + '...' : categoryImage) : 'none',
        });
        
        const updatePayload: any = {
          categoryName,
          businessCategory,
          description: categoryDescription || '',
          seoTitleTag: categoryName,
          seoMetaDescription: categoryDescription || '',
        };
        
        // Only include image if it's a new image (not the existing URL)
        // If categoryImage is a data URI or file path, it's a new image
        if (categoryImage && (categoryImage.startsWith('file://') || categoryImage.startsWith('data:'))) {
          // This is a new image - we'd need to upload it first, but for now just pass the URL
          // TODO: Handle image upload for updates
          console.warn('⚠️ [AddCategory] New image detected but image upload for updates not yet implemented');
        } else if (categoryImage) {
          // This is an existing image URL - include it
          updatePayload.categoryImage = categoryImage;
        }
        
        await updateCategory(categoryIdNum, updatePayload);
        console.log('✅ [AddCategory] Category updated successfully');
        Alert.alert(
          'Success',
          'Category updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        // Create new category (no categoryId means this is a new category)
        console.log('🆕 [AddCategory] CREATING new category (no categoryId found)');
        const createdCategory = await uploadCategoryWithImages({
          categoryName,
          businessCategory,
          description: categoryDescription,
          seoTitleTag: categoryName,
          seoMetaDescription: categoryDescription,
          imageUri: categoryImage,
        });

        console.log('✅ [AddCategory] Category created successfully:', {
          categoryId: createdCategory.category_id,
          categoryName,
          businessCategory,
        });

        // Auto-link products with matching businessCategory to this new category
        if (createdCategory && createdCategory.category_id && businessCategory) {
          try {
            console.log('🔄 [AddCategory] Auto-linking products with businessCategory:', businessCategory);
            const allProducts = await fetchProducts();
            
            // Filter products that match the businessCategory
            const matchingProducts = allProducts.filter(p => {
              const pBusinessCategory = (p.businessCategory || '').toLowerCase().trim();
              const targetBusinessCategory = businessCategory.toLowerCase().trim();
              return pBusinessCategory === targetBusinessCategory;
            });

            console.log('📦 [AddCategory] Found matching products:', {
              totalProducts: allProducts.length,
              matchingProducts: matchingProducts.length,
              businessCategory,
            });

            // Update each matching product to link to the new category
            let linkedCount = 0;
            for (const product of matchingProducts) {
              try {
                await updateProduct(product.productsId, {
                  productName: product.productName,
                  sellingPrice: product.sellingPrice,
                  businessCategory: product.businessCategory || '',
                  productCategory: product.productCategory || '',
                  description: product.description || '',
                  mrp: product.mrp,
                  inventoryQuantity: product.inventoryQuantity || 0,
                  customSku: product.customSku,
                  color: product.color,
                  size: product.size,
                  hsnCode: product.hsnCode,
                  categoryId: createdCategory.category_id, // Link product to new category
                });
                linkedCount++;
              } catch (productError) {
                console.error(`❌ [AddCategory] Failed to link product ${product.productsId}:`, productError);
                // Continue with other products even if one fails
              }
            }

            console.log('✅ [AddCategory] Auto-linked products:', {
              linkedCount,
              totalMatching: matchingProducts.length,
            });

            // Show success message with product count
            const successMessage = linkedCount > 0
              ? `Category created successfully!\n\n${linkedCount} product${linkedCount > 1 ? 's' : ''} with business category "${businessCategory}" ${linkedCount > 1 ? 'have' : 'has'} been automatically added to this category.`
              : 'Category created successfully!';

            Alert.alert(
              'Success',
              successMessage,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Reset both ref and state before navigation
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                    navigation.goBack();
                  },
                },
              ],
            );
          } catch (linkError) {
            console.error('❌ [AddCategory] Error auto-linking products:', linkError);
            // Still show success for category creation, but warn about product linking
            Alert.alert(
              'Category Created',
              'Category created successfully, but there was an error linking products. You can manually add products to this category.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                    navigation.goBack();
                  },
                },
              ],
            );
          }
        } else {
          // No businessCategory selected, just show normal success
          Alert.alert(
            'Success',
            'Category created successfully',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Reset both ref and state before navigation
                  isSubmittingRef.current = false;
                  setIsSubmitting(false);
                  navigation.goBack();
                },
              },
            ],
          );
        }
      }
    } catch (error) {
      console.error('❌ [AddCategory] Failed to save category', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save category. Please check your internet connection and try again.';
      Alert.alert('Error', errorMessage);
      // Reset both ref and state on error so user can retry
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setCategoryImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Category' : 'Add New Category'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}>
        {/* Category Image */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category Image</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setPickerOpen(true)}>
            {categoryImage ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{uri: categoryImage}}
                  style={styles.categoryImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}>
                  <IconSymbol name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.uploadIconCircle}>
                  <IconSymbol name="add" size={32} color="#e61580" />
                </View>
                <Text style={styles.uploadText}>Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Category Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Category Name"
            placeholderTextColor="#9CA3AF"
            value={categoryName}
            onChangeText={setCategoryName}
            maxLength={30}
          />
          <Text style={styles.helper}>
            {categoryName.length}/30
          </Text>
        </View>

        {/* Category Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Enter Category Description"
            placeholderTextColor="#9CA3AF"
            value={categoryDescription}
            onChangeText={setCategoryDescription}
            multiline
            numberOfLines={4}
            maxLength={250}
            textAlignVertical="top"
          />
          <Text style={styles.helper}>
            {categoryDescription.length}/250
          </Text>
        </View>

        {/* Business Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Business Category<Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCategoryOpen(true)}>
            <Text
              style={[
                styles.dropdownText,
                !businessCategory && styles.placeholderText,
              ]}>
              {businessCategory || 'Select Business Category'}
            </Text>
            <IconSymbol name="chevron-down" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, (!canSave || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || isSubmitting}>
          <Text
            style={[
              styles.saveButtonText,
              (!canSave || isSubmitting) && styles.saveButtonTextDisabled,
            ]}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <Modal
        transparent
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.dragHandle} />
            <Text style={styles.pickerTitle}>Select Image</Text>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={handleCamera}>
              <IconSymbol name="camera" size={24} color="#e61580" />
              <Text style={styles.pickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={handleImageLibrary}>
              <IconSymbol name="image" size={24} color="#e61580" />
              <Text style={styles.pickerOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setPickerOpen(false)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Business Category Modal */}
      <Modal
        transparent
        visible={categoryOpen}
        animationType="slide"
        onRequestClose={() => setCategoryOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setCategoryOpen(false)}>
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Business Category</Text>
              <TouchableOpacity onPress={() => setCategoryOpen(false)}>
                <IconSymbol name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categoryList.map(category => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => {
                    setBusinessCategory(category);
                    setCategoryOpen(false);
                  }}>
                  <Text style={styles.categoryItemText}>{category}</Text>
                  {businessCategory === category && (
                    <IconSymbol name="checkmark" size={20} color="#e61580" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
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
  content: {
    padding: 16,
    paddingBottom: 150, // Account for button container (~70px) + bottom nav (~60px) + safe area (~20px)
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e61580',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  textarea: {
    minHeight: 100,
    paddingTop: 12,
  },
  helper: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
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
    marginBottom: 12,
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
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e61580',
  },
  secondaryButtonText: {
    color: '#e61580',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  pickerCancel: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  categoryModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 8,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#111827',
  },
});

export default AddCategoryScreen;

