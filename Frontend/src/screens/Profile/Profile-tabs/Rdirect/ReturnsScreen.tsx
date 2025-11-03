import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReturnSettingsScreen from './ReturnSettingsScreen';

interface ReturnsScreenProps {
  onBack: () => void;
}

export default function ReturnsScreen({ onBack }: ReturnsScreenProps) {
  const [showReturnSettings, setShowReturnSettings] = useState(false);

  if (showReturnSettings) {
    return <ReturnSettingsScreen onBack={() => setShowReturnSettings(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Returns</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Background Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>

        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <MaterialCommunityIcons name="party-popper" size={20} color="#ffc107" />
          <Text style={styles.promoText}>
            Stores that enable returns see a 12% boost in repeat purchases
          </Text>
        </View>

        {/* Features Card */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Here's what you can do with returns:</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>View and manage your return requests</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Notify customers about their returns</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Process refund pickups via Shiprocket</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Leverage Razorpay to issue refunds</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.comingSoonSection}>
            <MaterialCommunityIcons name="star" size={18} color="#17aba5" />
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>

          <View style={styles.comingSoonList}>
            <View style={styles.featureItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.comingSoonFeatureText}>
                Ask customers to upload photos while creating a return request
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.comingSoonFeatureText}>
                Set return eligibilities based on categories
              </Text>
            </View>
          </View>
        </View>

        {/* Enable Returns Button */}
        <TouchableOpacity
          style={styles.enableButton}
          onPress={() => setShowReturnSettings(true)}
        >
          <Text style={styles.enableButtonText}>Enable Returns on Store</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#1a237e',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginLeft: 12,
    flex: 1,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeb3b',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  promoText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#363740',
    marginBottom: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#363740',
    marginLeft: 12,
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e4ec',
    marginVertical: 16,
  },
  comingSoonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#17aba5',
    marginLeft: 6,
  },
  comingSoonList: {
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 20,
    color: '#888',
    marginRight: 8,
  },
  comingSoonFeatureText: {
    flex: 1,
    fontSize: 15,
    color: '#888',
    lineHeight: 22,
  },
  enableButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
