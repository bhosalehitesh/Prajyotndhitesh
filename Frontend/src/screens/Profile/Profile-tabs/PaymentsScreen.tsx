import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CashOnDeliveryScreen from './Rdirect/CashOnDeliveryScreen';
import OnlinePaymentScreen from './Rdirect/OnlinePaymentScreen';

const paymentMenuItems = [
  {
    label: 'Setup Online Payment',
    subtitle: 'Powered by',
    poweredBy: 'Razorpay',
  },
  {
    label: 'Setup Cash on Delivery (COD)',
    subtitle: null,
    poweredBy: null,
  },
];

export default function PaymentsScreen({ onBack }: { onBack: () => void }) {
  const [showCashOnDelivery, setShowCashOnDelivery] = useState(false);
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);

  if (showCashOnDelivery) {
    return <CashOnDeliveryScreen onBack={() => setShowCashOnDelivery(false)} />;
  }

  if (showOnlinePayment) {
    return <OnlinePaymentScreen onBack={() => setShowOnlinePayment(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Payments</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Manage Your Payment Options.</Text>
          <Text style={styles.desc}>
            Customize how you get paid and make shopping convenient for your customers.
          </Text>

          {/* Payment Option Cards */}
          {paymentMenuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.paymentCard,
                index === paymentMenuItems.length - 1 && styles.lastCard,
              ]}
              onPress={() => {
                if (item.label === 'Setup Online Payment') {
                  setShowOnlinePayment(true);
                } else if (item.label === 'Setup Cash on Delivery (COD)') {
                  setShowCashOnDelivery(true);
                }
              }}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                {item.subtitle && (
                  <View style={styles.poweredByRow}>
                    <Text style={styles.poweredByText}>{item.subtitle} </Text>
                    <View style={styles.razorpayLogo}>
                      <Text style={styles.razorpayText}>{item.poweredBy}</Text>
                    </View>
                  </View>
                )}
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#e61580"
                style={styles.arrow}
              />
            </TouchableOpacity>
          ))}

          {/* Recommendation Section */}
          <View style={styles.recommendationBox}>
            <View style={styles.recommendationHeader}>
              <MaterialCommunityIcons
                name="star"
                size={16}
                color="#e61580"
              />
              <Text style={styles.recommendationLabel}>Our Recommendation</Text>
            </View>
            <Text style={styles.recommendationText}>
              Consider offering both Cash on Delivery (COD) and Online Payment options,
              keeping your customers' familiar choices in mind.
            </Text>
          </View>
        </View>
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
  content: {
    padding: 24,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  desc: {
    color: '#6B7280',
    fontSize: 17,
    marginBottom: 24,
    lineHeight: 24,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lastCard: {
    marginBottom: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 6,
  },
  poweredByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  poweredByText: {
    fontSize: 14,
    color: '#888',
  },
  razorpayLogo: {
    backgroundColor: '#4361ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  razorpayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrow: {
    marginLeft: 12,
  },
  recommendationBox: {
    backgroundColor: '#fff5f8',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e61580',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationLabel: {
    color: '#e61580',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  recommendationText: {
    color: '#1a1a1a',
    fontSize: 16,
    lineHeight: 24,
  },
});

