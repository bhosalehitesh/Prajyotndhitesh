import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TermsScreen from './Rdirect/TermsScreen';
import PrivacyPolicyScreen from './Rdirect/PrivacyPolicy';

export default function LegalScreen({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<'main' | 'terms' | 'privacy'>('main');

  if (screen === 'terms') return <TermsScreen onBack={() => setScreen('main')} />;
  if (screen === 'privacy') return <PrivacyPolicyScreen onBack={() => setScreen('main')} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Legal</Text>
      </View>
      <Text style={styles.desc}>
        Adjust store settings for smooth operations and an enhanced customer experience.
      </Text>
      <TouchableOpacity style={styles.row} onPress={() => setScreen('terms')}>
        <MaterialCommunityIcons name="file-document-outline" size={26} color="#e61580" />
        <Text style={styles.label}> Terms & Conditions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={() => setScreen('privacy')}>
        <MaterialCommunityIcons name="shield-check" size={26} color="#e61580" />
        <Text style={styles.label}> Privacy Policy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: '#e61580' },
  title: { fontWeight: 'bold', fontSize: 28, textAlign: 'center', marginLeft: 12, flex: 1, color: '#ffffff' },
  desc: { color: '#6B7280', fontSize: 17, margin: 24, marginBottom: 18, marginTop: 22, opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#fff', marginHorizontal: 16 },
  label: { fontSize: 20, color: '#1a1a1a', marginLeft: 12 }
});

