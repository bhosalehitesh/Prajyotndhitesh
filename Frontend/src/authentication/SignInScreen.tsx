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
import { login } from '../utils/api';
import { useAuth } from './AuthContext';

interface SignInScreenProps {
  onAuthenticated: () => void;
  onSwitchToSignUp?: () => void;
}

type SignInMethod = 'password' | 'otp';

const SignInScreen: React.FC<SignInScreenProps> = ({ onAuthenticated, onSwitchToSignUp }) => {
  const auth = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState('');
  const [loading, setLoading] = useState(false);

  const isMobileValid = useMemo(() => {
    return /^\d{10}$/.test(mobileNumber.replace(/\D/g, ''));
  }, [mobileNumber]);

  const isPasswordValid = useMemo(() => {
    return password.length >= 6;
  }, [password]);

  const isOtpValid = useMemo(() => {
    return /^\d{6}$/.test(otp);
  }, [otp]);

  const handleSendOtp = async () => {
    if (!isMobileValid) {
      Alert.alert('Validation', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    Alert.alert(
      'Info',
      'OTP login is not available yet. Please use password login. OTP login will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleSignIn = async () => {
    if (!isMobileValid) {
      Alert.alert('Validation', 'Please enter a valid mobile number.');
      return;
    }

    if (signInMethod === 'password') {
      if (!isPasswordValid) {
        Alert.alert('Validation', 'Please enter a valid password.');
        return;
      }

      setLoading(true);
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      
      try {
        // Call backend login API
        const authResponse = await login({
          phone: cleanMobile,
          password: password,
        });

        // Store auth token and user info
        await auth.login(authResponse.token);
        await storage.setItem(AUTH_TOKEN_KEY, authResponse.token);
        await storage.setItem(AUTH_PHONE_KEY, authResponse.phone);
        await storage.setItem('userName', authResponse.fullName);
        
        setLoading(false);
        onAuthenticated();
      } catch (error) {
        setLoading(false);
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        
        if (errorMessage.includes('not found')) {
          Alert.alert(
            'Account Not Found',
            'No account found with this mobile number. Please sign up first.',
            [{ text: 'OK' }]
          );
        } else if (errorMessage.includes('password') || errorMessage.includes('Invalid')) {
          Alert.alert('Error', 'Incorrect password. Please try again or use OTP.');
        } else if (errorMessage.includes('not verified')) {
          Alert.alert(
            'Account Not Verified',
            'Please verify your account with OTP first. You can do this from the sign up screen.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Login Error', errorMessage);
        }
      }
    } else {
      // OTP sign in - not available yet (backend needs to implement)
      Alert.alert(
        'Info',
        'OTP login is not available yet. Please use password login. OTP login will be available soon.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!isMobileValid) {
      Alert.alert('Validation', 'Please enter your mobile number first.');
      return;
    }

    Alert.alert(
      'Info',
      'Password reset via OTP is not available yet. Please contact support or use the sign up flow.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsPress = () => {
    Alert.alert('Terms and Conditions', 'Terms and conditions content will be displayed here.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.');
  };

  const handleSupportPress = () => {
    Alert.alert('Support', 'Contact SmartBiz support for assistance.');
  };

  return (
    <View style={styles.container}>
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
          value={mobileNumber}
          onChangeText={(text) => setMobileNumber(text.replace(/\D/g, '').slice(0, 10))}
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

          {!otpSent || otpSent === '' ? (
            <TouchableOpacity
              style={styles.sendOtpButton}
              onPress={handleSendOtp}
              disabled={!isMobileValid || loading}
              activeOpacity={0.7}
            >
              <Text style={styles.sendOtpText}>Send OTP</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.resendOtpButton}
              onPress={handleSendOtp}
              disabled={loading}
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
            setOtpSent('');
            setOtp('');
          }}
        >
          <Text style={styles.methodOptionText}>Use Password</Text>
        </TouchableOpacity>
        <Text style={styles.methodSeparator}>or</Text>
        <TouchableOpacity
          style={styles.methodOption}
          onPress={() => {
            setSignInMethod('otp');
            if ((!otpSent || otpSent === '') && isMobileValid) {
              handleSendOtp();
            }
          }}
        >
          <Text style={styles.methodOptionText}>Use OTP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          ((signInMethod === 'password' && (!isMobileValid || !isPasswordValid)) ||
           (signInMethod === 'otp' && (!isMobileValid || !isOtpValid)) ||
           loading) &&
            styles.continueButtonDisabled,
        ]}
        onPress={handleSignIn}
        disabled={
          (signInMethod === 'password' && (!isMobileValid || !isPasswordValid)) ||
          (signInMethod === 'otp' && (!isMobileValid || !isOtpValid)) ||
          loading
        }
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>
          {loading ? 'Signing in...' : 'Continue'}
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

      <TouchableOpacity
        style={styles.supportContainer}
        onPress={handleSupportPress}
        activeOpacity={0.7}
      >
        <Text style={styles.supportText}>
          Facing issues? <Text style={styles.supportLink}>Contact SmartBiz support</Text>
        </Text>
      </TouchableOpacity>

      {onSwitchToSignUp && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>New here? </Text>
          <TouchableOpacity onPress={onSwitchToSignUp} activeOpacity={0.7}>
            <Text style={styles.switchLink}>Create account</Text>
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
  alreadyCustomer: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
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
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007185',
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
    color: '#007185',
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
    color: '#007185',
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
    color: '#007185',
    fontWeight: '500',
  },
  methodSeparator: {
    fontSize: 14,
    color: '#6b7280',
  },
  continueButton: {
    backgroundColor: '#ff9900',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#ff9900',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  linkText: {
    color: '#007185',
    textDecorationLine: 'underline',
  },
  supportContainer: {
    marginTop: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  supportLink: {
    color: '#007185',
    textDecorationLine: 'underline',
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

export default SignInScreen;

