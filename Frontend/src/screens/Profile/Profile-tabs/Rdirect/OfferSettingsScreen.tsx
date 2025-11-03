import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface OfferSettingsScreenProps {
  offerData: any;
  onNext: (data: any) => void;
}

export default function OfferSettingsScreen({ offerData, onNext }: OfferSettingsScreenProps) {
  const [percentageValue, setPercentageValue] = useState(offerData.percentageValue || '');
  const [maxDiscount, setMaxDiscount] = useState(offerData.maxDiscount || '');
  const [minPurchase, setMinPurchase] = useState(offerData.minPurchase || '');
  const [usageLimit, setUsageLimit] = useState(offerData.usageLimit || '1');
  const [startDate, setStartDate] = useState(offerData.startDate || '');
  const [endDate, setEndDate] = useState(offerData.endDate || '');
  const [setEndDateEnabled, setSetEndDateEnabled] = useState(offerData.setEndDate || false);
  const [customerType, setCustomerType] = useState<'any' | 'firstTime' | 'repeat'>(
    offerData.customerType || 'any'
  );
  const [couponCode, setCouponCode] = useState(offerData.couponCode || '');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());

  const handleNext = () => {
    if (offerData.offerType === 'percentage') {
      if (!percentageValue || parseFloat(percentageValue) <= 0 || parseFloat(percentageValue) > 100) {
        Alert.alert('Error', 'Please enter a valid percentage value (1-100)');
        return;
      }
    } else {
      if (!percentageValue || parseFloat(percentageValue) <= 0) {
        Alert.alert('Error', 'Please enter a valid discount amount');
        return;
      }
    }

    if (!startDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }

    if (setEndDateEnabled && !endDate) {
      Alert.alert('Error', 'Please select an end date');
      return;
    }

    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    if (couponCode.length > 17) {
      Alert.alert('Error', 'Coupon code must be 17 characters or less');
      return;
    }

    onNext({
      percentageValue,
      maxDiscount: maxDiscount || '',
      minPurchase: minPurchase || '',
      usageLimit,
      startDate,
      endDate: setEndDateEnabled ? endDate : '',
      setEndDate: setEndDateEnabled,
      customerType,
      couponCode: couponCode.trim().toUpperCase(),
    });
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateConfirm = (date: Date, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(formatDate(date));
      setTempStartDate(date);
    } else {
      setEndDate(formatDate(date));
      setTempEndDate(date);
    }
    if (type === 'start') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {offerData.offerType === 'percentage' ? (
          <>
            {/* Percentage Value */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Percentage Value</Text>
              <Text style={styles.sectionDesc}>
                What percentage of discount will the customer get by using this offer?
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="21"
                  value={percentageValue}
                  onChangeText={setPercentageValue}
                  keyboardType="numeric"
                />
                <View style={styles.unitBox}>
                  <Text style={styles.unitText}>%</Text>
                </View>
              </View>
            </View>

            {/* Maximum Discount Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maximum Discount Amount</Text>
              <Text style={styles.sectionDesc}>What is the maximum discount amount a customer can get?</Text>
              <View style={styles.inputRow}>
                <View style={styles.currencyBox}>
                  <Text style={styles.currencyText}>₹</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="122"
                  value={maxDiscount}
                  onChangeText={setMaxDiscount}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discount Amount</Text>
            <Text style={styles.sectionDesc}>What is the discount amount?</Text>
            <View style={styles.inputRow}>
              <View style={styles.currencyBox}>
                <Text style={styles.currencyText}>₹</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="250"
                value={percentageValue}
                onChangeText={setPercentageValue}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Minimum Purchase Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Purchase Amount</Text>
          <Text style={styles.sectionDesc}>What is the minimum order value to use this offer?</Text>
          <View style={styles.inputRow}>
            <View style={styles.currencyBox}>
              <Text style={styles.currencyText}>₹</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="2000"
              value={minPurchase}
              onChangeText={setMinPurchase}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Usage Limit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Limit</Text>
          <Text style={styles.sectionDesc}>How many times can a customer use this offer?</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            value={usageLimit}
            onChangeText={setUsageLimit}
            keyboardType="numeric"
          />
        </View>

        {/* Offer Validity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer Validity</Text>
          <Text style={styles.sectionDesc}>How long is this offer available for customers to use?</Text>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateLabel}>Start Date *</Text>
            <View style={styles.dateValue}>
              <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
                {startDate || 'dd/mm/yyyy'}
              </Text>
              <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSetEndDateEnabled(!setEndDateEnabled)}
          >
            <View style={styles.checkbox}>
              {setEndDateEnabled && (
                <MaterialCommunityIcons name="check" size={16} color="#17aba5" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Set End Date</Text>
          </TouchableOpacity>

          {setEndDateEnabled && (
            <>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateLabel}>End Date *</Text>
                <View style={styles.dateValue}>
                  <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
                    {endDate || 'dd/mm/yyyy'}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>

              {!endDate && (
                <View style={styles.warningBox}>
                  <MaterialCommunityIcons name="information" size={20} color="#ff9800" />
                  <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Consider adding an expiry date</Text>
                    <Text style={styles.warningText}>
                      This coupon does not have an expiry, which can result in large discounts.
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Offer Valid to? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer Valid to?</Text>
          <Text style={styles.sectionDesc}>Which type of customer can use this offer?</Text>

          <TouchableOpacity
            style={styles.customerOption}
            onPress={() => setCustomerType('any')}
          >
            <View style={styles.radioButton}>
              {customerType === 'any' && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.customerText}>Any Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customerOption}
            onPress={() => setCustomerType('firstTime')}
          >
            <View style={styles.radioButton}>
              {customerType === 'firstTime' && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.customerText}>First Time Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customerOption}
            onPress={() => setCustomerType('repeat')}
          >
            <View style={styles.radioButton}>
              {customerType === 'repeat' && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.customerText}>Repeat Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Coupon Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer Code</Text>
          <Text style={styles.sectionDesc}>
            Enter a offer code for customers to use at checkout. E.g. DIWALI25 (max 17 characters)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Offer Code *"
            value={couponCode}
            onChangeText={setCouponCode}
            maxLength={17}
            autoCapitalize="characters"
          />
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modals */}
      <Modal visible={showStartDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Start Date</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.datePickerText}>Use native date picker here</Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleDateConfirm(tempStartDate, 'start')}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showEndDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select End Date</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.datePickerText}>Use native date picker here</Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleDateConfirm(tempEndDate, 'end')}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    backgroundColor: '#fff',
  },
  unitBox: {
    backgroundColor: '#f5f5fa',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#e2e4ec',
  },
  unitText: {
    fontSize: 16,
    color: '#363740',
    fontWeight: '500',
  },
  currencyBox: {
    backgroundColor: '#f5f5fa',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#e2e4ec',
  },
  currencyText: {
    fontSize: 16,
    color: '#363740',
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  dateValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#363740',
  },
  datePlaceholder: {
    color: '#888',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningContent: {
    flex: 1,
    marginLeft: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 18,
  },
  customerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  customerText: {
    fontSize: 16,
    color: '#363740',
  },
  nextButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
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
  },
  datePickerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  confirmButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

