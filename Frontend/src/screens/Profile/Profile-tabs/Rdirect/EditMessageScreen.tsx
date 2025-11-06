import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface EditMessageScreenProps {
  campaignData: any;
  onNext: (data: any) => void;
}

export default function EditMessageScreen({ campaignData = {}, onNext }: EditMessageScreenProps) {
  const [campaignName, setCampaignName] = useState(
    campaignData?.campaignName || campaignData?.selectedMessage?.type || ''
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    campaignData?.discountPercentage || ''
  );
  const [messageContent, setMessageContent] = useState(
    campaignData?.messageContent || campaignData?.selectedMessage?.content || ''
  );

  const handleNext = () => {
    if (!campaignName.trim()) {
      Alert.alert('Error', 'Please enter a campaign name');
      return;
    }
    const parsedValue = parseFloat(discountPercentage);
    if (!discountPercentage || isNaN(parsedValue) || parsedValue <= 0) {
      Alert.alert('Error', 'Please enter a valid discount percentage');
      return;
    }
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter message content');
      return;
    }

    onNext({
      campaignName: campaignName.trim(),
      discountPercentage,
      messageContent: messageContent.trim(),
    });
  };

  const getPreviewMessage = () => {
    let preview = messageContent;
    if (discountPercentage) {
      preview = preview.replace(/\*\{\{discount_percentage\}\}\*/g, `**${discountPercentage}**`);
      preview = preview.replace(/\*\*Discount Percentage\*\*/g, `**${discountPercentage}**`);
      preview = preview.replace(/\{\{discount_percentage\}\}/g, discountPercentage);
    } else {
      preview = preview.replace(/\*\{\{discount_percentage\}\}\*/g, '**Discount Percentage**');
      preview = preview.replace(/\{\{discount_percentage\}\}/g, 'Discount Percentage');
    }
    // Process other variables
    preview = preview.replace(/\*\{\{customer_name\}\}\*/g, '*Customer Name*');
    preview = preview.replace(/\{\{customer_name\}\}/g, 'Customer Name');
    preview = preview.replace(/\*\{\{brand_name\}\}\*/g, '*Brand Name*');
    preview = preview.replace(/\{\{brand_name\}\}/g, 'Brand Name');
    preview = preview.replace(/\*\{\{event_name\}\}\*/g, '*Event Name*');
    preview = preview.replace(/\{\{Event_name\}\}/g, 'Event Name');
    preview = preview.replace(/\{\{category_name\}\}/g, 'Category Name');
    preview = preview.replace(/\*\{\{category_name\}\}\*/g, '*Category Name*');
    preview = preview.replace(/\{\{coupon_code\}\}/g, 'COUPON123');
    preview = preview.replace(/\*\{\{coupon_code\}\}\*/g, '*COUPON123*');
    return preview;
  };

  const formatMessageText = (text: string) => {
    // Split text into parts for bold and regular formatting
    const parts: Array<{ text: string; bold: boolean; teal?: boolean }> = [];
    
    // Match **text** for bold/teal text
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        // Check for special words like "Girnai" that should be teal
        const words = beforeText.split(/(\s+)/);
        words.forEach((word) => {
          if (word.trim() === 'Girnai') {
            parts.push({ text: word, bold: true, teal: true });
          } else if (word.trim().length > 0) {
            parts.push({ text: word, bold: false });
          } else {
            parts.push({ text: word, bold: false });
          }
        });
      }
      parts.push({ text: match[1], bold: true, teal: true });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      // Check for special words like "Girnai" in remaining text
      const words = remainingText.split(/(\s+)/);
      words.forEach((word) => {
        if (word.trim() === 'Girnai') {
          parts.push({ text: word, bold: true, teal: true });
        } else if (word.trim().length > 0) {
          parts.push({ text: word, bold: false });
        } else {
          parts.push({ text: word, bold: false });
        }
      });
    }

    if (parts.length === 0) {
      parts.push({ text, bold: false });
    }

    return parts;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Edit your marketing message</Text>

        {/* Campaign Name */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter campaign name *"
            value={campaignName}
            onChangeText={setCampaignName}
          />
        </View>

        {/* Message Preview */}
        <View style={styles.messagePreview}>
          <View style={styles.messagePreviewHeader}>
            <Text style={styles.messageTitle}>
              {campaignData.selectedMessage?.title || campaignName || 'Marketing Message'}
            </Text>
          </View>
          <View style={styles.messagePreviewContent}>
            <View style={styles.messageTextWrapper}>
              {campaignData.selectedMessage?.emoji && (
                <Text style={styles.messageEmoji}>{campaignData.selectedMessage.emoji} </Text>
              )}
              <Text style={styles.messagePreviewText}>
                {formatMessageText(getPreviewMessage()).map((part, index) => (
                  <Text
                    key={index}
                    style={[
                      part.bold && (part.teal ? styles.messagePreviewTextBoldTeal : styles.messagePreviewTextBold),
                    ]}
                  >
                    {part.text}
                  </Text>
                ))}
              </Text>
            </View>
          </View>
        </View>

        {/* Discount Percentage */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter the discount percentage *"
            value={discountPercentage}
            onChangeText={setDiscountPercentage}
            keyboardType="numeric"
          />
        </View>

        {/* Confirm & Next Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!campaignName || !discountPercentage || !messageContent) && styles.confirmButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!campaignName || !discountPercentage || !messageContent}
        >
          <Text
            style={[
              styles.confirmButtonText,
              (!campaignName || !discountPercentage || !messageContent) && styles.confirmButtonTextDisabled,
            ]}
          >
            Confirm & Next
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#363740',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#363740',
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  messagePreview: {
    backgroundColor: '#fff5f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e61580',
  },
  messagePreviewHeader: {
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
  },
  messagePreviewContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  messageTextWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  messagePreviewText: {
    fontSize: 15,
    color: '#363740',
    lineHeight: 22,
  },
  messagePreviewTextBold: {
    fontWeight: 'bold',
    color: '#363740',
  },
  messagePreviewTextBoldTeal: {
    fontWeight: 'bold',
    color: '#e61580',
  },
  messageEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#e3f2fd',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  confirmButtonTextDisabled: {
    color: '#666',
  },
});

