/**
 * Store Appearance / Website Appearance Screen
 * 
 * Allows shopkeepers to customize their store's website appearance,
 * upload logo, and preview their store.
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  uploadStoreLogo,
  getStoreBySellerId,
  getBannersBySellerId,
  createBannerWithImage,
  updateBanner,
  updateBannerImage,
  deleteBanner,
  BannerResponse,
} from '../../utils/api';
import {storage} from '../../authentication/storage';

interface StoreAppearanceScreenProps {
  navigation: any;
}

interface BannerData {
  imageUri: string | null;
  title: string;
  buttonText: string;
}

const StoreAppearanceScreen: React.FC<StoreAppearanceScreenProps> = ({
  navigation,
}) => {
  const [uploadLogoModalOpen, setUploadLogoModalOpen] = useState(false);
  const [editBannerModalOpen, setEditBannerModalOpen] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [bannerData, setBannerData] = useState<BannerData>({
    imageUri: null,
    title: 'Discover Our Hand-Knitted Creations',
    buttonText: 'Shop Now',
  });
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [sellerId, setSellerId] = useState<number | null>(null);

  // Load seller ID and existing logo/banner on mount
  useEffect(() => {
    loadSellerIdAndLogo();
  }, []);

  // Load banners when sellerId is available
  useEffect(() => {
    if (sellerId) {
      loadBanners();
    }
  }, [sellerId]);

  const loadSellerIdAndLogo = async () => {
    try {
      const id = await storage.getItem('userId');
      if (id) {
        const sellerIdNum = parseInt(id, 10);
        if (!isNaN(sellerIdNum)) {
          setSellerId(sellerIdNum);
          // Load existing logo from store
          const store = await getStoreBySellerId(sellerIdNum);
          if (store?.logoUrl) {
            setLogoUri(store.logoUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error loading seller ID:', error);
    }
  };

  const loadBanners = async () => {
    if (!sellerId) return;
    
    setLoadingBanners(true);
    try {
      console.log('Loading banners for sellerId:', sellerId);
      const fetchedBanners = await getBannersBySellerId(sellerId, false);
      console.log('Fetched banners:', fetchedBanners);
      setBanners(fetchedBanners);
      
      // Load the first active banner, or first banner if none are active
      if (fetchedBanners.length > 0) {
        const activeBanner = fetchedBanners.find(b => b.isActive) || fetchedBanners[0];
        console.log('Setting banner data:', {
          bannerId: activeBanner.bannerId,
          imageUrl: activeBanner.imageUrl,
          title: activeBanner.title,
          buttonText: activeBanner.buttonText,
        });
        
        if (activeBanner.imageUrl) {
          setBannerData({
            bannerId: activeBanner.bannerId,
            imageUri: null,
            imageUrl: activeBanner.imageUrl,
            title: activeBanner.title || 'Discover Our Hand-Knitted Creations',
            buttonText: activeBanner.buttonText || 'Shop Now',
            buttonLink: activeBanner.buttonLink,
          });
          setCurrentBannerIndex(fetchedBanners.indexOf(activeBanner));
        } else {
          console.warn('Banner found but imageUrl is missing:', activeBanner);
          setBannerData({
            bannerId: activeBanner.bannerId,
            imageUri: null,
            imageUrl: undefined,
            title: activeBanner.title || 'Discover Our Hand-Knitted Creations',
            buttonText: activeBanner.buttonText || 'Shop Now',
            buttonLink: activeBanner.buttonLink,
          });
        }
      } else {
        console.log('No banners found for sellerId:', sellerId);
        // Reset to default if no banners
        setBannerData({
          imageUri: null,
          imageUrl: undefined,
          title: 'Discover Our Hand-Knitted Creations',
          buttonText: 'Shop Now',
        });
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewDemoStore = () => {
    const url = 'https://www.sakhi.store/store-appearance';
    Linking.openURL(url).catch(err =>
      console.error('Error opening URL:', err),
    );
  };

  const handlePreviewPublishedWebsite = () => {
    // Navigate to preview or open URL
    Alert.alert('Preview', 'Preview functionality will be implemented');
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
      maxWidth: 180,
      maxHeight: 180,
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
      maxWidth: 180,
      maxHeight: 180,
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

  const handleBannerImageSelect = async (uri: string | null) => {
    if (uri) {
      setBannerData(prev => ({...prev, imageUri: uri}));
      setHasChanges(true);
    }
  };

  const handleBannerTitleChange = (text: string) => {
    setBannerData(prev => ({...prev, title: text}));
    setHasChanges(true);
  };

  const handleBannerButtonTextChange = (text: string) => {
    setBannerData(prev => ({...prev, buttonText: text}));
    setHasChanges(true);
  };

  const handleUploadBannerFromGallery = async () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 461,
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
        handleBannerImageSelect(asset.uri || null);
        setEditBannerModalOpen(false);
      }
    });
  };

  const handleCaptureBannerFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 461,
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
        handleBannerImageSelect(asset.uri || null);
        setEditBannerModalOpen(false);
      }
    });
  };

  const handleSave = async () => {
    if (!hasChanges || !sellerId) {
      return;
    }

    setUploading(true);
    try {
      // Save logo if changed
      if (logoUri && !logoUri.startsWith('http')) {
        console.log('Uploading logo:', { sellerId, logoUri: logoUri.substring(0, 50) });
        const result = await uploadStoreLogo(sellerId, logoUri);
        console.log('Upload result:', result);
        
        if (result.success && result.logoUrl) {
          setLogoUri(result.logoUrl);
          await storage.setItem('storeLogoUrl', result.logoUrl);
        } else {
          const errorMsg = result.message || 'Failed to upload logo. Please try again.';
          console.error('Upload failed:', errorMsg);
          Alert.alert('Error', errorMsg);
          setUploading(false);
          return;
        }
      }

      // Save banner data to API
      if (bannerData.bannerId) {
        // Update existing banner
        if (bannerData.imageUri && !bannerData.imageUri.startsWith('http')) {
          // Upload new image
          const imageResult = await updateBannerImage(bannerData.bannerId, bannerData.imageUri);
          if (!imageResult.success) {
            Alert.alert('Error', imageResult.message || 'Failed to update banner image');
            setUploading(false);
            return;
          }
          
          // Update bannerData with the new imageUrl from server
          if (imageResult.banner) {
            setBannerData(prev => ({
              ...prev,
              imageUri: null,
              imageUrl: imageResult.banner!.imageUrl,
            }));
          }
        }

        // Update banner text fields (and imageUrl if image was just uploaded)
        const updateResult = await updateBanner(bannerData.bannerId, {
          imageUrl: bannerData.imageUri && !bannerData.imageUri.startsWith('http') 
            ? undefined // Image was uploaded separately, don't update here
            : bannerData.imageUrl,
          title: bannerData.title,
          buttonText: bannerData.buttonText,
          buttonLink: bannerData.buttonLink,
        });

        if (!updateResult.success) {
          Alert.alert('Error', updateResult.message || 'Failed to update banner');
          setUploading(false);
          return;
        }
        
        // Update bannerData with the updated banner's imageUrl if image was uploaded
        if (bannerData.imageUri && !bannerData.imageUri.startsWith('http') && updateResult.banner) {
          setBannerData(prev => ({
            ...prev,
            imageUri: null,
            imageUrl: updateResult.banner!.imageUrl,
          }));
        } else if (updateResult.banner) {
          // Update with latest banner data even if image wasn't changed
          setBannerData(prev => ({
            ...prev,
            imageUrl: updateResult.banner!.imageUrl || prev.imageUrl,
            title: updateResult.banner!.title || prev.title,
            buttonText: updateResult.banner!.buttonText || prev.buttonText,
            buttonLink: updateResult.banner!.buttonLink || prev.buttonLink,
          }));
        }
      } else if (bannerData.imageUri) {
        // Create new banner
        const createResult = await createBannerWithImage({
          sellerId,
          imageUri: bannerData.imageUri,
          title: bannerData.title,
          buttonText: bannerData.buttonText,
          buttonLink: bannerData.buttonLink,
          displayOrder: 0,
        });

        if (!createResult.success) {
          Alert.alert('Error', createResult.message || 'Failed to create banner');
          setUploading(false);
          return;
        }
        
        // Update bannerData with the created banner's data
        if (createResult.banner) {
          setBannerData(prev => ({
            ...prev,
            bannerId: createResult.banner!.bannerId,
            imageUri: null,
            imageUrl: createResult.banner!.imageUrl,
          }));
        }
      }

      // Reload banners to get updated data
      await loadBanners();

      Alert.alert('Success', 'Settings saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Save exception:', error);
      Alert.alert('Error', error.message || 'Failed to save settings. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Website Appearance</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Information Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Unlock endless customization possibilities for your store with our
            Desktop Themes Editor. Edit layouts, widgets, images, and more!
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://www.sakhi.store/store-appearance')
            }>
            <Text style={styles.infoBannerLink}>
              Visit sakhi.store/store-appearance for more!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Showcase Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Showcase</Text>
              <Text style={styles.themeName}>Suites All Categories</Text>
            </View>
            <View style={styles.currentThemeBadge}>
              <Text style={styles.currentThemeText}>CURRENT THEME</Text>
            </View>
          </View>

          <View style={styles.demoLinkContainer}>
            <TouchableOpacity
              onPress={handleViewDemoStore}
              style={styles.demoLink}>
              <Text style={styles.demoLinkText}>View Demo Store →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEditBannerModalOpen(true)}
              style={styles.editBannerButton}>
              <IconSymbol name="pencil" size={16} color="#e61580" />
              <Text style={styles.editBannerText}>Edit Banner</Text>
            </TouchableOpacity>
          </View>

          {/* Website Preview */}
          <View style={styles.previewContainer}>
            {/* Desktop Preview */}
            <View style={styles.desktopPreview}>
              <View style={styles.desktopHeader}>
                <View style={styles.desktopLogo}>
                  <Text style={styles.desktopLogoText}>Keep It All</Text>
                </View>
                <View style={styles.desktopNav}>
                  <Text style={styles.desktopNavItem}>Featured Products</Text>
                  <Text style={styles.desktopNavItem}>Categories</Text>
                  <Text style={styles.desktopNavItem}>All Products</Text>
                  <Text style={styles.desktopNavItem}>Collections</Text>
                  <Text style={styles.desktopNavItem}>Sign In</Text>
                </View>
              </View>
              <View style={styles.desktopContent}>
                {loadingBanners ? (
                  <ActivityIndicator size="large" color="#e61580" />
                ) : (bannerData.imageUri || bannerData.imageUrl) ? (
                  <Image 
                    source={{uri: bannerData.imageUri || bannerData.imageUrl || ''}} 
                    style={styles.bannerImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('Error loading banner image:', error);
                      console.log('Image URI:', bannerData.imageUri);
                      console.log('Image URL:', bannerData.imageUrl);
                    }}
                    onLoad={() => {
                      console.log('Banner image loaded successfully:', bannerData.imageUri || bannerData.imageUrl);
                    }}
                  />
                ) : (
                  <View style={styles.bannerPlaceholder} />
                )}
                <View style={styles.bannerTextOverlay}>
                  <TouchableOpacity
                    style={styles.editTextButton}
                    onPress={() => setEditBannerModalOpen(true)}>
                    <IconSymbol name="pencil" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.previewTitle}>
                    {bannerData.title}
                  </Text>
                  <TouchableOpacity style={styles.shopNowButton}>
                    <Text style={styles.shopNowText}>{bannerData.buttonText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Mobile Preview Overlay */}
            <View style={styles.mobilePreviewOverlay}>
              <View style={styles.mobilePreview}>
                <View style={styles.mobileHeader}>
                  <View style={styles.mobileLogo}>
                    <Text style={styles.mobileLogoText}>Keep It All</Text>
                  </View>
                </View>
                <View style={styles.mobileContent}>
                  {loadingBanners ? (
                    <ActivityIndicator size="small" color="#e61580" />
                  ) : (bannerData.imageUri || bannerData.imageUrl) ? (
                    <Image 
                      source={{uri: bannerData.imageUri || bannerData.imageUrl || ''}} 
                      style={styles.mobileBannerImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.error('Error loading mobile banner image:', error);
                      }}
                    />
                  ) : null}
                  <View style={styles.mobileBannerTextOverlay}>
                    <TouchableOpacity
                      style={styles.editTextButtonSmall}
                      onPress={() => setEditBannerModalOpen(true)}>
                      <IconSymbol name="pencil" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.mobilePreviewTitle}>
                      {bannerData.title}
                    </Text>
                    <TouchableOpacity style={styles.mobileShopNowButton}>
                      <Text style={styles.mobileShopNowText}>{bannerData.buttonText}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePreviewPublishedWebsite}>
            <Text style={styles.previewButtonText}>Preview Published Website</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo</Text>
          <Text style={styles.logoDescription}>
            Personalise your store's identity with your logo.
          </Text>

          {logoUri ? (
            <View style={styles.logoPreviewContainer}>
              <Image source={{uri: logoUri}} style={styles.logoPreview} />
              <TouchableOpacity
                style={styles.changeLogoButton}
                onPress={() => setUploadLogoModalOpen(true)}>
                <IconSymbol name="pencil" size={16} color="#e61580" />
                <Text style={styles.changeLogoText}>Change Logo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadLogoButton}
              onPress={() => setUploadLogoModalOpen(true)}>
              <IconSymbol name="add" size={24} color="#e61580" />
              <Text style={styles.uploadLogoText}>Upload Logo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || uploading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                (!hasChanges || uploading) && styles.saveButtonTextDisabled,
              ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Upload Logo Modal */}
      <Modal
        transparent
        visible={uploadLogoModalOpen}
        animationType="slide"
        onRequestClose={() => setUploadLogoModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Logo</Text>
              <TouchableOpacity onPress={() => setUploadLogoModalOpen(false)}>
                <IconSymbol name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Personalise your store's identity with your logo.
              </Text>
              <Text style={styles.modalInstructions}>
                Make sure image size is less than 5MB
              </Text>
              <Text style={styles.modalInstructions}>
                Minimum size for the logo should be 180px (width) x 180px
                (height)
              </Text>

              <TouchableOpacity
                style={styles.modalUploadButton}
                onPress={handleUploadFromGallery}>
                <Text style={styles.modalUploadButtonText}>
                  Upload From Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCameraButton}
                onPress={handleCaptureFromCamera}>
                <Text style={styles.modalCameraButtonText}>
                  Capture Using Camera
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Banner Modal */}
      <Modal
        transparent
        visible={editBannerModalOpen}
        animationType="slide"
        onRequestClose={() => setEditBannerModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Banner</Text>
              <TouchableOpacity onPress={() => setEditBannerModalOpen(false)}>
                <IconSymbol name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                Customize your website banner. Edit the image (1600x461px), title text, button text, and link.
              </Text>

              {/* Banner Image Preview */}
              {(bannerData.imageUri || bannerData.imageUrl) && (
                <View style={styles.bannerPreviewContainer}>
                  <Image 
                    source={{uri: bannerData.imageUri || bannerData.imageUrl || ''}} 
                    style={styles.bannerPreviewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeBannerButton}
                    onPress={() => {
                      handleBannerImageSelect(null);
                      setBannerData(prev => ({...prev, imageUrl: undefined}));
                    }}>
                    <IconSymbol name="trash" size={16} color="#FFFFFF" />
                    <Text style={styles.removeBannerText}>Remove Image</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Banner Image Upload */}
              <Text style={styles.modalSectionTitle}>Banner Image</Text>
              <Text style={styles.modalInstructions}>
                Required size: 1600x461px (width x height)
              </Text>
              <Text style={styles.modalInstructions}>
                Maximum file size: 5MB
              </Text>
              <Text style={[styles.modalInstructions, {fontStyle: 'italic', color: '#64748B'}]}>
                For best results, use an image with this exact dimension
              </Text>

              {!bannerData.imageUri && (
                <>
                  <TouchableOpacity
                    style={styles.modalUploadButton}
                    onPress={handleUploadBannerFromGallery}>
                    <Text style={styles.modalUploadButtonText}>
                      Upload From Gallery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCameraButton}
                    onPress={handleCaptureBannerFromCamera}>
                    <Text style={styles.modalCameraButtonText}>
                      Capture Using Camera
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Banner Title */}
              <Text style={styles.modalSectionTitle}>Banner Title</Text>
              <Text style={styles.modalInstructions}>
                This text will appear on your website banner
              </Text>
              <TextInput
                style={styles.modalTextInput}
                value={bannerData.title}
                onChangeText={handleBannerTitleChange}
                placeholder="Enter banner title (e.g., Discover Our Hand-Knitted Creations)"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={100}
              />

              {/* Button Text */}
              <Text style={styles.modalSectionTitle}>Button Text</Text>
              <Text style={styles.modalInstructions}>
                Text displayed on the call-to-action button
              </Text>
              <TextInput
                style={styles.modalTextInput}
                value={bannerData.buttonText}
                onChangeText={handleBannerButtonTextChange}
                placeholder="Enter button text (e.g., Shop Now)"
                placeholderTextColor="#94A3B8"
                maxLength={30}
              />

              {/* Button Link (Optional) */}
              <Text style={styles.modalSectionTitle}>Button Link (Optional)</Text>
              <Text style={styles.modalInstructions}>
                URL where the button will navigate (e.g., /products, /collections)
              </Text>
              <TextInput
                style={styles.modalTextInput}
                value={bannerData.buttonLink || ''}
                onChangeText={(text) => {
                  setBannerData(prev => ({...prev, buttonLink: text}));
                  setHasChanges(true);
                }}
                placeholder="Enter link URL (e.g., /products or /collections)"
                placeholderTextColor="#94A3B8"
                maxLength={500}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  infoBanner: {
    backgroundColor: '#FCE4EC',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoBannerLink: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  themeName: {
    fontSize: 14,
    color: '#64748B',
  },
  currentThemeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentThemeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  demoLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  demoLink: {
    flex: 1,
  },
  demoLinkText: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
  },
  editBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e61580',
    backgroundColor: '#FFFFFF',
  },
  editBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e61580',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    overflow: 'visible',
  },
  desktopPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e61580',
  },
  desktopLogo: {
    flex: 1,
  },
  desktopLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  desktopNav: {
    flexDirection: 'row',
    gap: 16,
  },
  desktopNavItem: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  desktopContent: {
    padding: 0,
    alignItems: 'center',
    aspectRatio: 1600 / 461, // Maintain 1600x461 aspect ratio for banner
    minHeight: 200,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerPlaceholder: {
    width: '100%',
    aspectRatio: 1600 / 461, // Maintain 1600x461 aspect ratio
    backgroundColor: '#e61580',
    minHeight: 200,
  },
  bannerTextOverlay: {
    position: 'relative',
    zIndex: 1,
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  editTextButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  editTextButtonSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  shopNowButton: {
    backgroundColor: '#e61580',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mobilePreviewOverlay: {
    position: 'absolute',
    right: 16,
    top: 80,
    zIndex: 10,
  },
  mobilePreview: {
    width: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mobileHeader: {
    backgroundColor: '#e61580',
    padding: 8,
    alignItems: 'center',
  },
  mobileLogo: {
    alignItems: 'center',
  },
  mobileLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mobileContent: {
    padding: 0,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mobileBannerImage: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mobileBannerTextOverlay: {
    position: 'relative',
    zIndex: 1,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  mobilePreviewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  mobileShopNowButton: {
    backgroundColor: '#e61580',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  mobileShopNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewButton: {
    borderWidth: 2,
    borderColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e61580',
  },
  logoDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  uploadLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e61580',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 8,
  },
  uploadLogoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e61580',
  },
  logoPreviewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoPreview: {
    width: 180,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  changeLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e61580',
  },
  changeLogoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e61580',
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#FCE4EC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#F8BBD9',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  modalInstructions: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  modalUploadButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  modalUploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCameraButton: {
    borderWidth: 2,
    borderColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e61580',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    minHeight: 44,
  },
  bannerPreviewContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerPreviewImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F1F5F9',
  },
  removeBannerButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeBannerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default StoreAppearanceScreen;

