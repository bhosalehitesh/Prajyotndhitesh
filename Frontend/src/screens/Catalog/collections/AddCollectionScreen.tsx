import React, {useState} from 'react';
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

interface AddCollectionScreenProps {
  navigation: any;
  route?: any;
}

const AddCollectionScreen: React.FC<AddCollectionScreenProps> = ({
  navigation,
  route,
}) => {
  const isEditMode = route?.params?.collectionId;
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

  // Update selected products when coming back from SelectProducts screen
  React.useEffect(() => {
    if (route?.params?.selectedProducts) {
      setSelectedProducts(route.params.selectedProducts);
    }
  }, [route?.params?.selectedProducts]);

  const canCreate =
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

  const handleCreate = () => {
    if (!canCreate) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Success',
      isEditMode
        ? 'Collection updated successfully'
        : 'Collection created successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const handleRemoveImage = () => {
    setCollectionImage(null);
  };

  const handleAddProducts = () => {
    navigation.navigate('SelectProducts', {
      collectionId: route?.params?.collectionId,
      selectedProductIds: route?.params?.selectedProductIds || [],
      returnScreen: 'AddCollection',
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

      <ScrollView contentContainerStyle={styles.content}>
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
                  <IconSymbol name="add" size={32} color="#e61580" />
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
          <View style={styles.inputWithCounter}>
            <TextInput
              style={styles.input}
              placeholder="Enter Collection Name"
              placeholderTextColor="#9CA3AF"
              value={collectionName}
              onChangeText={setCollectionName}
              maxLength={30}
            />
            <Text style={styles.counter}>
              {collectionName.length} / 30
            </Text>
          </View>
        </View>

        {/* Collection Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Collection Description</Text>
          <View style={styles.textareaWrapper}>
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
            <Text style={styles.counter}>
              {collectionDescription.length} / 250
            </Text>
          </View>
        </View>

        {/* Add Products to Collection */}
        <View style={styles.section}>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.addProductsRow}
            onPress={handleAddProducts}>
            <Text style={styles.addProductsText}>Add products to Collection</Text>
            <IconSymbol name="chevron-forward" size={20} color="#e61580" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Collection Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate}>
          <Text
            style={[
              styles.createButtonText,
              !canCreate && styles.createButtonTextDisabled,
            ]}>
            Create Collection
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
  content: {
    padding: 16,
    paddingBottom: 100,
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
    color: '#e61580',
  },
  inputWithCounter: {
    position: 'relative',
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
  counter: {
    position: 'absolute',
    right: 16,
    top: 12,
    fontSize: 12,
    color: '#9CA3AF',
  },
  textareaWrapper: {
    position: 'relative',
  },
  textarea: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  addProductsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addProductsText: {
    fontSize: 16,
    color: '#e61580',
    fontWeight: '500',
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
  createButton: {
    backgroundColor: '#e61580',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButtonTextDisabled: {
    color: '#E5E7EB',
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

