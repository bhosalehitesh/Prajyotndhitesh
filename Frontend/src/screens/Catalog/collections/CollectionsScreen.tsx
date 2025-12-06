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
import {fetchCollectionsWithCounts, deleteCollection, CollectionWithCountDto, setCollectionVisibility} from '../../../utils/api';

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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [messageOpacity] = useState(new Animated.Value(0));

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const loadCollections = React.useCallback(async () => {
    try {
      setLoading(true);
      const apiCollections: CollectionWithCountDto[] = await fetchCollectionsWithCounts();
      const mapped: Collection[] = apiCollections.map(col => ({
        id: String(col.collectionId),
        name: col.collectionName,
        image: col.collectionImage || undefined,
        productCount: col.productCount ?? 0,
        hideFromWebsite: !!col.hideFromWebsite,
        description: col.description || '',
      }));
      setCollections(mapped);
    } catch (error) {
      console.error('Failed to load collections', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCollections();
    });
    return unsubscribe;
  }, [navigation, loadCollections]);

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

  const handleShare = async () => {
    setBottomSheetOpen(false);
    
    if (!activeCollection) {
      Alert.alert('Error', 'No collection selected');
      return;
    }

    // Small delay to ensure bottom sheet closes before share sheet opens
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const shareMessage = `Check out this collection: ${activeCollection.name}\n\n${activeCollection.description || 'Explore this collection on our app!'}`;
      
      console.log('Sharing collection:', activeCollection.name);
      
      // Use native Android/iOS share sheet - shows all available apps on the device
      const result = await Share.share({
        message: shareMessage,
        title: activeCollection.name,
      });
      
      console.log('Share result:', result);
      
      if (result.action === Share.sharedAction) {
        console.log('Collection shared successfully via:', result.activityType || 'unknown');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed by user');
      }
    } catch (error: any) {
      console.error('Error sharing collection:', error);
      // Only show error if it's not a user cancellation
      const errorMessage = error?.message || String(error);
      if (!errorMessage.includes('User did not share') && 
          !errorMessage.includes('cancelled') && 
          !errorMessage.includes('dismissed')) {
        Alert.alert('Error', 'Failed to share collection. Please try again.');
      }
    }
  };

  const handleDeletePress = () => {
    setBottomSheetOpen(false);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = () => {
    if (activeCollectionId) {
      const idToDelete = activeCollectionId;
      setConfirmDeleteOpen(false);
      setActiveCollectionId(null);
      deleteCollection(idToDelete)
        .then(() => {
          setCollections(prev => prev.filter(c => c.id !== idToDelete));
          showSuccessMessage('Collection deleted successfully');
        })
        .catch(err => {
          console.error('Failed to delete collection', err);
          const errorMessage = err?.message || 'Failed to delete collection. Please try again.';
          Alert.alert('Error', errorMessage);
        });
    }
  };

  const showSuccessMessage = (message: string) => {
    if (!messageOpacity) return;
    setSuccessMessage(message);
    try {
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
      ]).start((finished) => {
        if (finished) {
          setSuccessMessage(null);
        }
      });
    } catch (error) {
      console.error('Animation error:', error);
      setSuccessMessage(null);
    }
  };

  const toggleHideFromWebsite = async (collectionId: string, value: boolean) => {
    try {
      await setCollectionVisibility(collectionId, value);
      setCollections(prev =>
        prev.map(c => (c.id === collectionId ? {...c, hideFromWebsite: value} : c)),
      );

      const collection = collections.find(c => c.id === collectionId);
      if (value) {
        showSuccessMessage(`${collection?.name} is now hidden from website`);
      } else {
        showSuccessMessage(`${collection?.name} is now visible on website`);
      }
    } catch (error) {
      console.error('Failed to update collection visibility', error);
      Alert.alert('Error', 'Failed to update visibility. Please try again.');
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
        {loading && collections.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#6c757d', marginTop: 24}}>
            Loading collections...
          </Text>
        ) : !loading && filteredCollections.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#6c757d', marginTop: 24}}>
            No collections found. Add your first collection.
          </Text>
        ) : (
          filteredCollections.map(collection => (
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
        )))}
      </ScrollView>

      {/* Success Message Toast */}
      {successMessage && messageOpacity && (
        <Animated.View
          style={[
            styles.successMessageContainer,
            {
              opacity: messageOpacity,
            },
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
    backgroundColor: '#FFF4FA',
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

