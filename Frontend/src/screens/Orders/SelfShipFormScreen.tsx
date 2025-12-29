/**
 * Self Ship Form Screen
 * Full screen for entering delivery agent details
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { updateOrderStatus } from '../../utils/orderApi';

interface RouteParams {
  orderId: string;
}

const SelfShipFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = (route.params as RouteParams) || {};
  const [deliveryAgentName, setDeliveryAgentName] = useState('');
  const [deliveryAgentPhone, setDeliveryAgentPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!deliveryAgentName.trim() || !deliveryAgentPhone.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      
      // Update order status to SHIPPED
      await updateOrderStatus(orderId, 'SHIPPED');
      
      // Navigate back to order details
      navigation.goBack();
      navigation.goBack(); // Go back twice: once from this screen, once from ShipOrderScreen
      
      Alert.alert('Success', 'Order has been marked as shipped via Self Ship');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to ship order');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Self Ship</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <MaterialCommunityIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>Delivery Agent's Details</Text>
        <Text style={styles.subtext}>
          To ensure a smooth delivery experience for the customer, please add delivery agent's information
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Name*"
            placeholderTextColor="#999"
            value={deliveryAgentName}
            onChangeText={setDeliveryAgentName}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Phone Number*"
            placeholderTextColor="#999"
            value={deliveryAgentPhone}
            onChangeText={setDeliveryAgentPhone}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            deliveryAgentName.trim() && deliveryAgentPhone.trim() && styles.continueButtonEnabled
          ]}
          onPress={handleSubmit}
          disabled={!deliveryAgentName.trim() || !deliveryAgentPhone.trim() || updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.continueButtonText,
              deliveryAgentName.trim() && deliveryAgentPhone.trim() && styles.continueButtonTextEnabled
            ]}>
              Continue
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    gap: 16,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#d1d5db',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonEnabled: {
    backgroundColor: '#e61580',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  continueButtonTextEnabled: {
    color: '#fff',
  },
  goBackButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  goBackButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});

export default SelfShipFormScreen;








