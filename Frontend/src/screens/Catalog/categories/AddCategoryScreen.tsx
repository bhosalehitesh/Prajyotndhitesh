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

interface AddCategoryScreenProps {
  navigation: any;
  route?: any;
}

const AddCategoryScreen: React.FC<AddCategoryScreenProps> = ({
  navigation,
  route,
}) => {
  const isEditMode = route?.params?.categoryId;
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

  const handleSave = () => {
    if (!canSave) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Here you would typically save the category to your backend/state
    Alert.alert(
      'Success',
      isEditMode
        ? 'Category updated successfully'
        : 'Category created successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
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

      <ScrollView contentContainerStyle={styles.content}>
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
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}>
          <Text
            style={[
              styles.saveButtonText,
              !canSave && styles.saveButtonTextDisabled,
            ]}>
            Save
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
    backgroundColor: '#f8f9fa',
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

