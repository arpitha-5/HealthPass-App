import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

// Suppress non-critical warnings
if (typeof global !== 'undefined' && global.LogBox) {
  try {
    global.LogBox.ignoreLogs([
      'SafeAreaView has been deprecated',
      'No native ExponentConstants module found',
      'No native ExpoFirebaseCore module found',
      'Non-serializable values were found in the navigation state',
    ]);
  } catch (e) {
    // Silently fail if LogBox isn't available
  }
}

if (__DEV__) {
  console.log('🚀 HealthPass App Starting');
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}