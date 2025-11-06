import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const suggestedQuestions = [
  "How can I set-up my Sakhi account?",
  "How can I list my products?",
  "Issues/Queries related to Shipping?",
  "How can I promote my brand?",
  "How can I enhance my website?",
  "Issues/Queries related to payments?",
  "Getting Started with Performance Marketing",
];

export default function ChatScreen({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Sakhi</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.chatContainer}>
        {/* Online Status */}
        <View style={styles.onlineBubble}>
          <Text style={styles.onlineText}>You're back online</Text>
        </View>

        {/* Bot Message */}
        <View style={styles.botMessageContainer}>
          <View style={styles.botAvatar}>
            <View style={styles.botEyes}>
              <View style={styles.eyeDot} />
              <View style={styles.eyeDot} />
            </View>
          </View>
          <View style={styles.botBubble}>
            <Text style={styles.botMessageText}>
              Hi! This is Sakhi bot. How can I help you today?
            </Text>
            <Text style={styles.messageTime}>14:31</Text>
          </View>
        </View>

        {/* Suggested Questions */}
        <View style={styles.suggestedContainer}>
          {suggestedQuestions.map((question, index) => (
            <TouchableOpacity key={index} style={styles.suggestedButton}>
              <Text style={styles.suggestedButtonText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <MaterialCommunityIcons name="paperclip" size={20} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </View>
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
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    flex: 1,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  onlineBubble: {
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  onlineText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  botEyes: {
    flexDirection: 'row',
    gap: 8,
  },
  eyeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1a1a1a',
  },
  botBubble: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    maxWidth: '80%',
  },
  botMessageText: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  suggestedContainer: {
    marginTop: 8,
  },
  suggestedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  suggestedButtonText: {
    fontSize: 15,
    color: '#22c55e',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#4a5568',
  },
  attachButton: {
    marginRight: 12,
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#4a5568',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    maxHeight: 100,
  },
});

