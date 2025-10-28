import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const handleMenuAction = (action: string) => {
    console.log('Menu action:', action);
    // Handle different menu actions
  };

  const handleLogout = () => {
    console.log('Logout');
    // Handle logout logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>U</Text>
          </View>
          <Text style={styles.userName}>User Name</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Business Name</Text>
            <Text style={styles.infoValue}>Your Business LLC</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>October 2024</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>Active</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('personal_info')}>
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('business_info')}>
            <Text style={styles.menuItemText}>Business Information</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('documents')}>
            <Text style={styles.menuItemText}>Documents</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('notifications')}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('security')}>
            <Text style={styles.menuItemText}>Security</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('help')}>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('contact')}>
            <Text style={styles.menuItemText}>Contact Support</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuAction('feedback')}>
            <Text style={styles.menuItemText}>Send Feedback</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
  },
  profileInfo: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusActive: {
    color: '#34C759',
  },
  menuSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#666666',
  },
  supportSection: {
    padding: 20,
    paddingTop: 0,
  },
  logoutSection: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
