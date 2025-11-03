import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SelectCustomerScreenProps {
  campaignData: any;
  onBack: () => void;
  onComplete: () => void;
}

export default function SelectCustomerScreen({
  campaignData,
  onBack,
  onComplete,
}: SelectCustomerScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'existing' | 'potential'>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  // Mock customers (in real app, this would come from the customer list)
  const mockCustomers = [
    { id: '1', name: 'John Doe', phone: '+91 72494 18130', type: 'existing' },
    { id: '2', name: 'Jane Smith', phone: '+91 83299 39954', type: 'existing' },
    { id: '3', name: 'Mike Johnson', phone: '+91 99677 36663', type: 'potential' },
    { id: '4', name: 'Sarah Williams', phone: '+91 97665 51194', type: 'potential' },
  ];

  const filteredCustomers =
    selectedTab === 'all'
      ? mockCustomers
      : mockCustomers.filter((c) => c.type === selectedTab);

  const handleToggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  const handleSendMessage = () => {
    if (selectedCustomers.size === 0) {
      Alert.alert('Error', 'Please select at least one customer');
      return;
    }
    Alert.alert(
      'Success',
      `Campaign "${campaignData.campaignName}" sent to ${selectedCustomers.size} customer(s) successfully!`,
      [{ text: 'OK', onPress: onComplete }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>All</Text>
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
        {filteredCustomers.length === 0 ? (
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
        ) : (
          <View style={styles.customersList}>
            {filteredCustomers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={styles.customerItem}
                onPress={() => handleToggleCustomer(customer.id)}
              >
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerPhone}>{customer.phone}</Text>
                </View>
                <View style={styles.checkbox}>
                  {selectedCustomers.has(customer.id) && (
                    <MaterialCommunityIcons name="check" size={20} color="#17aba5" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Send Message Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>
            Send message ({selectedCustomers.size})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  customersList: {
    marginTop: 8,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#17aba5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  sendButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

