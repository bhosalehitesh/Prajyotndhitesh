import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DeliverySettingsScreen from './Rdirect/DeliverySettingsScreen';
import ReturnsScreen from './Rdirect/ReturnsScreen';

const shippingMenuItems = [
  {
    label: 'Delivery Settings',
    icon: 'truck-delivery-outline',
  },
  {
    label: 'Returns',
    icon: 'truck-delivery-outline',
  },
];

export default function ShippingScreen({ onBack }: { onBack: () => void }) {
  const [showDeliverySettings, setShowDeliverySettings] = useState(false);
  const [showReturns, setShowReturns] = useState(false);

  if (showDeliverySettings) {
    return <DeliverySettingsScreen onBack={() => setShowDeliverySettings(false)} />;
  }

  if (showReturns) {
    return <ReturnsScreen onBack={() => setShowReturns(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Shipping</Text>
      </View>
      <ScrollView>
        <Text style={styles.desc}>
          Tailor delivery and return settings for smooth order fulfillment and customer satisfaction.
        </Text>

        {/* Easy Return Option Card */}
        <View style={styles.card}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>
              Provide your customers an easy return option products
            </Text>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={() => setShowReturns(true)}
            >
              <Text style={styles.enableButtonText}>Enable Returns on Store</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#e61580"
                style={styles.enableArrow}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        {shippingMenuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              index === shippingMenuItems.length - 1 && styles.lastRow,
            ]}
            onPress={() => {
              if (item.label === 'Delivery Settings') {
                setShowDeliverySettings(true);
              } else if (item.label === 'Returns') {
                setShowReturns(true);
              }
            }}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={26}
              color="#e61580"
            />
            <Text style={styles.label}>{item.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#e61580"
              style={styles.arrow}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  desc: {
    color: '#6B7280',
    fontSize: 17,
    margin: 24,
    marginBottom: 18,
    marginTop: 22,
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  enableButtonText: {
    color: '#e61580',
    fontSize: 16,
    fontWeight: '600',
  },
  enableArrow: {
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#fff',
    marginHorizontal: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    color: '#1a1a1a',
    marginLeft: 12,
    flex: 1,
  },
  arrow: {
    marginLeft: 'auto',
  },
});

