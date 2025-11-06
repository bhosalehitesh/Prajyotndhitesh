import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SocialMediaScreen({ onBack }: { onBack: () => void }) {
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  });

  const handleSave = () => {
    // Handle save logic
    console.log('Social links saved:', socialLinks);
    onBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Link Social Media</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.desc}>
          Connect your social media accounts to increase trust and engagement with customers.
        </Text>

        {Object.entries(socialLinks).map(([platform, value]) => (
          <View key={platform} style={styles.inputContainer}>
            <MaterialCommunityIcons
              name={platform === 'facebook' ? 'facebook' : platform === 'instagram' ? 'instagram' : platform === 'twitter' ? 'twitter' : platform === 'linkedin' ? 'linkedin' : 'youtube'}
              size={24}
              color="#6B7280"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder={`Enter ${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
              value={value}
              onChangeText={(text) => setSocialLinks({ ...socialLinks, [platform]: text })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Links</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  content: {
    padding: 20,
  },
  desc: {
    color: '#6B7280',
    fontSize: 17,
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

