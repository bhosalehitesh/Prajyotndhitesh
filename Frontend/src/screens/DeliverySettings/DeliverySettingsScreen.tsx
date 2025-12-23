/**
 * Delivery Settings Screen
 * Main delivery settings configuration screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import IconSymbol from '../../components/IconSymbol';
import { storage } from '../../authentication/storage';

const DeliverySettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  // State for delivery settings
  const [deliveryCharge, setDeliveryCharge] = useState('0');
  const [deliveryRadius, setDeliveryRadius] = useState('All India coverage');
  const [deliveryTime, setDeliveryTime] = useState('Delivered in 3-5 Days');

  // Load delivery settings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadDeliverySettings = async () => {
        try {
          // Load delivery charge
          const savedType = await storage.getItem('deliveryChargeType');
          if (savedType === 'flat') {
            const flatPrice = await storage.getItem('deliveryFlatPrice') || '0';
            setDeliveryCharge(flatPrice);
          } else if (savedType === 'free') {
            const freeAbove = await storage.getItem('deliveryFreeAbove');
            if (freeAbove) {
              setDeliveryCharge(`Free above ₹${freeAbove}`);
            } else {
              setDeliveryCharge('0');
            }
          } else {
            // Default to 0 if nothing saved
            setDeliveryCharge('0');
          }

          // Load delivery radius
          const coverageType = await storage.getItem('deliveryCoverageType');
          if (coverageType === 'radius') {
            const radius = await storage.getItem('deliveryRadius');
            if (radius) {
              setDeliveryRadius(`${radius} KM`);
            } else {
              setDeliveryRadius('All India coverage');
            }
          } else {
            setDeliveryRadius('All India coverage');
          }

          // Load delivery time
          const localTime = await storage.getItem('localDeliveryTime');
          const nationalTime = await storage.getItem('nationalDeliveryTime');

          let timeDisplay = 'Delivered in 3-5 Days';

          if (localTime) {
            const cleanLocal = localTime.replace('Delivered in ', '');
            timeDisplay = `Local: ${cleanLocal}`;

            if (nationalTime) {
              const cleanNational = nationalTime.replace('Delivered in ', '');
              timeDisplay += ` • National: ${cleanNational}`;
            }
          } else if (nationalTime) {
            timeDisplay = nationalTime;
          }

          setDeliveryTime(timeDisplay);
        } catch (error) {
          console.error('Error loading delivery settings:', error);
          setDeliveryCharge('0');
          setDeliveryRadius('All India coverage');
          setDeliveryTime('Delivered in 3-5 Days');
        }
      };

      loadDeliverySettings();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Set delivery charges */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            navigation.navigate('SetDeliveryCharges' as never);
          }}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Set delivery charges</Text>
            <Text style={styles.settingValue}>
              Delivery: <Text style={styles.valueText}>{deliveryCharge}</Text>
            </Text>
          </View>
          <IconSymbol name="chevron-forward" size={24} color="#000000" />
        </TouchableOpacity>

        {/* Set delivery radius */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            navigation.navigate('SetDeliveryRadius' as never);
          }}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Set delivery radius</Text>
            <Text style={styles.settingValue}>
              Delivery Radius: <Text style={styles.valueText}>{deliveryRadius}</Text>
            </Text>
          </View>
          <IconSymbol name="chevron-forward" size={24} color="#000000" />
        </TouchableOpacity>

        {/* Delivery Time */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            navigation.navigate('DeliveryTime' as never);
          }}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Delivery Time</Text>
            <Text style={styles.settingValue}>
              <Text style={styles.valueText}>{deliveryTime}</Text>
            </Text>
          </View>
          <IconSymbol name="chevron-forward" size={24} color="#000000" />
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
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4EC',
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
    color: '#888888',
  },
  valueText: {
    color: '#25A0B0', // Teal/blue color as shown in image
    fontWeight: '600',
  },
});

export default DeliverySettingsScreen;

