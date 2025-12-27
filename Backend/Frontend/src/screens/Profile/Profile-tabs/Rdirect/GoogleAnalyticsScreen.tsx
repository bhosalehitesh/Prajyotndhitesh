import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function GoogleAnalyticsScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff5f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Google Analytics</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Google Analytics Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.gaIcon}>
              <View style={styles.gaBar1} />
              <View style={styles.gaBar2} />
              <View style={styles.gaBar3} />
              <View style={styles.gaDot} />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.desc}>
            Understand your sales patterns, customer behaviour and more with Google Analytics.
          </Text>

          {/* How to get started link */}
          <TouchableOpacity style={styles.getStartedLink}>
            <Text style={styles.getStartedText}>How to get started</Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  gaIcon: {
    width: 80,
    height: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gaBar1: {
    width: 12,
    height: 30,
    backgroundColor: '#FF9500',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  gaBar2: {
    width: 12,
    height: 45,
    backgroundColor: '#FFC107',
    borderRadius: 2,
    position: 'absolute',
    left: 18,
    bottom: 0,
  },
  gaBar3: {
    width: 12,
    height: 20,
    backgroundColor: '#FFEB3B',
    borderRadius: 2,
    position: 'absolute',
    left: 36,
    bottom: 0,
  },
  gaDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FF9500',
    borderRadius: 4,
    position: 'absolute',
    left: -4,
    top: 10,
  },
  desc: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  getStartedLink: {
    marginBottom: 32,
  },
  getStartedText: {
    fontSize: 15,
    color: '#e61580',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#e61580',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

