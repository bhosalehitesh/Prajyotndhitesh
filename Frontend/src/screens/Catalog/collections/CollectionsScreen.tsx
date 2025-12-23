import React, { useState, useEffect } from 'react';
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
import { fetchCollectionsWithCounts, deleteCollection, CollectionWithCountDto, setCollectionVisibility } from '../../../utils/api';

interface CollectionsScreenProps {
  navigation: any;
}

interface Collection {
  id: string;
  name: string;
  image?: string;
  productCount: number;
  hideFromWebsite: boolean; // Legacy field
  isActive?: boolean; // SmartBiz: preferred field (same as Category)
  orderIndex?: number; // SmartBiz: for sorting (same as Category)
  slug?: string; // SmartBiz: URL-friendly identifier (same as Category)
  description?: string;
}

const CollectionsScreen: React.FC<CollectionsScreenProps> = ({ navigation }) => {
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
      // SmartBiz: Map collections with all fields (same as categories)
      const mapped: Collection[] = apiCollections.map(col => ({
        id: String(col.collectionId),
        name: col.collectionName,
        image: col.collectionImage || undefined,
        productCount: col.productCount ?? 0,
        hideFromWebsite: col.hideFromWebsite ?? (!col.isActive ?? false), // Sync with isActive
        isActive: col.isActive ?? (!col.hideFromWebsite ?? true), // SmartBiz: preferred field
        orderIndex: col.orderIndex ?? 0, // SmartBiz: for sorting
        slug: col.slug || undefined, // SmartBiz: URL-friendly identifier
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
    if (!activeCollectionId || !activeCollection) {
      Alert.alert('Error', 'No collection selected');
      return;
    }
    console.log('🔄 [CollectionsScreen] Navigating to edit collection:', {
      collectionId: activeCollectionId,
      collectionName: activeCollection.name,
      isActive: activeCollection.isActive,
      orderIndex: activeCollection.orderIndex,
    });
    navigation.navigate('EditCollection', {
      collectionId: activeCollectionId, // Ensure this is passed
      name: activeCollection.name,
      description: activeCollection.description,
      image: activeCollection.image,
      isActive: activeCollection.isActive ?? !activeCollection.hideFromWebsite ?? true,
      orderIndex: activeCollection.orderIndex ?? 0,
      hideFromWebsite: activeCollection.hideFromWebsite,
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

  // SmartBiz: Update collection active status (same as categories)
  const toggleCollectionStatus = async (collectionId: string, isActive: boolean) => {
    try {
      // Use the new status endpoint if available, otherwise fallback to hideFromWebsite
      const hideFromWebsite = !isActive;
      await setCollectionVisibility(collectionId, hideFromWebsite);
      setCollections(prev =>
        prev.map(c => (c.id === collectionId ? {
          ...c,
          hideFromWebsite: hideFromWebsite,
          isActive: isActive
        } : c)),
      );

      const collection = collections.find(c => c.id === collectionId);
      if (isActive) {
        showSuccessMessage(`${collection?.name} is now active`);
      } else {
        showSuccessMessage(`${collection?.name} is now hidden`);
      }
    } catch (error) {
      console.error('Failed to update collection status', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
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
          <Text style={styles.emptyText}>Loading collections...</Text>
        ) : !loading && filteredCollections.length === 0 ? (
          <Text style={styles.emptyText}>No collections found. Add your first collection.</Text>
        ) : (
          filteredCollections.map(collection => (
            <TouchableOpacity
              key={collection.id}
              style={styles.collectionCard}
              onPress={() => {
                // Navigate to ProductsScreen in add-to-collection mode with full product list
                navigation.navigate('Products', {
                  collectionId: collection.id,
                  collectionName: collection.name,
                  addToCollection: false, // Default to view mode
                  viewCollectionProducts: true,
                  returnScreen: 'Collections',
                });
              }}
              activeOpacity={0.7}>
              <View style={styles.collectionImageContainer}>
                {collection.image && typeof collection.image === 'string' && collection.image !== 'placeholder' ? (
                  <Image source={{ uri: collection.image }} style={styles.collectionImage} />
                ) : (
                  <View style={styles.collectionImagePlaceholder}>
                    <IconSymbol name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionName} numberOfLines={1}>
                  {collection.name}
                </Text>
                <Text style={styles.collectionCount}>
                  {collection.productCount === 0
                    ? 'No product listed'
                    : `${collection.productCount} product${collection.productCount > 1 ? 's' : ''} listed`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleMenuPress(collection.id)}>
                <IconSymbol name="ellipsis-vertical" size={20} color="#6c757d" />
              </TouchableOpacity>
            </TouchableOpacity>
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

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setBottomSheetOpen(false);
                if (activeCollectionId && activeCollection) {
                  navigation.push('Products', {
                    collectionId: activeCollectionId,
                    collectionName: activeCollection.name,
                    addToCollection: true,
                    returnScreen: 'Collections',
                    returnParams: {
                      collectionId: activeCollectionId,
                      collectionName: activeCollection.name,
                      viewCollectionProducts: true,
                    },
                  });
                }
              }}>
              <Text style={styles.actionRowText}>Add Products</Text>
              <IconSymbol name="add-circle" size={20} color="#111827" />
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
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0, // SmartBiz: same as CategoriesScreen (shadow instead)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    paddingBottom: 120, // SmartBiz: same as CategoriesScreen
    paddingTop: 8,
  },
  collectionCard: {
    flexDirection: 'row', // SmartBiz: same layout as CategoriesScreen
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // SmartBiz: same as CategoriesScreen
  },
  collectionImageContainer: {
    marginRight: 12, // SmartBiz: same as CategoriesScreen
  },
  collectionImagePlaceholder: {
    width: 70, // SmartBiz: same size as CategoriesScreen
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F3F4F6', // SmartBiz: same as CategoriesScreen
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  collectionImage: {
    width: 70, // SmartBiz: same size as CategoriesScreen
    height: 70,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  collectionInfo: {
    flex: 1, // SmartBiz: same as CategoriesScreen
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6, // SmartBiz: same spacing as CategoriesScreen
  },
  collectionCount: {
    fontSize: 13, // SmartBiz: same as CategoriesScreen
    color: '#6B7280', // SmartBiz: same color as CategoriesScreen
  },
  menuButton: {
    padding: 8,
    marginLeft: 8, // SmartBiz: same as CategoriesScreen
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#e61580',
    paddingVertical: 16, // SmartBiz: same as CategoriesScreen
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000', // SmartBiz: same shadow as CategoriesScreen
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 14,
    marginTop: 24,
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
    shadowOffset: { width: 0, height: 2 },
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

