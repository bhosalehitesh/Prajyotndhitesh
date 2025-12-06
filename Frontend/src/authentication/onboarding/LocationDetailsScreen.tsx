import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHeaderActions } from '../../utils/headerActions';
import ChatBot from '../../components/ChatBot';
import {
  validatePincode,
  checkPincodeForState,
  getCitiesByState,
  getAllStates,
  validateCityForStateAndDistrict,
  PincodeDetails,
} from '../../utils/api';

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
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [validatingPincode, setValidatingPincode] = useState(false);
  const [availableStates, setAvailableStates] = useState<string[]>(INDIAN_STATES);
  const [cityInputMode, setCityInputMode] = useState<'dropdown' | 'manual'>('dropdown');
  const [manualCityInput, setManualCityInput] = useState('');
  const [cityValidationError, setCityValidationError] = useState('');
  const [validatingCity, setValidatingCity] = useState(false);
  const { handleHelp, handleLogout, HelpModal } = useHeaderActions();
  
  // Load states from API on mount
  useEffect(() => {
    loadStatesFromAPI();
  }, []);
  
  // Clear fields when state changes
  useEffect(() => {
    if (state) {
      setCity('');
      setManualCityInput('');
      setCityValidationError('');
      setPincode('');
      setPincodeError('');
    }
  }, [state]);
  
  const loadStatesFromAPI = async () => {
    setLoadingStates(true);
    try {
      const states = await getAllStates();
      if (states.length > 0) {
        // Merge API states with hardcoded states to ensure completeness
        const allStates = [...new Set([...states, ...INDIAN_STATES])].sort();
        setAvailableStates(allStates);
      } else {
        // Fallback to hardcoded states if API returns empty
        setAvailableStates(INDIAN_STATES);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      // Fallback to hardcoded states
      setAvailableStates(INDIAN_STATES);
    } finally {
      setLoadingStates(false);
    }
  };
  
  // Get cities for selected state (from API or fallback)
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  useEffect(() => {
    if (state) {
      loadCitiesForState(state);
    }
  }, [state]);
  
  const loadCitiesForState = async (stateName: string) => {
    setLoadingCities(true);
    try {
      const apiCities = await getCitiesByState(stateName);
      const hardcodedCities = STATE_CITIES[stateName] || [];
      
      // Merge API cities with hardcoded cities to ensure completeness
      if (apiCities.length > 0) {
        const allCities = [...new Set([...apiCities, ...hardcodedCities])].sort();
        setAvailableCities(allCities);
      } else {
        // Fallback to hardcoded cities if API returns empty
        setAvailableCities(hardcodedCities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // Fallback to hardcoded cities
      setAvailableCities(STATE_CITIES[stateName] || []);
    } finally {
      setLoadingCities(false);
    }
  };

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearchQuery) return availableCities;
    return availableCities.filter((cityName) =>
      cityName.toLowerCase().includes(citySearchQuery.toLowerCase())
    );
  }, [availableCities, citySearchQuery]);

  // Validate pincode using API
  const validatePincodeLocal = async (pin: string, selectedState: string) => {
    if (!pin || pin.length !== 6 || !selectedState) {
      return { valid: false, message: 'Please enter a 6-digit pincode and select state' };
    }
    
    setValidatingPincode(true);
    try {
      // First check if pincode is valid for the state
      const stateCheck = await checkPincodeForState(pin, selectedState);
      
      if (stateCheck.valid) {
        // Get full pincode details
        const details = await validatePincode(pin);
        if (details.valid) {
          // Auto-populate city if available
          if (details.city && !city) {
            setCity(details.city);
          }
          setPincodeError('');
          return { valid: true, message: '', details };
        }
      }
      
      return { valid: false, message: stateCheck.message || 'Pincode does not match the selected state' };
    } catch (error) {
      console.error('Error validating pincode:', error);
      // Fallback to local validation
      const pinNum = parseInt(pin, 10);
      if (isNaN(pinNum)) {
        return { valid: false, message: 'Invalid pincode format' };
      }
      const ranges = STATE_PINCODE_RANGES[selectedState];
      if (ranges && ranges.some(([min, max]) => pinNum >= min && pinNum <= max)) {
        return { valid: true, message: '' };
      }
      return { valid: false, message: 'Pincode does not match the selected state' };
    } finally {
      setValidatingPincode(false);
    }
  };

  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setCity('');
    setPincode('');
    setPincodeError('');
    setShowStateModal(false);
    setStateSearchQuery('');
  };
  
  // Validate manually entered city/village against state
  const validateManualCity = async (cityName: string) => {
    if (!cityName.trim() || !state) {
      setCityValidationError('');
      return false;
    }
    
    setValidatingCity(true);
    setCityValidationError('');
    
    try {
      // First try API validation (without district)
      const apiValidation = await validateCityForStateAndDistrict(cityName.trim(), state);
      
      if (apiValidation.valid) {
        setCityValidationError('');
        setCity(cityName.trim()); // Set the validated city
        return true;
      }
      
      // Fallback: Get cities for the selected state
      const cities = await getCitiesByState(state);
      const cityLower = cityName.trim().toLowerCase();
      
      // Check if entered city exists in the list
      const cityExists = cities.some(c => c.toLowerCase() === cityLower);
      
      if (cityExists) {
        setCityValidationError('');
        setCity(cityName.trim()); // Set the validated city
        return true;
      } else {
        // Also check hardcoded cities as fallback
        const hardcodedCities = STATE_CITIES[state] || [];
        const existsInHardcoded = hardcodedCities.some(c => c.toLowerCase() === cityLower);
        
        if (existsInHardcoded) {
          setCityValidationError('');
          setCity(cityName.trim());
          return true;
        } else {
          setCityValidationError('Village/Town not found in selected state. Please verify or select from list.');
          setCity('');
          return false;
        }
      }
    } catch (error) {
      console.error('Error validating city:', error);
      // On error, allow the city but show warning
      setCityValidationError('Could not verify. Please ensure the village/town is correct.');
      setCity(cityName.trim());
      return true; // Allow to proceed with warning
    } finally {
      setValidatingCity(false);
    }
  };
  
  // Debounce timer for manual city validation
  const cityValidationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleManualCityChange = (text: string) => {
    setManualCityInput(text);
    setCity(''); // Clear selected city when typing manually
    setCityValidationError(''); // Clear previous errors
    
    // Clear existing timer
    if (cityValidationTimerRef.current) {
      clearTimeout(cityValidationTimerRef.current);
    }
    
    // Validate after user stops typing (debounce)
    if (text.trim().length >= 3 && state) {
      // Small delay to avoid too many API calls
      cityValidationTimerRef.current = setTimeout(() => {
        validateManualCity(text);
      }, 800);
    } else if (text.trim().length > 0 && text.trim().length < 3) {
      setCityValidationError('Please enter at least 3 characters');
    } else if (text.trim().length === 0) {
      setCityValidationError('');
    }
  };
  
  const handleCityInputModeToggle = () => {
    // Clear any pending validation timer
    if (cityValidationTimerRef.current) {
      clearTimeout(cityValidationTimerRef.current);
      cityValidationTimerRef.current = null;
    }
    
    if (cityInputMode === 'dropdown') {
      setCityInputMode('manual');
      setCity(''); // Clear selected city
      setManualCityInput('');
      setCityValidationError('');
    } else {
      setCityInputMode('dropdown');
      setManualCityInput(''); // Clear manual input
      setCityValidationError('');
      setCity(''); // Clear city to allow fresh selection
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCityModal(false);
    setCitySearchQuery('');
  };

  const handlePincodeChange = async (text: string) => {
    const numericText = text.replace(/\D/g, '').slice(0, 6);
    setPincode(numericText);
    
    if (numericText.length === 6) {
      if (state) {
        const validation = await validatePincodeLocal(numericText, state);
        if (validation.valid) {
          setPincodeError('');
        } else {
          setPincodeError(validation.message);
        }
      } else {
        setPincodeError('Please select state first');
      }
    } else {
      setPincodeError('');
    }
  };

  const handleNext = async () => {
    // Determine the city value based on input mode
    const finalCity = cityInputMode === 'manual' ? manualCityInput.trim() : city.trim();
    
    if (!finalCity || !state.trim() || !pincode.trim()) {
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
    
    // If manual input mode, validate the city
    if (cityInputMode === 'manual') {
      if (cityValidationError) {
        Alert.alert('Validation', cityValidationError);
        return;
      }
      
      // Final validation of manual city
      const isValid = await validateManualCity(finalCity);
      if (!isValid && cityValidationError) {
        Alert.alert('Validation', cityValidationError);
        return;
      }
    }

    // Final pincode validation
    const validation = await validatePincodeLocal(pincode, state);
    if (!validation.valid) {
      Alert.alert('Validation', validation.message || 'Pincode does not match the selected state. Please enter a valid pincode.');
      return;
    }

    onNext({
      city: finalCity,
      state: state.trim(),
      pincode: pincode.trim(),
    });
  };

  const filteredStates = availableStates.filter((stateName) =>
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

            {/* City Field - Dropdown or Manual Entry */}
            <View style={styles.inputContainer}>
              <View style={styles.cityHeader}>
                <Text style={styles.label}>
                  Village / Town / City* {loadingCities && <ActivityIndicator size="small" />}
                  {validatingCity && <ActivityIndicator size="small" />}
                </Text>
                <TouchableOpacity
                  onPress={handleCityInputModeToggle}
                  style={styles.toggleButton}
                  disabled={!state}
                >
                  <Text style={styles.toggleButtonText}>
                    {cityInputMode === 'dropdown' ? 'Enter Manually' : 'Select from List'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {cityInputMode === 'dropdown' ? (
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
                    {city || (state ? 'Select Village/Town/City' : 'Select State first')}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={state ? '#6b7280' : '#d1d5db'} />
                </TouchableOpacity>
              ) : (
                <View>
                  <TextInput
                    style={[
                      styles.input,
                      cityValidationError && styles.inputError,
                      !state && styles.inputDisabled,
                    ]}
                    placeholder={state ? 'Enter Village/Town/City' : 'Select state first'}
                    placeholderTextColor="#9ca3af"
                    value={manualCityInput}
                    onChangeText={handleManualCityChange}
                    autoCapitalize="words"
                    editable={!!state}
                  />
                  {cityValidationError ? (
                    <Text style={styles.errorText}>{cityValidationError}</Text>
                  ) : manualCityInput.trim().length >= 3 && state && !validatingCity ? (
                    <Text style={styles.successText}>✓ Valid village/town</Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Pincode Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pincode* {validatingPincode && <ActivityIndicator size="small" />}</Text>
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
                editable={!validatingPincode}
              />
              {pincodeError ? (
                <Text style={styles.errorText}>{pincodeError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                ((cityInputMode === 'dropdown' && !city.trim()) || 
                 (cityInputMode === 'manual' && !manualCityInput.trim()) || 
                 !state.trim() || !pincode.trim() || pincodeError || 
                 (cityInputMode === 'manual' && cityValidationError)) &&
                  styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={
                (cityInputMode === 'dropdown' && !city.trim()) || 
                (cityInputMode === 'manual' && !manualCityInput.trim()) || 
                !state.trim() || !pincode.trim() || !!pincodeError || 
                (cityInputMode === 'manual' && !!cityValidationError)
              }
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
              data={availableCities.filter((cityName) =>
                cityName.toLowerCase().includes(citySearchQuery.toLowerCase())
              )}
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
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
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
  successText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  helpText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#e61580',
    fontWeight: '500',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
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
