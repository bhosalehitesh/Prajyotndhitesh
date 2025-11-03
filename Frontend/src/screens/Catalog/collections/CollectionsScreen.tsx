import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Image,
  Share,
  Linking,
  Alert,
  Platform,
  Switch,
  Animated,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';

interface CollectionsScreenProps {
  navigation: any;
}

interface Collection {
  id: string;
  name: string;
  image?: string;
  productCount: number;
  hideFromWebsite: boolean;
  description?: string;
}

const CollectionsScreen: React.FC<CollectionsScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<Collection[]>([
    {id: '1', name: 'Rfgg', productCount: 0, hideFromWebsite: false},
    {id: '2', name: 'Vhh', productCount: 0, hideFromWebsite: false},
  ]);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [messageOpacity] = useState(new Animated.Value(0));

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const handleMenuPress = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setBottomSheetOpen(true);
  };

  const handleEdit = () => {
    setBottomSheetOpen(false);
    navigation.navigate('EditCollection', {
      collectionId: activeCollectionId,
      ...activeCollection,
    });
  };

  const handleShare = () => {
    setBottomSheetOpen(false);
    setShareSheetOpen(true);
  };

  const shareContent = {
    message: `Check out this collection: ${activeCollection?.name}\n\n${activeCollection?.description || 'Explore this collection on our app!'}`,
    title: activeCollection?.name || 'Collection',
  };

  const shareViaApp = async (app: string) => {
    const {message, title} = shareContent;
    
    try {
      switch (app) {
        case 'whatsapp':
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
          const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
          if (canOpenWhatsApp) {
            await Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share');
          }
          break;
        
        case 'messages':
          if (Platform.OS === 'ios') {
            const smsUrl = `sms:&body=${encodeURIComponent(message)}`;
            await Linking.openURL(smsUrl);
          } else {
            const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
            await Linking.openURL(smsUrl);
          }
          break;
        
        case 'chrome':
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title)}`;
          await Linking.openURL(searchUrl);
          break;
        
        case 'snapchat':
          await Share.share({
            message: message,
            title: title,
          });
          break;
        
        case 'quick-share':
        case 'system':
        default:
          await Share.share({
            message: message,
            title: title,
          });
          break;
      }
      setShareSheetOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Unable to share. Please try again.');
    }
  };

  const shareViaContact = async (contactName: string, app: string) => {
    await shareViaApp(app);
  };

  const handleDeletePress = () => {
    setBottomSheetOpen(false);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (activeCollectionId) {
      setCollections(prev => prev.filter(c => c.id !== activeCollectionId));
      setConfirmDeleteOpen(false);
      setActiveCollectionId(null);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    Animated.sequence([
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSuccessMessage(null);
    });
  };

  const toggleHideFromWebsite = (collectionId: string, value: boolean) => {
    setCollections(prev =>
      prev.map(c => (c.id === collectionId ? {...c, hideFromWebsite: value} : c)),
    );
    
    // Show success message
    const collection = collections.find(c => c.id === collectionId);
    if (value) {
      showSuccessMessage(`${collection?.name} is now hidden from website`);
    } else {
      showSuccessMessage(`${collection?.name} is now visible on website`);
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collections</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Collections"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Collections List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredCollections.map(collection => (
          <View key={collection.id} style={styles.collectionCard}>
            <View style={styles.collectionMainRow}>
              <View style={styles.collectionImageContainer}>
                {collection.image && typeof collection.image === 'string' && collection.image !== 'placeholder' ? (
                  <Image source={{uri: collection.image}} style={styles.collectionImage} />
                ) : (
                  <View style={styles.collectionImagePlaceholder}>
                    <IconSymbol name="image" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionName}>{collection.name}</Text>
                <Text style={styles.collectionCount}>
                  {collection.productCount === 0
                    ? 'No products'
                    : `${collection.productCount} product${collection.productCount > 1 ? 's' : ''}`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleMenuPress(collection.id)}>
                <IconSymbol name="ellipsis-vertical" size={20} color="#6c757d" />
              </TouchableOpacity>
            </View>
            
            {/* Hide from website toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Hide from website</Text>
              <Switch
                value={collection.hideFromWebsite}
                onValueChange={value => toggleHideFromWebsite(collection.id, value)}
                trackColor={{false: '#D1D5DB', true: '#e61580'}}
                thumbColor={collection.hideFromWebsite ? '#FFFFFF' : '#f8f9fa'}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Success Message Toast */}
      {successMessage && (
        <Animated.View
          style={[
            styles.successMessageContainer,
            {opacity: messageOpacity},
          ]}>
          <IconSymbol name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.successMessageText}>{successMessage}</Text>
        </Animated.View>
      )}

      {/* Add New Collection Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCollection')}>
        <Text style={styles.addButtonText}>Add New Collection</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Modal
        transparent
        visible={bottomSheetOpen}
        animationType="slide"
        onRequestClose={() => setBottomSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setBottomSheetOpen(false)}>
          <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.dragHandle} />
            <Text style={styles.bottomSheetTitle}>{activeCollection?.name}</Text>

            <TouchableOpacity style={styles.actionRow} onPress={handleEdit}>
              <Text style={styles.actionRowText}>Edit Collection</Text>
              <IconSymbol name="pencil" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleShare}>
              <Text style={styles.actionRowText}>Share Collection</Text>
              <IconSymbol name="share" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleDeletePress}>
              <Text style={[styles.actionRowText, styles.deleteText]}>Delete Collection</Text>
              <IconSymbol name="trash" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share Sheet Modal */}
      <Modal
        transparent
        visible={shareSheetOpen}
        animationType="slide"
        onRequestClose={() => setShareSheetOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setShareSheetOpen(false)}>
          <Pressable style={styles.shareSheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.shareSheetTitle}>Share</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.shareRow}
              contentContainerStyle={styles.shareRowContent}>
              <TouchableOpacity 
                style={styles.shareContactItem}
                onPress={() => shareViaContact('Mandir Galli', 'whatsapp')}>
                <View style={styles.shareContactAvatar}>
                  <IconSymbol name="person" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareContactName} numberOfLines={1}>
                  मंदिर गल्ली
                </Text>
                <View style={[styles.shareAppBadge, styles.whatsappBadge]}>
                  <IconSymbol name="logo-whatsapp" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareContactItem}
                onPress={() => shareViaContact('Bloodlines', 'whatsapp')}>
                <View style={styles.shareContactAvatar}>
                  <IconSymbol name="people" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareContactName} numberOfLines={1}>
                  Bloodlines & Better...
                </Text>
                <View style={[styles.shareAppBadge, styles.whatsappBadge]}>
                  <IconSymbol name="logo-whatsapp" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareContactItem}
                onPress={() => shareViaContact('Kalpesh', 'whatsapp')}>
                <View style={styles.shareContactAvatar}>
                  <IconSymbol name="person" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareContactName} numberOfLines={1}>
                  Kalpesh Trd
                </Text>
                <View style={[styles.shareAppBadge, styles.whatsappBadge]}>
                  <IconSymbol name="logo-whatsapp" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareContactItem}
                onPress={() => shareViaContact('Hitesh', 'snapchat')}>
                <View style={styles.shareContactAvatar}>
                  <IconSymbol name="person" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareContactName} numberOfLines={1}>
                  Hitesh7722
                </Text>
                <View style={[styles.shareAppBadge, styles.snapchatBadge]}>
                  <IconSymbol name="logo-snapchat" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </ScrollView>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.shareRow}
              contentContainerStyle={styles.shareRowContent}>
              <TouchableOpacity 
                style={styles.shareAppItem}
                onPress={() => shareViaApp('quick-share')}>
                <View style={[styles.shareAppIcon, styles.quickShareIcon]}>
                  <IconSymbol name="share" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareAppName}>Quick Share</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareAppItem}
                onPress={() => shareViaApp('whatsapp')}>
                <View style={[styles.shareAppIcon, styles.whatsappIcon]}>
                  <IconSymbol name="logo-whatsapp" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareAppName}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareAppItem}
                onPress={() => shareViaApp('messages')}>
                <View style={[styles.shareAppIcon, styles.messagesIcon]}>
                  <IconSymbol name="chatbubble" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareAppName}>Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareAppItem}
                onPress={() => shareViaApp('chrome')}>
                <View style={[styles.shareAppIcon, styles.chromeIcon]}>
                  <IconSymbol name="globe" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareAppName}>Chrome</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareAppItem}
                onPress={() => shareViaApp('snapchat')}>
                <View style={[styles.shareAppIcon, styles.snapchatIcon]}>
                  <IconSymbol name="logo-snapchat" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareAppName}>Snapchat</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.shareCancelButton}
              onPress={() => setShareSheetOpen(false)}>
              <Text style={styles.shareCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={confirmDeleteOpen}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setConfirmDeleteOpen(false)}>
          <Pressable style={styles.deleteModal} onPress={e => e.stopPropagation()}>
            <Text style={styles.deleteModalTitle}>Delete Collection</Text>
            <Text style={styles.deleteModalQuestion}>
              Are you sure you want to delete "{activeCollection?.name}"?
            </Text>
            <TouchableOpacity style={styles.deleteModalButton} onPress={handleDelete}>
              <Text style={styles.deleteModalButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setConfirmDeleteOpen(false)}>
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e61580',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  collectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  collectionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionImageContainer: {
    marginRight: 12,
  },
  collectionImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  collectionImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuButton: {
    padding: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#e61580',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  actionRowText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  deleteText: {
    color: '#B91C1C',
  },
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: '100%',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  deleteModalQuestion: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  deleteModalButton: {
    backgroundColor: '#B91C1C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelModalButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  shareSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  shareSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  shareRow: {
    marginBottom: 20,
  },
  shareRowContent: {
    paddingHorizontal: 4,
  },
  shareContactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  shareContactAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  shareContactName: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    maxWidth: 80,
  },
  shareAppBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  whatsappBadge: {
    backgroundColor: '#25D366',
  },
  snapchatBadge: {
    backgroundColor: '#FFFC00',
  },
  shareAppItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  shareAppIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickShareIcon: {
    backgroundColor: '#3B82F6',
  },
  whatsappIcon: {
    backgroundColor: '#25D366',
  },
  messagesIcon: {
    backgroundColor: '#F97316',
  },
  chromeIcon: {
    backgroundColor: '#4285F4',
  },
  snapchatIcon: {
    backgroundColor: '#FFFC00',
  },
  shareAppName: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
  },
  shareCancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  shareCancelText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  successMessageContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default CollectionsScreen;

