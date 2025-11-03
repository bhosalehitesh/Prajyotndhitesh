import React, {useState} from 'react';
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
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';

interface CategoriesScreenProps {
  navigation: any;
}

interface Category {
  id: string;
  name: string;
  image?: string;
  productCount: number;
  description?: string;
  businessCategory?: string;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    {id: '1', name: 'Fruits & Vegetables', productCount: 1, image: 'placeholder'},
    {id: '2', name: 'Hhjk', productCount: 0},
    {id: '3', name: 'Abc', productCount: 0, image: 'placeholder'},
  ]);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  const handleMenuPress = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setBottomSheetOpen(true);
  };

  const handleEdit = () => {
    setBottomSheetOpen(false);
    navigation.navigate('EditCategory', {
      categoryId: activeCategoryId,
      ...activeCategory,
    });
  };

  const handleShare = () => {
    setBottomSheetOpen(false);
    setShareSheetOpen(true);
  };

  const shareContent = {
    message: `Check out this category: ${activeCategory?.name}\n\n${activeCategory?.description || 'Explore this category on our app!'}`,
    title: activeCategory?.name || 'Category',
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
          // Open in browser with search
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title)}`;
          await Linking.openURL(searchUrl);
          break;
        
        case 'snapchat':
          // Snapchat doesn't have a direct share URL, use system share
          await Share.share({
            message: message,
            title: title,
          });
          break;
        
        case 'quick-share':
        case 'system':
        default:
          // Use system share
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
    // For contact sharing, we'll use the app-specific sharing
    await shareViaApp(app);
  };

  const handleDeletePress = () => {
    setBottomSheetOpen(false);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (activeCategoryId) {
      setCategories(prev => prev.filter(c => c.id !== activeCategoryId));
      setConfirmDeleteOpen(false);
      setActiveCategoryId(null);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Categories"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredCategories.map(category => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryImageContainer}>
              {category.image && typeof category.image === 'string' && category.image !== 'placeholder' ? (
                <Image source={{uri: category.image}} style={styles.categoryImage} />
              ) : (
                <View style={styles.categoryImagePlaceholder}>
                  <IconSymbol name="image" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {category.productCount === 0
                  ? 'No product listed'
                  : `${category.productCount} product${category.productCount > 1 ? 's' : ''} listed`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleMenuPress(category.id)}>
              <IconSymbol name="ellipsis-vertical" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Add New Category Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCategory')}>
        <Text style={styles.addButtonText}>Add New Category</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Modal
        transparent
        visible={bottomSheetOpen}
        animationType="slide"
        onRequestClose={() => setBottomSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setBottomSheetOpen(false)}>
          <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Category Title */}
            <Text style={styles.bottomSheetTitle}>{activeCategory?.name}</Text>

            {/* Action Options */}
            <TouchableOpacity style={styles.actionRow} onPress={handleEdit}>
              <Text style={styles.actionRowText}>Edit Category</Text>
              <IconSymbol name="pencil" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleShare}>
              <Text style={styles.actionRowText}>Share Category</Text>
              <IconSymbol name="share" size={20} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleDeletePress}>
              <Text style={[styles.actionRowText, styles.deleteText]}>Delete Category</Text>
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
            
            {/* Recent Contacts/Apps Row */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.shareRow}
              contentContainerStyle={styles.shareRowContent}>
              {/* Sample contacts - in real app, these would come from your contacts */}
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

            {/* Share Apps Row */}
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

            {/* Cancel Button */}
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
            <Text style={styles.deleteModalTitle}>Delete Category</Text>
            <Text style={styles.deleteModalQuestion}>
              Are you sure you want to delete "{activeCategory?.name}"?
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
    backgroundColor: '#374151',
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
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryImageContainer: {
    marginRight: 12,
  },
  categoryImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuButton: {
    padding: 8,
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
});

export default CategoriesScreen;

