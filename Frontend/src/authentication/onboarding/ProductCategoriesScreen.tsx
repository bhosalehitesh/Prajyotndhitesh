import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductCategoriesScreenProps {
  onNext: (categories: string[]) => void;
  onBack?: () => void;
}

const PRODUCT_CATEGORIES = [
  'Appliances',
  'Baby',
  'Beauty and Personal Care',
  'Books and Stationery',
  'Clothing',
  'Electronics',
  'Food and Grocery',
  'Footwear',
  'Furniture',
  'General',
  'Health Supplements',
  'Home and Kitchen',
  'Home Care',
  'Jewelry',
  'Lawn and Garden',
  'Luggage and Bags',
  'Multipurpose',
  'Pet Products',
  'Sports and Fitness',
  'Toys and games',
  'Watches',
];

const ProductCategoriesScreen: React.FC<ProductCategoriesScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleNext = () => {
    onNext(selectedCategories);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="store" size={24} color="#1a1a1a" />
            <Text style={styles.logoText}>
              smart<Text style={styles.logoTextAccent}>biz</Text>
            </Text>
          </View>
          <View style={styles.headerLinks}>
            <TouchableOpacity style={styles.headerLink}>
              <MaterialCommunityIcons name="help-circle-outline" size={18} color="#007185" />
              <Text style={styles.headerLinkText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerLink}>
              <MaterialCommunityIcons name="logout" size={18} color="#007185" />
              <Text style={styles.headerLinkText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={20} color="#1a1a1a" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>What products do you offer?</Text>
          <Text style={styles.subtitle}>
            Select as many as you wish. Don't worry you can always edit this later
          </Text>

          <View style={styles.categoriesGrid}>
            {PRODUCT_CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                  ]}
                  onPress={() => toggleCategory(category)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Support */}
        <TouchableOpacity style={styles.chatButton}>
          <MaterialCommunityIcons name="message-text" size={24} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  logoTextAccent: {
    color: '#22b0a7',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  headerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLinkText: {
    fontSize: 14,
    color: '#007185',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    marginTop: 16,
    padding: Math.max(20, SCREEN_WIDTH * 0.05),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minHeight: 44,
    justifyContent: 'center',
  },
  categoryButtonSelected: {
    borderColor: '#007185',
    backgroundColor: '#e0f2f1',
  },
  categoryText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#007185',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#22b0a7',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#22b0a7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#035f6b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ProductCategoriesScreen;

