/**
 * Third Party Form Screen
 * Full screen for entering partner and tracking details
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

const ThirdPartyFormScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = (route.params as RouteParams) || {};
  const [partnerName, setPartnerName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!partnerName.trim() || !trackingId.trim()) {
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
      
      Alert.alert('Success', `Order has been marked as shipped via ${partnerName}`);
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
        <Text style={styles.question}>Third Party Service</Text>
        <Text style={styles.subtext}>
          Enter the tracking code for Blue Dart, Delhivery or any other service you have used.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Partner*"
            placeholderTextColor="#999"
            value={partnerName}
            onChangeText={setPartnerName}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Tracking ID / URL*"
            placeholderTextColor="#999"
            value={trackingId}
            onChangeText={setTrackingId}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            partnerName.trim() && trackingId.trim() && styles.continueButtonEnabled
          ]}
          onPress={handleSubmit}
          disabled={!partnerName.trim() || !trackingId.trim() || updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.continueButtonText,
              partnerName.trim() && trackingId.trim() && styles.continueButtonTextEnabled
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

export default ThirdPartyFormScreen;



