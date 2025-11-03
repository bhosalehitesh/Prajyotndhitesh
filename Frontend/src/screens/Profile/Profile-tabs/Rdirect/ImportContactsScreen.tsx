import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ImportContactsScreenProps {
  onBack: () => void;
}

interface Contact {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
}

export default function ImportContactsScreen({ onBack }: ImportContactsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Mock contacts data (in real app, this would come from device contacts)
  const [contacts] = useState<Contact[]>([
    { id: '1', phoneNumber: '917249418130', formattedNumber: '+91 72494 18130' },
    { id: '2', phoneNumber: '918329939954', formattedNumber: '+91 83299 39954' },
    { id: '3', phoneNumber: '919967736663', formattedNumber: '+91 99677 36663' },
    { id: '4', phoneNumber: '919766551194', formattedNumber: '+91 97665 51194' },
    { id: '5', phoneNumber: '917249418130', formattedNumber: '+91 72494 18130' },
    { id: '6', phoneNumber: '918329939954', formattedNumber: '+91 83299 39954' },
    { id: '7', phoneNumber: '919967736663', formattedNumber: '+91 99677 36663' },
    { id: '8', phoneNumber: '919766551194', formattedNumber: '+91 97665 51194' },
    { id: '9', phoneNumber: '917058039219', formattedNumber: '+917058039219' },
    { id: '10', phoneNumber: '917058039219', formattedNumber: '+917058039219' },
  ]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.phoneNumber.includes(searchQuery) ||
      contact.formattedNumber.includes(searchQuery)
  );

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const handleAddCustomers = () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }
    Alert.alert('Success', `${selectedContacts.size} customer(s) added successfully!`, [
      { text: 'OK', onPress: onBack },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Import Contacts</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or mobile number"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Header with Select All */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>All Contacts</Text>
        <TouchableOpacity onPress={handleSelectAll}>
          <Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contactsList}>
        {filteredContacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            onPress={() => handleToggleContact(contact.id)}
          >
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleToggleContact(contact.id)}
            >
              <MaterialCommunityIcons
                name={selectedContacts.has(contact.id) ? 'check' : 'plus'}
                size={20}
                color={selectedContacts.has(contact.id) ? '#10B981' : '#888'}
              />
            </TouchableOpacity>
            <View style={styles.contactInfo}>
              <Text style={styles.phoneNumber}>{contact.formattedNumber}</Text>
              <Text style={styles.phoneNumberAlt}>{contact.phoneNumber}</Text>
            </View>
            <View style={styles.checkbox}>
              {selectedContacts.has(contact.id) && (
                <MaterialCommunityIcons name="check" size={20} color="#17aba5" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Customers Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButtonMain} onPress={handleAddCustomers}>
          <Text style={styles.addButtonText}>
            Add Customers ({selectedContacts.size})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5fa',
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
    fontSize: 22,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#222',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#363740',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#363740',
  },
  selectAllText: {
    fontSize: 16,
    color: '#17aba5',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contactsList: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 15,
    color: '#363740',
    fontWeight: '500',
    marginBottom: 2,
  },
  phoneNumberAlt: {
    fontSize: 14,
    color: '#888',
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
  addButtonMain: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

