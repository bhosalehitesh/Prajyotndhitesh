import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StoreAppearanceScreen from './Rdirect/StoreAppearanceScreen';
import CustomDomainScreen from './Rdirect/CustomDomainScreen';
import GoogleAnalyticsScreen from './Rdirect/GoogleAnalyticsScreen';
import StoreTimingsScreen from './Rdirect/StoreTimingsScreen';
import StorePoliciesScreen from './Rdirect/StorePoliciesScreen';

const configMenuItems = [
  {
    label: 'Store Appearance',
    icon: 'palette-outline',
  },
  {
    label: 'Custom Domain',
    icon: 'web',
  },
  {
    label: 'Google Analytics',
    icon: 'file-document-edit-outline',
  },
  {
    label: 'Store Timings',
    icon: 'clock-outline',
  },
  {
    label: 'Store Policies',
    icon: 'file-document-outline',
  },
];

export default function StoreConfigScreen({ onBack }: { onBack: () => void }) {
  const [showStoreAppearance, setShowStoreAppearance] = useState(false);
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [showGoogleAnalytics, setShowGoogleAnalytics] = useState(false);
  const [showStoreTimings, setShowStoreTimings] = useState(false);
  const [showStorePolicies, setShowStorePolicies] = useState(false);

  if (showStoreAppearance) {
    return <StoreAppearanceScreen onBack={() => setShowStoreAppearance(false)} />;
  }

  if (showCustomDomain) {
    return <CustomDomainScreen onBack={() => setShowCustomDomain(false)} />;
  }

  if (showGoogleAnalytics) {
    return <GoogleAnalyticsScreen onBack={() => setShowGoogleAnalytics(false)} />;
  }

  if (showStoreTimings) {
    return <StoreTimingsScreen onBack={() => setShowStoreTimings(false)} />;
  }

  if (showStorePolicies) {
    return <StorePoliciesScreen onBack={() => setShowStorePolicies(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Store Configuration</Text>
      </View>
      <ScrollView>
        <Text style={styles.desc}>
          Adjust store settings for smooth operations and an enhanced customer experience.
        </Text>
        {configMenuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              index === configMenuItems.length - 1 && styles.lastRow,
            ]}
            onPress={() => {
              if (item.label === 'Store Appearance') {
                setShowStoreAppearance(true);
              } else if (item.label === 'Custom Domain') {
                setShowCustomDomain(true);
              } else if (item.label === 'Google Analytics') {
                setShowGoogleAnalytics(true);
              } else if (item.label === 'Store Timings') {
                setShowStoreTimings(true);
              } else if (item.label === 'Store Policies') {
                setShowStorePolicies(true);
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

