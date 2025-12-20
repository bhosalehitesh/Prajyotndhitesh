import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES, getRoute } from '../constants/routes';
import { updateUserAddress, getUserById, getUserByPhone, updateUserAddressByPhone } from '../utils/api';

// Hook for responsive design
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

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

const Checkout = () => {
  const { cart, getCartTotal } = useCart();
  const { storeSlug, currentStore } = useStore();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 968px)');
  
  const [isSaving, setIsSaving] = useState(false);

  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    pincode: '',
    houseNumber: '',
    areaStreet: '',
    landmark: '',
    city: '',
    state: '',
    addressType: 'Other',
    emailId: '',
  });

  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const navigateToPayment = () => {
    const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
    const path = getRoute(ROUTES.CHECKOUT_CONFIRM, resolvedSlug);
    // Pass address data to confirm order page
    const address = {
      customerName: formData.customerName,
      mobileNumber: formData.mobileNumber,
      pincode: formData.pincode,
      houseNumber: formData.houseNumber,
      areaStreet: formData.areaStreet,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      addressType: formData.addressType,
      emailId: formData.emailId
    };
    navigate(path, { state: { address } });
  };

  const itemTotal = getCartTotal();
  const deliveryFee = 0; // Free delivery
  const orderTotal = itemTotal + deliveryFee;

  // Load saved address from database or localStorage
  useEffect(() => {
    const loadAddress = async () => {
      // Only load address if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, skipping address load');
        return;
      }

      const token = user.token || localStorage.getItem('authToken');
      const userPhone = user.phone;
      
      if (!userPhone) {
        console.warn('User phone number not available');
        return;
      }

      try {
        // Get user data by phone number (most reliable)
        const userData = await getUserByPhone(userPhone, token);
        console.log('Loaded user data by phone:', userData);
        
        // Verify phone number matches logged-in user
        if (userData.phone !== userPhone) {
          console.warn('Phone number mismatch! Database:', userData.phone, 'Logged in:', userPhone);
          alert('Phone number mismatch detected. Please login again.');
          return;
        }
        
        // Always set customer name and phone from user data
        const userName = userData.fullName || userData.name || user.fullName || user.name || '';
        const userPhoneNumber = userData.phone || userPhone;
        
        // If user has address data in database, use it
        if (userData && (userData.pincode || userData.flatOrHouseNo || userData.areaOrStreet)) {
          setFormData({
            customerName: userName,
            mobileNumber: userPhoneNumber,
            pincode: userData.pincode || '',
            houseNumber: userData.flatOrHouseNo || '',
            areaStreet: userData.areaOrStreet || '',
            landmark: userData.landmark || '',
            city: userData.city || '',
            state: userData.state || '',
            addressType: userData.addressType || 'Other',
            emailId: userData.email || '',
          });
          setIsAddressSaved(true);
          return; // Don't load from localStorage if we got data from DB
        } else {
          // Even if no address data, always set name and phone from user data
          setFormData(prev => ({
            ...prev,
            customerName: userName || prev.customerName,
            mobileNumber: userPhoneNumber || prev.mobileNumber
          }));
        }
      } catch (error) {
        console.error('Error loading user address from database:', error);
        // Don't fall through to localStorage - only use DB data
      }
      
      // Fallback to localStorage ONLY if phone number matches
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        try {
          const address = JSON.parse(savedAddress);
          
          // CRITICAL: Only use address if phone number matches logged-in user
          if (address.mobileNumber && address.mobileNumber !== userPhone) {
            console.warn('Saved address phone number does not match logged-in user. Ignoring saved address.');
            console.log('Saved address phone:', address.mobileNumber, 'Logged in phone:', userPhone);
            // Clear the mismatched address from localStorage
            localStorage.removeItem('selectedAddress');
            return;
          }
          
          // Only load if phone matches or if no phone in saved address (legacy data)
          if (!address.mobileNumber || address.mobileNumber === userPhone) {
            const userName = user.fullName || user.name || address.customerName || '';
            setFormData({
              customerName: userName,
              mobileNumber: userPhone, // Always use logged-in user's phone
              pincode: address.pincode || '',
              houseNumber: address.houseNumber || '',
              areaStreet: address.areaStreet || '',
              landmark: address.landmark || '',
              city: address.city || '',
              state: address.state || '',
              addressType: address.addressType || 'Other',
              emailId: address.emailId || '',
            });
            if (address.deliveryOption) {
              setDeliveryOption(address.deliveryOption);
            }
            setIsAddressSaved(true);
          }
        } catch (e) {
          console.error('Error loading address from localStorage:', e);
        }
      }
    };

    loadAddress();
  }, [isAuthenticated, user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const cartPath = getRoute(ROUTES.CART, resolvedSlug);
      navigate(cartPath);
    }
  }, [cart, storeSlug, currentStore, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    const userPhone = user?.phone;
    
    // If user is logged in, prevent changing phone number
    if (userPhone && value !== userPhone) {
      alert(`Phone number cannot be changed. Your registered phone number is ${userPhone}.`);
      setFormData(prev => ({
        ...prev,
        mobileNumber: userPhone
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      mobileNumber: value
    }));
  };

  // Auto-fill phone number and customer name from user data (runs immediately when user is available)
  useEffect(() => {
    if (isAuthenticated && user) {
      const userName = user.fullName || user.name || '';
      const userPhone = user.phone || '';
      
      setFormData(prev => ({
        ...prev,
        customerName: userName || prev.customerName,
        mobileNumber: userPhone || prev.mobileNumber
      }));
    }
  }, [isAuthenticated, user?.fullName, user?.name, user?.phone]);

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({
      ...prev,
      pincode: value
    }));
  };

  const handleSaveAddress = async (e, navigateAfterSave = false) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerName || !formData.mobileNumber || !formData.pincode || 
        !formData.houseNumber || !formData.areaStreet || !formData.city || !formData.state) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate mobile number
    if (formData.mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate pincode
    if (formData.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      alert('Please login to save your address');
      return;
    }

    const userPhone = user.phone;
    if (!userPhone) {
      alert('User phone number not found. Please login again.');
      return;
    }

    // CRITICAL: Verify phone number matches logged-in user
    if (formData.mobileNumber && formData.mobileNumber !== userPhone) {
      alert(`Phone number mismatch! The entered phone number (${formData.mobileNumber}) does not match your logged-in phone number (${userPhone}). Please use your registered phone number.`);
      // Auto-fill with logged-in user's phone
      setFormData(prev => ({
        ...prev,
        mobileNumber: userPhone
      }));
      return;
    }

    setIsSaving(true);

    try {
      // Map form data to database fields (matching database schema)
      // All fields match the backend User model exactly
      const addressData = {
        fullName: formData.customerName,
        phone: userPhone, // Always use logged-in user's phone
        email: formData.emailId || null,
        pincode: formData.pincode,
        flatOrHouseNo: formData.houseNumber, // Maps to flat_or_house_no column in DB
        areaOrStreet: formData.areaStreet, // Maps to area_or_street column in DB
        landmark: formData.landmark || null,
        city: formData.city,
        state: formData.state,
        addressType: formData.addressType || 'Other', // Maps to address_type column in DB
        whatsappUpdates: true // Default to true for order updates
      };

      // Save to database using logged-in user's phone number
      const token = user.token || localStorage.getItem('authToken');
      
      console.log('=== SAVING ADDRESS TO DATABASE ===');
      console.log('User Phone:', userPhone);
      console.log('Has Token:', !!token);
      console.log('Address Data to Save:', JSON.stringify(addressData, null, 2));
      console.log('Fields being saved:', {
        fullName: addressData.fullName,
        phone: addressData.phone,
        email: addressData.email,
        pincode: addressData.pincode,
        flatOrHouseNo: addressData.flatOrHouseNo,
        areaOrStreet: addressData.areaOrStreet,
        landmark: addressData.landmark,
        city: addressData.city,
        state: addressData.state,
        addressType: addressData.addressType,
        whatsappUpdates: addressData.whatsappUpdates
      });
      
      let updatedUser = null;
      let dbSaveSuccess = false;
      try {
        // Save by phone number (most reliable identifier)
        console.log('Attempting to save to database...');
        updatedUser = await updateUserAddressByPhone(userPhone, addressData, token);
        console.log('✅ Address saved to database successfully:', updatedUser);
        dbSaveSuccess = true;
      } catch (apiError) {
        console.error('❌ Failed to save address to database:', apiError);
        console.error('Error type:', typeof apiError);
        console.error('Error message:', apiError.message);
        console.error('Error stack:', apiError.stack);
        console.error('Phone used:', userPhone);
        console.error('Token present:', !!token);
        console.error('Address data sent:', addressData);
        
        // Check if it's a network error or server error
        const errorMsg = apiError.message || 'Database error';
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network error') || errorMsg.includes('timeout')) {
          console.warn('⚠️ Network error detected - will save to localStorage only');
          // Don't throw - allow localStorage save
        } else if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
          console.error('❌ API endpoint not found. Check backend routes.');
          throw new Error('Backend endpoint not found. Please check server configuration.');
        } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          console.warn('⚠️ Got 401 response. Endpoint is public, so this might be a token issue.');
          console.warn('⚠️ Continuing anyway - endpoint should work without authentication.');
          // Don't throw - endpoint is public, allow localStorage save
          // The error might be from invalid token, but endpoint should work without auth
        } else {
          // For other errors, still allow localStorage save but show the error
          console.warn('⚠️ Database save failed:', errorMsg);
          // Don't throw - allow localStorage save
        }
      }

      // Also save to localStorage for quick access (only if phone matches)
      const address = {
        ...formData,
        mobileNumber: userPhone, // Ensure phone matches logged-in user
        deliveryOption,
        userId: user.id || user.userId,
        userPhone: userPhone, // Store phone for verification
        storeId: currentStore?.storeId || currentStore?.id,
        storeSlug: storeSlug
      };

      // Save to localStorage - filter out any addresses with mismatched phone numbers
      const addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
      
      // Remove any addresses that don't match current user's phone
      const filteredAddresses = addresses.filter(
        addr => !addr.userPhone || addr.userPhone === userPhone || addr.mobileNumber === userPhone
      );
      
      // Check if address already exists for this user and store
      const existingIndex = filteredAddresses.findIndex(
        addr => (addr.userId === address.userId || addr.userPhone === userPhone) && addr.storeId === address.storeId
      );
      
      if (existingIndex !== -1) {
        filteredAddresses[existingIndex] = address;
      } else {
        filteredAddresses.push(address);
      }
      
      localStorage.setItem('addresses', JSON.stringify(filteredAddresses));
      localStorage.setItem('selectedAddress', JSON.stringify(address));

      // Update user in localStorage if needed
      if (updatedUser) {
        const updatedUserData = {
          ...user,
          ...addressData
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
      }

      setIsAddressSaved(true);
      if (navigateAfterSave) {
        navigateToPayment();
      }
      
      // Show appropriate success message
      if (dbSaveSuccess) {
        alert('✅ Address saved successfully to database!');
      } else {
        // Show error but still allow user to proceed
        const retry = confirm('⚠️ Could not connect to database.\n\nYour address has been saved locally.\n\nWould you like to try saving to database again?\n\n(Click OK to retry, Cancel to continue)');
        if (retry) {
          // Retry saving to database
          try {
            updatedUser = await updateUserAddressByPhone(userPhone, addressData, token);
            console.log('✅ Address saved to database on retry:', updatedUser);
            alert('✅ Address saved successfully to database!');
            dbSaveSuccess = true;
          } catch (retryError) {
            console.error('❌ Retry also failed:', retryError);
            alert('Still unable to connect to database. Your address is saved locally. Please check:\n\n1. Backend server is running on port 8080\n2. Your internet connection\n3. Browser console for details (F12)');
          }
        } else {
          alert('Address saved to local storage. You can proceed with checkout, but the address will only be available for this session.');
        }
      }

      // Navigate to confirm order page
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const confirmPath = getRoute(ROUTES.CHECKOUT_CONFIRM, resolvedSlug);
      // Reuse the address variable already created above (line 385)
      navigate(confirmPath, { state: { address } });
    } catch (error) {
      console.error('Error saving address:', error);
      let errorMessage = error.message || 'Unknown error';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
        errorMessage = 'Unable to connect to server. Please check:\n' +
          '1. Backend server is running on port 8080\n' +
          '2. Your internet connection\n' +
          '3. CORS settings if running locally';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        // Endpoint is public, so 401 shouldn't block the save
        errorMessage = 'Got authentication error, but endpoint is public. Address saved locally.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Server endpoint not found. Please check backend configuration.';
      }
      
      alert(`Failed to save address: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePincodeSettings = () => {
    alert('Pincode settings feature coming soon!');
  };

  const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div style={{
        background: isDarkMode ? '#1b1b1b' : '#fff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            left: 0,
            right: 0,
            height: '2px',
            background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#ddd',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              background: '#ff6d2e',
              width: '50%',
              transition: 'width 0.3s'
            }}></div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ff6d2e',
              border: '2px solid #ff6d2e',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#ff6d2e', fontWeight: '600' }}>Cart</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ff6d2e',
              border: '2px solid #ff6d2e',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }}>
              <span>−</span>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#ff6d2e', fontWeight: '600' }}>Address</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#ddd'}`,
              background: isDarkMode ? '#1b1b1b' : '#fff',
              color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }}>
              <span>3</span>
            </div>
            <span style={{ fontSize: '0.9rem', color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#666', fontWeight: '500' }}>Payment</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', 
        gap: '24px' 
      }}>
        {/* Address Form Section */}
        <div style={{
          background: isDarkMode ? '#1b1b1b' : '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: isDarkMode ? '#f5f5f5' : '#111',
            marginBottom: '24px'
          }}>
            Customer & Delivery Details
          </h2>

          {/* Delivery Options */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setDeliveryOption('delivery')}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: `2px solid ${deliveryOption === 'delivery' ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                borderRadius: '8px',
                background: deliveryOption === 'delivery' ? '#ff6d2e' : (isDarkMode ? '#1b1b1b' : '#fff'),
                color: deliveryOption === 'delivery' ? '#fff' : (isDarkMode ? '#f5f5f5' : '#111'),
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Delivery to Location
            </button>
            <button
              type="button"
              onClick={() => setDeliveryOption('pickup')}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: `2px solid ${deliveryOption === 'pickup' ? '#ff6d2e' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                borderRadius: '8px',
                background: deliveryOption === 'pickup' ? '#ff6d2e' : (isDarkMode ? '#1b1b1b' : '#fff'),
                color: deliveryOption === 'pickup' ? '#fff' : (isDarkMode ? '#f5f5f5' : '#111'),
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Pickup at Store
            </button>
          </div>

          {/* Address Form */}
          <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={(e) => {
                  // If user is logged in, prevent changing customer name
                  if (isAuthenticated && user) {
                    const userName = user.fullName || user.name;
                    if (userName && e.target.value !== userName) {
                      alert(`Customer name cannot be changed. Your registered name is ${userName}.`);
                      setFormData(prev => ({
                        ...prev,
                        customerName: userName
                      }));
                      return;
                    }
                  }
                  handleInputChange(e);
                }}
                placeholder="Name"
                required
                readOnly={isAuthenticated && user && (user.fullName || user.name) ? true : false}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isAuthenticated && user && (user.fullName || user.name)
                    ? (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0')
                    : (isDarkMode ? '#0e0e0e' : '#fff'),
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  transition: 'border-color 0.2s',
                  cursor: isAuthenticated && user && (user.fullName || user.name) ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  if (!(isAuthenticated && user && (user.fullName || user.name))) {
                    e.target.style.borderColor = '#ff6d2e';
                  }
                }}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              />
              {isAuthenticated && user && (user.fullName || user.name) && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#ff6d2e', 
                  margin: '4px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                  Customer name is locked to your registered name: {user.fullName || user.name}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Mobile Number *
              </label>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{
                  padding: '12px 16px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f6f6f6',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  +91
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleMobileNumberChange}
                  placeholder="Mobile Number"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  readOnly={isAuthenticated && user?.phone ? true : false}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.95rem',
                    background: isAuthenticated && user?.phone 
                      ? (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0')
                      : (isDarkMode ? '#0e0e0e' : '#fff'),
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    transition: 'border-color 0.2s',
                    cursor: isAuthenticated && user?.phone ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!(isAuthenticated && user?.phone)) {
                      e.target.style.borderColor = '#ff6d2e';
                    }
                  }}
                  onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
                />
              </div>
              {isAuthenticated && user?.phone && (
                <small style={{
                  fontSize: '0.8rem',
                  color: '#ff6d2e',
                  fontStyle: 'italic',
                  marginTop: '4px'
                }}>
                  Phone number is locked to your registered number: {user.phone}
                </small>
              )}
              <small style={{
                fontSize: '0.85rem',
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                marginTop: '-4px'
              }}>
                Updates regarding your order will be sent over WhatsApp
              </small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Pincode *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  placeholder="E.g. 410055"
                  required
                  pattern="[0-9]{6}"
                  maxLength="6"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    background: isDarkMode ? '#0e0e0e' : '#fff',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                  onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
                />
                <button
                  type="button"
                  onClick={handlePincodeSettings}
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: 0,
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                    borderRadius: '8px',
                    background: '#ff6d2e',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e55a1f';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 109, 46, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ff6d2e';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Flat, House no, Building, Company, Apartment *
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleInputChange}
                placeholder="House / Flat / Floor No."
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Area, Street, Sector, Village *
              </label>
              <input
                type="text"
                name="areaStreet"
                value={formData.areaStreet}
                onChange={handleInputChange}
                placeholder="Apartment/ Road / Area"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Near apollo hospital"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Town/City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '36px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? '%23fff' : '%23333'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                Address Type
              </label>
              <select
                name="addressType"
                value={formData.addressType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '36px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDarkMode ? '%23fff' : '%23333'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: isDarkMode ? '#f5f5f5' : '#111'
              }}>
                E-mail ID
              </label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleInputChange}
                placeholder="Email ID"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: isDarkMode ? '#0e0e0e' : '#fff',
                  color: isDarkMode ? '#f5f5f5' : '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
              />
            </div>
          </form>
        </div>

        {/* Bill Details Section */}
        <div style={{
          background: isDarkMode ? '#1b1b1b' : '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          height: 'fit-content',
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? '0' : '100px'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: isDarkMode ? '#f5f5f5' : '#111',
            marginBottom: '20px'
          }}>
            Bill Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
            }}>
              <span>Item Total</span>
              <span>₹{itemTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: '#388e3c',
              fontWeight: '600'
            }}>
              <span>Delivery Fee</span>
              <span>FREE</span>
            </div>
            <div style={{
              height: '1px',
              background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              margin: '16px 0'
            }}></div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: '700',
              color: isDarkMode ? '#f5f5f5' : '#111'
            }}>
              <span>Order Total:</span>
              <span>₹{orderTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              if (isAddressSaved) {
                navigateToPayment();
              } else {
                handleSaveAddress(e, true);
              }
            }}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '14px',
              background: isDarkMode ? '#1b1b1b' : '#fff',
              color: isDarkMode ? '#f5f5f5' : '#111',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              marginTop: '20px',
              transition: 'all 0.3s',
              opacity: isSaving ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f6f6f6';
                e.target.style.borderColor = '#ff6d2e';
                e.target.style.color = '#ff6d2e';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.target.style.background = isDarkMode ? '#1b1b1b' : '#fff';
                e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
                e.target.style.color = isDarkMode ? '#f5f5f5' : '#111';
              }
            }}
          >
            {isSaving ? 'Saving...' : (isAddressSaved ? 'Continue to Payment' : 'Save Address')}
          </button>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.3s',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
        }}
        title="Contact us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
};

export default Checkout;
