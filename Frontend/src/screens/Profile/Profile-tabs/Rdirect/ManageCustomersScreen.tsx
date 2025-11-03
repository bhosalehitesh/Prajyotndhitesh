import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImportContactsScreen from './ImportContactsScreen';
import NewCustomerScreen from './NewCustomerScreen';

interface ManageCustomersScreenProps {
  onBack: () => void;
}

export default function ManageCustomersScreen({ onBack }: ManageCustomersScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'existing' | 'potential'>('all');
  const [showImportContacts, setShowImportContacts] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  if (showImportContacts) {
    return <ImportContactsScreen onBack={() => setShowImportContacts(false)} />;
  }

  if (showNewCustomer) {
    return <NewCustomerScreen onBack={() => setShowNewCustomer(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Customers</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            All
          </Text>
          {selectedTab === 'all' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'existing' && styles.tabActive]}
          onPress={() => setSelectedTab('existing')}
        >
          <Text style={[styles.tabText, selectedTab === 'existing' && styles.tabTextActive]}>
            Existing
          </Text>
          {selectedTab === 'existing' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'potential' && styles.tabActive]}
          onPress={() => setSelectedTab('potential')}
        >
          <Text style={[styles.tabText, selectedTab === 'potential' && styles.tabTextActive]}>
            Potential
          </Text>
          {selectedTab === 'potential' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Empty State */}
        <View style={styles.emptyState}>
          <View style={styles.illustration}>
            <View style={styles.phoneCircle}>
              <MaterialCommunityIcons name="phone" size={40} color="#17aba5" />
              <View style={styles.bubble}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#10B981" />
              </View>
            </View>
          </View>
          <Text style={styles.emptyStateTitle}>You do not have any customers yet</Text>
          <Text style={styles.emptyStateDesc}>
            You can import contacts from your phone book or add new contacts. To import, please
            allow the app to access contacts.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.importButton}
          onPress={() => setShowImportContacts(true)}
        >
          <Text style={styles.importButtonText}>Import Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newCustomerButton}
          onPress={() => setShowNewCustomer(true)}
        >
          <Text style={styles.newCustomerButtonText}>New Customer</Text>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    // Active styling
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#17aba5',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#17aba5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    marginBottom: 24,
    position: 'relative',
  },
  phoneCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bubble: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
    gap: 12,
  },
  importButton: {
    flex: 1,
    backgroundColor: '#f5f5fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
  },
  newCustomerButton: {
    flex: 1,
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newCustomerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

