import React, { useState } from 'react';
import { Alert, Linking, View, Modal, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../authentication/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Hook to handle Help and Logout actions for header buttons
 * Returns handlers and a Help modal component
 */
export const useHeaderActions = (onLogoutComplete?: () => void) => {
  const { logout } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHelp = () => {
    setShowHelpModal(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              if (onLogoutComplete) {
                onLogoutComplete();
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleContactUs = () => {
    Alert.alert(
      'Contact Us',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:+911234567890'),
        },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@smartbiz.ltd'),
        },
        {
          text: 'Website',
          onPress: () => Linking.openURL('https://smartbiz.ltd/help'),
        },
      ]
    );
  };

  const HelpModal = () => (
    <Modal
      visible={showHelpModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.helpSection}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <Text style={styles.helpText}>
                • How do I set up my store?{'\n'}
                • How do I add products?{'\n'}
                • How do I manage orders?{'\n'}
                • How do I customize my store?{'\n'}
                • How do I share my store link?
              </Text>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.sectionTitle}>Need More Help?</Text>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactUs}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#e61580" />
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.sectionTitle}>Quick Links</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL('https://smartbiz.ltd/help')}
              >
                <Text style={styles.linkText}>Visit Help Center</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#e61580" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return {
    handleHelp,
    handleLogout,
    HelpModal,
  };
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  helpSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e61580',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e61580',
    marginLeft: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#e61580',
    fontWeight: '500',
  },
});

