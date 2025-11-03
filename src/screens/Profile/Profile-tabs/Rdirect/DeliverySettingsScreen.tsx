import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DeliveryTimeScreen from './DeliveryTimeScreen';

interface DeliverySettingsScreenProps {
  onBack: () => void;
}

export default function DeliverySettingsScreen({ onBack }: DeliverySettingsScreenProps) {
  // State for delivery charges
  const [showDeliveryChargesModal, setShowDeliveryChargesModal] = useState(false);
  const [deliveryChargeType, setDeliveryChargeType] = useState<'flat' | 'free'>('flat');
  const [flatDeliveryPrice, setFlatDeliveryPrice] = useState('0');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('');

  // State for delivery radius
  const [showDeliveryRadiusModal, setShowDeliveryRadiusModal] = useState(false);
  const [coverageType, setCoverageType] = useState<'radius' | 'allIndia'>('radius');
  const [deliveryRadius, setDeliveryRadius] = useState('5');

  // State for courier
  const [courierPartner, setCourierPartner] = useState('ShipRocket');
  const [showCourierModal, setShowCourierModal] = useState(false);

  // State for navigation
  const [showDeliveryTime, setShowDeliveryTime] = useState(false);

  const handleSaveDeliveryCharges = () => {
    // Validation
    if (deliveryChargeType === 'flat' && !flatDeliveryPrice) {
      Alert.alert('Error', 'Please enter delivery price');
      return;
    }
    if (deliveryChargeType === 'free' && !freeDeliveryAbove) {
      Alert.alert('Error', 'Please enter minimum order amount for free delivery');
      return;
    }
    setShowDeliveryChargesModal(false);
    Alert.alert('Success', 'Delivery charges saved successfully');
  };

  const handleSaveDeliveryRadius = () => {
    if (coverageType === 'radius' && (!deliveryRadius || parseFloat(deliveryRadius) <= 0)) {
      Alert.alert('Error', 'Please enter a valid delivery radius');
      return;
    }
    setShowDeliveryRadiusModal(false);
    Alert.alert('Success', 'Delivery radius saved successfully');
  };

  const handleSaveCourier = (courier: string) => {
    setCourierPartner(courier);
    setShowCourierModal(false);
    Alert.alert('Success', `Courier partner set to ${courier}`);
  };

  const courierOptions = ['ShipRocket', 'Delhivery', 'FedEx', 'BlueDart', 'DTDC'];

  if (showDeliveryTime) {
    return <DeliveryTimeScreen onBack={() => setShowDeliveryTime(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Set delivery charges */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowDeliveryChargesModal(true)}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Set delivery charges</Text>
            <Text style={styles.settingValue}>
              Delivery:{' '}
              <Text style={styles.valueText}>
                {deliveryChargeType === 'flat' ? `₹${flatDeliveryPrice}` : 'Free above ₹' + freeDeliveryAbove}
              </Text>
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
        </TouchableOpacity>

        {/* Set delivery radius */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowDeliveryRadiusModal(true)}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Set delivery radius</Text>
            <Text style={styles.settingValue}>
              Delivery Radius:{' '}
              <Text style={styles.valueText}>
                {coverageType === 'radius' ? `${deliveryRadius} KM` : 'All India'}
              </Text>
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
        </TouchableOpacity>

        {/* Manage courier for delivery */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowCourierModal(true)}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Manage courier for delivery</Text>
            <Text style={styles.settingValue}>
              Courier Partner:{' '}
              <Text style={styles.valueText}>{courierPartner}</Text>
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
        </TouchableOpacity>

        {/* Delivery Time */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowDeliveryTime(true)}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Delivery Time</Text>
            <Text style={styles.settingValue}>
              Delivered in{' '}
              <Text style={styles.valueText}>3-5 Days</Text>
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
        </TouchableOpacity>
      </ScrollView>

      {/* Delivery Charges Modal */}
      <Modal
        visible={showDeliveryChargesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeliveryChargesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set delivery charges</Text>
              <TouchableOpacity onPress={() => setShowDeliveryChargesModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setDeliveryChargeType('flat')}
              >
                <View style={styles.radioButton}>
                  {deliveryChargeType === 'flat' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>Flat Delivery fee</Text>
              </TouchableOpacity>

              {deliveryChargeType === 'flat' && (
                <View style={styles.inputRow}>
                  <View style={styles.currencyBox}>
                    <Text style={styles.currencySymbol}>₹</Text>
                  </View>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Price"
                    value={flatDeliveryPrice}
                    onChangeText={setFlatDeliveryPrice}
                    keyboardType="numeric"
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.radioOption, { marginTop: 20 }]}
                onPress={() => setDeliveryChargeType('free')}
              >
                <View style={styles.radioButton}>
                  {deliveryChargeType === 'free' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>Free Delivery Above</Text>
              </TouchableOpacity>

              {deliveryChargeType === 'free' && (
                <View style={styles.inputRow}>
                  <View style={styles.currencyBox}>
                    <Text style={styles.currencySymbol}>₹</Text>
                  </View>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Minimum order amount"
                    value={freeDeliveryAbove}
                    onChangeText={setFreeDeliveryAbove}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDeliveryCharges}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delivery Radius Modal */}
      <Modal
        visible={showDeliveryRadiusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeliveryRadiusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set delivery coverage for home delivery</Text>
              <TouchableOpacity onPress={() => setShowDeliveryRadiusModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setCoverageType('radius')}
              >
                <View style={styles.radioButton}>
                  {coverageType === 'radius' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>Coverage limited to specific radius</Text>
              </TouchableOpacity>

              {coverageType === 'radius' && (
                <View style={styles.radiusInputContainer}>
                  <Text style={styles.inputLabel}>Delivery Radius</Text>
                  <View style={styles.radiusInputRow}>
                    <TextInput
                      style={styles.radiusInput}
                      placeholder="5"
                      value={deliveryRadius}
                      onChangeText={setDeliveryRadius}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.unitButton}>
                      <Text style={styles.unitButtonText}>KM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.radioOption, { marginTop: 20 }]}
                onPress={() => setCoverageType('allIndia')}
              >
                <View style={styles.radioButton}>
                  {coverageType === 'allIndia' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>All India coverage</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDeliveryRadius}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Courier Selection Modal */}
      <Modal
        visible={showCourierModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCourierModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage courier for delivery</Text>
              <TouchableOpacity onPress={() => setShowCourierModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.courierOptionsContainer}>
              {courierOptions.map((courier) => (
                <TouchableOpacity
                  key={courier}
                  style={[
                    styles.courierOption,
                    courierPartner === courier && styles.courierOptionSelected,
                  ]}
                  onPress={() => handleSaveCourier(courier)}
                >
                  <View style={styles.courierOptionContent}>
                    <View style={styles.radioButton}>
                      {courierPartner === courier && (
                        <View style={styles.radioButtonSelected} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.courierOptionText,
                        courierPartner === courier && styles.courierOptionTextSelected,
                      ]}
                    >
                      {courier}
                    </Text>
                  </View>
                  {courierPartner === courier && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#17aba5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#f5f5fa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#222',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff',
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    color: '#888',
  },
  valueText: {
    color: '#17aba5',
    fontWeight: '600',
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  radioContainer: {
    marginBottom: 24,
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
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 36,
  },
  currencyBox: {
    backgroundColor: '#f5f5fa',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#e2e4ec',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#363740',
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#363740',
  },
  radiusInputContainer: {
    marginTop: 12,
    marginLeft: 36,
  },
  inputLabel: {
    fontSize: 16,
    color: '#363740',
    marginBottom: 8,
    fontWeight: '500',
  },
  radiusInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#363740',
    marginRight: 12,
  },
  unitButton: {
    backgroundColor: '#f5f5fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  unitButtonText: {
    fontSize: 16,
    color: '#363740',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  courierOptionsContainer: {
    marginBottom: 24,
  },
  courierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  courierOptionSelected: {
    backgroundColor: '#f0fdfa',
    borderColor: '#17aba5',
  },
  courierOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courierOptionText: {
    fontSize: 16,
    color: '#363740',
    marginLeft: 12,
  },
  courierOptionTextSelected: {
    color: '#17aba5',
    fontWeight: '600',
  },
});
