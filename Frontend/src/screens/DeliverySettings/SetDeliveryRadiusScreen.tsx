/**
 * Set Delivery Radius Screen
 * Screen for configuring delivery coverage/radius
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconSymbol from '../../components/IconSymbol';
import { storage } from '../../authentication/storage';

const SetDeliveryRadiusScreen: React.FC = () => {
  const navigation = useNavigation();
  const [coverageType, setCoverageType] = useState<'radius' | 'allIndia'>('radius');
  const [deliveryRadius, setDeliveryRadius] = useState('3800');

  // Load saved values on mount
  useEffect(() => {
    const loadSavedRadius = async () => {
      try {
        const savedType = await storage.getItem('deliveryCoverageType');
        const savedRadius = await storage.getItem('deliveryRadius');
        
        if (savedType) {
          setCoverageType(savedType as 'radius' | 'allIndia');
        }
        if (savedRadius) {
          setDeliveryRadius(savedRadius);
        }
      } catch (error) {
        console.error('Error loading saved delivery radius:', error);
      }
    };
    
    loadSavedRadius();
  }, []);

  const handleSave = async () => {
    // Validation
    if (coverageType === 'radius' && (!deliveryRadius || parseFloat(deliveryRadius) <= 0)) {
      Alert.alert('Error', 'Please enter a valid delivery radius');
      return;
    }
    
    try {
      // Save to storage
      await storage.setItem('deliveryCoverageType', coverageType);
      if (coverageType === 'radius') {
        await storage.setItem('deliveryRadius', deliveryRadius);
      }
      
      // TODO: API call to save to backend
      
      Alert.alert('Success', 'Delivery radius saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving delivery radius:', error);
      Alert.alert('Error', 'Failed to save delivery radius. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set delivery coverage for home delivery</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <IconSymbol name="close" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.radioContainer}>
          {/* Coverage limited to specific radius */}
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
                  placeholder="3800"
                  value={deliveryRadius}
                  onChangeText={setDeliveryRadius}
                  keyboardType="numeric"
                />
                <View style={styles.unitButton}>
                  <Text style={styles.unitButtonText}>KM</Text>
                </View>
              </View>
            </View>
          )}

          {/* All India coverage */}
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4EC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  radioContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    borderColor: '#e61580',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e61580',
  },
  radioLabel: {
    fontSize: 16,
    color: '#363740',
    fontWeight: '500',
    flex: 1,
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
    borderColor: '#E2E4EC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#363740',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  unitButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E4EC',
    minWidth: 60,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#e61580',
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
});

export default SetDeliveryRadiusScreen;










