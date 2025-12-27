import React, { useState, useEffect } from 'react';
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
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHeaderActions } from '../../utils/headerActions';
import ChatBot from '../../components/ChatBot';
import { getAllStates } from '../../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// List of Indian States and Union Territories
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

interface LocationDetailsScreenProps {
  onNext: (location: {
    city: string;
    state: string;
    pincode: string;
  }) => void;
  onBack?: () => void;
}

const LocationDetailsScreen: React.FC<LocationDetailsScreenProps> = ({ onNext, onBack }) => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [availableStates, setAvailableStates] = useState<string[]>(INDIAN_STATES);
  const { handleHelp, handleLogout, HelpModal } = useHeaderActions();

  // Load states from API on mount
  useEffect(() => {
    loadStatesFromAPI();
  }, []);

  const loadStatesFromAPI = async () => {
    try {
      const states = await getAllStates();
      if (states.length > 0) {
        // Merge API states with hardcoded states to ensure completeness
        const allStates = [...new Set([...states, ...INDIAN_STATES])].sort();
        setAvailableStates(allStates);
      } else {
        setAvailableStates(INDIAN_STATES);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      setAvailableStates(INDIAN_STATES);
    }
  };

  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setShowStateModal(false);
    setStateSearchQuery('');
  };

  const handlePincodeChange = (text: string) => {
    const numericText = text.replace(/\D/g, '').slice(0, 6);
    setPincode(numericText);

    if (numericText.length === 6) {
      setPincodeError('');
    }
  };

  const handleNext = () => {
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    if (!trimmedCity || !trimmedState || !trimmedPincode) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }

    if (trimmedPincode.length !== 6) {
      Alert.alert('Validation', 'Please enter a valid 6-digit pincode.');
      return;
    }

    onNext({
      city: trimmedCity,
      state: trimmedState,
      pincode: trimmedPincode,
    });
  };

  const filteredStates = availableStates.filter((stateName) =>
    stateName.toLowerCase().includes(stateSearchQuery.toLowerCase())
  );

  const isNextButtonEnabled = city.trim().length >= 3 && state.trim().length > 0 && pincode.length === 6;

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

            <Text style={styles.title}>Location Details</Text>

            {/* State Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>State*</Text>
              <TouchableOpacity
                style={styles.selectContainer}
                onPress={() => setShowStateModal(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectInput,
                    !state && styles.selectPlaceholder,
                  ]}
                >
                  {state || 'Select State'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* City Field - Manual Entry */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Village / Town / City*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Village/Town/City"
                placeholderTextColor="#9ca3af"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>

            {/* Pincode Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pincode*</Text>
              <TextInput
                style={[
                  styles.input,
                  !!pincodeError && styles.inputError,
                ]}
                placeholder="Enter Pincode"
                placeholderTextColor="#9ca3af"
                value={pincode}
                onChangeText={handlePincodeChange}
                keyboardType="number-pad"
                maxLength={6}
              />
              {pincodeError ? (
                <Text style={styles.errorText}>{pincodeError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !isNextButtonEnabled && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!isNextButtonEnabled}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Chat Support */}
        <TouchableOpacity style={styles.chatButton} onPress={() => setShowChat(true)}>
          <MaterialCommunityIcons name="message-text" size={24} color="#ffffff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowStateModal(false);
          setStateSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowStateModal(false);
                  setStateSearchQuery('');
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search state..."
                placeholderTextColor="#9ca3af"
                value={stateSearchQuery}
                onChangeText={setStateSearchQuery}
                autoCapitalize="words"
              />
            </View>

            {/* States List */}
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateItem,
                    state === item && styles.stateItemSelected,
                  ]}
                  onPress={() => handleStateSelect(item)}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      state === item && styles.stateItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {state === item && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#e61580"
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.statesList}
            />
          </View>
        </View>
      </Modal>
      <HelpModal />
      <ChatBot isModal={true} visible={showChat} onBack={() => setShowChat(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Updated to match global theme
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
    marginBottom: 24,
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  selectInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectPlaceholder: {
    color: '#9ca3af',
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
    maxHeight: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  statesList: {
    maxHeight: 400,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stateItemSelected: {
    backgroundColor: '#fef2f2',
  },
  stateItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  stateItemTextSelected: {
    color: '#e61580',
    fontWeight: '600',
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
});

export default LocationDetailsScreen;
