/**
 * Discount & Coupons Coming Soon Screen
 * Placeholder for Discount & Coupons feature
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import IconSymbol from '../../components/IconSymbol';

const DiscountCouponsComingSoon: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol name="tag" size={64} color="#e61580" />
          </View>
        </View>

        <Text style={styles.title}>Discounts & Coupons</Text>
        <Text style={styles.comingSoonBadge}>Coming Soon</Text>
        
        <Text style={styles.subtitle}>
          We're working on powerful discount and coupon management features to help you boost sales and attract more customers.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Create Custom Discount Codes</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Percentage & Fixed Amount Discounts</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Set Minimum Purchase Requirements</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Usage Limits & Expiry Dates</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Track Coupon Performance</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>First-Time & Repeat Customer Offers</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            This feature will be available in the next update. Stay tuned for exciting offers and discount management tools!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FBCFE8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonBadge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e61580',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default DiscountCouponsComingSoon;
