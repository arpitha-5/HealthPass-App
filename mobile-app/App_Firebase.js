import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './ErrorBoundary';

import RootNavigator from './navigation/AppNavigator_Firebase';

// Suppress non-related warnings
if (typeof global !== 'undefined' && global.LogBox) {
  try {
    global.LogBox.ignoreLogs([
      'SafeAreaView has been deprecated',
      'No native ExponentConstants module found',
      'No native ExpoFirebaseCore module found',
      'AsyncStorage has been extracted from react-native core',
      'ViewPropTypes will be removed from React Native',
    ]);
  } catch (e) {
    console.warn('LogBox not available');
  }
}

if (__DEV__) {
  console.log('🚀 HealthPass App Starting (Firebase Authentication Mode)');
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
