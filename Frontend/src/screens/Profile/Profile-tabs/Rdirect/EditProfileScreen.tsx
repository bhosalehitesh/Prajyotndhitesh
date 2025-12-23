import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { storage, AUTH_TOKEN_KEY } from '../../../../authentication/storage';
import { getCurrentSellerStoreDetails, saveStoreAddress, getSellerDetails, updateSellerDetails, saveBusinessDetails, fetchCategories, fetchProducts } from '../../../../utils/api';

export default function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [hideAddress, setHideAddress] = useState(false);
  const [supportOption, setSupportOption] = useState('other');
  const [supportNumber, setSupportNumber] = useState('');
  const [loginNumber, setLoginNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    legalName: '',
    phone: '',
    email: '',
    category: '',
    address: '',
  });

  // Load all profile data from database when component mounts
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Get userId from storage
      const userId = await storage.getItem('userId');
      if (!userId) {
        console.warn('⚠️ [EditProfile] No userId found in storage');
        setLoading(false);
        setInitialLoading(false);
        return;
      }

      // Load seller details (fullName, phone)
      const sellerDetails = await getSellerDetails(userId);
      console.log('👤 [EditProfile] Loaded sellerDetails:', JSON.stringify(sellerDetails, null, 2));
      
      // Load store details (store name, address)
      const storeDetails = await getCurrentSellerStoreDetails();
      console.log('📦 [EditProfile] Loaded storeDetails:', JSON.stringify(storeDetails, null, 2));

      // Load email from storage (check multiple possible keys where email might be stored)
      let storedEmail = await storage.getItem('userEmail') || 
                       await storage.getItem('email') || 
                       await storage.getItem('sellerEmail') ||
                       '';
      
      // Also check if email is in the sellerDetails JSON string stored in storage
      if (!storedEmail) {
        try {
          const sellerDetailsJson = await storage.getItem('sellerDetails');
          if (sellerDetailsJson) {
            const parsedSellerDetails = JSON.parse(sellerDetailsJson);
            storedEmail = parsedSellerDetails.email || '';
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      console.log('📧 [EditProfile] Email from storage:', storedEmail || 'Not found');
      
      // Load business category - try multiple sources
      let businessCategory = '';
      try {
        // First, try to get category from products (most accurate - seller's actual products)
        const products = await fetchProducts();
        console.log('📦 [EditProfile] Loaded products:', products.length);
        if (products && products.length > 0) {
          // Get the most common businessCategory from products
          const categoryCounts: Record<string, number> = {};
          products.forEach((product: any) => {
            const cat = product.businessCategory || product.productCategory;
            if (cat) {
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            }
          });
          
          // Find the most common category
          let maxCount = 0;
          let mostCommonCategory = '';
          Object.entries(categoryCounts).forEach(([cat, count]) => {
            if (count > maxCount) {
              maxCount = count;
              mostCommonCategory = cat;
            }
          });
          
          if (mostCommonCategory) {
            businessCategory = mostCommonCategory;
            console.log('📂 [EditProfile] Found most common category from products:', businessCategory);
          } else {
            // Fallback to first product's category
            const firstProduct = products[0];
            businessCategory = firstProduct.businessCategory || firstProduct.productCategory || '';
            if (businessCategory) {
              console.log('📂 [EditProfile] Found category from first product:', businessCategory);
            }
          }
        }
        
        // If no category from products, try fetching categories
        if (!businessCategory) {
          const categories = await fetchCategories();
          console.log('📂 [EditProfile] Loaded categories:', categories.length);
          if (categories && categories.length > 0) {
            // Get the first category's businessCategory or categoryName
            const firstCategory = categories[0];
            businessCategory = firstCategory.businessCategory || firstCategory.categoryName || '';
            if (businessCategory) {
              console.log('📂 [EditProfile] Found category from categories list:', businessCategory);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ [EditProfile] Could not load products/categories:', error);
      }

      // Update profile data with seller information
      const updatedData: any = {};
      
      if (sellerDetails) {
        updatedData.legalName = sellerDetails.fullName || sellerDetails.legalName || '';
        updatedData.phone = sellerDetails.phone || '';
        // Email is not in SellerDetails model, so get from storage
        updatedData.email = storedEmail || sellerDetails.email || '';
        
        // Set login number for support option
        if (sellerDetails.phone) {
          setLoginNumber(sellerDetails.phone);
          setSupportNumber(sellerDetails.phone);
        }
      } else {
        // If sellerDetails is null, still try to get email from storage
        updatedData.email = storedEmail || '';
      }
      
      // Log what we found
      console.log('📧 [EditProfile] Email loaded:', updatedData.email || 'Not found');
      console.log('📂 [EditProfile] Category loaded:', businessCategory || 'Not found');

      // Update with store information
      if (storeDetails) {
        // Use the fetched category if we got one
        if (businessCategory) {
          updatedData.category = businessCategory;
        }
        
        // Load and format address
        if (storeDetails.storeAddress) {
          const addr = storeDetails.storeAddress;
          console.log('📍 [EditProfile] Store address from DB:', JSON.stringify(addr, null, 2));
          
          // Format address from database fields (matching Footer format exactly)
          // Order: shopNoBuildingCompanyApartment, areaStreetSectorVillage, landmark (optional), townCity, state, pincode
          const parts = [];
          if (addr.shopNoBuildingCompanyApartment) parts.push(addr.shopNoBuildingCompanyApartment.trim());
          if (addr.areaStreetSectorVillage) parts.push(addr.areaStreetSectorVillage.trim());
          // Include landmark only if it exists and is not empty (optional field)
          if (addr.landmark && addr.landmark.trim()) parts.push(addr.landmark.trim());
          if (addr.townCity) parts.push(addr.townCity.trim());
          if (addr.state) parts.push(addr.state.trim());
          if (addr.pincode) parts.push(addr.pincode.trim());
          
          const formattedAddress = parts.join(', ');
          console.log('📋 [EditProfile] Address parts:', parts);
          console.log('✅ [EditProfile] Formatted address:', formattedAddress);
          
          if (parts.length > 0) {
            updatedData.address = formattedAddress;
          }
        } else {
          console.log('⚠️ [EditProfile] No storeAddress found in storeDetails');
        }
      }

      // Update state with all loaded data
      setProfileData(prev => ({
        ...prev,
        ...updatedData,
      }));

      console.log('✅ [EditProfile] Profile data loaded:', updatedData);
    } catch (error) {
      console.error('❌ [EditProfile] Error loading profile data:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await storage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in. Please login again.');
        setLoading(false);
        return;
      }

      console.log('💾 [EditProfile] Saving profile data:', profileData);

      // Save seller details (fullName, phone)
      // Note: Email is not in SellerDetails model, so we save it to storage instead
      try {
        const sellerUpdateData: any = {};
        if (profileData.legalName) sellerUpdateData.fullName = profileData.legalName;
        if (profileData.phone) sellerUpdateData.phone = profileData.phone;
        // Email is not in SellerDetails model, save to storage instead
        if (profileData.email) {
          await storage.setItem('userEmail', profileData.email);
          await storage.setItem('email', profileData.email);
          console.log('✅ [EditProfile] Email saved to storage');
        }

        if (Object.keys(sellerUpdateData).length > 0) {
          await updateSellerDetails(userId, sellerUpdateData);
          console.log('✅ [EditProfile] Seller details updated');
        }
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        console.warn('⚠️ [EditProfile] Could not update seller details:', errorMessage);
        // Show specific error if it's a connection issue
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Network')) {
          Alert.alert('Connection Error', 'Could not connect to server. Please check your internet connection and try again.');
          setLoading(false);
          return;
        }
        // Continue with address save even if seller update fails (for other errors)
      }

      // Save address
      if (profileData.address) {
        // Parse the address string into individual components
        // Format: "Building, Area, Landmark (optional), City, State, Pincode"
        // Or: "Building, Area, City, State, Pincode" (without landmark)
        const addressParts = profileData.address.split(',').map(p => p.trim()).filter(p => p.length > 0);
        console.log('🔍 [EditProfile] Parsed address parts:', addressParts);
        
        // Extract components - handle both with and without landmark
        let pincode = '';
        let state = '';
        let city = '';
        let landmark = '';
        let area = '';
        let building = '';
        
        const numParts = addressParts.length;
        
        if (numParts >= 1) {
          building = addressParts[0] || '';
        }
        if (numParts >= 2) {
          area = addressParts[1] || '';
        }
        
        // Determine if landmark exists by checking if we have 6 parts (with landmark) or 5 parts (without)
        if (numParts === 6) {
          // Format: Building, Area, Landmark, City, State, Pincode
          landmark = addressParts[2] || '';
          city = addressParts[3] || '';
          state = addressParts[4] || '';
          pincode = addressParts[5] || '';
        } else if (numParts === 5) {
          // Format: Building, Area, City, State, Pincode (no landmark)
          city = addressParts[2] || '';
          state = addressParts[3] || '';
          pincode = addressParts[4] || '';
        } else if (numParts >= 3) {
          // Fallback: assume last 3 are city, state, pincode
          city = addressParts[numParts - 3] || '';
          state = addressParts[numParts - 2] || '';
          pincode = addressParts[numParts - 1] || '';
        }

        const addressData = {
          addressLine1: building || '',
          addressLine2: area || '',
          landmark: landmark || undefined,
          city: city || '',
          state: state || '',
          pincode: pincode || '',
        };
        
        console.log('📤 [EditProfile] Sending address data to backend:', JSON.stringify(addressData, null, 2));

        // Save address to backend
        await saveStoreAddress(addressData);
        console.log('✅ [EditProfile] Address saved successfully');
      }

      // Save business category if changed
      if (profileData.category) {
        try {
          // Note: This assumes businessDetails already exists. If not, you may need to create it first.
          // For now, we'll just log it - you may need to implement a separate updateBusinessCategory function
          console.log('📝 [EditProfile] Category to save:', profileData.category);
          // TODO: Implement category update if backend supports it
        } catch (error) {
          console.warn('⚠️ [EditProfile] Could not update category:', error);
        }
      }

      Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK', onPress: onBack }]);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error('❌ [EditProfile] Error saving profile:', errorMessage);
      
      // Show more specific error messages
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Network')) {
        Alert.alert('Connection Error', 'Could not connect to server. Please check your internet connection and try again.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
      } else {
        Alert.alert('Error', `Failed to save profile: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e61580" />
          <Text style={styles.loadingText}>Loading profile data...</Text>
        </View>
      ) : (
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileData.legalName ? profileData.legalName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{profileData.legalName || 'User'}</Text>
        </View>

        {/* Store Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Store Details</Text>
          <View style={styles.editRow}>
            <Text style={styles.label}>Legal Name: </Text>
            <TextInput
              style={styles.editableValue}
              value={profileData.legalName}
              onChangeText={(text) => setProfileData({ ...profileData, legalName: text })}
            />
          </View>
          <View style={styles.editRow}>
            <Text style={styles.label}>Phone: </Text>
            <TextInput
              style={styles.editableValue}
              value={profileData.phone}
              onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.editRow}>
            <Text style={styles.label}>Email: </Text>
            <TextInput
              style={styles.editableValue}
              value={profileData.email}
              onChangeText={(text) => setProfileData({ ...profileData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.editRow}>
            <Text style={styles.label}>Category: </Text>
            <TextInput
              style={styles.editableValue}
              value={profileData.category}
              onChangeText={(text) => setProfileData({ ...profileData, category: text })}
            />
          </View>
        </View>

        {/* Store Address Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Store Address</Text>
          <View style={styles.editRow}>
            <TextInput
              style={[styles.value, styles.editableAddress]}
              value={profileData.address}
              onChangeText={(text) => setProfileData({ ...profileData, address: text })}
              multiline
            />
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#e61580" style={{ marginLeft: 8 }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.label}>Hide address on store</Text>
            <Switch value={hideAddress} onValueChange={setHideAddress} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <MaterialCommunityIcons name="information" size={16} color="#6B7280" />
            <Text style={styles.infoText}>  Your customers can see the full address</Text>
          </View>
        </View>

        {/* Customer Support Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Support</Text>
          <Text style={styles.subText}>
            This mobile number will be displayed on your website for customer support
          </Text>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSupportOption('login')}
          >
            <MaterialCommunityIcons
              name={supportOption === 'login' ? 'radiobox-marked' : 'radiobox-blank'}
              size={20}
              color={supportOption === 'login' ? '#e61580' : '#ccc'}
            />
            <Text style={styles.radioLabel}>Same as Login ({loginNumber})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setSupportOption('other')}
          >
            <MaterialCommunityIcons
              name={supportOption === 'other' ? 'radiobox-marked' : 'radiobox-blank'}
              size={20}
              color={supportOption === 'other' ? '#e61580' : '#ccc'}
            />
            <Text style={styles.radioLabel}>Use another number</Text>
          </TouchableOpacity>
          {supportOption === 'other' && (
            <TextInput
              style={styles.input}
              placeholder="Enter support phone"
              value={supportNumber}
              keyboardType="phone-pad"
              onChangeText={setSupportNumber}
            />
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff5f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  avatarSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 16 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarText: { fontSize: 44, fontWeight: 'bold', color: '#e61580' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333333', marginBottom: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginBottom: 12,
    padding: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardTitle: { fontWeight: 'bold', marginBottom: 10, fontSize: 17, color: '#333333' },
  row: { fontSize: 16, marginVertical: 3 },
  label: { color: '#6B7280', fontWeight: 'bold', fontSize: 15 },
  value: { color: '#333333', fontWeight: 'normal', fontSize: 15 },
  editableValue: {
    color: '#333333',
    fontSize: 15,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
    marginLeft: 8,
  },
  editableAddress: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
    minHeight: 40,
  },
  editRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3, flexWrap: 'wrap' },
  divider: { borderBottomWidth: 1, borderColor: '#E5E7EB', marginVertical: 10 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  infoText: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  subText: { color: '#6B7280', marginBottom: 6, fontSize: 14 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  radioLabel: { marginLeft: 7, fontSize: 15, color: '#333333' },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    paddingHorizontal: 10,
    fontSize: 15,
    minHeight: 40,
    marginVertical: 8,
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#e61580',
    margin: 20,
    marginTop: 20,
    borderRadius: 7,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

