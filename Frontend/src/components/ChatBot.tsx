import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: string;
  type: 'navigate' | 'info' | 'link';
}

interface ChatBotProps {
  onBack?: () => void;
  isModal?: boolean;
  visible?: boolean;
  onNavigate?: (route: string) => void;
}

const suggestedQuestions = [
  "How can I add a product?",
  "How do I manage my orders?",
  "How to set up payments?",
  "How to customize my store?",
  "How to share my store?",
  "How to manage inventory?",
];

// Bot response logic
const getBotResponse = (userMessage: string): { text: string; quickActions?: QuickAction[] } => {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Product related queries
  if (lowerMessage.includes('product') || lowerMessage.includes('add product') || lowerMessage.includes('list product')) {
    return {
      text: "To add a product:\n\n1. Go to Catalog → Products\n2. Tap 'Add New Product'\n3. Fill in product details (name, price, images, etc.)\n4. Set inventory quantity\n5. Save\n\nWould you like me to take you there?",
      quickActions: [
        { label: 'Go to Products', action: 'Products', type: 'navigate' },
        { label: 'Add Product', action: 'AddProduct', type: 'navigate' },
      ],
    };
  }

  // Category related queries
  if (lowerMessage.includes('category') || lowerMessage.includes('categor')) {
    return {
      text: "Categories help organize your products. You can:\n\n• Create categories from Catalog → Categories\n• Add products to categories\n• Set category images\n• Share categories\n\nNeed help with categories?",
      quickActions: [
        { label: 'Go to Categories', action: 'Categories', type: 'navigate' },
        { label: 'Add Category', action: 'AddCategory', type: 'navigate' },
      ],
    };
  }

  // Collection related queries
  if (lowerMessage.includes('collection')) {
    return {
      text: "Collections let you group products for special displays:\n\n• Create collections from Catalog → Collections\n• Add multiple products to a collection\n• Show/hide collections on your website\n• Share collections with customers\n\nWant to create a collection?",
      quickActions: [
        { label: 'Go to Collections', action: 'Collections', type: 'navigate' },
        { label: 'Add Collection', action: 'AddCollection', type: 'navigate' },
      ],
    };
  }

  // Order related queries
  if (lowerMessage.includes('order') || lowerMessage.includes('order management')) {
    return {
      text: "Manage your orders from the Orders section:\n\n• View all orders\n• Update order status\n• Track shipments\n• Process refunds\n\nI can help you navigate there!",
      quickActions: [
        { label: 'View Orders', action: 'MyOrders', type: 'navigate' },
      ],
    };
  }

  // Payment related queries
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('cod') || lowerMessage.includes('cash on delivery')) {
    return {
      text: "Set up payment methods:\n\n• Cash on Delivery (COD)\n• Online payments (Razorpay, etc.)\n• Configure payment settings\n\nGo to Profile → Payments to set this up!",
      quickActions: [
        { label: 'Payment Settings', action: 'Payments', type: 'navigate' },
      ],
    };
  }

  // Shipping related queries
  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('ship')) {
    return {
      text: "Configure shipping settings:\n\n• Set delivery charges\n• Configure shipping zones\n• Set up return policies\n• Manage delivery partners\n\nGo to Profile → Shipping to configure!",
      quickActions: [
        { label: 'Shipping Settings', action: 'Shipping', type: 'navigate' },
      ],
    };
  }

  // Store appearance/customization
  if (lowerMessage.includes('customize') || lowerMessage.includes('appearance') || lowerMessage.includes('theme') || lowerMessage.includes('design')) {
    return {
      text: "Customize your store:\n\n• Change store appearance\n• Set up custom domain\n• Configure store timings\n• Add store policies\n\nLet me take you to Store Configuration!",
      quickActions: [
        { label: 'Store Appearance', action: 'StoreAppearance', type: 'navigate' },
        { label: 'Store Configuration', action: 'StoreConfig', type: 'navigate' },
      ],
    };
  }

  // Share store
  if (lowerMessage.includes('share') || lowerMessage.includes('store link') || lowerMessage.includes('promote')) {
    return {
      text: "Share your store with customers:\n\n• Get your store link from Home screen\n• Share via WhatsApp, Messages, etc.\n• Share products, categories, or collections\n• Use native share options\n\nYour store link is visible on the Home screen!",
      quickActions: [
        { label: 'Go to Home', action: 'Home', type: 'navigate' },
      ],
    };
  }

  // Inventory/Stock
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') || lowerMessage.includes('out of stock')) {
    return {
      text: "Manage inventory:\n\n• View stock levels in Products\n• Mark items in/out of stock\n• Update inventory quantities\n• Filter products by stock status\n\nGo to Products to manage inventory!",
      quickActions: [
        { label: 'Manage Products', action: 'Products', type: 'navigate' },
      ],
    };
  }

  // Analytics
  if (lowerMessage.includes('analytics') || lowerMessage.includes('sales') || lowerMessage.includes('report') || lowerMessage.includes('statistics')) {
    return {
      text: "Track your store performance:\n\n• View sales analytics\n• Monitor product performance\n• Track customer behavior\n• Set up Google Analytics\n\nCheck the Analytics section!",
      quickActions: [
        { label: 'View Analytics', action: 'Analytics', type: 'navigate' },
        { label: 'Google Analytics', action: 'GoogleAnalytics', type: 'navigate' },
      ],
    };
  }

  // Help/Support
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('faq')) {
    return {
      text: "I'm here to help! You can:\n\n• Browse FAQs\n• Contact support team\n• Read how-to guides\n• Get step-by-step instructions\n\nWhat would you like help with?",
      quickActions: [
        { label: 'FAQs', action: 'HelpCenter', type: 'navigate' },
        { label: 'How To Guides', action: 'HowTo', type: 'navigate' },
        { label: 'Contact Support', action: 'TalkToUs', type: 'navigate' },
      ],
    };
  }

  // Store setup/onboarding
  if (lowerMessage.includes('setup') || lowerMessage.includes('set up') || lowerMessage.includes('onboarding') || lowerMessage.includes('getting started')) {
    return {
      text: "Getting started with your store:\n\n1. Complete store name & location\n2. Add your first product\n3. Set up payment methods\n4. Configure shipping\n5. Customize store appearance\n\nI can guide you through each step!",
      quickActions: [
        { label: 'Add Product', action: 'AddProduct', type: 'navigate' },
        { label: 'Payment Setup', action: 'Payments', type: 'navigate' },
        { label: 'Store Settings', action: 'StoreConfig', type: 'navigate' },
      ],
    };
  }

  // Greetings
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return {
      text: "Hello! 👋 I'm Sakhi, your store assistant. I can help you with:\n\n• Adding & managing products\n• Setting up categories & collections\n• Configuring payments & shipping\n• Customizing your store\n• Managing orders\n• And much more!\n\nWhat would you like to do today?",
      quickActions: [
        { label: 'Add Product', action: 'AddProduct', type: 'navigate' },
        { label: 'View Products', action: 'Products', type: 'navigate' },
        { label: 'Store Settings', action: 'StoreConfig', type: 'navigate' },
      ],
    };
  }

  // Default response
  return {
    text: "I understand you're asking about: \"" + userMessage + "\"\n\nI can help you with:\n• Products & Inventory\n• Categories & Collections\n• Orders & Payments\n• Store Settings\n• Shipping & Delivery\n• Analytics & Reports\n\nTry asking something like:\n• \"How do I add a product?\"\n• \"How to set up payments?\"\n• \"How to customize my store?\"",
    quickActions: [
      { label: 'Browse Help Center', action: 'HelpCenter', type: 'navigate' },
      { label: 'Contact Support', action: 'TalkToUs', type: 'navigate' },
    ],
  };
};

export default function ChatBot({ onBack, isModal = false, visible = true, onNavigate }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm Sakhi, your store assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
      quickActions: [
        { label: 'Add Product', action: 'AddProduct', type: 'navigate' },
        { label: 'View Products', action: 'Products', type: 'navigate' },
        { label: 'Store Settings', action: 'StoreConfig', type: 'navigate' },
      ],
    },
  ]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isBot: true,
        timestamp: new Date(),
        quickActions: botResponse.quickActions,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.type === 'navigate') {
      if (onNavigate) {
        onNavigate(action.action);
        if (onBack) onBack(); // Close modal if navigating
      } else {
        Alert.alert(
          'Navigate',
          `Would you like to go to ${action.label}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Yes', 
              onPress: () => {
                const responseMessage: Message = {
                  id: Date.now().toString(),
                  text: `Taking you to ${action.label}...`,
                  isBot: true,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, responseMessage]);
              }
            },
          ]
        );
      }
    } else if (action.type === 'link') {
      Linking.openURL(action.action).catch(err => 
        console.error('Error opening link:', err)
      );
    } else {
      // Info type - add bot response
      const responseMessage: Message = {
        id: Date.now().toString(),
        text: `Here's more information about ${action.label}...`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const chatContent = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Sakhi Assistant</Text>
          <Text style={styles.subtitle}>Online</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id}>
            {msg.isBot ? (
              <View style={styles.botMessageContainer}>
                <View style={styles.botAvatar}>
                  <MaterialCommunityIcons name="robot" size={20} color="#ffffff" />
                </View>
                <View style={styles.botBubble}>
                  <Text style={styles.botMessageText}>{msg.text}</Text>
                  <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <View style={styles.quickActionsContainer}>
                      {msg.quickActions.map((action, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.quickActionButton}
                          onPress={() => handleQuickAction(action)}
                        >
                          <Text style={styles.quickActionText}>{action.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.userMessageContainer}>
                <View style={styles.userBubble}>
                  <Text style={styles.userMessageText}>{msg.text}</Text>
                  <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {isTyping && (
          <View style={styles.botMessageContainer}>
            <View style={styles.botAvatar}>
              <MaterialCommunityIcons name="robot" size={20} color="#ffffff" />
            </View>
            <View style={styles.botBubble}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}

        {/* Suggested Questions - Show only if no messages yet or at the end */}
        {messages.length <= 1 && (
          <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedTitle}>Quick Questions:</Text>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestedButton}
                onPress={() => handleSuggestedQuestion(question)}
              >
                <Text style={styles.suggestedButtonText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <MaterialCommunityIcons 
            name="send" 
            size={20} 
            color={message.trim() ? "#ffffff" : "#666"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  if (isModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onBack}
      >
        <View style={styles.container}>
          {chatContent}
        </View>
      </Modal>
    );
  }

  return <View style={styles.container}>{chatContent}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#e61580',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e61580',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  botBubble: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    maxWidth: '85%',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botMessageText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 6,
  },
  userMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#e61580',
    borderRadius: 16,
    padding: 14,
    maxWidth: '85%',
    borderTopRightRadius: 4,
  },
  userMessageText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 6,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  quickActionsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#e61580',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  suggestedContainer: {
    marginTop: 20,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  suggestedButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e61580',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  suggestedButtonText: {
    fontSize: 14,
    color: '#e61580',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a1a',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e61580',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});

