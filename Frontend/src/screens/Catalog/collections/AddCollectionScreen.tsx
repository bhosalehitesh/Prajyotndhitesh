import React, {useState, useRef} from 'react';
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
import {uploadCollectionWithImages, saveCollectionProducts, updateCollection} from '../../../utils/api';

interface AddCollectionScreenProps {
  navigation: any;
  route?: any;
}

const AddCollectionScreen: React.FC<AddCollectionScreenProps> = ({
  navigation,
  route,
}) => {
  // SmartBiz: Check if we're in edit mode (collectionId must be present)
  const collectionIdFromRoute = route?.params?.collectionId;
  const isEditMode = !!(collectionIdFromRoute && (collectionIdFromRoute !== '' && collectionIdFromRoute !== null && collectionIdFromRoute !== undefined));
  
  // Debug: Log route params on mount
  React.useEffect(() => {
    console.log('🔍 [AddCollectionScreen] Screen mounted/updated:', {
      routeName: route?.name,
      hasParams: !!route?.params,
      collectionId: collectionIdFromRoute,
      isEditMode,
      allParams: route?.params,
    });
  }, [route?.params, collectionIdFromRoute, isEditMode]);
  const productIdToAdd = route?.params?.productIdToAdd; // Product ID to add when creating collection
  const [collectionImage, setCollectionImage] = useState<string | null>(
    route?.params?.image || null,
  );
  const [collectionName, setCollectionName] = useState(
    route?.params?.name || '',
  );
  const [collectionDescription, setCollectionDescription] = useState(
    route?.params?.description || '',
  );
  const [selectedProducts, setSelectedProducts] = useState<any[]>(
    route?.params?.selectedProducts || [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use ref for immediate synchronous check (prevents race conditions - same as categories)
  const isSubmittingRef = useRef(false);
  // SmartBiz: Add orderIndex and isActive fields (same as categories)
  const [orderIndex, setOrderIndex] = useState<string>(
    route?.params?.orderIndex != null ? String(route.params.orderIndex) : '0',
  );
  // SmartBiz: Initialize isActive from params (prefer isActive, fallback to !hideFromWebsite)
  const getInitialIsActive = (): boolean => {
    if (route?.params?.isActive !== undefined) {
      return route.params.isActive;
    }
    if (route?.params?.hideFromWebsite !== undefined) {
      return !route.params.hideFromWebsite;
    }
    return true; // Default to active
  };
  const [isActive, setIsActive] = useState<boolean>(getInitialIsActive());
  
  // Debug: Log when screen loads in edit mode
  React.useEffect(() => {
    if (isEditMode) {
      console.log('📝 [AddCollectionScreen] Edit mode detected:', {
        collectionId: route?.params?.collectionId,
        collectionName: route?.params?.name,
        isActive: route?.params?.isActive,
        hideFromWebsite: route?.params?.hideFromWebsite,
        orderIndex: route?.params?.orderIndex,
        allParams: route?.params,
        currentIsActive: isActive,
      });
    }
  }, [isEditMode, route?.params, isActive]);

  // Update selected products when coming back from SelectProducts screen
  React.useEffect(() => {
    if (route?.params?.selectedProducts) {
      setSelectedProducts(route.params.selectedProducts);
    }
  }, [route?.params?.selectedProducts]);

  const canSave =
    collectionName.trim().length > 0 &&
    collectionName.length <= 30;

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
        setCollectionImage(uri!);
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
        setCollectionImage(uri!);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open image library');
    }
    setPickerOpen(false);
  };

  const handleSave = async () => {
    // IMMEDIATE synchronous check using ref (prevents race conditions - same as categories)
    if (isSubmittingRef.current) {
      console.log('⚠️ [AddCollection] Submission already in progress, ignoring duplicate click');
      return;
    }

    // Also check state (double protection)
    if (isSubmitting) {
      console.log('⚠️ [AddCollection] Submission already in progress (state check), ignoring duplicate click');
      return;
    }

    if (!canSave) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Set BOTH ref and state IMMEDIATELY (synchronously) before any async operation
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    const collectionId = route?.params?.collectionId;
    console.log('🔄 [AddCollection] Starting collection save...', {
      isEditMode,
      collectionId,
      collectionName,
      hasImage: !!collectionImage,
      isActive,
      orderIndex,
    });

    try {
      // CRITICAL: Check if we have a collectionId to update
      if (isEditMode && collectionId) {
        // Update existing collection (SmartBiz: same as categories)
        const orderIndexNum = orderIndex ? Number(orderIndex) : 0;
        const collectionIdNum = typeof collectionId === 'string' ? Number(collectionId) : collectionId;
        
        if (isNaN(collectionIdNum)) {
          throw new Error(`Invalid collection ID: ${collectionId}`);
        }
        
        console.log('🔄 [AddCollection] UPDATING existing collection:', {
          collectionId: collectionIdNum,
          collectionName,
          description: collectionDescription,
          isActive,
          orderIndex: orderIndexNum,
          hasImage: !!collectionImage,
          imageUrl: collectionImage ? (collectionImage.length > 50 ? collectionImage.substring(0, 50) + '...' : collectionImage) : 'none',
        });
        
        const updatePayload = {
          collectionName,
          description: collectionDescription || '',
          seoTitleTag: collectionName,
          seoMetaDescription: collectionDescription || '',
          isActive: isActive,
          orderIndex: orderIndexNum,
        };
        
        // Only include image if it's a new image (not the existing URL)
        // If collectionImage is a data URI or file path, it's a new image
        if (collectionImage && (collectionImage.startsWith('file://') || collectionImage.startsWith('data:'))) {
          // This is a new image - we'd need to upload it first, but for now just pass the URL
          // TODO: Handle image upload for updates
          console.warn('⚠️ [AddCollection] New image detected but image upload for updates not yet implemented');
        } else if (collectionImage) {
          // This is an existing image URL - include it
          updatePayload.collectionImage = collectionImage;
        }
        
        await updateCollection(collectionIdNum, updatePayload);
        console.log('✅ [AddCollection] Collection updated successfully');
        Alert.alert(
          'Success',
          'Collection updated successfully',
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
        // Create new collection (no collectionId means this is a new collection)
        console.log('🆕 [AddCollection] CREATING new collection (no collectionId found)');
        const created = await uploadCollectionWithImages({
          collectionName,
          description: collectionDescription,
          seoTitleTag: collectionName,
          seoMetaDescription: collectionDescription,
          imageUri: collectionImage,
        });

        // Map selected products to this collection in backend
        const productIdsToAdd: number[] = [];
        
        // Add products from selectedProducts (if any)
        if (selectedProducts.length > 0) {
          productIdsToAdd.push(...selectedProducts.map(p => Number(p.id)));
        }
        
        // Add productIdToAdd if provided (when coming from ProductsScreen)
        if (productIdToAdd && !productIdsToAdd.includes(Number(productIdToAdd))) {
          productIdsToAdd.push(Number(productIdToAdd));
        }
        
        if (productIdsToAdd.length > 0 && created?.collectionId != null) {
          console.log(`Adding ${productIdsToAdd.length} product(s) to new collection ${created.collectionId}`);
          await saveCollectionProducts(
            created.collectionId,
            productIdsToAdd,
          );
          console.log(`Products added successfully. Note: Products remain in their existing collections.`);
        }

        const successMessage = productIdsToAdd.length > 0
          ? `Collection created successfully with ${productIdsToAdd.length} product(s). Products remain in their existing collections.`
          : 'Collection created successfully';

        console.log('✅ [AddCollection] Collection created successfully');
        Alert.alert(
          'Success',
          successMessage,
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
    } catch (error) {
      console.error('❌ [AddCollection] Failed to save collection', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save collection. Please check your internet connection and try again.';
      Alert.alert('Error', errorMessage);
      // Reset both ref and state on error so user can retry
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setCollectionImage(null);
  };

  const handleAddProducts = () => {
    // SmartBiz: Same as categories - navigate to ProductsScreen to add products
    if (!isEditMode || !route?.params?.collectionId) {
      Alert.alert('Add products', 'Please save the collection first, then add products.');
      return;
    }

    navigation.push('Products', {
      collectionId: route.params.collectionId,
      collectionName: collectionName || route?.params?.collectionName,
      addToCollection: true,
      returnScreen: 'AddCollection',
      returnParams: {
        collectionId: route.params.collectionId,
        name: collectionName,
        description: collectionDescription,
        image: collectionImage,
        orderIndex: orderIndex,
        isActive: isActive,
      },
    });
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
          {isEditMode ? 'Edit Collection' : 'Add New Collection'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}>
        {/* Collection Image */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Collection Image</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setPickerOpen(true)}>
            {collectionImage ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{uri: collectionImage}}
                  style={styles.collectionImage}
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
                  <IconSymbol name="add" size={32} color="#1E3A8A" />
                </View>
                <Text style={styles.uploadText}>Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Collection Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Collection Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Collection Name"
            placeholderTextColor="#9CA3AF"
            value={collectionName}
            onChangeText={setCollectionName}
            maxLength={30}
          />
          <Text style={styles.helper}>
            {collectionName.length}/30
          </Text>
        </View>

        {/* Collection Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Collection Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Enter Collection Description"
            placeholderTextColor="#9CA3AF"
            value={collectionDescription}
            onChangeText={setCollectionDescription}
            multiline
            numberOfLines={4}
            maxLength={250}
            textAlignVertical="top"
          />
          <Text style={styles.helper}>
            {collectionDescription.length}/250
          </Text>
        </View>

        {/* SmartBiz: Order Index (same as Category) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Order Index (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter order index (0 = first)"
            placeholderTextColor="#9CA3AF"
            value={orderIndex}
            onChangeText={setOrderIndex}
            keyboardType="numeric"
          />
          <Text style={styles.helper}>
            Lower numbers appear first on website
          </Text>
        </View>

        {/* SmartBiz: Active Status (same as Category) */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.sectionLabel}>Active Status</Text>
            <TouchableOpacity
              style={[styles.switchContainer, isActive && styles.switchContainerActive]}
              onPress={() => setIsActive(!isActive)}>
              <View style={[styles.switchThumb, isActive && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>
            {isActive ? 'Collection is visible on website' : 'Collection is hidden from website'}
          </Text>
        </View>
      </ScrollView>

      {/* Save Button (SmartBiz: same as Category) */}
      <View style={styles.buttonContainer}>
        {isEditMode && (
          <TouchableOpacity
            style={[styles.saveButton, styles.secondaryButton]}
            onPress={handleAddProducts}>
            <Text style={[styles.saveButtonText, styles.secondaryButtonText]}>
              Add Products to Collection
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveButton, (!canSave || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || isSubmitting}>
          <Text
            style={[
              styles.saveButtonText,
              (!canSave || isSubmitting) && styles.saveButtonTextDisabled,
            ]}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Collection' : 'Create Collection'}
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
              <IconSymbol name="camera" size={24} color="#1E3A8A" />
              <Text style={styles.pickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={handleImageLibrary}>
              <IconSymbol name="image" size={24} color="#1E3A8A" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  scrollView: {
    flex: 1, // SmartBiz: same as AddCategoryScreen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A', // SmartBiz: same blue as AddCategoryScreen
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
    paddingBottom: 250, // SmartBiz: same as AddCategoryScreen (for button container + bottom nav)
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
  collectionImage: {
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
    color: '#1E3A8A', // SmartBiz: same blue as AddCategoryScreen
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
  // SmartBiz: Switch styles for Active Status (same as categories would have)
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  switchContainerActive: {
    backgroundColor: '#1E3A8A', // SmartBiz: same blue as header
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
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
    backgroundColor: '#1E3A8A', // SmartBiz: same blue as AddCategoryScreen
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
    borderColor: '#1E3A8A', // SmartBiz: same blue as AddCategoryScreen
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1E3A8A', // SmartBiz: same blue as AddCategoryScreen
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
});

export default AddCollectionScreen;

