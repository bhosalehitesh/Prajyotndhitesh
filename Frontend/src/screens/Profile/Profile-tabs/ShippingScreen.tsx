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
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
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
                color="#22b0a7"
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
              color="#888"
            />
            <Text style={styles.label}>{item.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#17aba5"
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
    backgroundColor: '#f5f5fa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
  },
  desc: {
    color: '#858997',
    fontSize: 17,
    margin: 24,
    marginBottom: 18,
    marginTop: 22,
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
    color: '#363740',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  enableButtonText: {
    color: '#22b0a7',
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
    borderColor: '#e2e4ec',
    backgroundColor: '#fff',
    marginHorizontal: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 20,
    color: '#363740',
    marginLeft: 12,
    flex: 1,
  },
  arrow: {
    marginLeft: 'auto',
  },
});

