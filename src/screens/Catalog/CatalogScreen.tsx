import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';

interface CatalogScreenProps {
  navigation: any;
}

const CatalogScreen: React.FC<CatalogScreenProps> = ({navigation}) => {
  const handleNavigation = (screen: string) => {
    if (screen === 'Products' || screen === 'Categories' || screen === 'Collections') {
      navigation.navigate(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  const handleFloatingAction = () => {
    // Handle floating action button
    console.log('Floating action button pressed');
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
              <IconSymbol name="bag" size={20} color="#6B7280" />
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
              <IconSymbol name="tag" size={20} color="#6B7280" />
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
              <IconSymbol name="folder" size={20} color="#6B7280" />
            </View>
            <Text style={styles.optionText}>Collections</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleFloatingAction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E3A8A',
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
    borderBottomColor: '#F3F4F6',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#1E3A8A',
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
});

export default CatalogScreen;
