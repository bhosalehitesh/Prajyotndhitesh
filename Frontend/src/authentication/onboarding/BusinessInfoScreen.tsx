import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BusinessInfoScreenProps {
  onNext: (businessInfo: {
    hasBusiness: string;
    businessSize: string;
    platforms: string[];
  }) => void;
  onBack?: () => void;
}

const BUSINESS_SIZE_OPTIONS = [
  'Less than INR 3 lakh monthly',
  '3 lakh to 8 lakh monthly',
  '8 lakh - 40 lakh monthly',
  'More than INR 40 lakh monthly',
];

const PLATFORM_OPTIONS = [
  'Amazon',
  'Flipkart',
  'Shopify',
  'Woocommerce',
  'Others',
  "I don't sell on any online platforms",
];

const BusinessInfoScreen: React.FC<BusinessInfoScreenProps> = ({ onNext, onBack }) => {
  const [hasBusiness, setHasBusiness] = useState<string>('');
  const [businessSize, setBusinessSize] = useState<string>('');
  const [platforms, setPlatforms] = useState<string[]>([]);

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleNext = () => {
    onNext({
      hasBusiness,
      businessSize,
      platforms,
    });
  };

  const handleSkip = () => {
    onNext({
      hasBusiness: '',
      businessSize: '',
      platforms: [],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

          <Text style={styles.title}>Tell us more about your business</Text>
          <Text style={styles.subtitle}>
            Share more details about your business so we can assist you more effectively!
          </Text>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>
              1. Do you currently own a business?
            </Text>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setHasBusiness('yes')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.radio}>
                {hasBusiness === 'yes' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>
                Yes, I'm currently selling online and/or offline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setHasBusiness('no')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.radio}>
                {hasBusiness === 'no' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>No, I don't have a business</Text>
            </TouchableOpacity>
          </View>

          {hasBusiness === 'yes' && (
            <View style={styles.questionContainer}>
              <Text style={styles.question}>2. What's your business size?</Text>
              {BUSINESS_SIZE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => setBusinessSize(option)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.radio}>
                    {businessSize === option && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {hasBusiness === 'yes' && (
            <View style={styles.questionContainer}>
              <Text style={styles.question}>
                3. What platforms do you currently use or sell on?
              </Text>
              {PLATFORM_OPTIONS.map((platform) => {
                const isSelected = platforms.includes(platform);
                return (
                  <TouchableOpacity
                    key={platform}
                    style={styles.checkboxOption}
                    onPress={() => togglePlatform(platform)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>{platform}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip this step</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.finishButton} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Support */}
        <TouchableOpacity style={styles.chatButton}>
          <MaterialCommunityIcons name="message-text" size={24} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
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
  questionContainer: {
    marginBottom: 32,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007185',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007185',
  },
  radioText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 20,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007185',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007185',
  },
  checkboxText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#22b0a7',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#22b0a7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
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

export default BusinessInfoScreen;

