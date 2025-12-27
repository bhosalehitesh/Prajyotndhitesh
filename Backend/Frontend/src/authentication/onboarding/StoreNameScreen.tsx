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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHeaderActions } from '../../utils/headerActions';
import ChatBot from '../../components/ChatBot';
import { checkStoreNameAvailability } from '../../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreNameScreenProps {
  onNext: (storeName: string) => void;
  onBack?: () => void;
}

const StoreNameScreen: React.FC<StoreNameScreenProps> = ({ onNext, onBack }) => {
  const [storeName, setStoreName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const { handleHelp, handleLogout, HelpModal } = useHeaderActions();

  const handleCheckAvailability = async () => {
    const trimmedName = storeName.trim();
    
    if (trimmedName.length < 3) {
      setIsAvailable(false);
      setAvailabilityMessage('Store name must be at least 3 characters');
      return;
    }
    
    setIsChecking(true);
    setIsAvailable(null);
    setAvailabilityMessage('');
    
    try {
      const result = await checkStoreNameAvailability(trimmedName);
      setIsAvailable(result.available);
      setAvailabilityMessage(result.message);
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
      setAvailabilityMessage('Failed to check availability. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = async () => {
    const trimmedName = storeName.trim();
    
    if (trimmedName.length < 3) {
      return;
    }
    
    // If availability hasn't been checked, check it first
    if (isAvailable === null) {
      await handleCheckAvailability();
      // Wait a moment for the check to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Only allow proceeding if name is available
    if (isAvailable === true) {
      onNext(trimmedName);
    } else if (isAvailable === false) {
      // Show error message
      setAvailabilityMessage(availabilityMessage || 'Store name is not available');
    }
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
              <MaterialCommunityIcons name="store" size={24} color="#ffffff" />
              <Text style={styles.logoText}>
                Sakhi <Text style={styles.logoTextAccent}>Store</Text>
              </Text>
            </View>
            <View style={styles.headerLinks}>
              <TouchableOpacity style={styles.headerLink} onPress={handleHelp}>
                <MaterialCommunityIcons name="help-circle-outline" size={18} color="#ffffff" />
                <Text style={styles.headerLinkText}>Help</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerLink} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={18} color="#ffffff" />
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

            <Text style={styles.title}>What do you call your shop?</Text>
            <Text style={styles.subtitle}>
              You won't be able to change the store name later!
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Store Name*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Store Name"
                placeholderTextColor="#9ca3af"
                value={storeName}
                onChangeText={(text) => {
                  // Only allow alphabets, numbers, and underscores
                  const filteredText = text.replace(/[^a-zA-Z0-9_]/g, '');
                  setStoreName(filteredText);
                  setIsAvailable(null);
                  setAvailabilityMessage('');
                }}
                autoCapitalize="none"
                maxLength={50}
              />
              {storeName.length >= 3 && (
                <TouchableOpacity
                  style={[styles.checkButton, isChecking && styles.checkButtonDisabled]}
                  onPress={handleCheckAvailability}
                  activeOpacity={0.7}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <View style={styles.checkButtonLoading}>
                      <ActivityIndicator size="small" color="#e61580" />
                      <Text style={styles.checkButtonText}>Checking...</Text>
                    </View>
                  ) : (
                    <Text style={styles.checkButtonText}>Check Availability</Text>
                  )}
                </TouchableOpacity>
              )}
              {isAvailable === true && (
                <Text style={styles.successText}>
                  ✓ {availabilityMessage || 'Congratulations! Store Name available'}
                </Text>
              )}
              {isAvailable === false && availabilityMessage && (
                <Text style={styles.errorText}>
                  ✗ {availabilityMessage}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Store Link</Text>
              <TextInput
                style={styles.input}
                placeholder="www.sakhi.store/your-store"
                placeholderTextColor="#9ca3af"
                value={storeName.trim() ? `www.sakhi.store/${storeName.trim().toLowerCase()}` : ''}
                editable={false}
              />
              <Text style={styles.storeLinkHelp}>
                This is your store link that customers will use to access your store. You can always opt for a custom domain in future.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                (storeName.trim().length < 3 || isAvailable === false || isChecking) && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={storeName.trim().length < 3 || isAvailable === false || isChecking}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Chat Support - Fixed at bottom */}
        <TouchableOpacity style={styles.chatButton} onPress={() => setShowChat(true)}>
          <MaterialCommunityIcons name="message-text" size={24} color="#ffffff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <HelpModal />
      <ChatBot isModal={true} visible={showChat} onBack={() => setShowChat(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
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
    backgroundColor: '#e61580',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoTextAccent: {
    color: '#ffffff',
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
    color: '#ffffff',
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
  inputContainer: {
    marginBottom: 24,
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
    marginBottom: 12,
  },
  checkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkButtonText: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '500',
  },
  successText: {
    fontSize: 14,
    color: '#e61580',
    marginTop: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  nextButton: {
    backgroundColor: '#e61580',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#e61580',
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
    backgroundColor: '#e61580',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  storeLinkHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 16,
  },
});

export default StoreNameScreen;

