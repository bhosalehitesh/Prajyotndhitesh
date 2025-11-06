import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface OnlinePaymentScreenProps {
  onBack: () => void;
}

export default function OnlinePaymentScreen({ onBack }: OnlinePaymentScreenProps) {
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [isNewAccount, setIsNewAccount] = useState(true);
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);

  // Form states
  const [businessType, setBusinessType] = useState('');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [email, setEmail] = useState('aditin26901@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('8766408154');

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited Company',
    'Public Limited Company',
    'LLP (Limited Liability Partnership)',
    'HUF (Hindu Undivided Family)',
    'Trust',
    'Society',
  ];

  const handleCreateAccount = () => {
    setIsNewAccount(true);
    setShowAccountForm(true);
  };

  const handleLinkAccount = () => {
    setIsNewAccount(false);
    Alert.alert('Link Account', 'Redirecting to Razorpay login...');
  };

  const handleSaveForm = () => {
    if (!businessType) {
      Alert.alert('Error', 'Please select a business type');
      return;
    }
    if (!legalBusinessName.trim()) {
      Alert.alert('Error', 'Please enter legal business name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    Alert.alert(
      'Success',
      'Razorpay account creation request submitted. You will receive an email confirmation shortly.',
      [{ text: 'OK', onPress: () => onBack() }]
    );
  };

  // Show account creation form
  if (showAccountForm && isNewAccount) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAccountForm(false)}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Payments</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.instructionText}>
            Select your business type and enter the registered name of your business
          </Text>

          {/* Business Type */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Business Type *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowBusinessTypeModal(true)}
            >
              <Text style={[styles.selectText, !businessType && styles.placeholderText]}>
                {businessType || 'Select Business Type'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="#e61580" />
            </TouchableOpacity>
          </View>

          {/* Legal Business Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Legal Business Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter legal business name"
              value={legalBusinessName}
              onChangeText={setLegalBusinessName}
            />
          </View>

          {/* Information Note */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Your Razorpay account will be created with the email and phone number provided to
              Sakhi. This cannot be changed.
            </Text>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Enter email"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={phoneNumber}
              editable={false}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              (!businessType || !legalBusinessName) && styles.createButtonDisabled,
            ]}
            onPress={handleSaveForm}
            disabled={!businessType || !legalBusinessName}
          >
            <Text style={styles.createButtonText}>Create Razorpay Account</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Business Type Modal */}
        <Modal
          visible={showBusinessTypeModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBusinessTypeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Business Type</Text>
                <TouchableOpacity onPress={() => setShowBusinessTypeModal(false)}>
                  <MaterialCommunityIcons name="close" size={28} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {businessTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalOption}
                    onPress={() => {
                      setBusinessType(type);
                      setShowBusinessTypeModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                    {businessType === type && (
                      <MaterialCommunityIcons name="check" size={24} color="#e61580" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Initial screen with Razorpay options
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Payments</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.razorpayCard}>
          <View style={styles.razorpayLogo}>
            <View style={styles.razorpayIcon}>
              <Text style={styles.razorpayIconText}>R</Text>
            </View>
            <Text style={styles.razorpayText}>Razorpay</Text>
          </View>
          <Text style={styles.razorpayDesc}>
            Accept payments via Razorpay on your online and offline website
          </Text>

          <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
            <Text style={styles.createAccountButtonText}>Create New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkAccountButton} onPress={handleLinkAccount}>
            <Text style={styles.linkAccountButtonText}>Link Existing Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 24,
    lineHeight: 26,
  },
  razorpayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  razorpayLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  razorpayIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  razorpayIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  razorpayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  razorpayDesc: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  createAccountButton: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  createAccountButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkAccountButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e61580',
  },
  linkAccountButtonText: {
    color: '#e61580',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  selectText: {
    fontSize: 16,
    color: '#363740',
    flex: 1,
  },
  placeholderText: {
    color: '#888',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#e61580',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#363740',
    flex: 1,
  },
});
