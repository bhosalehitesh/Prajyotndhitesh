import React, { useState, useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import IconSymbol from './src/components/IconSymbol';

// Import authentication
import { AuthProvider, useAuth } from './src/authentication/AuthContext';
import UnifiedAuthScreen from './src/authentication/UnifiedAuthScreen';
import OnboardingFlow from './src/authentication/onboarding/OnboardingFlow';
import { storage } from './src/authentication/storage';

// Import screens from organized folders
import HomeScreen from './src/screens/Home/HomeScreen';
import OrdersScreen from './src/screens/Orders/OrdersScreen';
import CatalogScreen from './src/screens/Catalog/CatalogScreen';
import AnalyticsScreen from './src/screens/Analytics/AnalyticsScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import ProductsScreen from './src/screens/Catalog/products/ProductsScreen';
import AddProductScreen from './src/screens/Catalog/products/AddProductScreen';
import CategoriesScreen from './src/screens/Catalog/categories/CategoriesScreen';
import AddCategoryScreen from './src/screens/Catalog/categories/AddCategoryScreen';
import CollectionsScreen from './src/screens/Catalog/collections/CollectionsScreen';
import AddCollectionScreen from './src/screens/Catalog/collections/AddCollectionScreen';
import SelectProductsScreen from './src/screens/Catalog/collections/SelectProductsScreen';
import StoreAppearanceScreen from './src/screens/StoreAppearance/StoreAppearanceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Catalog Stack Navigator
function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CatalogMain" component={CatalogScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
      <Stack.Screen name="EditCategory" component={AddCategoryScreen} />
      <Stack.Screen name="Collections" component={CollectionsScreen} />
      <Stack.Screen name="AddCollection" component={AddCollectionScreen} />
      <Stack.Screen name="EditCollection" component={AddCollectionScreen} />
      <Stack.Screen name="SelectProducts" component={SelectProductsScreen} />
    </Stack.Navigator>
  );
}

// Screen components are now imported from organized folders

// Custom Tab Bar Component
function CustomTabBar({state, descriptors, navigation}: any) {
  return (
    <View style={styles.bottomTabBar}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIcon = (routeName: string, isFocused: boolean) => {
          // Icons are black for inactive, solid black for active Catalog
          const iconColor = '#000000';
          
          switch (routeName) {
            case 'Home':
              return (
                <IconSymbol 
                  name="home-outline" 
                  size={24} 
                  color={iconColor} 
                />
              );
            case 'Orders':
              return (
                <IconSymbol 
                  name="folder-outline" 
                  size={24} 
                  color={iconColor} 
                />
              );
            case 'Catalog':
              return (
                <IconSymbol 
                  name={isFocused ? "grid" : "grid-outline"} 
                  size={24} 
                  color={iconColor} 
                />
              );
            case 'Analytics':
              return (
                <IconSymbol 
                  name="stats-chart-outline" 
                  size={24} 
                  color={iconColor} 
                />
              );
            case 'Profile':
              return (
                <IconSymbol 
                  name="menu-outline" 
                  size={24} 
                  color={iconColor} 
                />
              );
            default:
              return (
                <IconSymbol 
                  name="ellipse-outline" 
                  size={24} 
                  color={iconColor} 
                />
              );
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}>
            {getIcon(route.name, isFocused)}
            <Text style={[styles.tabLabel, isFocused && styles.focusedTabLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main Stack Navigator (includes tabs + modal screens)
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="StoreAppearance" component={StoreAppearanceScreen} />
    </Stack.Navigator>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel: 'Home'}} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{tabBarLabel: 'My Orders'}} />
      <Tab.Screen name="Catalog" component={CatalogStack} options={{tabBarLabel: 'Catalog'}} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{tabBarLabel: 'Analytics'}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel: 'Profile'}} />
    </Tab.Navigator>
  );
}

// App Content Component (wrapped with AuthProvider)
function AppContent(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(!isAuthenticated);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // If user is already authenticated (e.g., returning session), decide whether to show onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (isAuthenticated && !showAuth) {
        const completed = await storage.getItem('onboardingCompleted');
        setShowOnboarding(completed !== 'true');
      }
    };
    checkOnboarding();
  }, [isAuthenticated, showAuth]);

  // Show auth screen if not authenticated
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || showAuth) {
    return (
      <UnifiedAuthScreen
        onAuthenticated={async () => {
          // After successful auth, decide whether to show onboarding
          const completed = await storage.getItem('onboardingCompleted');
          if (completed !== 'true') {
            setShowOnboarding(true);
          }
          setShowAuth(false);
        }}
      />
    );
  }

  // Show onboarding flow if pending
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#333333',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF4FA',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff5f8',
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
    height: 60,
    paddingTop: 5,
    paddingBottom: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  // House Icon
  houseIcon: {
    width: 18,
    height: 14,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    position: 'relative',
  },
  houseRoof: {
    position: 'absolute',
    top: -6,
    left: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopWidth: 0,
  },
  houseDoor: {
    position: 'absolute',
    bottom: 0,
    left: 6,
    width: 6,
    height: 8,
  },
  // Box Icon
  boxIcon: {
    width: 16,
    height: 12,
    borderWidth: 1.5,
    position: 'relative',
  },
  boxArrow: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomWidth: 0,
  },
  // Grid Icon
  gridIcon: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    margin: 1,
  },
  // Chart Icon
  chartIcon: {
    width: 18,
    height: 12,
    borderWidth: 1.5,
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 14,
    height: 0,
    borderTopWidth: 1.5,
    borderTopColor: 'transparent',
  },
  // Menu Icon
  menuIcon: {
    width: 18,
    height: 12,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  // Default Icon
  defaultIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  tabLabel: {
    fontSize: 11,
    color: '#000000',
    marginTop: 4,
    fontWeight: '400',
  },
  focusedTabLabel: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default App;
