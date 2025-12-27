/**
 * WhatsApp Marketing Screen
 * Simple share store functionality
 */

import React, { useEffect } from 'react';
import {
  Share,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../../authentication/storage';

const WhatsAppMarketingScreen: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const shareStore = async () => {
      try {
        // Get store link and name from storage
        const storeLink = await storage.getItem('storeLink') || '';
        const storeName = await storage.getItem('storeName') || 'My Store';

        if (!storeLink) {
          Alert.alert(
            'Store Not Set Up',
            'Please set up your store first before sharing.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return;
        }

        const message = `🛍️ Check out ${storeName}!\n\nVisit my store: ${storeLink}\n\nShop now and get great deals! 🎉`;

        // Try to open WhatsApp directly first
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
        
        try {
          const canOpen = await Linking.canOpenURL(whatsappUrl);
          if (canOpen) {
            await Linking.openURL(whatsappUrl);
            // Navigate back after opening WhatsApp
            setTimeout(() => navigation.goBack(), 500);
            return;
          }
        } catch (error) {
          // WhatsApp not available, use native share
        }

        // Fallback to native share (works with all apps including WhatsApp)
        const result = await Share.share({
          message: message,
          title: `Share ${storeName}`,
        });

        // Navigate back after sharing
        if (result.action === Share.sharedAction || result.action === Share.dismissedAction) {
          setTimeout(() => navigation.goBack(), 300);
        }
      } catch (error) {
        console.error('Error sharing store:', error);
        Alert.alert('Error', 'Failed to share store. Please try again.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    };

    // Share immediately when screen opens
    shareStore();
  }, [navigation]);

  // Return null since we're just showing share dialog
  return null;
};

export default WhatsAppMarketingScreen;
