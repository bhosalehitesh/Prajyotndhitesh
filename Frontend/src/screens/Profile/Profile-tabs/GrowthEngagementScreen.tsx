import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import OffersDiscountsScreen from './Rdirect/OffersDiscountsScreen';
import MarketingAutomationScreen from './Rdirect/MarketingAutomationScreen';
import InstagramFeedScreen from './Rdirect/InstagramFeedScreen';
import SellUsingWhatsAppScreen from './Rdirect/SellUsingWhatsAppScreen';

const growthMenuItems = [
  {
    label: 'Offers & Discounts',
    icon: 'ticket-percent-outline',
  },
  {
    label: 'Marketing Automation',
    icon: 'bullhorn-outline',
  },
  {
    label: 'Instagram Feed',
    icon: 'instagram',
  },
  {
    label: 'Sell using Whatsapp',
    icon: 'whatsapp',
  },
];

export default function GrowthEngagementScreen({ onBack }: { onBack: () => void }) {
  const [showOffersDiscounts, setShowOffersDiscounts] = useState(false);
  const [showMarketingAutomation, setShowMarketingAutomation] = useState(false);
  const [showInstagramFeed, setShowInstagramFeed] = useState(false);
  const [showSellUsingWhatsApp, setShowSellUsingWhatsApp] = useState(false);

  if (showOffersDiscounts) {
    return <OffersDiscountsScreen onBack={() => setShowOffersDiscounts(false)} />;
  }

  if (showMarketingAutomation) {
    return <MarketingAutomationScreen onBack={() => setShowMarketingAutomation(false)} />;
  }

  if (showInstagramFeed) {
    return <InstagramFeedScreen onBack={() => setShowInstagramFeed(false)} />;
  }

  if (showSellUsingWhatsApp) {
    return <SellUsingWhatsAppScreen onBack={() => setShowSellUsingWhatsApp(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Growth & Engagement</Text>
      </View>
      <ScrollView>
        <Text style={styles.desc}>
          Boost business and connect better with customers using settings tailored for growth and engagement
        </Text>

        {/* Menu Items */}
        {growthMenuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              index === growthMenuItems.length - 1 && styles.lastRow,
            ]}
            onPress={() => {
              if (item.label === 'Offers & Discounts') {
                setShowOffersDiscounts(true);
              } else if (item.label === 'Marketing Automation') {
                setShowMarketingAutomation(true);
              } else if (item.label === 'Instagram Feed') {
                setShowInstagramFeed(true);
              } else if (item.label === 'Sell using Whatsapp') {
                setShowSellUsingWhatsApp(true);
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 0,
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

