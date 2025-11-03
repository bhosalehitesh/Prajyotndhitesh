import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CashOnDeliveryScreenProps {
  onBack: () => void;
}

export default function CashOnDeliveryScreen({ onBack }: CashOnDeliveryScreenProps) {
  const [codEnabled, setCodEnabled] = useState(false);
  const [setupCharges, setSetupCharges] = useState(false);
  const [charges, setCharges] = useState('0');
  const [availabilityType, setAvailabilityType] = useState<'all' | 'range'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const handleSave = () => {
    if (!codEnabled) {
      Alert.alert('Error', 'Please enable Cash on Delivery first');
      return;
    }

    if (setupCharges && (!charges || parseFloat(charges) < 0)) {
      Alert.alert('Error', 'Please enter a valid charge amount');
      return;
    }

    if (availabilityType === 'range') {
      if (!minAmount || !maxAmount) {
        Alert.alert('Error', 'Please enter both minimum and maximum amounts');
        return;
      }
      if (parseFloat(minAmount) >= parseFloat(maxAmount)) {
        Alert.alert('Error', 'Maximum amount must be greater than minimum amount');
        return;
      }
    }

    Alert.alert('Success', 'COD settings saved successfully');
  };

  const handleLearnMore = () => {
    Linking.openURL('https://razorpay.com/support');
  };

  const isSaveDisabled = !codEnabled || (setupCharges && (!charges || parseFloat(charges) < 0));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Cash on Delivery</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* COD Toggle Card */}
        <View style={[styles.toggleCard, codEnabled && styles.toggleCardActive]}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleTitle}>
              Cash on Delivery (COD): {codEnabled ? 'On' : 'Off'}
            </Text>
            <Switch
              value={codEnabled}
              onValueChange={setCodEnabled}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={codEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {codEnabled && (
          <>
            {/* Note */}
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Note</Text>
              <Text style={styles.noteText}>
                You will not be able to disable Cash on Delivery (COD) once you enable it if it is
                the only payment method activated.
              </Text>
            </View>

            {/* Settings Card */}
            <View style={styles.settingsCard}>
              <Text style={styles.settingsTitle}>Settings</Text>

              {/* Setup Charges */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setSetupCharges(!setupCharges)}
                >
                  <View style={styles.checkbox}>
                    {setupCharges && (
                      <MaterialCommunityIcons name="check" size={18} color="#17aba5" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Setup additional charges for COD</Text>
                </TouchableOpacity>

                {setupCharges && (
                  <View style={styles.chargesInputContainer}>
                    <Text style={styles.chargesLabel}>Enter Charges *</Text>
                    <View style={styles.chargesInputRow}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.chargesInput}
                        value={charges}
                        onChangeText={setCharges}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                    <Text style={styles.chargesNote}>
                      Note: Charges not applicable for 'Pickup at Store' COD orders
                    </Text>
                  </View>
                )}
              </View>

              {/* Availability Options */}
              <View style={styles.availabilitySection}>
                <Text style={styles.availabilityLabel}>Availability options</Text>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setAvailabilityType('all')}
                >
                  <View style={styles.radioButton}>
                    {availabilityType === 'all' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Available for all orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setAvailabilityType('range')}
                >
                  <View style={styles.radioButton}>
                    {availabilityType === 'range' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Orders within a price range</Text>
                </TouchableOpacity>

                {availabilityType === 'range' && (
                  <View style={styles.rangeInputContainer}>
                    <View style={styles.rangeInputRow}>
                      <View style={styles.rangeInput}>
                        <Text style={styles.rangeLabel}>Min Amount (₹)</Text>
                        <TextInput
                          style={styles.input}
                          value={minAmount}
                          onChangeText={setMinAmount}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                      </View>
                      <View style={styles.rangeInput}>
                        <Text style={styles.rangeLabel}>Max Amount (₹)</Text>
                        <TextInput
                          style={styles.input}
                          value={maxAmount}
                          onChangeText={setMaxAmount}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* KYC Information */}
            <View style={styles.kycCard}>
              <Text style={styles.kycText}>
                To receive your COD payment, contact your courier partner to inquire about their
                KYC process.{' '}
                <Text style={styles.learnMoreText} onPress={handleLearnMore}>
                  Learn More
                </Text>
              </Text>
            </View>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#1a237e',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  toggleCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  toggleCardActive: {
    backgroundColor: '#f0fdfa',
    borderColor: '#17aba5',
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#17aba5',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#363740',
    flex: 1,
  },
  chargesInputContainer: {
    marginLeft: 36,
    marginTop: 12,
  },
  chargesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 8,
  },
  chargesInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#363740',
    fontWeight: '600',
    paddingLeft: 16,
    paddingRight: 8,
  },
  chargesInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#363740',
  },
  chargesNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  availabilitySection: {
    marginTop: 8,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#17aba5',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#17aba5',
  },
  radioLabel: {
    fontSize: 16,
    color: '#363740',
    flex: 1,
  },
  rangeInputContainer: {
    marginLeft: 36,
    marginTop: 12,
  },
  rangeInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#363740',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  kycCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  kycText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  learnMoreText: {
    color: '#17aba5',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#888',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
