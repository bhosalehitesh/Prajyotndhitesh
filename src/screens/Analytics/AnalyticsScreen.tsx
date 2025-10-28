import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface AnalyticsScreenProps {
  navigation: any;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.screenText}>Analytics</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default AnalyticsScreen;
