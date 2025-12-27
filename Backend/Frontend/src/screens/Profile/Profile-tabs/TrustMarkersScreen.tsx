import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TrustBadgesScreen from './Rdirect/TrustBadgesScreen';
import SocialMediaLinksScreen from './Rdirect/SocialMediaLinksScreen';

const trustMenuItems = [
  {
    label: 'Trust Badges',
    icon: 'handshake-outline',
  },
  {
    label: 'Link Social Media',
    icon: 'web',
  },
];

export default function TrustMarkersScreen({ onBack }: { onBack: () => void }) {
  const [showTrustBadges, setShowTrustBadges] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);

  if (showTrustBadges) {
    return <TrustBadgesScreen onBack={() => setShowTrustBadges(false)} />;
  }

  if (showSocialMedia) {
    return <SocialMediaLinksScreen onBack={() => setShowSocialMedia(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Trust Markers</Text>
      </View>
      <ScrollView>
        <Text style={styles.desc}>
          Configure trust markers for increased credibility and customer trust in your store.
        </Text>

        {/* Menu Items */}
        {trustMenuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              index === trustMenuItems.length - 1 && styles.lastRow,
            ]}
            onPress={() => {
              if (item.label === 'Trust Badges') {
                setShowTrustBadges(true);
              } else if (item.label === 'Link Social Media') {
                setShowSocialMedia(true);
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

