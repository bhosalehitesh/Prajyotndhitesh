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
      const response = await fetch(`${API_BASE}/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Server error: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phone, code) => {
    try {
      const API_BASE = getBackendUrl();
      const response = await fetch(`${API_BASE}/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Server error: ${response.status} ${response.statusText}` 
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const currentUser = {
        id: data.userId,
        userId: data.userId,
        name: data.fullName || `User ${phone.slice(-4)}`,
        fullName: data.fullName || `User ${phone.slice(-4)}`,
        phone: data.phone || phone,
        token: data.token
      };

      setUser(currentUser);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('rememberUser', 'true');

      return currentUser;
    } catch (error) {
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

