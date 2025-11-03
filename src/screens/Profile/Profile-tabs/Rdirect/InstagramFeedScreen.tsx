import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface InstagramFeedScreenProps {
  onBack: () => void;
}

export default function InstagramFeedScreen({ onBack }: InstagramFeedScreenProps) {
  const [connected, setConnected] = useState(false);

  // Sample Instagram feed images
  const feedImages = [
    { id: 1, uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    { id: 2, uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400' },
    { id: 3, uri: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400' },
    { id: 4, uri: 'https://images.unsplash.com/photo-1556912173-0e022a3e628e?w=400' },
    { id: 5, uri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400' },
    { id: 6, uri: 'https://images.unsplash.com/photo-1574201635302-3883b0ffedd5?w=400' },
    { id: 7, uri: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
    { id: 8, uri: 'https://images.unsplash.com/photo-1567177789623-0d5cd4e3c0e8?w=400' },
    { id: 9, uri: 'https://images.unsplash.com/photo-1567177667439-ba2d14e07e71?w=400' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Instagram Feed</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Instagram Feed Grid */}
        <View style={styles.feedGrid}>
          {feedImages.map((image) => (
            <View key={image.id} style={styles.gridItem}>
              <Image source={{ uri: image.uri }} style={styles.gridImage} resizeMode="cover" />
            </View>
          ))}
        </View>

        {/* Promotional Section */}
        <View style={styles.promoSection}>
          <Text style={styles.promoTitle}>Add your Instagram feed to your website!</Text>
          <Text style={styles.promoDesc}>
            Engage users, build trust and confidence by displaying content from your instagram feed
            on your website.
          </Text>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={async () => {
              try {
                // Instagram OAuth/login URL
                const instagramLoginUrl = 'https://www.instagram.com/accounts/login/';
                
                // Try to open Instagram app first, fallback to web
                if (Platform.OS === 'ios') {
                  const instagramAppUrl = 'instagram://user?username=';
                  const canOpenApp = await Linking.canOpenURL(instagramAppUrl);
                  if (canOpenApp) {
                    // Try to open Instagram app, fallback to login page
                    try {
                      await Linking.openURL('instagram://app');
                    } catch {
                      await Linking.openURL(instagramLoginUrl);
                    }
                  } else {
                    await Linking.openURL(instagramLoginUrl);
                  }
                } else {
                  // Android: Try instagram:// scheme first
                  const instagramAppUrl = 'instagram://user?username=';
                  const canOpenApp = await Linking.canOpenURL(instagramAppUrl);
                  if (canOpenApp) {
                    try {
                      await Linking.openURL('instagram://app');
                    } catch {
                      await Linking.openURL(instagramLoginUrl);
                    }
                  } else {
                    await Linking.openURL(instagramLoginUrl);
                  }
                }
                
                // Mark as connected after successful redirect attempt
                setConnected(true);
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Unable to open Instagram. Please visit https://www.instagram.com/accounts/login/ manually.'
                );
              }
            }}
          >
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            <Text style={styles.connectButtonText}>Connect with Instagram</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: '#1a237e',
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
  feedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#fff',
  },
  gridItem: {
    width: '33.33%',
    padding: 4,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  promoSection: {
    backgroundColor: '#1a237e',
    padding: 24,
    marginTop: 16,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  promoDesc: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  connectButton: {
    backgroundColor: '#17aba5',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
