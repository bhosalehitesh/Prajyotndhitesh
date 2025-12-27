import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TalkToUsScreen({ onBack }: { onBack: () => void }) {
  const handleCall = () => {
    Linking.openURL('tel:+918766408154');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Talk To Us</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.desc}>Call our support team for immediate assistance and personalized help.</Text>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="phone" size={48} color="#e61580" />
            <Text style={styles.infoTitle}>24/7 Support Available</Text>
            <Text style={styles.infoText}>
              Our support team is available round the clock to help you with any questions or issues.
            </Text>
          </View>

          <View style={styles.contactCard}>
            <MaterialCommunityIcons name="phone-outline" size={24} color="#e61580" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Support Number</Text>
              <Text style={styles.contactNumber}>+91 8766408154</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <MaterialCommunityIcons name="phone" size={24} color="#ffffff" />
            <Text style={styles.callButtonText}>Call Support Now</Text>
          </TouchableOpacity>

          <View style={styles.hoursCard}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#6B7280" />
            <View style={styles.hoursInfo}>
              <Text style={styles.hoursLabel}>Support Hours</Text>
              <Text style={styles.hoursText}>Monday - Sunday: 24/7 Available</Text>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  desc: {
    fontSize: 17,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  callButton: {
    backgroundColor: '#e61580',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  hoursCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  hoursInfo: {
    marginLeft: 16,
    flex: 1,
  },
  hoursLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});

