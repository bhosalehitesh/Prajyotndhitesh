import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CreateNewOfferScreen from './CreateNewOfferScreen';

interface OffersDiscountsScreenProps {
  onBack: () => void;
}

export default function OffersDiscountsScreen({ onBack }: OffersDiscountsScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'yetToStart' | 'expired'>(
    'all'
  );
  const [showCreateOffer, setShowCreateOffer] = useState(false);

  if (showCreateOffer) {
    return <CreateNewOfferScreen onBack={() => setShowCreateOffer(false)} />;
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'yetToStart', label: 'Yet to Start' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Offers & Discounts</Text>
      </View>

      {/* Sort By Section */}
      <View style={styles.sortSection}>
        <Text style={styles.sortLabel}>Sort By</Text>
        <View style={styles.sortValue}>
          <Text style={styles.sortValueText}>Start Date</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#6B7280" />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {selectedTab === tab.key && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Empty State */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>You have not set up any Offers</Text>
          <Text style={styles.emptyStateDesc}>
            Create new Offer during non busy hours so your customers do not lose on deals.
          </Text>
        </View>
      </ScrollView>

      {/* Create New Offer Button */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateOffer(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        <Text style={styles.createButtonText}>Create New Offer</Text>
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
  sortSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  sortLabel: {
    fontSize: 16,
    color: '#363740',
    fontWeight: '500',
  },
  sortValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortValueText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 8,
    position: 'relative',
  },
  tabActive: {
    // Active styling handled by underline
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#17aba5',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#17aba5',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#363740',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDesc: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 20,
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
