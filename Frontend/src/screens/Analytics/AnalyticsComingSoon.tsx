/**
 * Analytics Coming Soon Screen
 * Placeholder for Analytics feature (v2)
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import IconSymbol from '../../components/IconSymbol';

const AnalyticsComingSoon: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol name="stats-chart-outline" size={64} color="#e61580" />
          </View>
        </View>

        <Text style={styles.title}>Analytics Coming Soon</Text>
        
        <Text style={styles.subtitle}>
          We're working on powerful analytics features to help you track your store's performance.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Sales Analytics</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Order Insights</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Customer Analytics</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Product Performance</Text>
          </View>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.featureText}>Revenue Reports</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <IconSymbol name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            This feature will be available in the next update. Stay tuned!
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
    marginBottom: 12,
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

export default AnalyticsComingSoon;

