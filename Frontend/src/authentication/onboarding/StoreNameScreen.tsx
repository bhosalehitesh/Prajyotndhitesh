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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreNameScreenProps {
  onNext: (storeName: string) => void;
  onBack?: () => void;
}

const StoreNameScreen: React.FC<StoreNameScreenProps> = ({ onNext, onBack }) => {
  const [storeName, setStoreName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const handleCheckAvailability = () => {
    if (storeName.trim().length < 3) {
      setIsAvailable(false);
      return;
    }
    // Simulate availability check
    setIsAvailable(true);
  };

  const handleNext = () => {
    if (storeName.trim().length >= 3) {
      // Allow proceeding even if availability not checked, but show warning
      if (!isAvailable && storeName.trim().length >= 3) {
        // Auto-check if not checked yet
        setIsAvailable(true);
      }
      onNext(storeName.trim());
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
                  setStoreName(text);
                  setIsAvailable(null);
                }}
                autoCapitalize="words"
                maxLength={50}
              />
              {storeName.length >= 3 && (
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={handleCheckAvailability}
                  activeOpacity={0.7}
                >
                  <Text style={styles.checkButtonText}>Check Availability</Text>
                </TouchableOpacity>
              )}
              {isAvailable === true && (
                <Text style={styles.successText}>
                  ✓ Congratulations! Store Name available
                </Text>
              )}
              {isAvailable === false && (
                <Text style={styles.errorText}>
                  ✗ Store name is too short or already taken
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Store Link</Text>
              <TextInput
                style={styles.input}
                placeholder="www.smartbiz.in/your-store"
                placeholderTextColor="#9ca3af"
                value={storeName.trim() ? `www.smartbiz.in/${storeName.trim().toLowerCase().replace(/\s+/g, '-')}` : ''}
                editable={false}
              />
              <Text style={styles.storeLinkHelp}>
                This is your store link that customers will use to access your store. You can always opt for a custom domain in future.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                storeName.trim().length < 3 && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={storeName.trim().length < 3}
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
  checkButtonText: {
    fontSize: 14,
    color: '#007185',
    fontWeight: '500',
  },
  successText: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
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
  storeLinkHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 16,
  },
});

export default StoreNameScreen;

