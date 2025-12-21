import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LoginPromptContext = createContext();

export const useLoginPrompt = () => {
  const context = useContext(LoginPromptContext);
  if (!context) {
    throw new Error('useLoginPrompt must be used within a LoginPromptProvider');
  }
  return context;
};

export const LoginPromptProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Execute pending action when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && pendingAction && typeof pendingAction === 'function') {
      // Small delay to ensure auth state is fully updated
      const timer = setTimeout(() => {
        try {
          pendingAction();
          setPendingAction(null);
          setActionMessage('');
        } catch (error) {
          console.error('Error executing pending action after login:', error);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pendingAction]);

  // Show login modal with a pending action
  const promptLogin = useCallback((action, message = 'Please login to continue') => {
    console.log('🔐 [LoginPrompt] promptLogin called', { isAuthenticated, hasAction: !!action, message });
    
    if (isAuthenticated) {
      // User is already logged in, execute action immediately
      console.log('✅ [LoginPrompt] User already authenticated, executing action immediately');
      if (action && typeof action === 'function') {
        action();
      }
      return;
    }

    // Store the action to execute after login
    console.log('📱 [LoginPrompt] Showing login modal with message:', message);
    setPendingAction(() => action);
    setActionMessage(message);
    setShowLoginModal(true);
    console.log('📱 [LoginPrompt] Login modal state set to true');
  }, [isAuthenticated]);

  // Execute pending action after successful login
  const executePendingAction = useCallback(() => {
    if (pendingAction && typeof pendingAction === 'function') {
      try {
        pendingAction();
        setPendingAction(null);
        setActionMessage('');
      } catch (error) {
        console.error('Error executing pending action:', error);
      }
    }
  }, [pendingAction]);

  // Close login modal
  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
    // Don't clear pending action - user might want to login later
  }, []);

  // Clear pending action (e.g., when user dismisses modal)
  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
    setActionMessage('');
  }, []);

  const value = {
    showLoginModal,
    promptLogin,
    executePendingAction,
    closeLoginModal,
    clearPendingAction,
    actionMessage,
    hasPendingAction: !!pendingAction
  };

  return (
    <LoginPromptContext.Provider value={value}>
      {children}
    </LoginPromptContext.Provider>
  );
};
