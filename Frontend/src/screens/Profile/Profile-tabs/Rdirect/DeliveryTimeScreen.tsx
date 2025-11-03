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

interface DeliveryTimeScreenProps {
  onBack: () => void;
}

export default function DeliveryTimeScreen({ onBack }: DeliveryTimeScreenProps) {
  const [showWithinPuneModal, setShowWithinPuneModal] = useState(false);
  const [showAcrossIndiaModal, setShowAcrossIndiaModal] = useState(false);
  
  const [withinPuneMin, setWithinPuneMin] = useState('2');
  const [withinPuneMax, setWithinPuneMax] = useState('4');
  const [withinPuneUnit, setWithinPuneUnit] = useState<'Hours' | 'Days'>('Hours');
  
  const [acrossIndiaMin, setAcrossIndiaMin] = useState('3');
  const [acrossIndiaMax, setAcrossIndiaMax] = useState('5');
  const [acrossIndiaUnit, setAcrossIndiaUnit] = useState<'Hours' | 'Days'>('Days');

  const handleSaveWithinPune = () => {
    if (!withinPuneMin || parseFloat(withinPuneMin) <= 0) {
      Alert.alert('Error', 'Please enter a valid minimum delivery time');
      return;
    }
    if (withinPuneMax && parseFloat(withinPuneMax) <= parseFloat(withinPuneMin)) {
      Alert.alert('Error', 'Maximum time must be greater than minimum time');
      return;
    }
    setShowWithinPuneModal(false);
    Alert.alert('Success', 'Delivery time for Within Pune saved successfully');
  };

  const handleSaveAcrossIndia = () => {
    if (!acrossIndiaMin || parseFloat(acrossIndiaMin) <= 0) {
      Alert.alert('Error', 'Please enter a valid minimum delivery time');
      return;
    }
    if (acrossIndiaMax && parseFloat(acrossIndiaMax) <= parseFloat(acrossIndiaMin)) {
      Alert.alert('Error', 'Maximum time must be greater than minimum time');
      return;
    }
    setShowAcrossIndiaModal(false);
    Alert.alert('Success', 'Delivery time for Across India saved successfully');
  };

  const formatDeliveryTime = (min: string, max: string, unit: string) => {
    if (max && max !== min) {
      return `${min}-${max} ${unit}`;
    }
    return `${min} ${unit}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Time</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Standard delivery time for orders */}
        <Text style={styles.sectionTitle}>Standard delivery time for orders</Text>
        
        <TouchableOpacity
          style={styles.deliveryTimeRow}
          onPress={() => setShowWithinPuneModal(true)}
        >
          <Text style={styles.deliveryTimeLabel}>Within Pune</Text>
          <View style={styles.deliveryTimeValueContainer}>
            <Text style={styles.deliveryTimeValue}>
              {formatDeliveryTime(withinPuneMin, withinPuneMax, withinPuneUnit)}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
          </View>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.deliveryTimeRow}
          onPress={() => setShowAcrossIndiaModal(true)}
        >
          <Text style={styles.deliveryTimeLabel}>Across India</Text>
          <View style={styles.deliveryTimeValueContainer}>
            <Text style={styles.deliveryTimeValue}>
              {formatDeliveryTime(acrossIndiaMin, acrossIndiaMax, acrossIndiaUnit)}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
          </View>
        </TouchableOpacity>

        {/* Recommendation Section */}
        <View style={styles.recommendationSection}>
          <View style={styles.recommendationHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#17aba5" />
            <Text style={styles.recommendationTitle}>
              Our Recommendation for average delivery times
            </Text>
          </View>
          <View style={styles.recommendationList}>
            <Text style={styles.recommendationItem}>• Hyperlocal deliveries: 30-60 minutes</Text>
            <Text style={styles.recommendationItem}>• Within the city: 2-4 hours</Text>
            <Text style={styles.recommendationItem}>• Across India: 3-5 days</Text>
          </View>
        </View>
      </ScrollView>

      {/* Within Pune Modal */}
      <Modal
        visible={showWithinPuneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWithinPuneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery time within Pune</Text>
              <TouchableOpacity onPress={() => setShowWithinPuneModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Minimum</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={withinPuneMin}
                  onChangeText={setWithinPuneMin}
                  keyboardType="numeric"
                  placeholder="2"
                />
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() =>
                    setWithinPuneUnit(withinPuneUnit === 'Hours' ? 'Days' : 'Hours')
                  }
                >
                  <Text style={styles.unitSelectorText}>{withinPuneUnit}</Text>
                  <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Maximum (Optional)</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={withinPuneMax}
                  onChangeText={setWithinPuneMax}
                  keyboardType="numeric"
                  placeholder="4"
                />
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() =>
                    setWithinPuneUnit(withinPuneUnit === 'Hours' ? 'Days' : 'Hours')
                  }
                >
                  <Text style={styles.unitSelectorText}>{withinPuneUnit}</Text>
                  <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>This is what your customer sees</Text>
              <View style={styles.previewBox}>
                <MaterialCommunityIcons name="truck-check" size={24} color="#10B981" />
                <Text style={styles.previewText}>
                  Delivered in {formatDeliveryTime(withinPuneMin, withinPuneMax, withinPuneUnit)}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowWithinPuneModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveWithinPune}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Across India Modal */}
      <Modal
        visible={showAcrossIndiaModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAcrossIndiaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery time across India</Text>
              <TouchableOpacity onPress={() => setShowAcrossIndiaModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Minimum</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={acrossIndiaMin}
                  onChangeText={setAcrossIndiaMin}
                  keyboardType="numeric"
                  placeholder="3"
                />
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() =>
                    setAcrossIndiaUnit(acrossIndiaUnit === 'Hours' ? 'Days' : 'Hours')
                  }
                >
                  <Text style={styles.unitSelectorText}>{acrossIndiaUnit}</Text>
                  <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Maximum (Optional)</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={acrossIndiaMax}
                  onChangeText={setAcrossIndiaMax}
                  keyboardType="numeric"
                  placeholder="5"
                />
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() =>
                    setAcrossIndiaUnit(acrossIndiaUnit === 'Hours' ? 'Days' : 'Hours')
                  }
                >
                  <Text style={styles.unitSelectorText}>{acrossIndiaUnit}</Text>
                  <MaterialCommunityIcons name="chevron-up" size={16} color="#363740" />
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#363740" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>This is what your customer sees</Text>
              <View style={styles.previewBox}>
                <MaterialCommunityIcons name="truck-check" size={24} color="#10B981" />
                <Text style={styles.previewText}>
                  Delivered in {formatDeliveryTime(acrossIndiaMin, acrossIndiaMax, acrossIndiaUnit)}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAcrossIndiaModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAcrossIndia}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 16,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  deliveryTimeLabel: {
    fontSize: 16,
    color: '#363740',
  },
  deliveryTimeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTimeValue: {
    fontSize: 16,
    color: '#17aba5',
    fontWeight: '600',
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e4ec',
    marginVertical: 8,
  },
  recommendationSection: {
    marginTop: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#363740',
    marginLeft: 8,
    flex: 1,
  },
  recommendationList: {
    marginLeft: 28,
  },
  recommendationItem: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 8,
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
  timeInputContainer: {
    marginBottom: 20,
  },
  timeInputLabel: {
    fontSize: 16,
    color: '#363740',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
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
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    minWidth: 100,
  },
  unitSelectorText: {
    fontSize: 16,
    color: '#363740',
    fontWeight: '500',
    marginRight: 8,
  },
  previewContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  previewText: {
    fontSize: 16,
    color: '#363740',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#f5f5fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  closeButtonText: {
    color: '#363740',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

