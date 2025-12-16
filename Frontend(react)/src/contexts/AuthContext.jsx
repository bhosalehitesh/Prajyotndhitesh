import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user:', e);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    
    return `${protocol}//${hostname}:8080/api`;
  };

  const sendOTP = async (phone) => {
    try {
      const API_BASE = getBackendUrl();
      const url = `${API_BASE}/user/send-otp`;
      console.log('Sending OTP request to:', url);
      console.log('Request body:', { phone });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('Error response text:', text);
          errorData = { message: text || `Server error: ${response.status} ${response.statusText}` };
        }
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('OTP sent successfully, response:', data);
      return data;
    } catch (error) {
      console.error('sendOTP error:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:8080');
      }
      throw error;
    }
  };

  const verifyOTP = async (phone, code, fullName = null) => {
    try {
      const API_BASE = getBackendUrl();
      // Use provided fullName or default to "User" + last 4 digits of phone
      const userFullName = fullName || `User ${phone.slice(-4)}`;
      const url = `${API_BASE}/user/verify-otp`;
      const requestBody = { phone, code, fullName: userFullName };
      
      console.log('Verifying OTP request to:', url);
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('Error response text:', text);
          errorData = { message: text || `Server error: ${response.status} ${response.statusText}` };
        }
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('OTP verified successfully, response data:', data);
      
      // Validate response data
      if (!data.token) {
        throw new Error('Invalid response: Token not received from server');
      }
      
      // Fetch full user data from database to get all fields
      let fullUserData = null;
      try {
        const { getUserByPhone } = await import('../utils/api');
        fullUserData = await getUserByPhone(phone, data.token);
        console.log('Fetched full user data:', fullUserData);
      } catch (error) {
        console.warn('Could not fetch full user data, using basic data:', error);
      }
      
      // Build user object with all database fields
      const currentUser = {
        id: data.userId || fullUserData?.id,
        userId: data.userId || fullUserData?.id,
        name: fullUserData?.fullName || data.fullName || `User ${phone.slice(-4)}`,
        fullName: fullUserData?.fullName || data.fullName || `User ${phone.slice(-4)}`,
        phone: fullUserData?.phone || data.phone || phone,
        email: fullUserData?.email || null,
        token: data.token,
        // Address fields from database
        pincode: fullUserData?.pincode || null,
        flatOrHouseNo: fullUserData?.flatOrHouseNo || null,
        areaOrStreet: fullUserData?.areaOrStreet || null,
        landmark: fullUserData?.landmark || null,
        city: fullUserData?.city || null,
        state: fullUserData?.state || null,
        addressType: fullUserData?.addressType || null,
        whatsappUpdates: fullUserData?.whatsappUpdates !== undefined ? fullUserData.whatsappUpdates : true,
        enabled: fullUserData?.enabled !== undefined ? fullUserData.enabled : true,
        createdAt: fullUserData?.createdAt || null,
        updatedAt: fullUserData?.updatedAt || null
      };

      console.log('Setting user with full DB fields:', currentUser);
      setUser(currentUser);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('rememberUser', 'true');

      return currentUser;
    } catch (error) {
      console.error('verifyOTP error:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:8080');
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberUser');
  };

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

