import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AUTH_TOKEN_KEY, AUTH_PHONE_KEY, storage } from './storage';

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      // Always set loading to false, even on error
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    try {
      await storage.setItem(AUTH_TOKEN_KEY, token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem(AUTH_TOKEN_KEY);
      await storage.removeItem(AUTH_PHONE_KEY);
      await storage.removeItem('userPassword');
      await storage.removeItem('userName');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
