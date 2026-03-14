import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

import AppNavigator from './navigation/AppNavigator';

// Optional: Import screen validator for development debugging
// Uncomment the next line and useEffect below to enable automatic screen validation
// import { checkScreenExports } from './utils/screenValidator';

// Safely suppress non-critical warnings
if (typeof global !== 'undefined' && global.LogBox) {
  try {
    global.LogBox.ignoreLogs([
      'SafeAreaView has been deprecated',
      'No native ExponentConstants module found',
      'No native ExpoFirebaseCore module found',
    ]);
  } catch (e) {
    // Silently fail if LogBox isn't available
  }
}

if (__DEV__) {
  console.log('🚀 HealthPass App Starting in Development Mode (MongoDB Backend)');
  console.log('📱 Expo SDK: 54+');
  console.log('✅ React Navigation: @react-navigation/native-stack');
}

export default function App() {
  // Optional: Enable screen validation on app start
  // Uncomment the useEffect below and the import at the top to use
  /*
  useEffect(() => {
    if (__DEV__) {
      console.log('\n🔍 Running automatic screen validation...\n');
      checkScreenExports()
        .then((results) => {
          const validCount = Object.values(results).filter((s) => s === 'VALID').length;
          const totalCount = Object.keys(results).length;
          console.log(`\n✅ Screen validation complete: ${validCount}/${totalCount} screens valid\n`);
        })
        .catch((error) => {
          console.error('❌ Screen validation failed:', error);
        });
    }
  }, []);
  */

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
