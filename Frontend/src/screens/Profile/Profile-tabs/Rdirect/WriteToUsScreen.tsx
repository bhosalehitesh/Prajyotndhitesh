import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Contact {
  name: string;
  phone: string;
}

export default function WriteToUsScreen({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState('');
  const [issue, setIssue] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact>({
    name: 'Aditi Nikam',
    phone: '+91 8766408154',
  });
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const categories = [
    'Account Issues',
    'Product Listing',
    'Shipping',
    'Payments',
    'Technical Support',
    'Other',
  ];

  const issues = [
    'Unable to login',
    'Product not listing',
    'Order not received',
    'Payment failed',
    'Website error',
    'Other issue',
  ];

  const languages = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu'];

  const handleRequestCallback = () => {
    // Handle request callback logic here
    console.log('Request callback:', {
      category,
      issue,
      contact: selectedContact,
      preferredLanguage,
    });
    // You can add navigation or API call here
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write to us instead</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Working Hours Banner */}
        <View style={styles.hoursBanner}>
          <MaterialCommunityIcons name="bell" size={20} color="#333" />
          <Text style={styles.hoursBannerText}>
            Working hours are from 10:00am - 07:00pm, we are out of office right now.
          </Text>
        </View>

        {/* Help Us Get in Touch Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help us get in touch with you</Text>
          <Text style={styles.sectionDescription}>
            Our team will reach out to you as soon as possible
          </Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdownField}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
              {category || 'Category *'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Specify Issue */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Specify Issue</Text>
          <TouchableOpacity
            style={styles.dropdownField}
            onPress={() => setShowIssueModal(true)}
          >
            <Text style={[styles.dropdownText, !issue && styles.placeholderText]}>
              {issue || 'Issue *'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Select Contact */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Select Contact</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <View style={styles.contactAvatarDot} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{selectedContact.name}</Text>
              <Text style={styles.contactPhone}>{selectedContact.phone}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.useAnotherContact}
            onPress={() => setShowContactModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#e61580" />
            <Text style={styles.useAnotherContactText}>Use another contact</Text>
          </TouchableOpacity>
        </View>

        {/* Preferred Language */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Preferred Language</Text>
          <TouchableOpacity
            style={styles.dropdownField}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.languageFieldContent}>
              <Text style={styles.dropdownLabel}>Language</Text>
              <Text style={styles.dropdownValue}>{preferredLanguage}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Request Call Back Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.requestButton} onPress={handleRequestCallback}>
          <MaterialCommunityIcons name="phone" size={20} color="#1a1a1a" />
          <Text style={styles.requestButtonText}>Request Call Back</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Issue Modal */}
      <Modal
        visible={showIssueModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIssueModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Issue</Text>
              <TouchableOpacity onPress={() => setShowIssueModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {issues.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    setIssue(item);
                    setShowIssueModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {languages.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    setPreferredLanguage(item);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contact</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <View style={styles.contactInputContainer}>
              <TextInput
                style={styles.contactInput}
                placeholder="Name"
                value={selectedContact.name}
                onChangeText={(text) =>
                  setSelectedContact({ ...selectedContact, name: text })
                }
              />
              <TextInput
                style={styles.contactInput}
                placeholder="Phone Number"
                value={selectedContact.phone}
                onChangeText={(text) =>
                  setSelectedContact({ ...selectedContact, phone: text })
                }
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.saveContactButton}
                onPress={() => setShowContactModal(false)}
              >
                <Text style={styles.saveContactButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  hoursBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbf0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa500',
  },
  hoursBannerText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 10,
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 16,
    minHeight: 56,
  },
  languageFieldContent: {
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  useAnotherContact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  useAnotherContactText: {
    fontSize: 16,
    color: '#17aba5',
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#87CEEB',
    borderRadius: 8,
    padding: 16,
  },
  requestButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
  contactInputContainer: {
    padding: 20,
  },
  contactInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
  },
  saveContactButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveContactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

