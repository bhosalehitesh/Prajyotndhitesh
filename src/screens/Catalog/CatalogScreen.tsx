import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Pressable,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';

interface CatalogScreenProps {
  navigation: any;
}

const CatalogScreen: React.FC<CatalogScreenProps> = ({navigation}) => {
  const [isFabExpanded, setIsFabExpanded] = useState(false);

  const handleNavigation = (screen: string) => {
    if (screen === 'Products' || screen === 'Categories' || screen === 'Collections') {
      navigation.navigate(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  const handleFloatingAction = () => {
    setIsFabExpanded(!isFabExpanded);
  };

  const handleFabOption = (option: string) => {
    setIsFabExpanded(false);
    if (option === 'Product') {
      navigation.navigate('AddProduct');
    } else if (option === 'Category') {
      navigation.navigate('AddCategory');
    } else if (option === 'Collection') {
      navigation.navigate('AddCollection');
    }
  };

  const handleBackdropPress = () => {
    setIsFabExpanded(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catalog</Text>
        <View style={styles.headerBackground}>
          {/* Background image placeholder */}
          <View style={styles.backgroundImage} />
        </View>
      </View>

      {/* Main Content Card */}
      <View style={styles.contentCard}>
        {/* Products Option */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => handleNavigation('Products')}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol name="bag" size={20} color="#6c757d" />
            </View>
            <Text style={styles.optionText}>Products</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Categories Option */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => handleNavigation('Categories')}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol name="tag" size={20} color="#6c757d" />
            </View>
            <Text style={styles.optionText}>Categories</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Collections Option */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => handleNavigation('Collections')}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol name="folder" size={20} color="#6c757d" />
            </View>
            <Text style={styles.optionText}>Collections</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Backdrop when FAB is expanded */}
      {isFabExpanded && (
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
      )}

      {/* Expanded FAB Options */}
      {isFabExpanded && (
        <View style={styles.fabOptionsContainer}>
          {/* Product Option - Top */}
          <TouchableOpacity
            style={[styles.fabOption, styles.fabOptionTop]}
            onPress={() => handleFabOption('Product')}>
            <View style={styles.fabOptionContent}>
              <IconSymbol name="bag" size={18} color="#4B5563" />
              <Text style={styles.fabOptionText}>Product</Text>
            </View>
          </TouchableOpacity>

          {/* Category Option - Middle */}
          <TouchableOpacity
            style={[styles.fabOption, styles.fabOptionMiddle]}
            onPress={() => handleFabOption('Category')}>
            <View style={styles.fabOptionContent}>
              <IconSymbol name="tag" size={18} color="#4B5563" />
              <Text style={styles.fabOptionText}>Category</Text>
            </View>
          </TouchableOpacity>

          {/* Collection Option - Bottom */}
          <TouchableOpacity
            style={[styles.fabOption, styles.fabOptionBottom]}
            onPress={() => handleFabOption('Collection')}>
            <View style={styles.fabOptionContent}>
              <IconSymbol name="folder" size={18} color="#4B5563" />
              <Text style={styles.fabOptionText}>Collection</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleFloatingAction}>
        <Text style={styles.fabText}>{isFabExpanded ? '✕' : '+'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#e61580',
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    zIndex: 2,
  },
  headerBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    opacity: 0.3,
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e61580',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  fabOptionsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 2,
    alignItems: 'flex-end',
  },
  fabOption: {
    width: 140,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabOptionTop: {
    marginBottom: 12,
  },
  fabOptionMiddle: {
    marginBottom: 12,
  },
  fabOptionBottom: {
    marginBottom: 0,
  },
  fabOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fabOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginLeft: 8,
  },
});

export default CatalogScreen;
