import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Linking, 
  Alert, 
  Modal, 
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { uploadStoreLogo, getStoreBySellerId, saveStoreDetails } from '../../../../utils/api';
import { storage } from '../../../../authentication/storage';

export default function StoreAppearanceScreen({ onBack }: { onBack: () => void }) {
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadLogoModalOpen, setUploadLogoModalOpen] = useState(false);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [storeExists, setStoreExists] = useState<boolean>(false);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    loadSellerIdAndLogo();
  }, []);

  const loadSellerIdAndLogo = async () => {
    try {
      setLoadingStore(true);
      const id = await storage.getItem('userId');
      console.log('Loading seller ID and logo, userId from storage:', id);
      
      if (id) {
        const sellerIdNum = parseInt(id, 10);
        if (!isNaN(sellerIdNum)) {
          setSellerId(sellerIdNum);
          console.log('Checking for store with sellerId:', sellerIdNum);
          
          // Load existing logo from store - validate store has storeId
          const store = await getStoreBySellerId(sellerIdNum);
          console.log('Store fetch result:', store ? { storeId: store.storeId, storeName: store.storeName, hasLogo: !!store.logoUrl } : 'null');
          
          if (store && store.storeId) {
            setStoreExists(true);
            console.log('✅ Store exists! StoreId:', store.storeId, 'StoreName:', store.storeName);
            if (store.logoUrl) {
              console.log('✅ Found logo in database:', store.logoUrl);
              setLogoUri(store.logoUrl);
              // Also save to storage for fallback
              await storage.setItem('storeLogoUrl', store.logoUrl);
            } else {
              console.log('ℹ️ Store exists but no logo yet');
            }
          } else {
            setStoreExists(false);
            console.warn('❌ Store not found for sellerId:', sellerIdNum);
            console.warn('⚠️ You need to complete store setup (onboarding) first!');
            // Check if logo exists in storage as fallback
            const storedLogo = await storage.getItem('storeLogoUrl');
            if (storedLogo) {
              console.log('Found stored logo (store not created yet):', storedLogo);
              setLogoUri(storedLogo);
            }
          }
        } else {
          console.error('Invalid userId:', id);
        }
      } else {
        console.warn('No userId found in storage');
      }
    } catch (error) {
      console.error('Error loading seller ID:', error);
      setStoreExists(false);
    } finally {
      setLoadingStore(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
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
    }
    return true;
  };

  const handleUploadFromGallery = async () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image size should be less than 5MB');
          return;
        }
        setLogoUri(asset.uri || null);
        setHasChanges(true);
        setUploadLogoModalOpen(false);
      }
    });
  };

  const handleCaptureFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to capture image');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Image size should be less than 5MB');
          return;
        }
        setLogoUri(asset.uri || null);
        setHasChanges(true);
        setUploadLogoModalOpen(false);
      }
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('Info', 'No changes to save');
      return;
    }

    // Check if store exists before uploading logo
    if (logoUri && sellerId && !logoUri.startsWith('http')) {
      // First check storeExists state (from initial load)
      if (!storeExists) {
        Alert.alert(
          'Store Not Found',
          'Please complete your store setup first before uploading a logo. Go to onboarding to create your store.',
          [{ text: 'OK' }]
        );
        setHasChanges(false); // Reset changes flag
        return;
      }

      // Double-check: verify store exists with valid storeId before attempting upload
      console.log('Verifying store exists before upload, sellerId:', sellerId);
      const store = await getStoreBySellerId(sellerId!);
      console.log('Store verification result:', store ? { storeId: store.storeId, storeName: store.storeName } : 'null');
      
      if (!store || !store.storeId) {
        console.error('❌ Cannot upload logo - Store does not exist!');
        console.error('SellerId:', sellerId, 'Store:', store);
        Alert.alert(
          'Store Not Found',
          'You need to complete your store setup first!\n\n' +
          'Steps:\n' +
          '1. Complete the onboarding process\n' +
          '2. Create your store\n' +
          '3. Then come back to upload your logo\n\n' +
          'The logo must be saved to the database, which requires a store to exist.',
          [{ text: 'OK' }]
        );
        setStoreExists(false); // Update state
        setHasChanges(false); // Reset changes flag
        return;
      }
      
      console.log('✅ Store verified! Proceeding with logo upload...');

      // Double-check: verify store exists before attempting upload
      console.log('Store found, proceeding with upload:', { storeId: store.storeId, storeName: store.storeName });
      setUploading(true);
      try {
        console.log('Uploading logo:', { sellerId, logoUri: logoUri.substring(0, 50) });
        const result = await uploadStoreLogo(sellerId, logoUri);
        console.log('Upload result:', result);
        
        if (result.success && result.logoUrl) {
          console.log('✅ Logo uploaded successfully, logoUrl:', result.logoUrl);
          console.log('✅ Logo saved to database (storeId:', result.storeId, ')');
          setLogoUri(result.logoUrl);
          // Save logo URL to local storage as backup/cache
          await storage.setItem('storeLogoUrl', result.logoUrl);
          console.log('✅ Logo URL also cached locally:', result.logoUrl);
          
          // Reload store to verify logo was saved to database
          const updatedStore = await getStoreBySellerId(sellerId!);
          if (updatedStore && updatedStore.logoUrl) {
            console.log('✅ Verified logo in database:', updatedStore.logoUrl);
            if (updatedStore.logoUrl === result.logoUrl) {
              console.log('✅ Logo URL matches - database save confirmed!');
            }
          } else {
            console.warn('⚠️ Logo not found in database after upload - please check backend');
          }
          
          Alert.alert('Success', 'Logo uploaded and saved to database successfully! It will appear on your home screen.');
          setHasChanges(false);
        } else {
          const errorMsg = result.message || 'Failed to upload logo. Please try again.';
          
          // Show helpful message if store doesn't exist (use console.warn instead of console.error)
          if (errorMsg.includes('Store not found') || errorMsg.includes('store not found') || errorMsg.includes('create a store')) {
            console.warn('Upload failed (store not found):', errorMsg);
            Alert.alert(
              'Store Not Found',
              'Please complete your store setup first before uploading a logo. Go to onboarding to create your store.',
              [{ text: 'OK' }]
            );
          } else {
            console.error('Upload failed:', errorMsg);
            Alert.alert('Error', errorMsg);
          }
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to upload logo. Please check your connection.';
        if (errorMsg.includes('Store not found') || errorMsg.includes('store not found') || errorMsg.includes('create a store')) {
          console.warn('Upload exception (store not found):', errorMsg);
          Alert.alert(
            'Store Not Found',
            'Please complete your store setup first before uploading a logo. Go to onboarding to create your store.',
            [{ text: 'OK' }]
          );
        } else {
          console.error('Upload exception:', error);
          Alert.alert('Error', errorMsg);
        }
      } finally {
        setUploading(false);
      }
    } else if (logoUri && logoUri.startsWith('http')) {
      // Logo already uploaded (has http URL), just save
      Alert.alert('Success', 'Settings saved successfully');
      setHasChanges(false);
    } else {
      Alert.alert('Success', 'Settings saved successfully');
      setHasChanges(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Website Appearance</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>
            Want to take more control of your store's appearance?
          </Text>
          <Text style={styles.infoCardText}>
            Unlock endless customization possibilities for your store with our Desktop Themes Editor.
            Edit layouts, widgets, images, and more!
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.sakhi.store/store-appearance')}>
            <Text style={styles.infoLink}>
              Visit sakhi.store/store-appearance for more!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Showcase Theme Section */}
        <View style={styles.themeCard}>
          <View style={styles.themeHeader}>
            <View style={styles.themeTitleContainer}>
              <Text style={styles.themeCardTitle}>Showcase</Text>
              <Text style={styles.themeCardSubtitle}>Suites All Categories</Text>
            </View>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT THEME</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewDemoLink}>
            <Text style={styles.viewDemoText}>View Demo Store</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#e61580" />
          </TouchableOpacity>

          {/* Theme Preview Image */}
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800' }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity style={styles.previewButton}>
            <Text style={styles.previewButtonText}>Preview Published Website</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoCard}>
          <Text style={styles.logoTitle}>Logo</Text>
          <Text style={styles.logoSubtitle}>Personalise your store's identity with your logo.</Text>
          
          {loadingStore ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e61580" />
              <Text style={styles.loadingText}>Checking store status...</Text>
            </View>
          ) : !storeExists ? (
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#f59e0b" />
              <Text style={styles.warningText}>
                Store not found! You need to create your store first.
              </Text>
              <Text style={styles.warningSubtext}>
                Complete onboarding to create your store, then upload your logo.
              </Text>
              <TouchableOpacity 
                style={styles.createStoreButton}
                onPress={async () => {
                  try {
                    const storedStoreName = await storage.getItem('storeName') || 'My Store';
                    const storedStoreLink = await storage.getItem('storeLink') || 'sakhi.store/mystore';
                    console.log('Creating store with:', { storeName: storedStoreName, storeLink: storedStoreLink });
                    await saveStoreDetails(storedStoreName, storedStoreLink);
                    console.log('✅ Store created successfully!');
                    // Reload to check for store
                    await loadSellerIdAndLogo();
                    Alert.alert('Success', 'Store created! You can now upload your logo.');
                  } catch (error: any) {
                    console.error('Failed to create store:', error);
                    Alert.alert('Error', error.message || 'Failed to create store. Please complete onboarding first.');
                  }
                }}
              >
                <Text style={styles.createStoreButtonText}>Create Store Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Show uploaded logo if available */}
              {logoUri && (
                <View style={styles.logoPreviewContainer}>
                  <Image
                    source={{ uri: logoUri }}
                    style={styles.logoPreview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.removeLogoButton}
                    onPress={() => {
                      setLogoUri(null);
                      setHasChanges(true);
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => setUploadLogoModalOpen(true)}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#e61580" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="plus" size={24} color="#e61580" />
                    <Text style={styles.uploadButtonText}>
                      {logoUri ? 'Change Logo' : 'Upload Logo'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, (!hasChanges || uploading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <Modal
        visible={uploadLogoModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUploadLogoModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Logo</Text>
              <TouchableOpacity onPress={() => setUploadLogoModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleUploadFromGallery}>
              <MaterialCommunityIcons name="image" size={24} color="#e61580" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleCaptureFromCamera}>
              <MaterialCommunityIcons name="camera" size={24} color="#e61580" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setUploadLogoModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#B8E6D3',
    borderRadius: 12,
    padding: 18,
    margin: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoLink: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  themeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginTop: 8,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  themeTitleContainer: {
    flex: 1,
  },
  themeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  themeCardSubtitle: {
    fontSize: 15,
    color: '#858997',
  },
  currentBadge: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewDemoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewDemoText: {
    fontSize: 16,
    color: '#e61580',
    fontWeight: '600',
    marginRight: 4,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5fa',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewButton: {
    borderWidth: 2,
    borderColor: '#4361ee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  logoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginTop: 8,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 15,
    color: '#858997',
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#e61580',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e61580',
    marginLeft: 8,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  saveButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  logoPreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5fa',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  removeLogoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  modalCancelButton: {
    padding: 20,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningText: {
    marginTop: 8,
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
  },
  warningSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#78350f',
    textAlign: 'center',
  },
  createStoreButton: {
    marginTop: 12,
    backgroundColor: '#e61580',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createStoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  warningSubtextOld: {
    marginTop: 4,
    fontSize: 12,
    color: '#78350f',
    textAlign: 'center',
  },
});

