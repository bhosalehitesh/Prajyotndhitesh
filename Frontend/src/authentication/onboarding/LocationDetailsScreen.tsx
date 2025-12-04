import React, { useState, useMemo } from 'react';
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

// State to Cities mapping
const STATE_CITIES: { [key: string]: string[] } = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Roing'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Sivasagar'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Katihar', 'Munger', 'Chapra'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Durg', 'Korba', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Rajnandgaon', 'Dhamtari'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Gandhidham', 'Anand'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Kullu', 'Chamba', 'Bilaspur', 'Hamirpur', 'Una', 'Kangra'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Medininagar', 'Chaibasa'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Kannur', 'Kottayam', 'Palakkad', 'Malappuram'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Raipur', 'Sagar', 'Dewas', 'Satna', 'Ratlam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kalyan', 'Vasai', 'Navi Mumbai'],
  'Manipur': ['Imphal', 'Thoubal', 'Kakching', 'Ukhrul', 'Churachandpur', 'Bishnupur', 'Senapati', 'Tamenglong'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar', 'Baghmara', 'Resubelpara'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Baleshwar', 'Baripada', 'Jharsuguda', 'Rayagada'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Pathankot', 'Hoshiarpur', 'Mohali', 'Batala', 'Abohar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia', 'Khowai', 'Ambassa'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh', 'Nainital', 'Mussoorie'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Baharampur', 'Habra'],
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder', 'Rangat', 'Car Nicobar'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Delhi': ['New Delhi', 'Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Rajouri'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Kadmat'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
};

// State to Pincode ranges mapping (first 1-2 digits indicate region/state)
const STATE_PINCODE_RANGES: { [key: string]: number[][] } = {
  'Andhra Pradesh': [[500000, 535999], [516000, 518999]],
  'Arunachal Pradesh': [[790000, 792999]],
  'Assam': [[780000, 789999]],
  'Bihar': [[800000, 855999]],
  'Chhattisgarh': [[490000, 497999]],
  'Goa': [[403000, 403999]],
  'Gujarat': [[360000, 396999]],
  'Haryana': [[120000, 135999]],
  'Himachal Pradesh': [[171000, 177999]],
  'Jharkhand': [[800000, 835999]],
  'Karnataka': [[560000, 599999]],
  'Kerala': [[670000, 699999]],
  'Madhya Pradesh': [[450000, 489999]],
  'Maharashtra': [[400000, 445999]],
  'Manipur': [[795000, 795999]],
  'Meghalaya': [[793000, 794999]],
  'Mizoram': [[796000, 796999]],
  'Nagaland': [[797000, 797999]],
  'Odisha': [[750000, 770999]],
  'Punjab': [[140000, 160999]],
  'Rajasthan': [[300000, 342999]],
  'Sikkim': [[737000, 737999]],
  'Tamil Nadu': [[600000, 643999]],
  'Telangana': [[500000, 509999]],
  'Tripura': [[799000, 799999]],
  'Uttar Pradesh': [[200000, 285999]],
  'Uttarakhand': [[248000, 249999]],
  'West Bengal': [[700000, 743999]],
  'Andaman and Nicobar Islands': [[744000, 744999]],
  'Chandigarh': [[160000, 160999]],
  'Dadra and Nagar Haveli and Daman and Diu': [[396000, 396999], [362000, 362999]],
  'Delhi': [[110000, 110999]],
  'Jammu and Kashmir': [[180000, 194999]],
  'Ladakh': [[194000, 194999]],
  'Lakshadweep': [[682000, 682999]],
  'Puducherry': [[605000, 605999]],
};

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
  const [showCityModal, setShowCityModal] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const { handleHelp, handleLogout, HelpModal } = useHeaderActions();

  // Get cities for selected state
  const availableCities = useMemo(() => {
    if (!state) return [];
    return STATE_CITIES[state] || [];
  }, [state]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearchQuery) return availableCities;
    return availableCities.filter((cityName) =>
      cityName.toLowerCase().includes(citySearchQuery.toLowerCase())
    );
  }, [availableCities, citySearchQuery]);

  // Validate pincode for selected state
  const validatePincode = (pin: string, selectedState: string): boolean => {
    if (!pin || pin.length !== 6 || !selectedState) return false;
    
    const pinNum = parseInt(pin, 10);
    if (isNaN(pinNum)) return false;

    const ranges = STATE_PINCODE_RANGES[selectedState];
    if (!ranges) return false;

    return ranges.some(([min, max]) => pinNum >= min && pinNum <= max);
  };

  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setCity(''); // Clear city when state changes
    setPincode(''); // Clear pincode when state changes
    setPincodeError('');
    setShowStateModal(false);
    setStateSearchQuery('');
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityModal(false);
    setCitySearchQuery('');
  };

  const handlePincodeChange = (text: string) => {
    const numericText = text.replace(/\D/g, '').slice(0, 6);
    setPincode(numericText);
    
    if (numericText.length === 6 && state) {
      if (validatePincode(numericText, state)) {
        setPincodeError('');
      } else {
        setPincodeError('Pincode does not match the selected state');
      }
    } else if (numericText.length === 6 && !state) {
      setPincodeError('Please select state first');
    } else {
      setPincodeError('');
    }
  };

  const handleNext = () => {
    if (!city.trim() || !state.trim() || !pincode.trim()) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }

    if (pincode.length !== 6) {
      Alert.alert('Validation', 'Please enter a valid 6-digit pincode.');
      return;
    }

    if (pincodeError) {
      Alert.alert('Validation', pincodeError);
      return;
    }

    if (!validatePincode(pincode, state)) {
      Alert.alert('Validation', 'Pincode does not match the selected state. Please enter a valid pincode.');
      return;
    }

    onNext({
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    });
  };

  const filteredStates = INDIAN_STATES.filter((stateName) =>
    stateName.toLowerCase().includes(stateSearchQuery.toLowerCase())
  );

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

            {/* State Field - Moved to top */}
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

            {/* City Field - Now depends on state */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Town / City*</Text>
              <TouchableOpacity
                style={[
                  styles.selectContainer,
                  !state && styles.selectContainerDisabled,
                ]}
                onPress={() => {
                  if (state) {
                    setShowCityModal(true);
                  } else {
                    Alert.alert('Info', 'Please select state first');
                  }
                }}
                activeOpacity={0.7}
                disabled={!state}
              >
                <Text
                  style={[
                    styles.selectInput,
                    (!city || !state) && styles.selectPlaceholder,
                  ]}
                >
                  {city || (state ? 'Select City' : 'Select State first')}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={state ? '#6b7280' : '#d1d5db'} />
              </TouchableOpacity>
            </View>

            {/* Pincode Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pincode*</Text>
              <TextInput
                style={[
                  styles.input,
                  pincodeError && styles.inputError,
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
                (!city.trim() || !state.trim() || !pincode.trim() || pincodeError) &&
                  styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!city.trim() || !state.trim() || !pincode.trim() || !!pincodeError}
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

      {/* City Selection Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCityModal(false);
          setCitySearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCityModal(false);
                  setCitySearchQuery('');
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
                placeholder="Search city..."
                placeholderTextColor="#9ca3af"
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                autoCapitalize="words"
              />
            </View>

            {/* Cities List */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateItem,
                    city === item && styles.stateItemSelected,
                  ]}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      city === item && styles.stateItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {city === item && (
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
  selectContainerDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
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
