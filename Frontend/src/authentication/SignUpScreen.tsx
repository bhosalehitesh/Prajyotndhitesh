import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AUTH_TOKEN_KEY, AUTH_PHONE_KEY, storage } from './storage';

interface SignUpScreenProps {
  onAuthenticated: () => void;
  onSwitchToSignIn?: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onAuthenticated, onSwitchToSignIn }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState('');

  const isFormValid = useMemo(() => {
    const nameValid = firstName.trim().length > 0 && lastName.trim().length > 0;
    const mobileValid = /^\d{10}$/.test(mobileNumber.replace(/\D/g, ''));
    const passwordValid = password.length >= 6;
    return nameValid && mobileValid && passwordValid;
  }, [firstName, lastName, mobileNumber, password]);

  const isOtpValid = useMemo(() => {
    return /^\d{6}$/.test(otp);
  }, [otp]);

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleVerifyMobile = async () => {
    if (!isFormValid) {
      Alert.alert('Validation', 'Please fill all fields correctly. Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    
    // Check if number already exists
    const existingPhone = await storage.getItem(AUTH_PHONE_KEY);
    if (existingPhone === cleanMobile) {
      setLoading(false);
      Alert.alert(
        'Account Already Exists',
        'This mobile number is already registered. Would you like to recreate your account?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Recreate Account',
            onPress: async () => {
              // Proceed with verification for recreation
              const code = generateOtp();
              setOtpSent(code);
              setStep('verification');
              setLoading(false);
              Alert.alert('OTP Sent', `Verification code: ${code}\n\nPlease enter this code to verify.`);
            },
          },
        ]
      );
      return;
    }

    // Generate and send OTP for new account
    const code = generateOtp();
    setOtpSent(code);
    setStep('verification');
    setLoading(false);
    
    // In production, send OTP via SMS service
    Alert.alert('OTP Sent', `Verification code: ${code}\n\nPlease enter this code to verify your mobile number.`);
  };

  const handleVerifyOtp = async () => {
    if (!isOtpValid) {
      Alert.alert('Validation', 'Please enter a valid 6-digit OTP.');
      return;
    }

    if (otp !== otpSent) {
      Alert.alert('Error', 'Incorrect OTP. Please try again.');
      return;
    }

    setLoading(true);
    await handleCreateAccount();
  };

  const handleResendOtp = async () => {
    const code = generateOtp();
    setOtpSent(code);
    setOtp('');
    Alert.alert('OTP Resent', `New verification code: ${code}`);
  };

  const handleCreateAccount = async () => {
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      
      // Create account and JWT token
      const token = `jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await storage.setItem(AUTH_TOKEN_KEY, token);
      await storage.setItem(AUTH_PHONE_KEY, cleanMobile);
      await storage.setItem('userName', `${firstName} ${lastName}`);
      await storage.setItem('userPassword', password); // Store password for sign in
      
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to seller info screen
            onAuthenticated();
          },
        },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const handleTermsPress = () => {
    Alert.alert('Terms and Conditions', 'Terms and conditions content will be displayed here.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.');
  };

  if (step === 'verification') {
    return (
      <View style={styles.container}>
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
          style={[styles.verifyButton, (!isOtpValid || loading) && styles.verifyButtonDisabled]}
          onPress={handleVerifyOtp}
          disabled={!isOtpValid || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>
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
    );
  }

  return (
    <View style={styles.container}>
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
        style={[styles.verifyButton, (!isFormValid || loading) && styles.verifyButtonDisabled]}
        onPress={handleVerifyMobile}
        disabled={!isFormValid || loading}
        activeOpacity={0.8}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? 'Sending...' : 'Verify mobile number'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By continuing, you agree to SmartBiz's{' '}
        <Text style={styles.linkText} onPress={handleTermsPress}>
          Terms and conditions of use
        </Text>{' '}
        and{' '}
        <Text style={styles.linkText} onPress={handlePrivacyPress}>
          Privacy Policy
        </Text>
        .
      </Text>

      {onSwitchToSignIn && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSwitchToSignIn} activeOpacity={0.7}>
            <Text style={styles.switchLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
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
  },
  passwordInput: {
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
    backgroundColor: '#007185',
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
    borderColor: '#007185',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#007185',
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
  verifyButton: {
    backgroundColor: '#ffd814',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ffd814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
  },
  linkText: {
    color: '#007185',
    textDecorationLine: 'underline',
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
    color: '#007185',
    textDecorationLine: 'underline',
  },
  verificationHelp: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#007185',
    textDecorationLine: 'underline',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  switchText: {
    fontSize: 14,
    color: '#6b7280',
  },
  switchLink: {
    fontSize: 14,
    color: '#007185',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;

