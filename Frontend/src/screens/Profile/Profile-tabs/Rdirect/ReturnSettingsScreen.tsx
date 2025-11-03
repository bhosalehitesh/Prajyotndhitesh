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

interface ReturnSettingsScreenProps {
  onBack: () => void;
}

export default function ReturnSettingsScreen({ onBack }: ReturnSettingsScreenProps) {
  const [returnWindow, setReturnWindow] = useState('7');
  const [feeType, setFeeType] = useState<'perRequest' | 'perItem'>('perRequest');
  const [returnFee, setReturnFee] = useState('0');
  const [showPreview, setShowPreview] = useState(false);
  const [returnReasons, setReturnReasons] = useState([
    'Product did not meet expectations',
    'Product was damaged',
    'Wrong product delivered',
    'Size or Fit issues',
    'Quality issues',
  ]);
  const [editingReason, setEditingReason] = useState<number | null>(null);
  const [editReasonText, setEditReasonText] = useState('');

  const handleSave = () => {
    if (!returnWindow || parseFloat(returnWindow) <= 0) {
      Alert.alert('Error', 'Please enter a valid return window');
      return;
    }
    if (!returnFee || parseFloat(returnFee) < 0) {
      Alert.alert('Error', 'Please enter a valid return fee');
      return;
    }
    Alert.alert('Success', 'Return settings saved successfully');
  };

  const handleEditReason = (index: number) => {
    setEditingReason(index);
    setEditReasonText(returnReasons[index]);
  };

  const handleSaveReason = (index: number) => {
    if (!editReasonText.trim()) {
      Alert.alert('Error', 'Return reason cannot be empty');
      return;
    }
    const updatedReasons = [...returnReasons];
    updatedReasons[index] = editReasonText.trim();
    setReturnReasons(updatedReasons);
    setEditingReason(null);
    setEditReasonText('');
  };

  const handleCancelEdit = () => {
    setEditingReason(null);
    setEditReasonText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Return Settings</Text>
        <TouchableOpacity onPress={() => setShowPreview(true)}>
          <View style={styles.previewButton}>
            <MaterialCommunityIcons name="eye-outline" size={20} color="#10B981" />
            <Text style={styles.previewText}>Preview</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Return Window Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Return Window</Text>
          <Text style={styles.sectionDesc}>
            Number of days up to which customers can request returns after delivery
          </Text>
          <TextInput
            style={styles.input}
            value={returnWindow}
            onChangeText={setReturnWindow}
            keyboardType="numeric"
            placeholder="7"
          />
          <View style={styles.proTip}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#ff9800" />
            <Text style={styles.proTipText}>
              A 7 - 14 day return window balances your customers' needs with your efficiency
            </Text>
          </View>
        </View>

        {/* Return Fee Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Return Fee</Text>
          <View style={styles.feeToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                feeType === 'perRequest' && styles.toggleButtonActive,
              ]}
              onPress={() => setFeeType('perRequest')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  feeType === 'perRequest' && styles.toggleButtonTextActive,
                ]}
              >
                Per Request
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                feeType === 'perItem' && styles.toggleButtonActive,
              ]}
              onPress={() => setFeeType('perItem')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  feeType === 'perItem' && styles.toggleButtonTextActive,
                ]}
              >
                Per Item
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.feeDesc}>
            Set a return fee to be applied on every return request
          </Text>
          <View style={styles.feeInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.feeInput}
              value={returnFee}
              onChangeText={setReturnFee}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          {feeType === 'perRequest' && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#ff9800" />
              <Text style={styles.infoText}>
                Return fee will be applied at an order level even if there are multiple requests
                within
              </Text>
            </View>
          )}
        </View>

        {/* Return Reasons Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Return Reasons</Text>
          <Text style={styles.reasonsDesc}>
            Customers will have a choice of 5 return reasons to select from. Edit them here.
          </Text>
          <View style={styles.reasonsList}>
            {returnReasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                {editingReason === index ? (
                  <View style={styles.editReasonContainer}>
                    <TextInput
                      style={styles.editReasonInput}
                      value={editReasonText}
                      onChangeText={setEditReasonText}
                      autoFocus
                    />
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        style={styles.saveReasonButton}
                        onPress={() => handleSaveReason(index)}
                      >
                        <MaterialCommunityIcons name="check" size={20} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelReasonButton}
                        onPress={handleCancelEdit}
                      >
                        <MaterialCommunityIcons name="close" size={20} color="#f44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.reasonText} numberOfLines={2}>
                      {reason}
                    </Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditReason(index)}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color="#10B981" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Preview - Return Settings</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Return Window:</Text>
                <Text style={styles.previewValue}>{returnWindow} days</Text>
              </View>
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Return Fee:</Text>
                <Text style={styles.previewValue}>
                  ₹{returnFee} ({feeType === 'perRequest' ? 'Per Request' : 'Per Item'})
                </Text>
              </View>
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Return Reasons:</Text>
                {returnReasons.map((reason, index) => (
                  <Text key={index} style={styles.previewReasonItem}>
                    {index + 1}. {reason}
                  </Text>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#222',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  previewText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    marginBottom: 12,
  },
  proTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
  },
  proTipText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    marginLeft: 8,
    lineHeight: 20,
  },
  feeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#17aba5',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  feeDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  feeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#363740',
    fontWeight: '600',
    paddingLeft: 16,
  },
  feeInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#363740',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    marginLeft: 8,
    lineHeight: 20,
  },
  reasonsDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  reasonsList: {
    marginTop: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#363740',
    marginRight: 12,
  },
  editButton: {
    padding: 4,
  },
  editReasonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editReasonInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#17aba5',
    marginRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveReasonButton: {
    padding: 4,
  },
  cancelReasonButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
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
    maxHeight: '80%',
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
  previewSection: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  previewReasonItem: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
    paddingLeft: 8,
  },
});

