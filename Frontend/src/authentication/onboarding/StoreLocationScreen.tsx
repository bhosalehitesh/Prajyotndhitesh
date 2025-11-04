import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreLocationScreenProps {
  onNext: (address: {
    addressLine1: string;
    addressLine2: string;
    landmark?: string;
  }) => void;
  onBack?: () => void;
}

const StoreLocationScreen: React.FC<StoreLocationScreenProps> = ({ onNext, onBack }) => {
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');

  const handleUseCurrentLocation = () => {
    Alert.alert(
      'Location Access',
      'Please allow location access to use your current location.',
      [{ text: 'OK' }]
    );
  };

  const handleNext = () => {
    if (addressLine1.trim().length === 0 || addressLine2.trim().length === 0) {
      Alert.alert('Validation', 'Please fill in all required address fields.');
      return;
    }
    onNext({
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      landmark: landmark.trim() || undefined,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="store" size={24} color="#1a1a1a" />
              <Text style={styles.logoText}>
                smart<Text style={styles.logoTextAccent}>biz</Text>
              </Text>
            </View>
            <View style={styles.headerLinks}>
              <TouchableOpacity style={styles.headerLink}>
                <MaterialCommunityIcons name="help-circle-outline" size={18} color="#007185" />
                <Text style={styles.headerLinkText}>Help</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerLink}>
                <MaterialCommunityIcons name="logout" size={18} color="#007185" />
                <Text style={styles.headerLinkText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialCommunityIcons name="chevron-left" size={20} color="#1a1a1a" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.title}>Where is your store located?</Text>
            <Text style={styles.subtitle}>
              Feel free to change your shop location at any time from your profile.
            </Text>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleUseCurrentLocation}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#007185" />
              <Text style={styles.locationButtonText}>Use my current location</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Shop No, Building, Company, Apartment*
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Address Line 1"
                placeholderTextColor="#9ca3af"
                value={addressLine1}
                onChangeText={setAddressLine1}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Area, Street, Sector, Village*</Text>
              <TextInput
                style={styles.input}
                placeholder="Address Line 2"
                placeholderTextColor="#9ca3af"
                value={addressLine2}
                onChangeText={setAddressLine2}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Landmark (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Landmark"
                placeholderTextColor="#9ca3af"
                value={landmark}
                onChangeText={setLandmark}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                (addressLine1.trim().length === 0 || addressLine2.trim().length === 0) &&
                  styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={addressLine1.trim().length === 0 || addressLine2.trim().length === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Support */}
          <TouchableOpacity style={styles.chatButton}>
            <MaterialCommunityIcons name="message-text" size={24} color="#ffffff" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  logoTextAccent: {
    color: '#22b0a7',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  headerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLinkText: {
    fontSize: 14,
    color: '#007185',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    marginTop: 16,
    padding: Math.max(20, SCREEN_WIDTH * 0.05),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#007185',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007185',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  nextButton: {
    backgroundColor: '#22b0a7',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#22b0a7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#035f6b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default StoreLocationScreen;

