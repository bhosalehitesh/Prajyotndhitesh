/**
 * Home Screen
 * 
 * Shopkeeper dashboard with profile, onboarding, features, and configuration.
 * Similar to Sakhi by Amazon style.
 * 
 * BACKEND INTEGRATION:
 * - Data fetching is handled by useHomeData hook
 * - Update mockData.ts or useHomeData.ts for backend integration
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import IconSymbol from '../../components/IconSymbol';
import {useHomeData} from './useHomeData';
import {OnboardingTask} from './types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {data, loading} = useHomeData();
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleTaskPress = (task: OnboardingTask) => {
    if (task.status === 'pending' && task.action) {
      navigation.navigate(task.action);
    }
  };

  const handleStoreLinkPress = () => {
    // Open store link
    const url = `https://${data.profile.storeLink}`;
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  const handleShareStoreLink = async () => {
    try {
      await Share.share({
        message: `Check out my store: ${data.profile.storeLink}`,
        title: 'My Store',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFeatureAction = (feature: typeof data.features[0]) => {
    if (feature.actionRoute) {
      navigation.navigate(feature.actionRoute);
    }
  };

  const handleConfigPress = (config: typeof data.storeConfiguration[0]) => {
    // Special handling for Collections - navigate to Catalog tab then Collections screen
    if (config.route === 'Collections') {
      navigation.navigate('Catalog', { screen: 'Collections' });
    } else {
      navigation.navigate(config.route);
    }
  };

  const handleHelpPress = (help: typeof data.helpOptions[0]) => {
    navigation.navigate(help.action);
  };

  const handleEditProfile = () => {
    // Navigate to Website Appearance / Store Appearance screen
    navigation.navigate('StoreAppearance');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section with Profile Card */}
        <View style={styles.headerSection}>
          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <IconSymbol name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Storefront Icon (Background) */}
          <View style={styles.storefrontIcon}>
            <IconSymbol name="storefront" size={80} color="rgba(255,255,255,0.2)" />
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {data.profile.avatarInitial || data.profile.name.charAt(0)}
                </Text>
              </View>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Welcome!</Text>

            {/* User Name */}
            <Text style={styles.userName}>{data.profile.name}</Text>

            {/* Store Link */}
            <View style={styles.storeLinkContainer}>
              <Text style={styles.storeLinkText}>{data.profile.storeLink}</Text>
              <TouchableOpacity
                style={styles.storeLinkIcon}
                onPress={handleStoreLinkPress}>
                <IconSymbol name="eye" size={18} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.storeLinkIcon}
                onPress={handleShareStoreLink}>
                <IconSymbol name="open-outline" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Onboarding Progress Section */}
        <View style={styles.onboardingCard}>
          <Text style={styles.onboardingTitle}>{data.onboardingProgress.message}</Text>
          <Text style={styles.onboardingSubtitle}>
            Complete the tasks to start accepting orders
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: data?.onboardingProgress?.percentage != null && !isNaN(data.onboardingProgress.percentage)
                    ? `${Math.max(0, Math.min(100, data.onboardingProgress.percentage))}%`
                    : '0%',
                },
              ]}
            />
          </View>

          {/* Tasks List */}
          <View style={styles.tasksList}>
            {data.tasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => handleTaskPress(task)}
                disabled={task.status === 'completed'}>
                <IconSymbol
                  name={task.icon}
                  size={20}
                  color={task.status === 'completed' ? '#10B981' : '#64748B'}
                />
                <Text
                  style={[
                    styles.taskText,
                    task.status === 'completed' && styles.taskTextCompleted,
                  ]}>
                  {task.title}
                </Text>
                {task.status === 'completed' ? (
                  <IconSymbol name="checkmark-circle" size={20} color="#10B981" />
                ) : (
                  <IconSymbol name="chevron-forward" size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sakhi Features Section */}
        {data.features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Explore Sakhi Features</Text>

            {/* Feature Card */}
            {data.features[currentFeatureIndex] && (
              <View style={styles.featureCard}>
                <View
                  style={[
                    styles.featureHeader,
                    data.features[currentFeatureIndex].backgroundColor
                      ? {
                          backgroundColor: data.features[currentFeatureIndex].backgroundColor,
                        }
                      : undefined,
                  ]}>
                  <Text style={styles.featureTitle}>
                    {data.features[currentFeatureIndex].title}
                  </Text>
                  {/* Placeholder for graphic/clipboard illustration */}
                  <View style={styles.featureGraphic} />
                </View>

                {data.features[currentFeatureIndex].badge && (
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureBadgeText}>
                      {data.features[currentFeatureIndex].badge}
                    </Text>
                  </View>
                )}

                <Text style={styles.featureDescription}>
                  {data.features[currentFeatureIndex].description}
                </Text>

                <TouchableOpacity
                  style={styles.featureActionButton}
                  onPress={() => handleFeatureAction(data.features[currentFeatureIndex])}>
                  <Text style={styles.featureActionText}>
                    {data.features[currentFeatureIndex].actionText} &gt;
                  </Text>
                </TouchableOpacity>

                {/* Carousel Dots */}
                {data.features.length > 1 && (
                  <View style={styles.carouselDots}>
                    {data.features.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          index === currentFeatureIndex && styles.dotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Store Configuration Section */}
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Store Configuration</Text>
          <View style={styles.configGrid}>
            {data.storeConfiguration.map(config => (
              <TouchableOpacity
                key={config.id}
                style={styles.configItem}
                onPress={() => handleConfigPress(config)}>
                <View style={styles.configIconContainer}>
                  <IconSymbol name={config.icon} size={28} color="#e61580" />
                </View>
                <Text style={styles.configItemText}>{config.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Need Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.helpGrid}>
            {data.helpOptions.map(help => (
              <TouchableOpacity
                key={help.id}
                style={styles.helpItem}
                onPress={() => handleHelpPress(help)}>
                <View style={styles.helpIconContainer}>
                  <IconSymbol name={help.icon} size={28} color="#e61580" />
                </View>
                <Text style={styles.helpItemText}>{help.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer Message */}
        <View style={styles.footer}>
          <Text style={styles.footerMessage}>
            Excited to see the magic you'll create
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    backgroundColor: '#e61580',
    paddingTop: 20,
    paddingBottom: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5, // For Android
  },
  storefrontIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    opacity: 0.3,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e61580',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  storeLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  storeLinkText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    textAlign: 'center',
  },
  storeLinkIcon: {
    marginLeft: 12,
    padding: 4,
  },
  onboardingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  onboardingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e61580',
    borderRadius: 4,
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  taskText: {
    fontSize: 16,
    color: '#64748B',
    flex: 1,
    marginLeft: 12,
  },
  taskTextCompleted: {
    color: '#10B981',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureHeader: {
    backgroundColor: '#e61580',
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureGraphic: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 60,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  featureBadge: {
    backgroundColor: '#FF6B35',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 12,
    marginLeft: 20,
  },
  featureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  featureActionButton: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  featureActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e61580',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    backgroundColor: '#FF6B35',
    width: 24,
  },
  configSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  configItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  configIconContainer: {
    marginBottom: 8,
  },
  configItemText: {
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '500',
  },
  helpSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  helpGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  helpItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpIconContainer: {
    marginBottom: 8,
  },
  helpItemText: {
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default HomeScreen;
