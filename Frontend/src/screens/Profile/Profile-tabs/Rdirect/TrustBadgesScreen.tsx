import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Badge {
  id: string;
  name: string;
  icon: string;
  category: string;
  recommended?: boolean;
}

interface Category {
  id: string;
  name: string;
  badges: Badge[];
}

const badgeCategories: Category[] = [
  {
    id: 'brand',
    name: 'Brand',
    badges: [
      { id: 'b1', name: 'Assured Quality', icon: 'ribbon', category: 'brand', recommended: true },
      { id: 'b2', name: 'Made In India', icon: 'flag', category: 'brand', recommended: true },
      { id: 'b3', name: '100% Original', icon: 'stamp', category: 'brand', recommended: true },
      { id: 'b4', name: 'Gold Plated', icon: 'star-circle', category: 'brand' },
      { id: 'b5', name: 'Proudly Indian', icon: 'hand-heart', category: 'brand' },
      { id: 'b6', name: '100% Natural', icon: 'leaf', category: 'brand' },
      { id: 'b7', name: 'Eco-Friendly', icon: 'leaf-circle', category: 'brand' },
      { id: 'b8', name: 'Cadmium Free', icon: 'periodic-table', category: 'brand' },
      { id: 'b9', name: 'Ayurveda-Enriched', icon: 'mortar-pestle', category: 'brand' },
      { id: 'b10', name: 'Award-Winning', icon: 'trophy', category: 'brand' },
      { id: 'b11', name: 'LGBTQI Owned Business', icon: 'rainbow', category: 'brand' },
      { id: 'b12', name: 'Handmade', icon: 'hand-heart-outline', category: 'brand' },
      { id: 'b13', name: 'Artisan Crafted', icon: 'hand-okay', category: 'brand' },
      { id: 'b14', name: 'Smart Design', icon: 'lightbulb-on', category: 'brand' },
      { id: 'b15', name: 'Handcrafted', icon: 'heart', category: 'brand' },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery & Returns',
    badges: [
      { id: 'd1', name: 'Easy Exchanges', icon: 'swap-horizontal', category: 'delivery', recommended: true },
      { id: 'd2', name: 'COD Available', icon: 'cash', category: 'delivery', recommended: true },
      { id: 'd3', name: 'Easy Returns', icon: 'return', category: 'delivery', recommended: true },
      { id: 'd4', name: 'Fast & Free Delivery', icon: 'truck-delivery', category: 'delivery', recommended: true },
      { id: 'd5', name: 'Timely Delivery', icon: 'scooter', category: 'delivery', recommended: true },
      { id: 'd6', name: 'Best Prices', icon: 'tag', category: 'delivery', recommended: true },
      { id: 'd7', name: 'Secure Delivery', icon: 'shield-check', category: 'delivery' },
      { id: 'd8', name: 'Great Prices', icon: 'currency-usd', category: 'delivery' },
      { id: 'd9', name: 'Save With Coupons', icon: 'tag-outline', category: 'delivery' },
      { id: 'd10', name: 'Free Delivery', icon: 'truck', category: 'delivery' },
    ],
  },
  {
    id: 'security',
    name: 'Security & Technology',
    badges: [
      { id: 's1', name: 'Secure Payments', icon: 'wallet', category: 'security', recommended: true },
      { id: 's2', name: 'SSL Encrypted', icon: 'shield-lock', category: 'security', recommended: true },
      { id: 's3', name: 'Amazon-Powered', icon: 'amazon', category: 'security', recommended: true },
    ],
  },
  {
    id: 'certifications',
    name: 'Certifications',
    badges: [
      { id: 'c1', name: 'WHO GMP Certified', icon: 'certificate', category: 'certifications' },
      { id: 'c2', name: '925 Sterling Silver', icon: 'certificate', category: 'certifications' },
      { id: 'c3', name: 'Certified Organic', icon: 'leaf-circle', category: 'certifications' },
      { id: 'c4', name: '100% Authentic', icon: 'stamp', category: 'certifications' },
      { id: 'c5', name: 'ISO Certified', icon: 'certificate', category: 'certifications' },
      { id: 'c6', name: 'Hallmarked Jewellery', icon: 'diamond-stone', category: 'certifications' },
    ],
  },
  {
    id: 'services',
    name: 'Services & Warranties',
    badges: [
      { id: 'w1', name: 'Free Installation', icon: 'wrench', category: 'services' },
      { id: 'w2', name: 'Lifetime Exchange', icon: 'shield-check', category: 'services' },
      { id: 'w3', name: 'On-Time Support', icon: 'headset', category: 'services' },
      { id: 'w4', name: 'Buyback Guarantee', icon: 'cart-arrow-up', category: 'services' },
      { id: 'w5', name: '1-Year Warranty', icon: 'certificate', category: 'services' },
      { id: 'w6', name: '0 Deduction Exchange', icon: 'swap-horizontal', category: 'services' },
      { id: 'w7', name: 'Chat Support', icon: 'message-outline', category: 'services' },
      { id: 'w8', name: 'Easy To Install', icon: 'tools', category: 'services' },
      { id: 'w9', name: 'Brand Warranty', icon: 'certificate', category: 'services' },
      { id: 'w10', name: 'Replacement Warranty', icon: 'cart-arrow-down', category: 'services' },
    ],
  },
];

export default function TrustBadgesScreen({ onBack }: { onBack: () => void }) {
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(
    new Set(['b3', 'b1', 'b2', 'd5']) // Default: 100% Original, Assured Quality, Made In India, Timely Delivery
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showRecommended, setShowRecommended] = useState(true);
  const [selectedServiceTab, setSelectedServiceTab] = useState<string>('guarantee');

  const getSelectedBadgesList = () => {
    const allBadges = badgeCategories.flatMap((cat) => cat.badges);
    return allBadges.filter((badge) => selectedBadges.has(badge.id));
  };

  const handleBadgeToggle = (badgeId: string) => {
    setSelectedBadges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(badgeId)) {
        newSet.delete(badgeId);
      } else {
        newSet.add(badgeId);
      }
      return newSet;
    });
  };

  const handleOpenCategoryModal = () => {
    setShowCategoryModal(true);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setShowBadgeModal(true);
    if (category.id === 'brand' || category.id === 'delivery' || category.id === 'security') {
      setShowRecommended(true);
    } else {
      setShowRecommended(false);
    }
    if (category.id === 'services') {
      setSelectedServiceTab('guarantee');
    }
  };

  const handleSave = () => {
    Alert.alert('Success', 'Trust badges updated successfully!', [{ text: 'OK' }]);
  };

  const renderBadgeIcon = (badge: Badge, isModal: boolean = false) => {
    const iconSize = isModal ? 28 : 32;
    const iconColor = '#222';

    if (badge.name === '100% Original' || badge.name === '100% Authentic') {
      return (
        <View style={styles.customBadgeIcon}>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
          </View>
          <Text style={styles.customBadgeText}>ORIGINAL</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
          </View>
        </View>
      );
    }
    if (badge.name === 'Made In India') {
      return (
        <View style={styles.customBadgeIcon}>
          <Text style={styles.customBadgeText}>MADE IN INDIA</Text>
        </View>
      );
    }
    if (badge.name === '925 Sterling Silver') {
      return (
        <View style={styles.customBadgeIcon}>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
          </View>
          <View style={styles.sterlingContainer}>
            <Text style={styles.sterlingText}>925</Text>
            <Text style={styles.sterlingText}>STERLING</Text>
            <Text style={styles.sterlingText}>SILVER</Text>
          </View>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
          </View>
        </View>
      );
    }
    if (badge.name === 'WHO GMP Certified') {
      return (
        <View style={styles.customBadgeIcon}>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
          </View>
          <Text style={styles.customBadgeText}>GMP</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
            <Text style={styles.stars}>★</Text>
          </View>
        </View>
      );
    }
    if (badge.name === 'Assured Quality') {
      return (
        <View style={styles.ribbonIcon}>
          <MaterialCommunityIcons name="check" size={20} color="#1a1a1a" />
        </View>
      );
    }
    if (badge.name === 'Timely Delivery') {
      return <MaterialCommunityIcons name="scooter" size={iconSize} color={iconColor} />;
    }
    if (badge.name === '1-Year Warranty') {
      return (
        <View style={styles.customBadgeIcon}>
          <Text style={styles.customBadgeText}>1 YEAR</Text>
        </View>
      );
    }
    return (
      <MaterialCommunityIcons
        name={badge.icon as any}
        size={iconSize}
        color={iconColor}
        style={styles.badgeIcon}
      />
    );
  };

  const getFilteredBadges = () => {
    if (!selectedCategory) return [];
    let badges = [...selectedCategory.badges];

    if (selectedCategory.id === 'services') {
      if (selectedServiceTab === 'guarantee') {
        badges = badges.filter(
          (b) =>
            b.name.includes('Guarantee') ||
            b.name.includes('Buyback') ||
            b.name === 'Lifetime Exchange' ||
            b.name === 'Free Installation' ||
            b.name === 'On-Time Support' ||
            b.name === 'Chat Support' ||
            b.name === 'Easy To Install'
        );
      } else if (selectedServiceTab === 'warranty') {
        badges = badges.filter(
          (b) =>
            b.name.includes('Warranty') ||
            b.name === 'Brand Warranty' ||
            b.name === 'Replacement Warranty' ||
            b.name === '1-Year Warranty'
        );
      } else if (selectedServiceTab === 'exchange') {
        badges = badges.filter(
          (b) =>
            b.name.includes('Exchange') ||
            b.name === 'Replacement Warranty' ||
            b.name.includes('0 Deduction') ||
            b.name === 'Lifetime Exchange'
        );
      }
    }

    if (showRecommended) {
      if (
        selectedCategory.id === 'brand' ||
        selectedCategory.id === 'delivery' ||
        selectedCategory.id === 'security'
      ) {
        badges = badges.filter((b) => b.recommended);
      }
    }

    return badges;
  };

  const filteredBadges = getFilteredBadges();
  const selectedBadgesList = getSelectedBadgesList();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trust Badges</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>Update trust badges to earn</Text>
        <Text style={styles.mainTitle}>customer trust</Text>
        <Text style={styles.subtitle}>We have populated recommended badges for you</Text>

        <View style={styles.badgesGrid}>
          {selectedBadgesList.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={styles.badgeCard}
              onPress={handleOpenCategoryModal}
            >
              {renderBadgeIcon(badge)}
                <Text style={styles.badgeName}>{badge.name}</Text>
            </TouchableOpacity>
          ))}
              </View>

        <Text style={styles.editHint}>Tap on a badge to edit</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Badge Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {badgeCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(category)}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#e61580" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Badge Selection Modal */}
      <Modal
        visible={showBadgeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowBadgeModal(false)}
          />
          <View style={styles.badgeModalContent}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowBadgeModal(false);
                  setSelectedCategory(null);
                  setShowCategoryModal(true);
                }}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedCategory?.name}</Text>
              {selectedCategory?.id !== 'services' &&
                selectedCategory?.id !== 'certifications' && (
                  <TouchableOpacity
                    onPress={() => setShowRecommended(!showRecommended)}
                    style={[
                      styles.recommendedButton,
                      showRecommended && styles.recommendedButtonActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="star"
                      size={14}
                      color={showRecommended ? '#fff' : '#FFB800'}
                    />
                    <Text
                      style={[
                        styles.recommendedButtonText,
                        showRecommended && styles.recommendedButtonTextActive,
                      ]}
                    >
                      Recommended
                    </Text>
                  </TouchableOpacity>
                )}
              {(selectedCategory?.id === 'services' ||
                selectedCategory?.id === 'certifications') && (
                <View style={{ width: 100 }} />
              )}
            </View>

            {selectedCategory?.id === 'services' && (
              <View style={styles.serviceTabsContainer}>
                <TouchableOpacity
                  style={[
                    styles.serviceTab,
                    selectedServiceTab === 'guarantee' && styles.serviceTabActive,
                  ]}
                  onPress={() => setSelectedServiceTab('guarantee')}
                >
                  <Text
                    style={[
                      styles.serviceTabText,
                      selectedServiceTab === 'guarantee' && styles.serviceTabTextActive,
                    ]}
                  >
                    Guarantee
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.serviceTab,
                    selectedServiceTab === 'warranty' && styles.serviceTabActive,
                  ]}
                  onPress={() => setSelectedServiceTab('warranty')}
                >
                  <Text
                    style={[
                      styles.serviceTabText,
                      selectedServiceTab === 'warranty' && styles.serviceTabTextActive,
                    ]}
                  >
                    Warranty
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.serviceTab,
                    selectedServiceTab === 'exchange' && styles.serviceTabActive,
                  ]}
                  onPress={() => setSelectedServiceTab('exchange')}
                >
                  <Text
                    style={[
                      styles.serviceTabText,
                      selectedServiceTab === 'exchange' && styles.serviceTabTextActive,
                    ]}
                  >
                    Exchange
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              style={styles.badgeScrollView}
              contentContainerStyle={styles.badgeScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.badgesGridModal}>
                {filteredBadges.length > 0 ? (
                  filteredBadges.map((badge) => {
                    const isSelected = selectedBadges.has(badge.id);
                    const isRecommended = badge.recommended;
                    return (
                      <TouchableOpacity
                        key={badge.id}
                        style={[
                          styles.badgeCardModal,
                          isSelected && styles.badgeCardSelected,
                        ]}
                        onPress={() => handleBadgeToggle(badge.id)}
                        activeOpacity={0.7}
                      >
                        {isRecommended && (
                          <View style={styles.recommendedStar}>
                            <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
                          </View>
                        )}
                        {renderBadgeIcon(badge, true)}
                        <Text
                          style={[
                            styles.badgeNameModal,
                            isSelected && styles.badgeNameSelected,
                          ]}
                          numberOfLines={2}
                        >
                          {badge.name}
            </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyBadgesContainer}>
                    <Text style={styles.emptyBadgesText}>No badges available</Text>
          </View>
                )}
        </View>
      </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 20,
  },
  editHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgeCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  badgeIcon: {
    marginBottom: 8,
  },
  customBadgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    paddingVertical: 6,
  },
  customBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  stars: {
    fontSize: 8,
    color: '#fff',
    marginHorizontal: 2,
  },
  sterlingContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sterlingText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 10,
  },
  ribbonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#222',
  },
  badgeName: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#e61580',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 8,
  },
  badgeModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 8,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginLeft: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  categoryName: {
    fontSize: 16,
    color: '#222',
  },
  recommendedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  recommendedButtonActive: {
    backgroundColor: '#FFB800',
    borderColor: '#FFB800',
  },
  recommendedButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  recommendedButtonTextActive: {
    color: '#fff',
  },
  serviceTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
    backgroundColor: '#fff',
  },
  serviceTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  serviceTabActive: {
    borderBottomColor: '#e61580',
  },
  serviceTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  serviceTabTextActive: {
    color: '#e61580',
    fontWeight: '600',
  },
  badgeScrollView: {
    flex: 1,
  },
  badgeScrollContent: {
    paddingBottom: 20,
  },
  badgesGridModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  badgeCardModal: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  badgeCardSelected: {
    backgroundColor: '#fff5f8',
    borderColor: '#e61580',
    borderWidth: 2,
  },
  recommendedStar: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 1,
  },
  badgeNameModal: {
    fontSize: 11,
    color: '#222',
    textAlign: 'center',
    marginTop: 6,
  },
  badgeNameSelected: {
    color: '#e61580',
    fontWeight: '600',
  },
  emptyBadgesContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadgesText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
});
