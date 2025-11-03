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
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
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

