import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface MarketingAutomationScreenProps {
  onBack: () => void;
}

export default function MarketingAutomationScreen({ onBack }: MarketingAutomationScreenProps) {
  const [showSetupModal, setShowSetupModal] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Marketing Automation</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Background Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Engage with your customers</Text>
          <Text style={styles.contentDesc}>
            Engage with customers to retain them, recover abandoned carts and drive sales by
            sending automated WhatsApp messages based on their action on your website. Your first
            500 messages are free!
          </Text>

          {/* Steps Section */}
          <View style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>Get started in just 3 steps!</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <View style={styles.stepIconInner} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>Setup a WhatsApp Business Account</Text>
                </View>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <View style={styles.stepIconInner} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>Choose customer actions</Text>
                </View>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <View style={styles.stepIconInner} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>Customize your campaign</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Setup Button */}
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => setShowSetupModal(true)}
          >
            <Text style={styles.setupButtonText}>Setup WhatsApp Business Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Setup Modal */}
      <Modal
        visible={showSetupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSetupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Setup WhatsApp Business Account</Text>
              <TouchableOpacity onPress={() => setShowSetupModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              To setup a WhatsApp Business Account, you need a phone number that does not have an
              existing WhatsApp Account.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                setShowSetupModal(false);
                try {
                  // WhatsApp Business API login URL
                  const whatsappBusinessUrl = 'https://business.facebook.com/wa/manage/home';
                  
                  // Check if WhatsApp Business app is installed, otherwise open web
                  const canOpen = await Linking.canOpenURL(whatsappBusinessUrl);
                  if (canOpen) {
                    await Linking.openURL(whatsappBusinessUrl);
                  } else {
                    // Fallback to web browser
                    await Linking.openURL('https://business.facebook.com/wa/manage/home');
                  }
                } catch (error) {
                  Alert.alert(
                    'Error',
                    'Unable to open WhatsApp Business. Please visit https://business.facebook.com/wa/manage/home manually.'
                  );
                }
              }}
            >
              <Text style={styles.modalButtonText}>Got it, Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  contentSection: {
    backgroundColor: '#0d9488',
    padding: 24,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  contentDesc: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.95,
  },
  stepsSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 20,
  },
  stepsList: {
    marginLeft: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#17aba5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  stepIconInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#17aba5',
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: '#17aba5',
    marginLeft: 12,
    marginBottom: 8,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepText: {
    fontSize: 16,
    color: '#363740',
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
