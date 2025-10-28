import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import IconSymbol from '../../../components/IconSymbol';

interface ProductsScreenProps {
  navigation: any;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({navigation}) => {
  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
    console.log('Navigate to Add Product screen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <IconSymbol name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products"
            placeholderTextColor="#999999"
          />
        </View>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.filterButton}>
            <IconSymbol name="filter" size={20} color="#333333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.filterButton, styles.sortButton]}>
            <IconSymbol name="swap-vertical" size={20} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Empty State */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No products in your catalog</Text>
          <Text style={styles.emptySubtitle}>
            Start here by adding products you want to sell in your website
          </Text>
          <Text style={styles.emptyExample}>eg. Water bottle, Soap</Text>
        </View>

        {/* Add Product Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 30,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sortButton: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
  },
  emptyExample: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductsScreen;
