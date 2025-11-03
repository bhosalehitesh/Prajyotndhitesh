import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Linking, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HelpCenterScreen from './Rdirect/HelpCenterScreen';
import HowToScreen from './Rdirect/HowToScreen';
import TalkToUsScreen from './Rdirect/TalkToUsScreen';
import ChatScreen from './Rdirect/ChatScreen';
import WriteToUsScreen from './Rdirect/WriteToUsScreen';

const helpMenuItems = [
  {
    label: 'FAQs',
    icon: 'help-circle-outline',
  },
  {
    label: 'How Tos',
    icon: 'clipboard-text-outline',
  },
  {
    label: 'Contact Us',
    icon: 'phone-outline',
  },
];

export default function NeedHelpScreen({ onBack }: { onBack: () => void }) {
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTalkToUs, setShowTalkToUs] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWriteToUs, setShowWriteToUs] = useState(false);

  const handleChatWithUs = () => {
    setShowContactModal(false);
    setShowChat(true);
  };

  const handleTalkToUs = () => {
    setShowContactModal(false);
    setShowTalkToUs(true);
  };

  const handleWriteToUs = () => {
    setShowContactModal(false);
    setShowWriteToUs(true);
  };

  if (showHelpCenter) {
    return <HelpCenterScreen onBack={() => setShowHelpCenter(false)} />;
  }

  if (showHowTo) {
    return <HowToScreen onBack={() => setShowHowTo(false)} />;
  }

  if (showTalkToUs) {
    return <TalkToUsScreen onBack={() => setShowTalkToUs(false)} />;
  }

  if (showChat) {
    return <ChatScreen onBack={() => setShowChat(false)} />;
  }

  if (showWriteToUs) {
    return <WriteToUsScreen onBack={() => setShowWriteToUs(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#edeff3' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Need Help?</Text>
      </View>
      <ScrollView>
        <Text style={styles.desc}>
          Adjust store settings for smooth operations and an enhanced customer experience.
        </Text>

        {/* Menu Items */}
        {helpMenuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.row,
              index === helpMenuItems.length - 1 && styles.lastRow,
            ]}
            onPress={() => {
              if (item.label === 'FAQs') {
                setShowHelpCenter(true);
              } else if (item.label === 'How Tos') {
                setShowHowTo(true);
              } else if (item.label === 'Contact Us') {
                setShowContactModal(true);
              }
            }}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={26}
              color="#888"
            />
            <Text style={styles.label}>{item.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#17aba5"
              style={styles.arrow}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contact Us Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Us</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#222" />
              </TouchableOpacity>
            </View>

            {/* Contact Options */}
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.chatButton} onPress={handleChatWithUs}>
                <Text style={styles.chatButtonText}>Chat With Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.callButton} onPress={handleTalkToUs}>
                <Text style={styles.callButtonText}>Talk To Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.writeButton} onPress={handleWriteToUs}>
                <Text style={styles.writeButtonText}>Write to us instead</Text>
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
    padding: 18,
    backgroundColor: '#f5f5fa',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
  },
  desc: {
    color: '#858997',
    fontSize: 17,
    margin: 24,
    marginBottom: 18,
    marginTop: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#e2e4ec',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 0,
  },
  lastRow: {
    borderBottomWidth: 0,
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    color: '#363740',
    marginLeft: 12,
    flex: 1,
  },
  arrow: {
    marginLeft: 'auto',
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
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  contactOptions: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  chatButton: {
    backgroundColor: '#17aba5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  callButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#17aba5',
    marginTop: 16,
  },
  callButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#17aba5',
  },
  writeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#17aba5',
    marginTop: 16,
  },
  writeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#17aba5',
  },
});

