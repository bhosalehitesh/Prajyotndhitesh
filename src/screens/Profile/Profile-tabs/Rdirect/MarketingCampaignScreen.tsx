import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CreateCampaignScreen from './CreateCampaignScreen';

interface MarketingCampaignScreenProps {
  onBack: () => void;
}

export default function MarketingCampaignScreen({ onBack }: MarketingCampaignScreenProps) {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  if (showCreateCampaign) {
    return <CreateCampaignScreen onBack={() => setShowCreateCampaign(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Marketing Campaign</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Message Usage Card */}
        <View style={styles.usageCard}>
          <Text style={styles.usageTitle}>This Month's Usage of 100 Messages</Text>
          <Text style={styles.usageDesc}>100 message limit resets at start of the month</Text>
          <View style={styles.usageStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Sent</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>100</Text>
            </View>
          </View>
        </View>

        {/* Campaigns Section */}
        <View style={styles.campaignsSection}>
          <View style={styles.campaignsHeader}>
            <Text style={styles.campaignsTitle}>Campaigns</Text>
            <View style={styles.filterDropdown}>
              <Text style={styles.filterText}>Last 7 days</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
            </View>
          </View>

          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>You do not have any campaigns yet.</Text>
            <Text style={styles.emptyStateDesc}>
              You can create new campaigns to promote your storefront among new customers or to
              encourage repeat purchases.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create New Campaign Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateCampaign(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create New Campaign</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
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
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 8,
  },
  usageDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  usageStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#363740',
  },
  campaignsSection: {
    marginTop: 8,
  },
  campaignsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  campaignsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5fa',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#363740',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  createButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

