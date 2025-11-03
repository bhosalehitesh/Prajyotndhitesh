import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const socialPlatforms: SocialPlatform[] = [
  { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: 'twitter', color: '#000000' },
  { id: 'youtube', name: 'Youtube', icon: 'youtube', color: '#FF0000' },
];

export default function SocialMediaLinksScreen({ onBack }: { onBack: () => void }) {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [linkInput, setLinkInput] = useState('');

  const handleOpenLinkModal = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setLinkInput(socialLinks[platform.id] || '');
    setShowLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!selectedPlatform) return;

    // Basic URL validation
    if (linkInput.trim() && !linkInput.trim().match(/^https?:\/\//)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setSocialLinks((prev) => ({
      ...prev,
      [selectedPlatform.id]: linkInput.trim(),
    }));
    setShowLinkModal(false);
    setLinkInput('');
    setSelectedPlatform(null);
    Alert.alert('Success', `${selectedPlatform.name} link saved successfully!`);
  };

  const handleRemoveLink = (platformId: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platformId]: '',
    }));
    Alert.alert('Success', 'Link removed successfully!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Media Links</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>Link your social accounts</Text>

        {socialPlatforms.map((platform) => {
          const hasLink = !!socialLinks[platform.id];
          return (
            <View key={platform.id} style={styles.platformCard}>
              <View style={styles.platformInfo}>
                <View
                  style={[
                    styles.platformIconContainer,
                    { backgroundColor: platform.color + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={platform.icon as any}
                    size={24}
                    color={platform.color}
                  />
                </View>
                <Text style={styles.platformName}>{platform.name}</Text>
                {hasLink && (
                  <View style={styles.linkIndicator}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#17aba5" />
                    <Text style={styles.linkIndicatorText}>Linked</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => handleOpenLinkModal(platform)}
              >
                <MaterialCommunityIcons
                  name={hasLink ? 'pencil' : 'link'}
                  size={20}
                  color={hasLink ? '#17aba5' : '#666'}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Link Input Modal */}
      <Modal
        visible={showLinkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLinkModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add {selectedPlatform?.name} Link
              </Text>
              <TouchableOpacity onPress={() => setShowLinkModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                {selectedPlatform?.name} URL
              </Text>
              <TextInput
                style={styles.linkInput}
                placeholder={`https://${selectedPlatform?.name.toLowerCase()}.com/yourprofile`}
                value={linkInput}
                onChangeText={setLinkInput}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHint}>
                Enter your {selectedPlatform?.name.toLowerCase()} profile URL
              </Text>

              <View style={styles.modalButtons}>
                {socialLinks[selectedPlatform?.id || ''] && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      if (selectedPlatform) {
                        handleRemoveLink(selectedPlatform.id);
                        setShowLinkModal(false);
                      }
                    }}
                  >
                    <Text style={styles.removeButtonText}>Remove Link</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.saveLinkButton, !linkInput.trim() && styles.saveLinkButtonDisabled]}
                  onPress={handleSaveLink}
                  disabled={!linkInput.trim()}
                >
                  <Text
                    style={[
                      styles.saveLinkButtonText,
                      !linkInput.trim() && styles.saveLinkButtonTextDisabled,
                    ]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  linkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  linkIndicatorText: {
    fontSize: 12,
    color: '#17aba5',
    marginLeft: 4,
    fontWeight: '500',
  },
  linkButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  linkInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d73a33',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d73a33',
  },
  saveLinkButton: {
    flex: 1,
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveLinkButtonDisabled: {
    backgroundColor: '#e2e4ec',
  },
  saveLinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveLinkButtonTextDisabled: {
    color: '#999',
  },
});

