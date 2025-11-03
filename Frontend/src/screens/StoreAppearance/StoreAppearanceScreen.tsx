/**
 * Store Appearance / Website Appearance Screen
 * 
 * Allows shopkeepers to customize their store's website appearance,
 * upload logo, and preview their store.
 */

import React, {useState} from 'react';
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
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import {PermissionsAndroid, Platform} from 'react-native';

interface StoreAppearanceScreenProps {
  navigation: any;
}

const StoreAppearanceScreen: React.FC<StoreAppearanceScreenProps> = ({
  navigation,
}) => {
  const [uploadLogoModalOpen, setUploadLogoModalOpen] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewDemoStore = () => {
    const url = 'https://sakhi.amazon.in/store-appearance';
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

  const handleSave = () => {
    // TODO: Save logo and other settings to backend
    Alert.alert('Success', 'Settings saved successfully');
    setHasChanges(false);
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
              Linking.openURL('https://sakhi.amazon.in/store-appearance')
            }>
            <Text style={styles.infoBannerLink}>
              Visit sakhi.amazon.in/store-appearance for more!
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

          <TouchableOpacity
            onPress={handleViewDemoStore}
            style={styles.demoLink}>
            <Text style={styles.demoLinkText}>View Demo Store →</Text>
          </TouchableOpacity>

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
                <Text style={styles.previewTitle}>
                  Discover Our Hand-Knitted Creations
                </Text>
                <TouchableOpacity style={styles.shopNowButton}>
                  <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
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
                  <Text style={styles.mobilePreviewTitle}>
                    Discover Our Hand-Knitted Creations
                  </Text>
                  <TouchableOpacity style={styles.mobileShopNowButton}>
                    <Text style={styles.mobileShopNowText}>Shop Now</Text>
                  </TouchableOpacity>
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
            !hasChanges && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges}>
          <Text
            style={[
              styles.saveButtonText,
              !hasChanges && styles.saveButtonTextDisabled,
            ]}>
            Save
          </Text>
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
  demoLink: {
    marginBottom: 16,
  },
  demoLinkText: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
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
    padding: 40,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
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
    padding: 16,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  mobilePreviewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
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
});

export default StoreAppearanceScreen;

