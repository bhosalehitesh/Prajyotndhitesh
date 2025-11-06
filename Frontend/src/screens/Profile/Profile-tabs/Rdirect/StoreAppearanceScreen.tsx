import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function StoreAppearanceScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Website Appearance</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>
            Want to take more control of your store's appearance?
          </Text>
          <Text style={styles.infoCardText}>
            Unlock endless customization possibilities for your store with our Desktop Themes Editor.
            Edit layouts, widgets, images, and more!
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.sakhi.store/store-appearance')}>
            <Text style={styles.infoLink}>
              Visit sakhi.store/store-appearance for more!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Showcase Theme Section */}
        <View style={styles.themeCard}>
          <View style={styles.themeHeader}>
            <View style={styles.themeTitleContainer}>
              <Text style={styles.themeCardTitle}>Showcase</Text>
              <Text style={styles.themeCardSubtitle}>Suites All Categories</Text>
            </View>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT THEME</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewDemoLink}>
            <Text style={styles.viewDemoText}>View Demo Store</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#e61580" />
          </TouchableOpacity>

          {/* Theme Preview Image */}
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800' }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity style={styles.previewButton}>
            <Text style={styles.previewButtonText}>Preview Published Website</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoCard}>
          <Text style={styles.logoTitle}>Logo</Text>
          <Text style={styles.logoSubtitle}>Personalise your store's identity with your logo.</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <MaterialCommunityIcons name="plus" size={24} color="#e61580" />
            <Text style={styles.uploadButtonText}>Upload Logo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#e61580',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e4ec',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#ffffff',
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#B8E6D3',
    borderRadius: 12,
    padding: 18,
    margin: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoLink: {
    fontSize: 14,
    color: '#e61580',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  themeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginTop: 8,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  themeTitleContainer: {
    flex: 1,
  },
  themeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  themeCardSubtitle: {
    fontSize: 15,
    color: '#858997',
  },
  currentBadge: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewDemoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewDemoText: {
    fontSize: 16,
    color: '#e61580',
    fontWeight: '600',
    marginRight: 4,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5fa',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewButton: {
    borderWidth: 2,
    borderColor: '#4361ee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  logoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginTop: 8,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 15,
    color: '#858997',
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#e61580',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e61580',
    marginLeft: 8,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
  },
  saveButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

