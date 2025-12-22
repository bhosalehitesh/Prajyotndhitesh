/**
 * WhatsApp Marketing Screen
 * Allows sellers to share their store link via WhatsApp or other sharing methods
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import { useNavigation } from '@react-navigation/native';
import { useHomeData } from '../Home/useHomeData';
import { storage } from '../../authentication/storage';

const WhatsAppMarketingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data, loading: homeDataLoading } = useHomeData();
  const [storeLink, setStoreLink] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('My Store');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStoreInfo = async () => {
      try {
        setIsLoading(true);
        // Get store link from home data or storage
        const link = data?.profile?.storeLink || await storage.getItem('storeLink') || '';
        const name = data?.profile?.storeName || data?.profile?.name || await storage.getItem('storeName') || 'My Store';
        
        setStoreLink(link);
        setStoreName(name);
      } catch (error) {
        console.error('Error loading store info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!homeDataLoading) {
      loadStoreInfo();
    }
  }, [data, homeDataLoading]);

  const handleShareViaWhatsApp = async () => {
    if (!storeLink) {
      Alert.alert('Error', 'Store link not available. Please set up your store first.');
      return;
    }

    const message = `🛍️ Check out ${storeName}!\n\nVisit my store: ${storeLink}\n\nShop now and get great deals! 🎉`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      // Check if WhatsApp is installed
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to native share if WhatsApp is not installed
        await Share.share({
          message: message,
          title: `Share ${storeName}`,
        });
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      // Fallback to native share
      try {
        await Share.share({
          message: message,
          title: `Share ${storeName}`,
        });
      } catch (shareError) {
        Alert.alert('Error', 'Failed to share store link. Please try again.');
      }
    }
  };

  const handleShareViaNative = async () => {
    if (!storeLink) {
      Alert.alert('Error', 'Store link not available. Please set up your store first.');
      return;
    }

    const message = `🛍️ Check out ${storeName}!\n\nVisit my store: ${storeLink}\n\nShop now and get great deals! 🎉`;

    try {
      await Share.share({
        message: message,
        title: `Share ${storeName}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share store link. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    if (!storeLink) {
      Alert.alert('Error', 'Store link not available. Please set up your store first.');
      return;
    }

    try {
      // Try React Native Clipboard (for older versions)
      let Clipboard;
      try {
        Clipboard = require('react-native').Clipboard;
      } catch {
        // Try @react-native-clipboard/clipboard (for newer versions)
        try {
          Clipboard = require('@react-native-clipboard/clipboard').default;
        } catch {
          throw new Error('Clipboard not available');
        }
      }
      
      if (Clipboard && Clipboard.setString) {
        Clipboard.setString(storeLink);
        Alert.alert('Success', 'Store link copied to clipboard!');
      } else {
        throw new Error('Clipboard method not available');
      }
    } catch (error) {
      // Fallback: show the link in an alert with share option
      Alert.alert('Store Link', storeLink, [
        { text: 'OK' },
        {
          text: 'Share',
          onPress: () => {
            Share.share({
              message: `Check out my store: ${storeLink}`,
              title: 'My Store',
            });
          },
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WhatsApp Marketing</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WhatsApp Marketing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol name="logo-whatsapp" size={64} color="#25D366" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Share Your Store</Text>
        <Text style={styles.subtitle}>
          Share your store link with customers via WhatsApp or other messaging apps to grow your business.
        </Text>

        {/* Store Link Display */}
        {storeLink ? (
          <View style={styles.storeLinkCard}>
            <View style={styles.storeLinkHeader}>
              <IconSymbol name="link" size={20} color="#e61580" />
              <Text style={styles.storeLinkLabel}>Your Store Link</Text>
            </View>
            <Text style={styles.storeLinkText} numberOfLines={2}>
              {storeLink}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLink}
              activeOpacity={0.7}>
              <IconSymbol name="copy" size={18} color="#e61580" />
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorCard}>
            <IconSymbol name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorText}>
              Store link not available. Please set up your store first.
            </Text>
          </View>
        )}

        {/* Share Options */}
        <View style={styles.shareOptionsContainer}>
          <Text style={styles.sectionTitle}>Share Options</Text>

          {/* WhatsApp Share Button */}
          <TouchableOpacity
            style={[styles.shareButton, styles.whatsappButton]}
            onPress={handleShareViaWhatsApp}
            activeOpacity={0.8}
            disabled={!storeLink}>
            <View style={styles.shareButtonContent}>
              <View style={styles.shareButtonIcon}>
                <IconSymbol name="logo-whatsapp" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.shareButtonTextContainer}>
                <Text style={[styles.shareButtonTitle, { color: '#FFFFFF' }]}>Share via WhatsApp</Text>
                <Text style={[styles.shareButtonSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                  Share directly to WhatsApp contacts
                </Text>
              </View>
              <IconSymbol name="chevron-forward" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Native Share Button */}
          <TouchableOpacity
            style={[styles.shareButton, styles.nativeShareButton]}
            onPress={handleShareViaNative}
            activeOpacity={0.8}
            disabled={!storeLink}>
            <View style={styles.shareButtonContent}>
              <View style={[styles.shareButtonIcon, { backgroundColor: '#e61580' }]}>
                <IconSymbol name="share-social" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.shareButtonTextContainer}>
                <Text style={[styles.shareButtonTitle, { color: '#1F2937' }]}>Share via Other Apps</Text>
                <Text style={[styles.shareButtonSubtitle, { color: '#6B7280' }]}>
                  Share via any messaging or social app
                </Text>
              </View>
              <IconSymbol name="chevron-forward" size={24} color="#64748B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <IconSymbol name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Marketing Tips</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Share your store link in WhatsApp groups related to your products
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Send personalized messages to your customers with special offers
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Create WhatsApp groups for your loyal customers
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Share new product launches and discounts regularly
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e61580',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DCF8C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#B4E4B4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  storeLinkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storeLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLinkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  storeLinkText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF4FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e61580',
    marginLeft: 8,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 12,
    lineHeight: 20,
  },
  shareOptionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  nativeShareButton: {
    backgroundColor: '#FFFFFF',
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#128C7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  shareButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareButtonSubtitle: {
    fontSize: 14,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    color: '#F59E0B',
    marginRight: 12,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default WhatsAppMarketingScreen;
