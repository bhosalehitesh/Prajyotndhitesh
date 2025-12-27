import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface SelectMessageScreenProps {
  campaignData: any;
  onNext: (data: any) => void;
  onEdit?: (message: any) => void;
}

interface MessageTemplate {
  id: string;
  type: string;
  title: string;
  content: string;
  emoji: string;
  editable: boolean;
}

export default function SelectMessageScreen({ campaignData = {}, onNext, onEdit }: SelectMessageScreenProps) {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const messageTemplates: MessageTemplate[] = [
    {
      id: '1',
      type: 'discount',
      title: 'Discount Message',
      content:
        'Boond Boond se sagar banta hai; usi tarah phool phool se garden banta hai! Amp up your garden game with *{{brand_name}}* and enjoy special discounts upto *{{discount_percentage}}*% off on select products. Shop now and transform your garden into a paradise! 🌸🌿',
      emoji: '💰',
      editable: true,
    },
    {
      id: '2',
      type: 'welcome',
      title: 'Welcome Message',
      content:
        'Hi *{{customer_name}}*, We see that you have great taste. Now let\'s help you curate a beautiful garden.',
      emoji: '👋',
      editable: true,
    },
    {
      id: '3',
      type: 'topical',
      title: 'Topical Messages',
      content:
        'Embrace the festive spirit this *{{Event_name}}* with our special *{{category_name}}* offers. Use coupon code *{{coupon_code}}* to enjoy an extra *{{discount_percentage}}*% off. Limited time offer! Don\'t miss out! ✨',
      emoji: '✨',
      editable: true,
    },
    {
      id: '4',
      type: 'seasonal',
      title: 'Seasonal Offer',
      content:
        '🌿 Spring is here! Refresh your home with our new collection. Get up to *{{discount_percentage}}*% off on all *{{category_name}}* products. Use code *{{coupon_code}}* for additional savings. Happy shopping! 🌸',
      emoji: '🌿',
      editable: true,
    },
    {
      id: '5',
      type: 'flash_sale',
      title: 'Flash Sale Alert',
      content:
        '⚡ FLASH SALE ALERT! ⚡ Limited time offer - Get amazing deals on *{{category_name}}*. Discounts starting from *{{discount_percentage}}*%! Hurry, sale ends soon! Visit our store now! 🛍️',
      emoji: '⚡',
      editable: true,
    },
    {
      id: '6',
      type: 'anniversary',
      title: 'Anniversary Special',
      content:
        '🎉 Celebrating our anniversary with YOU! As a token of gratitude, enjoy exclusive *{{discount_percentage}}*% off on all products. Thank you for being a valued customer. Shop now with code *{{coupon_code}}*! 🙏',
      emoji: '🎉',
      editable: true,
    },
    {
      id: '7',
      type: 'new_arrival',
      title: 'New Arrival',
      content:
        '🆕 Just in! Check out our latest *{{category_name}}* collection. Be the first to explore these stunning new arrivals. Use code *{{coupon_code}}* for *{{discount_percentage}}*% off on your first purchase!',
      emoji: '🆕',
      editable: true,
    },
    {
      id: '8',
      type: 'diwali',
      title: 'Diwali',
      content:
        '🏡 Get ready to welcome Goddess Lakshmi into your home with our Diwali-inspired decor deals. Upto *{{discount_percentage}}*% off on select products. Shop now! Girnai',
      emoji: '🏡',
      editable: true,
    },
    {
      id: '9',
      type: 'referral',
      title: 'Referral Program',
      content:
        '👥 Refer a friend and both of you get *{{discount_percentage}}*% off! Share your unique referral code *{{coupon_code}}* with friends and earn rewards. The more you refer, the more you save!',
      emoji: '👥',
      editable: true,
    },
    {
      id: '10',
      type: 'abandoned_cart',
      title: 'Abandoned Cart Reminder',
      content:
        '🛒 We noticed you left something behind! Complete your purchase now and get *{{discount_percentage}}*% off. Use code *{{coupon_code}}* at checkout. Don\'t miss out on these amazing items!',
      emoji: '🛒',
      editable: true,
    },
  ];

  const handleSelectMessage = (message: MessageTemplate) => {
    setSelectedMessage(message);
  };

  const handleNext = () => {
    if (!selectedMessage) {
      Alert.alert('Error', 'Please select a marketing message');
      return;
    }

    onNext({
      selectedMessageType: selectedMessage.type,
      selectedMessage: selectedMessage,
      messageContent: selectedMessage.content,
    });
  };

  const toggleExpand = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  const handleEdit = (message: MessageTemplate) => {
    if (onEdit) {
      onEdit(message);
    } else {
      // Fallback: proceed to next step with edit
      handleSelectMessage(message);
      handleNext();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select your marketing message</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="filter-variant" size={24} color="#e61580" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.messagesList}
        contentContainerStyle={styles.messagesListContent}
        showsVerticalScrollIndicator={true}
      >
        {messageTemplates.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[
              styles.messageCard,
              selectedMessage?.id === message.id && styles.messageCardSelected,
            ]}
            onPress={() => handleSelectMessage(message)}
            activeOpacity={0.7}
          >
            <View style={styles.messageHeader}>
              <View style={styles.messageTitleRow}>
                <Text style={styles.messageEmoji}>{message.emoji}</Text>
                <Text style={styles.messageTitle}>{message.title}</Text>
              </View>
              {selectedMessage?.id === message.id && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#e61580" />
              )}
            </View>

            <Text style={styles.messageContent} numberOfLines={expandedMessage === message.id ? undefined : 2}>
              {message.content}
            </Text>

            {message.content.length > 80 && (
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => toggleExpand(message.id)}
              >
                <Text style={styles.readMoreText}>Read more</Text>
                <MaterialCommunityIcons
                  name={expandedMessage === message.id ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#e61580"
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Edit Button - Large button at bottom when message is selected */}
      {selectedMessage && (
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(selectedMessage)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flex: 1,
    minHeight: 400,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e4ec',
  },
  messageCardSelected: {
    borderColor: '#e61580',
    backgroundColor: '#fff5f8',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  messageEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    flex: 1,
  },
  messageContent: {
    fontSize: 15,
    color: '#363740',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#e61580',
    marginRight: 4,
  },
  editButtonContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  editButton: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

