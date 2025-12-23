/**
 * Ship Order Screen
 * Full screen for selecting shipping method (Self Ship or Third Party Service)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface RouteParams {
  orderId: string;
}

const ShipOrderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = (route.params as RouteParams) || {};
  const [shippingMethod, setShippingMethod] = useState<'self' | 'third-party' | null>(null);

  const handleContinue = () => {
    if (!shippingMethod) {
      return;
    }

    if (shippingMethod === 'self') {
      navigation.navigate('SelfShipForm' as never, { orderId } as never);
    } else if (shippingMethod === 'third-party') {
      navigation.navigate('ThirdPartyForm' as never, { orderId } as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ship Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>How will the order get shipped?</Text>
        <Text style={styles.subtext}>Select how you are going to ship this order</Text>

        <View style={styles.shippingOptions}>
          <TouchableOpacity
            style={[
              styles.shippingOption,
              shippingMethod === 'self' && styles.shippingOptionSelected
            ]}
            onPress={() => setShippingMethod('self')}
          >
            <View style={styles.radioButton}>
              {shippingMethod === 'self' && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.shippingOptionText}>Self Ship</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shippingOption,
              shippingMethod === 'third-party' && styles.shippingOptionSelected
            ]}
            onPress={() => setShippingMethod('third-party')}
          >
            <View style={styles.radioButton}>
              {shippingMethod === 'third-party' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.shippingOptionContent}>
              <Text style={styles.shippingOptionText}>Third Party Service</Text>
              <Text style={styles.shippingOptionDescription}>
                Select this if you are using BlueDart or any other service to ship this order.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            shippingMethod && styles.continueButtonEnabled
          ]}
          onPress={handleContinue}
          disabled={!shippingMethod}
        >
          <Text style={[
            styles.continueButtonText,
            shippingMethod && styles.continueButtonTextEnabled
          ]}>
            Continue
          </Text>
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
    backgroundColor: '#e61580',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 32,
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
  shippingOptions: {
    gap: 16,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  shippingOptionSelected: {
    borderColor: '#e61580',
    backgroundColor: '#fef2f8',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e61580',
  },
  shippingOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shippingOptionContent: {
    flex: 1,
  },
  shippingOptionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
});

export default ShipOrderScreen;


