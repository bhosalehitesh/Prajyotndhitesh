import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SAFE_SCREEN_WIDTH = SCREEN_WIDTH && !isNaN(SCREEN_WIDTH) && SCREEN_WIDTH > 0 ? SCREEN_WIDTH : 375; // Fallback to iPhone width

interface StorePoliciesScreenProps {
  onNext: () => void;
  onBack?: () => void;
}

const StorePoliciesScreen: React.FC<StorePoliciesScreenProps> = ({ onNext, onBack }) => {
  const [policiesAgreed, setPoliciesAgreed] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const handleNext = () => {
    if (!policiesAgreed) {
      return;
    }
    onNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="store" size={24} color="#ffffff" />
            <Text style={styles.logoText}>
              Sakhi <Text style={styles.logoTextAccent}>Store</Text>
            </Text>
          </View>
          <View style={styles.headerLinks}>
            <TouchableOpacity style={styles.headerLink}>
              <MaterialCommunityIcons name="help-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.headerLinkText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerLink}>
              <MaterialCommunityIcons name="logout" size={18} color="#ffffff" />
              <Text style={styles.headerLinkText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={20} color="#1a1a1a" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>Your Store Policies</Text>
          <Text style={styles.description}>
            Store policies are essential for compliance and customer trust. Standard policies have
            been added for you, which you can change later from your store settings.
          </Text>

          <TouchableOpacity
            style={styles.viewPoliciesButton}
            onPress={() => setShowPoliciesModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewPoliciesText}>
              View Default Policies :{' '}
              <Text style={styles.policyLink}>Returns</Text>,{' '}
              <Text style={styles.policyLink}>Cancellation</Text>,{' '}
              <Text style={styles.policyLink}>Store T&C</Text>,{' '}
              <Text style={styles.policyLink}>Privacy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setPoliciesAgreed(!policiesAgreed)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.checkbox, policiesAgreed && styles.checkboxChecked]}>
              {policiesAgreed && (
                <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I have read and defined my store policies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !policiesAgreed && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!policiesAgreed}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Policies Modal */}
        <Modal
          visible={showPoliciesModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPoliciesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Default Store Policies</Text>
                <TouchableOpacity onPress={() => setShowPoliciesModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.policySectionTitle}>Returns Policy</Text>
                <Text style={styles.policyText}>
                  Customers can return products within 7 days of delivery. Items must be unused and
                  in original packaging.
                </Text>

                <Text style={styles.policySectionTitle}>Cancellation Policy</Text>
                <Text style={styles.policyText}>
                  Orders can be cancelled before shipment. Once shipped, cancellation is not
                  possible.
                </Text>

                <Text style={styles.policySectionTitle}>Store Terms & Conditions</Text>
                <Text style={styles.policyText}>
                  By purchasing from our store, customers agree to our terms and conditions. We
                  reserve the right to modify these terms at any time.
                </Text>

                <Text style={styles.policySectionTitle}>Privacy Policy</Text>
                <Text style={styles.policyText}>
                  We respect your privacy. Customer data is collected only for order processing and
                  will not be shared with third parties without consent.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Chat Support */}
        <TouchableOpacity style={styles.chatButton}>
          <MaterialCommunityIcons name="message-text" size={24} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#e61580',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoTextAccent: {
    color: '#ffffff',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  headerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLinkText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: Math.max(16, SAFE_SCREEN_WIDTH * 0.04),
    marginTop: 16,
    padding: Math.max(20, SAFE_SCREEN_WIDTH * 0.05),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  viewPoliciesButton: {
    marginBottom: 24,
  },
  viewPoliciesText: {
    fontSize: 14,
    color: '#e61580',
    lineHeight: 20,
  },
  policyLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingVertical: 8,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e61580',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#e61580',
  },
  checkboxText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: '#e61580',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#e61580',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e61580',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: Math.min(SAFE_SCREEN_WIDTH - 40, SAFE_SCREEN_WIDTH * 0.9),
    maxWidth: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalBody: {
    padding: 20,
  },
  policySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
});

export default StorePoliciesScreen;

