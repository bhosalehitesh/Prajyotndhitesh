import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AuthProvider, useAuth } from './Frontend/src/authentication/AuthContext';
import AuthScreen from './Frontend/src/authentication/AuthScreen';
import { storage, AUTH_TOKEN_KEY } from './Frontend/src/authentication/storage';
import OnboardingFlow from './Frontend/src/authentication/onboarding/OnboardingFlow';

// Import screens from organized folders
import HomeScreen from './Frontend/src/screens/Home/HomeScreen';
import OrdersScreen from './Frontend/src/screens/Orders/OrdersScreen';
import CatalogScreen from './Frontend/src/screens/Catalog/CatalogScreen';
import AnalyticsScreen from './Frontend/src/screens/Analytics/AnalyticsScreen';
import ProfileScreen from './Frontend/src/screens/Profile/ProfileScreen';
import ProductsScreen from './Frontend/src/screens/Catalog/products/ProductsScreen';
import AddProductScreen from './Frontend/src/screens/Catalog/products/AddProductScreen';
import CategoriesScreen from './Frontend/src/screens/Catalog/categories/CategoriesScreen';
import AddCategoryScreen from './Frontend/src/screens/Catalog/categories/AddCategoryScreen';
import CollectionsScreen from './Frontend/src/screens/Catalog/collections/CollectionsScreen';
import AddCollectionScreen from './Frontend/src/screens/Catalog/collections/AddCollectionScreen';
import SelectProductsScreen from './Frontend/src/screens/Catalog/collections/SelectProductsScreen';
import StoreAppearanceScreen from './Frontend/src/screens/StoreAppearance/StoreAppearanceScreen';

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
  // Safety check for navigation object
  if (!navigation || typeof navigation.navigate !== 'function') {
    return null;
  }

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
          try {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && (!event || !event.defaultPrevented)) {
              navigation.navigate(route.name);
            }
          } catch (error) {
            console.error('Navigation error:', error);
          }
        };

        const getIcon = (routeName: string, isFocused: boolean) => {
          // Icons are white for active, light gray for inactive on dark background
          const iconColor = isFocused ? '#FFFFFF' : '#D0D0D0';
          
          switch (routeName) {
            case 'Home':
              return (
                <View style={styles.iconContainer}>
                  <View style={[styles.houseIcon, {borderColor: iconColor}]}>
                    <View style={[styles.houseRoof, {borderColor: iconColor}]} />
                    <View style={[styles.houseDoor, {backgroundColor: iconColor}]} />
                  </View>
                </View>
              );
            case 'Orders':
              return (
                <View style={styles.iconContainer}>
                  <View style={[styles.boxIcon, {borderColor: iconColor}]}>
                    <View style={[styles.boxArrow, {borderColor: iconColor}]} />
                  </View>
                </View>
              );
            case 'Catalog':
              return (
                <View style={styles.iconContainer}>
                  <View style={styles.gridIcon}>
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                    <View style={[styles.gridDot, {backgroundColor: iconColor}]} />
                  </View>
                </View>
              );
            case 'Analytics':
              return (
                <View style={styles.iconContainer}>
                  <View style={[styles.chartIcon, {borderColor: iconColor}]}>
                    <View style={[styles.chartLine, {borderColor: iconColor}]} />
                  </View>
                </View>
              );
            case 'Profile':
              return (
                <View style={styles.iconContainer}>
                  <View style={styles.menuIcon}>
                    <View style={[styles.menuLine, {backgroundColor: iconColor}]} />
                    <View style={[styles.menuLine, {backgroundColor: iconColor}]} />
                    <View style={[styles.menuLine, {backgroundColor: iconColor}]} />
                  </View>
                </View>
              );
            default:
              return (
                <View style={styles.iconContainer}>
                  <View style={[styles.defaultIcon, {backgroundColor: iconColor}]} />
                </View>
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

// Wrapper component that handles authentication state
function AppContent() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = React.useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [initialLoadTimeout, setInitialLoadTimeout] = React.useState(false);

  // Add timeout to prevent infinite loading - reduced to 3 seconds
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading || isCheckingOnboarding) {
        if (__DEV__) {
          console.warn('App loading timeout - forcing render');
        }
        setInitialLoadTimeout(true);
        setIsCheckingOnboarding(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, isCheckingOnboarding]);

  React.useEffect(() => {
    checkOnboardingStatus();
  }, [isAuthenticated]);

  const checkOnboardingStatus = async () => {
    if (!isAuthenticated) {
      setIsCheckingOnboarding(false);
      setIsOnboardingComplete(false);
      return;
    }
    try {
      const onboardingCompleted = await storage.getItem('onboardingCompleted');
      setIsOnboardingComplete(onboardingCompleted === 'true');
      setError(null);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setError('Failed to check onboarding status');
      setIsOnboardingComplete(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const handleAuthenticated = async () => {
    try {
      // Token is already saved by SignInScreen/SignUpScreen
      // Just trigger auth state update by checking storage
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await login(token);
      } else {
        console.error('No token found after authentication');
        setError('Authentication failed - no token found');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setError('Authentication failed');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Ensure onboarding is marked as complete in storage
      await storage.setItem('onboardingCompleted', 'true');
      setIsOnboardingComplete(true);
      setError(null);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding');
    }
  };

  // Show error if any
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            checkOnboardingStatus();
          }}
          style={{ padding: 10, backgroundColor: '#007185', borderRadius: 8 }}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Force render if timeout reached
  if (initialLoadTimeout && (isLoading || isCheckingOnboarding)) {
    console.warn('Timeout reached - showing auth screen');
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (isLoading || (isAuthenticated && isCheckingOnboarding)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#17aba5" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}

function App(): JSX.Element {

  const [hasError, setHasError] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState<string>('');

  // Wrap in error boundary
  React.useEffect(() => {
    const errorHandler = (error: Error) => {
      console.error('App Error:', error);
      setHasError(true);
      setErrorInfo(error.message || 'Unknown error');
    };

    const originalError = console.error;
    console.error = (...args) => {
      originalError(...args);
      if (args[0] instanceof Error) {
        errorHandler(args[0]);
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Show error screen if something crashed
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>App Error</Text>
        <Text style={{ color: 'red', marginBottom: 20, textAlign: 'center' }}>{errorInfo}</Text>
        <TouchableOpacity
          onPress={() => {
            setHasError(false);
            setErrorInfo('');
          }}
          style={{ padding: 10, backgroundColor: '#007185', borderRadius: 8 }}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  try {
    return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    );
  } catch (error: any) {
    console.error('App initialization error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>Initialization Error</Text>
        <Text style={{ color: 'red', marginBottom: 20, textAlign: 'center' }}>{error?.message || String(error)}</Text>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 10 }}>Check Metro logs for details</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#e61580',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
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
    color: '#D0D0D0',
    marginTop: 4,
    fontWeight: '400',
  },
  focusedTabLabel: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
});

export default App;
