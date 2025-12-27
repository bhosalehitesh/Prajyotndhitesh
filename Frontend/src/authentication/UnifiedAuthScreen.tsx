import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AUTH_TOKEN_KEY, AUTH_PHONE_KEY, storage } from './storage';
import { signup, verifyOtp, login as apiLogin, sendLoginOtp, loginWithOtp, getSellerDetails, getCurrentSellerStoreDetails, API_BASE_URL, sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from '../utils/api';
import { useAuth } from './AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UnifiedAuthScreenProps {
  onAuthenticated: () => void;
}

type AuthMode = 'signup' | 'signin';
type SignInMethod = 'password' | 'otp';

const UnifiedAuthScreen: React.FC<UnifiedAuthScreenProps> = ({ onAuthenticated }) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('password');

  // Sign Up fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState('');

  // Sign In fields
  const [signInMobile, setSignInMobile] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInOtp, setSignInOtp] = useState('');
  const [signInOtpSent, setSignInOtpSent] = useState<string>('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Forgot Password fields
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'phone' | 'otp' | 'reset'>('phone');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Sign Up validations
  const isSignUpFormValid = useMemo(() => {
    const nameValid = firstName.trim().length > 0 && lastName.trim().length > 0;
    const mobileValid = /^\d{10}$/.test(mobileNumber.replace(/\D/g, ''));
    const passwordValid = password.length >= 6;
    return nameValid && mobileValid && passwordValid;
  }, [firstName, lastName, mobileNumber, password]);

  const isSignUpOtpValid = useMemo(() => {
    return /^\d{6}$/.test(otp);
  }, [otp]);

  // Sign In validations
  const isSignInMobileValid = useMemo(() => {
    return /^\d{10}$/.test(signInMobile.replace(/\D/g, ''));
  }, [signInMobile]);

  const isSignInPasswordValid = useMemo(() => {
    return signInPassword.length >= 6;
  }, [signInPassword]);

  const isSignInOtpValid = useMemo(() => {
    return /^\d{6}$/.test(signInOtp);
  }, [signInOtp]);

  // Forgot Password validations
  const isNewPasswordValid = useMemo(() => {
    return newPassword.length >= 6;
  }, [newPassword]);

  const isConfirmPasswordValid = useMemo(() => {
    return confirmPassword === newPassword && confirmPassword.length >= 6;
  }, [confirmPassword, newPassword]);

  // Sign Up Functions
  const handleVerifyMobile = async () => {
    if (!isSignUpFormValid) {
      Alert.alert('Validation', 'Please fill all fields correctly. Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      console.log('Starting signup process...', { fullName, phone: cleanMobile });

      // Call backend API to signup and get OTP
      const otpCode = await signup({
        fullName,
        phone: cleanMobile,
        password,
      });

      console.log('Signup completed, OTP received:', otpCode ? 'Yes' : 'No');

      // Store OTP for verification
      if (otpCode) {
        setOtpSent(otpCode);
      }

      setStep('verification');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Signup error in handleVerifyMobile:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        console.log('Error message:', msg);

        if (msg.includes('timeout') || msg.includes('timed out')) {
          errorMessage = `Request timed out. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`;
        } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
          errorMessage = `Network error. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`;
        } else if (msg.includes('already exists') || msg.includes('seller already exists')) {
          errorMessage = 'An account with this mobile number already exists. Please sign in instead.';
        } else if (msg.includes('required') || msg.includes('invalid')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message || 'Failed to send OTP. Please try again.';
        }
      }

      console.log('Showing error alert:', errorMessage);
      Alert.alert('Signup Error', errorMessage);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isSignUpOtpValid) {
      Alert.alert('Validation', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    const cleanMobile = mobileNumber.replace(/\D/g, '');

    try {
      // Verify OTP with backend and get token + seller info
      const authResponse = await verifyOtp({
        phone: cleanMobile,
        code: otp,
      });

      // Store authentication data
      await login(authResponse.token);
      await storage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      await storage.setItem(AUTH_PHONE_KEY, cleanMobile);
      await storage.setItem('userName', authResponse.fullName || `${firstName} ${lastName}`);
      await storage.setItem('userPassword', password);

      // Validate and store userId - must be a valid number > 0
      if (authResponse.userId && typeof authResponse.userId === 'number' && authResponse.userId > 0) {
        await storage.setItem('userId', authResponse.userId.toString());
      } else {
        console.error('Invalid userId in verifyOtp response:', authResponse.userId);
        throw new Error('Signup failed: Invalid user ID received');
      }

      // Fetch and store seller details and store details
      try {
        if (authResponse.userId) {
          // Fetch seller details
          const sellerDetails = await getSellerDetails(authResponse.userId);
          if (sellerDetails) {
            await storage.setItem('userName', sellerDetails.fullName || authResponse.fullName || `${firstName} ${lastName}`);
            await storage.setItem('sellerDetails', JSON.stringify(sellerDetails));
          }

          // Fetch store details (may not exist for new users)
          const storeDetails = await getCurrentSellerStoreDetails();
          if (storeDetails) {
            await storage.setItem('storeName', storeDetails.storeName || '');
            await storage.setItem('storeLink', storeDetails.storeLink || '');
            await storage.setItem('storeId', storeDetails.storeId?.toString() || '');
          }
        }
      } catch (error) {
        console.warn('Could not fetch user details after signup:', error);
        // Continue with signup even if details fetch fails
      }

      // Mark this as a sign-up (new user) - they may need onboarding
      await storage.setItem('isSignIn', 'false');

      setLoading(false);
      onAuthenticated();
    } catch (error) {
      setLoading(false);
      console.error('OTP verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleResendOtp = async () => {
    if (!isSignUpFormValid) {
      Alert.alert('Validation', 'Please ensure all fields are filled correctly.');
      return;
    }

    setLoading(true);
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      // Resend OTP by calling signup again
      const otpCode = await signup({
        fullName,
        phone: cleanMobile,
        password,
      });

      if (otpCode) {
        setOtpSent(otpCode);
      }
      setOtp('');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  // Sign In Functions
  const handleSendSignInOtp = async () => {
    if (!isSignInMobileValid) {
      Alert.alert('Validation', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const cleanMobile = signInMobile.replace(/\D/g, '');

    try {
      const otp = await sendLoginOtp(cleanMobile);
      // Store the OTP value for display and auto-fill
      if (otp) {
        setSignInOtpSent(otp);
        console.log('Login OTP:', otp);
      } else {
        setSignInOtpSent(''); // Clear if no OTP received
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!isSignInMobileValid) {
      Alert.alert('Validation', 'Please enter a valid mobile number.');
      return;
    }

    if (signInMethod === 'password') {
      if (!isSignInPasswordValid) {
        Alert.alert('Validation', 'Please enter a valid password.');
        return;
      }

      setLoading(true);
      const cleanMobile = signInMobile.replace(/\D/g, '');

      try {
        console.log('Attempting login with:', { phone: cleanMobile });

        // Login with backend API
        const authResponse = await apiLogin({
          phone: cleanMobile,
          password: signInPassword,
        });

        console.log('Login response received:', authResponse);

        // Validate response
        if (!authResponse) {
          throw new Error('Login failed: No response from server');
        }

        if (!authResponse.token) {
          console.error('Login failed: No token in response', authResponse);
          throw new Error('Login failed: Invalid response from server - no token received');
        }

        console.log('Storing authentication data...');

        // Store authentication data
        await login(authResponse.token);
        await storage.setItem(AUTH_TOKEN_KEY, authResponse.token);
        await storage.setItem(AUTH_PHONE_KEY, cleanMobile);
        await storage.setItem('userName', authResponse.fullName || '');
        await storage.setItem('userPassword', signInPassword);

        // Validate and store userId - must be a valid number > 0
        if (authResponse.userId && typeof authResponse.userId === 'number' && authResponse.userId > 0) {
          await storage.setItem('userId', authResponse.userId.toString());
        } else {
          console.error('Invalid userId in login response:', authResponse.userId);
          throw new Error('Login failed: Invalid user ID received');
        }

        // Fetch and store seller details and store details
        try {
          if (authResponse.userId) {
            // Fetch seller details
            const sellerDetails = await getSellerDetails(authResponse.userId);
            if (sellerDetails) {
              await storage.setItem('userName', sellerDetails.fullName || authResponse.fullName || '');
              await storage.setItem('sellerDetails', JSON.stringify(sellerDetails));
            }

            // Fetch store details
            const storeDetails = await getCurrentSellerStoreDetails();
            if (storeDetails) {
              await storage.setItem('storeName', storeDetails.storeName || '');
              await storage.setItem('storeLink', storeDetails.storeLink || '');
              await storage.setItem('storeId', storeDetails.storeId?.toString() || '');
              // Save logo URL if available
              if (storeDetails.logoUrl) {
                await storage.setItem('storeLogoUrl', storeDetails.logoUrl);
              }
            }
          }
        } catch (error) {
          console.warn('Could not fetch user details after login:', error);
          // Continue with login even if details fetch fails
        }

        // Mark this as a sign-in (not sign-up) so onboarding can be skipped
        await storage.setItem('isSignIn', 'true');

        console.log('Login successful, calling onAuthenticated...');
        setLoading(false);
        onAuthenticated();
      } catch (error) {
        setLoading(false);
        console.error('Login error details:', error);

        let errorMessage = 'Failed to sign in. Please check your credentials.';

        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          console.log('Error message:', msg);

          if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('network request failed')) {
            errorMessage = `Network error. Please check your internet connection and ensure the backend is running at ${API_BASE_URL}`;
          } else if (msg.includes('not found') || msg.includes('seller not found') || msg.includes('account not found')) {
            errorMessage = 'No account found with this mobile number. Please sign up first.';
          } else if (msg.includes('password') || msg.includes('invalid password') || msg.includes('incorrect')) {
            errorMessage = 'Incorrect password. Please try again.';
          } else if (msg.includes('verify') || msg.includes('otp') || msg.includes('please verify')) {
            errorMessage = 'Please verify your account with OTP first.';
          } else {
            errorMessage = error.message || 'Failed to sign in. Please try again.';
          }
        } else {
          console.error('Unknown error type:', typeof error, error);
          errorMessage = 'An unexpected error occurred. Please try again.';
        }

        console.log('Showing error alert:', errorMessage);
        Alert.alert('Login Error', errorMessage);
      }
    } else {
      // OTP-based sign-in
      if (!isSignInOtpValid) {
        Alert.alert('Validation', 'Please enter a valid 6-digit OTP.');
        return;
      }

      setLoading(true);
      const cleanMobile = signInMobile.replace(/\D/g, '');

      try {
        const authResponse = await loginWithOtp(cleanMobile, signInOtp);

        // Store authentication data
        await login(authResponse.token);
        await storage.setItem(AUTH_TOKEN_KEY, authResponse.token);
        await storage.setItem(AUTH_PHONE_KEY, cleanMobile);
        await storage.setItem('userName', authResponse.fullName || '');

        // Validate and store userId - must be a valid number > 0
        if (authResponse.userId && typeof authResponse.userId === 'number' && authResponse.userId > 0) {
          await storage.setItem('userId', authResponse.userId.toString());
        } else {
          console.error('Invalid userId in loginWithOtp response:', authResponse.userId);
          throw new Error('Login failed: Invalid user ID received');
        }

        // Fetch and store seller details and store details
        try {
          if (authResponse.userId) {
            // Fetch seller details
            const sellerDetails = await getSellerDetails(authResponse.userId);
            if (sellerDetails) {
              await storage.setItem('userName', sellerDetails.fullName || authResponse.fullName || '');
              await storage.setItem('sellerDetails', JSON.stringify(sellerDetails));
            }

            // Fetch store details
            const storeDetails = await getCurrentSellerStoreDetails();
            if (storeDetails) {
              await storage.setItem('storeName', storeDetails.storeName || '');
              await storage.setItem('storeLink', storeDetails.storeLink || '');
              await storage.setItem('storeId', storeDetails.storeId?.toString() || '');
              // Save logo URL if available
              if (storeDetails.logoUrl) {
                await storage.setItem('storeLogoUrl', storeDetails.logoUrl);
              }
            }
          }
        } catch (error) {
          console.warn('Could not fetch user details after OTP login:', error);
          // Continue with login even if details fetch fails
        }

        await storage.setItem('isSignIn', 'true');

        setLoading(false);
        onAuthenticated();
      } catch (error) {
        setLoading(false);
        const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';

        if (errorMessage.includes('Invalid OTP') || errorMessage.includes('Incorrect')) {
          Alert.alert('Error', 'Incorrect OTP. Please try again.');
        } else if (errorMessage.includes('expired')) {
          Alert.alert('Error', 'OTP expired. Please request a new one.');
        } else if (errorMessage.includes('not found')) {
          Alert.alert('Error', 'No account found with this mobile number. Please sign up first.');
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!isSignInMobileValid) {
      Alert.alert('Validation', 'Please enter your mobile number first.');
      return;
    }

    setLoading(true);
    const cleanMobile = signInMobile.replace(/\D/g, '');

    try {
      console.log('📱 [Forgot Password] Requesting OTP for:', cleanMobile);
      
      // Call backend API to send forgot password OTP
      const otpCode = await sendForgotPasswordOtp(cleanMobile);
      
      setSignInOtpSent(otpCode || '');
      setIsForgotPassword(true);
      setForgotPasswordStep('otp');
      setSignInPassword('');
      setSignInOtp('');
      
      Alert.alert(
        'OTP Sent',
        `We've sent an OTP to ${signInMobile}. Please enter it to reset your password.${otpCode ? `\n\nOTP (Dev): ${otpCode}` : ''}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      console.error('❌ [Forgot Password] Error:', errorMessage);
      
      if (errorMessage.includes('not found')) {
      Alert.alert(
        'Account Not Found',
        'No account found with this mobile number. Please sign up first.',
        [{ text: 'OK' }]
      );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async () => {
    if (!isSignInOtpValid) {
      Alert.alert('Validation', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    const cleanMobile = signInMobile.replace(/\D/g, '');

    try {
      console.log('📱 [Forgot Password] Verifying OTP for:', cleanMobile);
      
      // Verify OTP with backend
      await verifyForgotPasswordOtp(cleanMobile, signInOtp);
      
      // Move to password reset step
      setForgotPasswordStep('reset');
      setSignInOtp('');
      
      Alert.alert('Success', 'OTP verified! Please enter your new password.', [{ text: 'OK' }]);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed. Please try again.';
      console.error('❌ [Forgot Password] OTP verification error:', errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isNewPasswordValid) {
      Alert.alert('Validation', 'Password must be at least 6 characters long.');
      return;
    }

    if (!isConfirmPasswordValid) {
      Alert.alert('Validation', 'Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    const cleanMobile = signInMobile.replace(/\D/g, '');

    try {
      console.log('📱 [Reset Password] Resetting password for:', cleanMobile);
      
      // Reset password (backend returns token but we won't use it - user needs to login)
      const authResponse = await resetPassword(cleanMobile, newPassword);
      
      console.log('✅ [Reset Password] Password reset successful');
      
      // Validate response to ensure password was reset
      if (!authResponse || !authResponse.token) {
        throw new Error('Password reset failed: Invalid response from server');
      }

      // Reset all forgot password states
      setIsForgotPassword(false);
      setForgotPasswordStep('phone');
      setNewPassword('');
      setConfirmPassword('');
      setSignInOtp('');
      setSignInOtpSent('');
      // Keep the mobile number in the login field so user can easily login
      // setSignInMobile(''); // Don't clear mobile - user can login with it
      setSignInPassword(''); // Clear password field
      setSignInMethod('password'); // Switch back to password login method

      // Show success message and return to login screen
    Alert.alert(
        'Password Reset Successful', 
        'Your password has been reset successfully. Please login with your new password.',
        [{ 
          text: 'OK', 
          onPress: () => {
            // User will now be on login screen and can login with new password
            console.log('✅ User returned to login screen after password reset');
          }
        }]
      );
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed. Please try again.';
      console.error('❌ [Reset Password] Error:', errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTermsPress = () => {
    Alert.alert('Terms and Conditions', 'Terms and conditions content will be displayed here.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.');
  };

  return (
    <LinearGradient colors={['#ff85b3', '#a30f5b']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Section: Logo & Welcome Text */}
            <View style={styles.topSection}>
              <View style={styles.logoSquircle}>
                <Image
                  source={require('../assets/images/logo.png.jpg')}
                  style={styles.logoImage}
                // resizeMode="contain" // Handled in style
                />
              </View>
              <Text style={styles.welcomeTitleWhite}>Welcome!</Text>
              <Text style={styles.welcomeSubtitleWhite}>
                {authMode === 'signin' ? 'Let’s continue growing your business' : 'Sign up to get started'}
              </Text>
            </View>

            {/* Floating White Card */}
            <View style={styles.floatingCard}>
              {authMode === 'signin' ? (
                // SIGN IN FORM OR FORGOT PASSWORD FLOW
                <View>
                  {isForgotPassword ? (
                    // FORGOT PASSWORD FLOW
                    <View>
                      {/* Back Button */}
                      <TouchableOpacity
                        onPress={() => {
                          setIsForgotPassword(false);
                          setForgotPasswordStep('phone');
                          setSignInOtp('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        style={{ marginBottom: 15, alignSelf: 'flex-start' }}
                      >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#e61580" />
                      </TouchableOpacity>

                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 10, textAlign: 'center' }}>
                        Reset Password
                      </Text>

                      {forgotPasswordStep === 'otp' ? (
                        // OTP VERIFICATION STEP
                        <View>
                          <Text style={{ textAlign: 'center', marginBottom: 20, color: '#6c757d' }}>
                            Enter the OTP sent to +91 {signInMobile}
                          </Text>

                          <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="message-lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder="Enter OTP"
                              placeholderTextColor="#9ca3af"
                              keyboardType="number-pad"
                              value={signInOtp}
                              onChangeText={(text) => setSignInOtp(text.replace(/\D/g, '').slice(0, 6))}
                              maxLength={6}
                            />
                          </View>

                          {/* Demo OTP Box */}
                          {signInOtpSent && signInOtpSent.length > 0 && (
                            <View style={styles.demoOtpBox}>
                              <Text style={styles.demoOtpText}>{signInOtpSent}</Text>
                              <TouchableOpacity onPress={() => setSignInOtp(signInOtpSent)}>
                                <Text style={{ color: '#6c757d', fontSize: 12, marginTop: 4 }}>Tap to Auto-Fill</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          <TouchableOpacity
                            style={[
                              styles.primaryButton,
                              (!isSignInOtpValid || loading) && styles.buttonDisabled
                            ]}
                            onPress={handleVerifyForgotPasswordOtp}
                            disabled={!isSignInOtpValid || loading}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.primaryButtonText}>
                              {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : forgotPasswordStep === 'reset' ? (
                        // PASSWORD RESET STEP
                        <View>
                          <Text style={{ textAlign: 'center', marginBottom: 20, color: '#6c757d' }}>
                            Enter your new password
                          </Text>

                          {/* New Password Input */}
                          <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder="New Password"
                              placeholderTextColor="#9ca3af"
                              secureTextEntry={!showNewPassword}
                              value={newPassword}
                              onChangeText={setNewPassword}
                              autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                              <MaterialCommunityIcons
                                name={showNewPassword ? 'eye-off' : 'eye'}
                                size={24}
                                color="#9ca3af"
                              />
                            </TouchableOpacity>
                          </View>

                          {/* Confirm Password Input */}
                          <View style={[styles.inputContainer, { marginTop: 15 }]}>
                            <MaterialCommunityIcons name="lock-check-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder="Confirm Password"
                              placeholderTextColor="#9ca3af"
                              secureTextEntry={!showConfirmPassword}
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                              autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <MaterialCommunityIcons
                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                size={24}
                                color="#9ca3af"
                              />
                            </TouchableOpacity>
                          </View>

                          {confirmPassword.length > 0 && !isConfirmPasswordValid && (
                            <Text style={{ color: '#e61580', fontSize: 12, marginTop: 5 }}>
                              Passwords do not match
                            </Text>
                          )}

                          <TouchableOpacity
                            style={[
                              styles.primaryButton,
                              (!isConfirmPasswordValid || loading) && styles.buttonDisabled
                            ]}
                            onPress={handleResetPassword}
                            disabled={!isConfirmPasswordValid || loading}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.primaryButtonText}>
                              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    // NORMAL SIGN IN FORM
                <View>
                  {/* Mobile Input (Username equivalent) */}
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="account-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      value={signInMobile}
                      onChangeText={(text) => setSignInMobile(text.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                  </View>

                  {signInMethod === 'password' ? (
                    <View>
                      {/* Password Input */}
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry={!showSignInPassword}
                          value={signInPassword}
                          onChangeText={setSignInPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowSignInPassword(!showSignInPassword)}>
                          <MaterialCommunityIcons
                            name={showSignInPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#9ca3af"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      {/* OTP Input */}
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="message-lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter OTP"
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          value={signInOtp}
                          onChangeText={(text) => setSignInOtp(text.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                        />
                      </View>

                      {/* Pre-login OTP Send Button placed cleaner */}
                      {!signInOtpSent && (
                        <TouchableOpacity onPress={handleSendSignInOtp} style={{ alignSelf: 'flex-end', marginBottom: 10 }}>
                          <Text style={{ color: '#e61580', fontWeight: 'bold' }}>Get OTP</Text>
                        </TouchableOpacity>
                      )}

                      {/* Demo OTP Box */}
                      {signInOtpSent && signInOtpSent.length > 0 && (
                        <View style={styles.demoOtpBox}>
                          <Text style={styles.demoOtpText}>{signInOtpSent}</Text>
                          <TouchableOpacity onPress={() => setSignInOtp(signInOtpSent)}>
                            <Text style={{ color: '#6c757d', fontSize: 12, marginTop: 4 }}>Tap to Auto-Fill</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Primary LOGIN Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      loading && styles.buttonDisabled
                    ]}
                    onPress={handleSignIn}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'PROCESSING...' : 'LOGIN'}
                    </Text>
                  </TouchableOpacity>

                  {/* Footer Row: Forgot Password & Sign Up */}
                  <View style={styles.footerRow}>
                    {signInMethod === 'password' ? (
                      <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.footerLinkRed}>Forgot Password?</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => setSignInMethod('password')}>
                        <Text style={styles.footerLinkRed}>Use Password</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => {
                      setAuthMode('signup');
                      setStep('details');
                    }}>
                      <Text style={styles.footerLinkRed}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                    </View>
                  )}

                  {/* Toggle Sign In Method */}
                  {signInMethod === 'password' && (
                    <View style={{ alignItems: 'center', marginTop: 25 }}>
                      <TouchableOpacity
                        onPress={() => setSignInMethod('otp')}
                        style={{
                          backgroundColor: '#fce7f3', // Faint pink background
                          borderRadius: 30,
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                        }}
                      >
                        <Text style={{ color: '#e61580', fontWeight: 'bold', fontSize: 14, fontFamily: 'Poppins-Medium' }}>
                          Login With OTP
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                </View>
              ) : (
                // SIGN UP FORM
                <View>
                  {step === 'details' ? (
                    <View>
                      {/* Name Inputs */}
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                          <MaterialCommunityIcons name="account-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="#9ca3af"
                            value={firstName}
                            onChangeText={setFirstName}
                          />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                          <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="#9ca3af"
                            value={lastName}
                            onChangeText={setLastName}
                          />
                        </View>
                      </View>

                      {/* Mobile Input */}
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="phone-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Mobile Number"
                          placeholderTextColor="#9ca3af"
                          keyboardType="phone-pad"
                          value={mobileNumber}
                          onChangeText={(text) => setMobileNumber(text.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                        />
                      </View>

                      {/* Password Input */}
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Create Password"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <MaterialCommunityIcons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#9ca3af"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Terms */}
                      <Text style={{ fontSize: 12, color: '#6c757d', marginVertical: 10, textAlign: 'center' }}>
                        By signing up, you agree to our Terms & Conditions.
                      </Text>

                      {/* Primary Action Button */}
                      <TouchableOpacity
                        style={[
                          styles.primaryButton,
                          loading && styles.buttonDisabled
                        ]}
                        onPress={handleVerifyMobile}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.primaryButtonText}>
                          {loading ? 'PROCESSING...' : 'SEND OTP'}
                        </Text>
                      </TouchableOpacity>

                      {/* Footer Row: Back to Sign In */}
                      <View style={[styles.footerRow, { justifyContent: 'center', marginTop: 15 }]}>
                        <Text style={{ color: '#6c757d' }}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => {
                          setAuthMode('signin');
                          setSignInMethod('password');
                        }}>
                          <Text style={styles.footerLinkRed}>Sign In</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      {/* OTP Verification Step */}
                      <Text style={{ textAlign: 'center', marginBottom: 20, color: '#6c757d' }}>
                        Enter the OTP sent to +91 {mobileNumber}
                      </Text>

                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="message-lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter 6-digit OTP"
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          value={otp}
                          onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                        />
                      </View>

                      {/* Demo OTP Box */}
                      {otpSent && (
                        <View style={styles.demoOtpBox}>
                          <Text style={styles.demoOtpText}>{otpSent}</Text>
                          <TouchableOpacity onPress={() => setOtp(otpSent)}>
                            <Text style={{ color: '#6c757d', fontSize: 12, marginTop: 4 }}>Tap to Auto-Fill</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.primaryButton,
                          loading && styles.buttonDisabled
                        ]}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                      >
                        <Text style={styles.primaryButtonText}>
                          {loading ? 'VERIFYING...' : 'VERIFY & SIGN UP'}
                        </Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <TouchableOpacity onPress={handleResendOtp}>
                          <Text style={styles.footerLinkRed}>Resend OTP</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStep('details')}>
                          <Text style={styles.footerLinkRed}>Change Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Copyright Footer - outside card */}
            <Text style={styles.copyrightWhite}>
              © 2025 Sakhi. All rights reserved.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Center card vertically if possible
    paddingBottom: 30,
  },

  // Header Section
  topSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  logoSquircle: {
    width: 160,
    height: 160,
    borderRadius: 40, // Squircle shape
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    transform: [{ scale: 1.1 }],
  },
  welcomeTitleWhite: {
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeSubtitleWhite: {
    fontSize: 16,
    color: 'rgba(255,255,255, 0.95)', // Increased opacity
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Floating Card
  floatingCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 30, // Very rounded card
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Input Fields - Pill Shaped
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9', // Slightly gray/off-white for input bg to stand out on white card
    borderRadius: 30, // Pill shape
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
    borderColor: '#eee',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    height: '100%',
  },

  // Buttons - Pill Shaped
  primaryButton: {
    backgroundColor: '#e61580', // Red/Pink
    borderRadius: 30, // Pill shape
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#e61580',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  footerLinkRed: {
    color: '#e61580',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },

  // Extras
  demoOtpBox: {
    backgroundColor: '#fce7f3',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  demoOtpText: {
    color: '#e61580',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 2,
  },
  copyrightWhite: {
    marginTop: 30,
    textAlign: 'center',
    color: 'rgba(255,255,255, 0.7)',
    fontSize: 12,
  },
});

export default UnifiedAuthScreen;
