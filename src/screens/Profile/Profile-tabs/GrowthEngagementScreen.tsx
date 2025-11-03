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
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#e2e4ec',
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
    color: '#363740',
    marginLeft: 12,
    flex: 1,
  },
  arrow: {
    marginLeft: 'auto',
  },
});

