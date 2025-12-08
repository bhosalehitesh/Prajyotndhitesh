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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AUTH_TOKEN_KEY, AUTH_PHONE_KEY, storage } from './storage';
import { signup, verifyOtp, login as apiLogin, sendLoginOtp, loginWithOtp, getSellerDetails, getCurrentSellerStoreDetails, API_BASE_URL } from '../utils/api';
import { useAuth } from './AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UnifiedAuthScreenProps {
  onAuthenticated: () => void;
}

type AuthMode = 'signup' | 'signin';
type SignInMethod = 'password' | 'otp';

const UnifiedAuthScreen: React.FC<UnifiedAuthScreenProps> = ({ onAuthenticated }) => {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
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
      await storage.setItem('userId', authResponse.userId?.toString() || '');
      
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
        await storage.setItem('userId', authResponse.userId?.toString() || '');
        
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
          await storage.setItem('userId', authResponse.userId?.toString() || '');
          
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

    const cleanMobile = signInMobile.replace(/\D/g, '');
    const storedPhone = await storage.getItem(AUTH_PHONE_KEY);
    
    if (!storedPhone || storedPhone !== cleanMobile) {
      Alert.alert(
        'Account Not Found',
        'No account found with this mobile number. Please sign up first.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Generate OTP for password reset
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSignInOtpSent(otpCode);
    setSignInMethod('otp');
    setSignInPassword('');
    Alert.alert(
      'OTP Sent',
      `We've sent an OTP to ${signInMobile}. Use this OTP to sign in.\n\nOTP: ${otpCode}`,
      [{ text: 'OK' }]
    );
  };

  const handleTermsPress = () => {
    Alert.alert('Terms and Conditions', 'Terms and conditions content will be displayed here.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.');
  };

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
          {/* Header with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>S</Text>
            </View>
              <Text style={styles.logoTextMain}>Sakhi</Text>
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome Sellers!</Text>
          </View>

          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, authMode === 'signup' && styles.toggleButtonActive]}
              onPress={() => {
                setAuthMode('signup');
                setStep('details');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, authMode === 'signup' && styles.toggleTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, authMode === 'signin' && styles.toggleButtonActive]}
              onPress={() => {
                setAuthMode('signin');
                setSignInMethod('password');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, authMode === 'signin' && styles.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {authMode === 'signup' ? (
              // Sign Up Form
              step === 'verification' ? (
                <View>
                  <Text style={styles.verificationTitle}>Verify mobile number</Text>
                  <Text style={styles.verificationSubtext}>
                    IN +91 {mobileNumber}
                    <Text style={styles.changeText} onPress={() => setStep('details')}>
                      {' '}Change
                    </Text>
                  </Text>
                  <Text style={styles.verificationHelp}>
                    We've sent a One Time Password (OTP) to the mobile number above. Please enter it to complete verification.
                  </Text>

                  {/* Demo OTP Display Box */}
                  {otpSent && (
                    <View style={styles.demoOtpContainer}>
                      <View style={styles.demoOtpBox}>
                        <Text style={styles.demoOtpLabel}>Demo OTP (for testing):</Text>
                        <Text style={styles.demoOtpCode}>{otpSent}</Text>
                        <TouchableOpacity
                          style={styles.autoFillButton}
                          onPress={() => {
                            setOtp(otpSent);
                          }}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="content-copy" size={16} color="#ffffff" />
                          <Text style={styles.autoFillText}>Auto Fill</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <Text style={[styles.label, styles.labelMargin]}>Enter OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit code"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={[styles.primaryButton, (!isSignUpOtpValid || loading) && styles.buttonDisabled]}
                    onPress={handleVerifyOtp}
                    disabled={!isSignUpOtpValid || loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Verifying...' : 'Verify and Create Account'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendOtp}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.nameRow}>
                    <View style={styles.nameField}>
                      <Text style={styles.label}>First name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                    <View style={[styles.nameField, styles.nameFieldRight]}>
                      <Text style={styles.label}>Last name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>

                  <Text style={[styles.label, styles.labelMargin]}>Mobile number</Text>
                  <View style={styles.mobileRow}>
                    <View style={styles.countryCodeContainer}>
                      <Text style={styles.countryCode}>IN +91</Text>
                    </View>
                    <TextInput
                      style={styles.mobileInput}
                      placeholder="Enter 10-digit number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      value={mobileNumber}
                      onChangeText={(text) => setMobileNumber(text.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                  </View>

                  <Text style={[styles.label, styles.labelMargin]}>Create a password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.showPasswordButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoIcon}>
                      <Text style={styles.infoIconText}>i</Text>
                    </View>
                    <Text style={styles.infoText}>Passwords must be at least 6 characters.</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                      {showPassword && (
                        <MaterialCommunityIcons name="check" size={12} color="#ffffff" />
                      )}
                    </View>
                    <Text style={styles.checkboxText}>Show password</Text>
                  </TouchableOpacity>

                  <Text style={styles.verificationText}>
                    To verify your number, we will send you a text message with a temporary code. Message and data rates may apply.
                  </Text>

                  <TouchableOpacity
                    style={[styles.primaryButton, (!isSignUpFormValid || loading) && styles.buttonDisabled]}
                    onPress={handleVerifyMobile}
                    disabled={!isSignUpFormValid || loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Sending...' : 'Verify mobile number'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.termsText}>
                  By continuing, you agree to Sakhi's{' '}
                    <Text style={styles.linkText} onPress={handleTermsPress}>
                      Terms and conditions of use
                    </Text>{' '}
                    and{' '}
                    <Text style={styles.linkText} onPress={handlePrivacyPress}>
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>
              )
            ) : (
              // Sign In Form
              <View>
                <Text style={styles.alreadyCustomer}>Already a customer?</Text>

                <Text style={[styles.label, styles.labelMargin]}>Mobile number</Text>
                <View style={styles.mobileRow}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.countryCode}>IN +91</Text>
                  </View>
                  <TextInput
                    style={styles.mobileInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={signInMobile}
                    onChangeText={(text) => setSignInMobile(text.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </View>

                {signInMethod === 'password' ? (
                  <>
                    <Text style={[styles.label, styles.labelMargin]}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter your password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showSignInPassword}
                        value={signInPassword}
                        onChangeText={setSignInPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.showPasswordButton}
                        onPress={() => setShowSignInPassword(!showSignInPassword)}
                      >
                        <MaterialCommunityIcons
                          name={showSignInPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.forgotPasswordButton}
                      onPress={handleForgotPassword}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Demo OTP Display Box for Sign In */}
                    {signInOtpSent && signInOtpSent.length > 0 && (
                      <View style={styles.demoOtpContainer}>
                        <View style={styles.demoOtpBox}>
                          <Text style={styles.demoOtpLabel}>DEMO OTP (FOR TESTING):</Text>
                          <Text style={styles.demoOtpCode}>{signInOtpSent}</Text>
                          <TouchableOpacity
                            style={styles.autoFillButton}
                            onPress={() => {
                              setSignInOtp(signInOtpSent);
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="content-copy" size={16} color="#ffffff" />
                            <Text style={styles.autoFillText}>Auto Fill</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <Text style={[styles.label, styles.labelMargin]}>Enter OTP</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit code"
                      placeholderTextColor="#9ca3af"
                      keyboardType="number-pad"
                      value={signInOtp}
                      onChangeText={(text) => setSignInOtp(text.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />

                    {!signInOtpSent || signInOtpSent === '' ? (
                      <TouchableOpacity
                        style={styles.sendOtpButton}
                        onPress={handleSendSignInOtp}
                        disabled={!isSignInMobileValid || loading}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.sendOtpText}>Send OTP</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.resendOtpButton}
                        onPress={handleSendSignInOtp}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.resendOtpText}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                <View style={styles.methodToggle}>
                  <TouchableOpacity
                    style={styles.methodOption}
                    onPress={() => {
                      setSignInMethod('password');
                      setSignInOtpSent('');
                      setSignInOtp('');
                    }}
                  >
                    <Text style={styles.methodOptionText}>Use Password</Text>
                  </TouchableOpacity>
                  <Text style={styles.methodSeparator}>or</Text>
                  <TouchableOpacity
                    style={styles.methodOption}
                    onPress={() => {
                      setSignInMethod('otp');
                      if ((!signInOtpSent || signInOtpSent === '') && isSignInMobileValid) {
                        handleSendSignInOtp();
                      }
                    }}
                  >
                    <Text style={styles.methodOptionText}>Use OTP</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    ((signInMethod === 'password' && (!isSignInMobileValid || !isSignInPasswordValid)) ||
                     (signInMethod === 'otp' && (!isSignInMobileValid || !isSignInOtpValid)) ||
                     loading) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleSignIn}
                  disabled={
                    (signInMethod === 'password' && (!isSignInMobileValid || !isSignInPasswordValid)) ||
                    (signInMethod === 'otp' && (!isSignInMobileValid || !isSignInOtpValid)) ||
                    loading
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Signing in...' : 'Continue'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By continuing, you agree to Sakhi's{' '}
                  <Text style={styles.linkText} onPress={handleTermsPress}>
                    Terms and conditions of use
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.linkText} onPress={handlePrivacyPress}>
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>
            )}
          </View>

          {/* Footer Copyright */}
          <Text style={styles.copyright}>
            © 2025 Sakhi. All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e61580', // Bright pink background
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e61580',
  },
  logoTextMain: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  welcomeContainer: {
    marginHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    marginTop: 8,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: '#e61580', // Bright pink
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    marginTop: 8,
    padding: Math.max(20, SCREEN_WIDTH * 0.05),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  labelMargin: {
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  nameFieldRight: {
    marginLeft: 0,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCodeContainer: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f8f9fa',
  },
  countryCode: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  mobileInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e61580', // Bright pink
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  infoIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e61580', // Bright pink
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#e61580', // Bright pink
  },
  checkboxText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  verificationText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#e61580', // Bright pink
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#e61580',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
  },
  linkText: {
    color: '#e61580', // Bright pink
    textDecorationLine: 'underline',
  },
  alreadyCustomer: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#e61580', // Bright pink
    textDecorationLine: 'underline',
  },
  sendOtpButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendOtpText: {
    fontSize: 14,
    color: '#e61580', // Bright pink
    fontWeight: '500',
  },
  resendOtpButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendOtpText: {
    fontSize: 14,
    color: '#e61580', // Bright pink
    textDecorationLine: 'underline',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#e61580', // Bright pink
    textDecorationLine: 'underline',
  },
  methodToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  methodOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  methodOptionText: {
    fontSize: 14,
    color: '#e61580', // Bright pink
    fontWeight: '500',
  },
  methodSeparator: {
    fontSize: 14,
    color: '#6b7280',
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  verificationSubtext: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  changeText: {
    color: '#e61580', // Bright pink
    textDecorationLine: 'underline',
  },
  verificationHelp: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  demoOtpContainer: {
    marginBottom: 20,
  },
  demoOtpBox: {
    backgroundColor: '#fff5f9', // Light pink background
    borderWidth: 2,
    borderColor: '#e61580', // Bright pink border
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#e61580',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  demoOtpLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoOtpCode: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e61580', // Bright pink
    letterSpacing: 8,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e61580', // Bright pink background
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#e61580',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  autoFillText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  copyright: {
    fontSize: 11,
    color: '#ffffff', // White text for visibility on pink background
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
    opacity: 0.8,
  },
});

export default UnifiedAuthScreen;

