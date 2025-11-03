import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function StorePoliciesScreen({ onBack }: { onBack: () => void }) {
  const policies = [
    {
      id: 1,
      title: 'Store FAQs',
      category: 'Account',
      preview: '1. Do I have to create an account to make a purchase?...',
    },
    {
      id: 2,
      title: 'Return Policy',
      preview: "1. We ensure that our products reach you safely and on-time and currently don't accept returns. In case of queries please contact us with the details mentioned in th...",
    },
    {
      id: 3,
      title: 'Cancellation & Refund',
      preview: '1. Full refund if Order is cancelled before it is accepted by us.\n2. No cancellation or refund if your order has been accepted or shipped....',
    },
    {
      id: 4,
      title: 'Privacy Policy',
      preview: 'This Privacy Policy ("Privacy Policy") explains how we use your information when you access or use our storefront, its corresponding mobile site or mobile ap...',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Store Policies</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#858997" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Introduction Section */}
          <View style={styles.introSection}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons name="shield-check" size={48} color="#4361ee" />
            </View>
            <Text style={styles.introTitle}>Store Policies</Text>
            <Text style={styles.introText}>
              Sell the way you want with policies you prefer. Having store terms and usage policy helps earn customer trust.
            </Text>
            <Text style={styles.introText}>
              We have added default policy templates which you can add to your website straightaway. You can edit these anytime and create your own store terms and usage policy.
            </Text>
          </View>

          {/* Policy Cards */}
          {policies.map((policy) => (
            <View key={policy.id} style={styles.policyCard}>
              <View style={styles.policyHeader}>
                <View style={styles.policyTitleContainer}>
                  <Text style={styles.policyTitle}>{policy.title}</Text>
                  {policy.category && (
                    <Text style={styles.policyCategory}>{policy.category}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.policyPreview}>{policy.preview}</Text>
            </View>
          ))}
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
    backgroundColor: '#fff',
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
    padding: 20,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  introIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: '#363740',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  policyTitleContainer: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  policyCategory: {
    fontSize: 15,
    color: '#363740',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#4361ee',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  policyPreview: {
    fontSize: 15,
    color: '#363740',
    lineHeight: 22,
  },
});

