import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

// Firebase Auth
import { onAuthStateChange, getCachedUser } from '../services/firebaseAuthService';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen_Firebase';
import LoginScreen from '../screens/LoginScreen_Firebase';
import OtpScreen from '../screens/OtpScreen_Firebase';
import DashboardScreen from '../screens/DashboardScreen_Firebase';

const Stack = createNativeStackNavigator();

// Loading Screen Component
const LoadingScreen = () => (
  <LinearGradient
    colors={['#1e3a8a', '#3b82f6', '#06b6d4']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
  >
    <ActivityIndicator size="large" color="#00ff88" />
  </LinearGradient>
);

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{
        animationEnabled: true,
      }}
    />
    <Stack.Screen
      name="Otp"
      component={OtpScreen}
      options={{
        animationEnabled: true,
      }}
    />
  </Stack.Navigator>
);

// App Navigator (Main App)
const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        animationEnabled: true,
      }}
    />
  </Stack.Navigator>
);

// Root Navigation Container
const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('🔐 Checking authentication state...');

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((authUser) => {
      console.log('👤 Auth state changed:', authUser ? 'User logged in' : 'User logged out');
      setUser(authUser);
      setIsLoading(false);
    });

    // Check for cached user data on app start
    const checkCachedUser = async () => {
      try {
        const cachedUser = await getCachedUser();
        if (cachedUser) {
          console.log('📦 Found cached user data');
          setUser(cachedUser);
        }
      } catch (error) {
        console.error('Error checking cached user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkCachedUser();

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  if (isLoading) {
    return (
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer
      onReady={() => console.log('✅ Navigation container is ready')}
      onStateChange={(state) => {
        if (state) {
          const currentRoute = state.routes[state.index].name;
          console.log(`📍 Navigation state changed to: ${currentRoute}`);
        }
      }}
    >
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
