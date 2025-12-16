import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { updateUserAddress, getUserById } from '../utils/api';

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

  const itemTotal = getCartTotal();
  const deliveryFee = 0; // Free delivery
  const orderTotal = itemTotal + deliveryFee;

  // Load saved address from database or localStorage
  useEffect(() => {
    const loadAddress = async () => {
      // First try to load from database if user is authenticated
      if (isAuthenticated && user) {
        try {
          const token = user.token || localStorage.getItem('authToken');
          const userData = await getUserById(user.id || user.userId, token);
          
          // If user has address data in database, use it
          if (userData.pincode || userData.flatOrHouseNo || userData.areaOrStreet) {
            setFormData({
              customerName: userData.fullName || userData.full_name || '',
              mobileNumber: userData.phone || '',
              pincode: userData.pincode || '',
              houseNumber: userData.flatOrHouseNo || userData.flat_or_house_no || '',
              areaStreet: userData.areaOrStreet || userData.area_or_street || '',
              landmark: userData.landmark || '',
              city: userData.city || '',
              state: userData.state || '',
              addressType: userData.addressType || userData.address_type || 'Other',
              emailId: userData.email || '',
            });
            setIsAddressSaved(true);
            return; // Don't load from localStorage if we got data from DB
          }
        } catch (error) {
          console.error('Error loading user address from database:', error);
          // Fall through to localStorage
        }
      }
      
      // Fallback to localStorage
      const savedAddress = localStorage.getItem('selectedAddress');
      if (savedAddress) {
        try {
          const address = JSON.parse(savedAddress);
          setFormData({
            customerName: address.customerName || '',
            mobileNumber: address.mobileNumber || '',
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
      const cartPath = resolvedSlug ? `/store/${resolvedSlug}/cart` : '/cart';
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
    setFormData(prev => ({
      ...prev,
      mobileNumber: value
    }));
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({
      ...prev,
      pincode: value
    }));
  };

  const handleSaveAddress = async (e) => {
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
      // Optionally redirect to login
      return;
    }

    setIsSaving(true);

    try {
      // Map form data to database fields
      const addressData = {
        fullName: formData.customerName,
        phone: formData.mobileNumber,
        email: formData.emailId || null,
        pincode: formData.pincode,
        flatOrHouseNo: formData.houseNumber,
        areaOrStreet: formData.areaStreet,
        landmark: formData.landmark || null,
        city: formData.city,
        state: formData.state,
        addressType: formData.addressType || 'Other',
        whatsappUpdates: true // Default to true for order updates
      };

      // Save to database
      const token = user.token || localStorage.getItem('authToken');
      const updatedUser = await updateUserAddress(user.id || user.userId, addressData, token);

      // Also save to localStorage for quick access
      const address = {
        ...formData,
        deliveryOption,
        userId: user.id || user.userId,
        storeId: currentStore?.storeId || currentStore?.id,
        storeSlug: storeSlug
      };

      const addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
      // Check if address already exists for this user and store
      const existingIndex = addresses.findIndex(
        addr => addr.userId === address.userId && addr.storeId === address.storeId
      );
      
      if (existingIndex !== -1) {
        addresses[existingIndex] = address;
      } else {
        addresses.push(address);
      }
      
      localStorage.setItem('addresses', JSON.stringify(addresses));
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
      alert('Address saved successfully!');

      // Navigate to payment page
      const resolvedSlug = storeSlug || (currentStore?.storeLink ? currentStore.storeLink.split('/').filter(Boolean).pop() : null);
      const paymentPath = resolvedSlug ? `/store/${resolvedSlug}/payment` : '/payment';
      navigate(paymentPath);
    } catch (error) {
      console.error('Error saving address:', error);
      alert(`Failed to save address: ${error.message || 'Unknown error'}`);
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
                onChange={handleInputChange}
                placeholder="Name"
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
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.95rem',
                    background: isDarkMode ? '#0e0e0e' : '#fff',
                    color: isDarkMode ? '#f5f5f5' : '#111',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6d2e'}
                  onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}
                />
              </div>
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
            onClick={handleSaveAddress}
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
