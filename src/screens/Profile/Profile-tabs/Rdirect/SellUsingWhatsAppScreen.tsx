import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ManageCustomersScreen from './ManageCustomersScreen';
import MarketingCampaignScreen from './MarketingCampaignScreen';

interface SellUsingWhatsAppScreenProps {
  onBack: () => void;
}

export default function SellUsingWhatsAppScreen({ onBack }: SellUsingWhatsAppScreenProps) {
  const [showManageCustomers, setShowManageCustomers] = useState(false);
  const [showMarketingCampaign, setShowMarketingCampaign] = useState(false);

  if (showManageCustomers) {
    return <ManageCustomersScreen onBack={() => setShowManageCustomers(false)} />;
  }

  if (showMarketingCampaign) {
    return <MarketingCampaignScreen onBack={() => setShowMarketingCampaign(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Sell using WhatsApp</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Manage Customers */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowManageCustomers(true)}
        >
          <Text style={styles.menuItemText}>Manage Customers</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
        </TouchableOpacity>

        {/* Marketing Campaign */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowMarketingCampaign(true)}
        >
          <Text style={styles.menuItemText}>Marketing Campaign</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#17aba5" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    color: '#222',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#363740',
  },
});
