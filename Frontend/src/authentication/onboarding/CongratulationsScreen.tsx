import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CongratulationsScreenProps {
  onContinue: () => void;
}

const CongratulationsScreen: React.FC<CongratulationsScreenProps> = ({ onContinue }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onContinue}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>

              <Text style={styles.title}>Congratulations</Text>

              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="check" size={48} color="#ffffff" />
                </View>
              </View>

              <Text style={styles.message}>Your online store is successfully created</Text>

              <TouchableOpacity style={styles.continueButton} onPress={onContinue} activeOpacity={0.8}>
                <Text style={styles.continueButtonText}>Go to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  content: {
    flex: 1,
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
    borderRadius: 16,
    padding: Math.max(32, SCREEN_WIDTH * 0.08),
    width: Math.min('100%', SCREEN_WIDTH - 40),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22b0a7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    fontSize: 18,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  continueButton: {
    backgroundColor: '#22b0a7',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#22b0a7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default CongratulationsScreen;

