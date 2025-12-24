/**
 * Set Delivery Charges Screen
 * Screen for configuring delivery charges
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

const SetDeliveryChargesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [deliveryChargeType, setDeliveryChargeType] = useState<'flat' | 'free'>('flat');
  const [flatDeliveryPrice, setFlatDeliveryPrice] = useState('0');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('');

  // Load saved values on mount
  useEffect(() => {
    const loadSavedCharges = async () => {
      try {
        const savedType = await storage.getItem('deliveryChargeType');
        const savedFlatPrice = await storage.getItem('deliveryFlatPrice');
        const savedFreeAbove = await storage.getItem('deliveryFreeAbove');
        
        if (savedType) {
          setDeliveryChargeType(savedType as 'flat' | 'free');
        }
        if (savedFlatPrice) {
          setFlatDeliveryPrice(savedFlatPrice);
        }
        if (savedFreeAbove) {
          setFreeDeliveryAbove(savedFreeAbove);
        }
      } catch (error) {
        console.error('Error loading saved delivery charges:', error);
      }
    };
    
    loadSavedCharges();
  }, []);

  const handleSave = async () => {
    // Validation
    if (deliveryChargeType === 'flat' && !flatDeliveryPrice) {
      Alert.alert('Error', 'Please enter delivery price');
      return;
    }
    if (deliveryChargeType === 'free' && !freeDeliveryAbove) {
      Alert.alert('Error', 'Please enter minimum order amount for free delivery');
      return;
    }
    
    try {
      // Save to storage
      await storage.setItem('deliveryChargeType', deliveryChargeType);
      if (deliveryChargeType === 'flat') {
        await storage.setItem('deliveryFlatPrice', flatDeliveryPrice);
      } else {
        await storage.setItem('deliveryFreeAbove', freeDeliveryAbove);
      }
      
      // TODO: API call to save to backend
      
      Alert.alert('Success', 'Delivery charges saved successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving delivery charges:', error);
      Alert.alert('Error', 'Failed to save delivery charges. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set delivery charges</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.radioContainer}>
          {/* Flat Delivery Fee Option */}
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

          {/* Free Delivery Above Option */}
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
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 36,
  },
  currencyBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#E2E4EC',
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
    borderColor: '#E2E4EC',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#363740',
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

export default SetDeliveryChargesScreen;



