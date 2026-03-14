/**
 * Screen Validator Utility
 * Detects undefined or improperly exported screens in the app
 * 
 * Usage: Import and call validateScreens() to check all screen imports
 */

// List of all screens that should be imported in AppNavigator
const EXPECTED_SCREENS = [
  'WelcomeScreen',
  'LoginScreen',
  'SignupScreen',
  'OtpScreen',
  'AccountSetupScreen',
  'ReferralLocationScreen',
  'FamilySetupScreen',
  'InsuranceLinkingScreen',
  'PlansScreen',
  'PlanComparisonScreen',
  'PlanSelectionScreen',
  'BillingCycleScreen',
  'CheckoutScreen',
  'PaymentSuccessScreen',
  'DashboardScreen',
  'ProfileScreen',
];

/**
 * Validate that all imported screens are properly defined
 * @param {Object} screenImports - Object containing all imported screens
 * @returns {Object} Validation result with status and details
 */
export const validateScreens = (screenImports) => {
  const result = {
    isValid: true,
    missingScreens: [],
    undefinedScreens: [],
    invalidScreens: [],
    allScreens: {},
  };

  EXPECTED_SCREENS.forEach((screenName) => {
    const screen = screenImports[screenName];

    if (!screen) {
      result.missingScreens.push(screenName);
      result.isValid = false;
    } else if (screen === undefined) {
      result.undefinedScreens.push(screenName);
      result.isValid = false;
    } else if (typeof screen !== 'function' && typeof screen?.default !== 'function') {
      result.invalidScreens.push({
        name: screenName,
        type: typeof screen,
        value: screen,
      });
      result.isValid = false;
    } else {
      result.allScreens[screenName] = '✅ Valid';
    }
  });

  // Log results
  console.log('📊 SCREEN VALIDATION REPORT:');
  console.log('================================');

  if (result.isValid) {
    console.log('✅ ALL SCREENS ARE VALID');
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('');

    if (result.missingScreens.length > 0) {
      console.log('🚨 Missing Screens (not imported):');
      result.missingScreens.forEach((screen) => {
        console.log(`   - ${screen}`);
      });
      console.log('');
    }

    if (result.undefinedScreens.length > 0) {
      console.log('🔴 Undefined Screens:');
      result.undefinedScreens.forEach((screen) => {
        console.log(`   - ${screen} = undefined`);
      });
      console.log('');
    }

    if (result.invalidScreens.length > 0) {
      console.log('🟠 Invalid Screen Exports:');
      result.invalidScreens.forEach((item) => {
        console.log(`   - ${item.name}: type="${item.type}" (expected function)`);
      });
      console.log('');
    }
  }

  console.log('Valid Screens:');
  Object.entries(result.allScreens).forEach(([name, status]) => {
    console.log(`   ${status} ${name}`);
  });

  console.log('================================');

  return result;
};

/**
 * Automatically check screen exports by importing screen files
 * This helps identify problems with default exports
 */
export const checkScreenExports = async () => {
  const screenFiles = {
    WelcomeScreen: () => import('../screens/WelcomeScreen'),
    LoginScreen: () => import('../screens/LoginScreen'),
    SignupScreen: () => import('../screens/SignupScreen'),
    OtpScreen: () => import('../screens/OtpScreen'),
    AccountSetupScreen: () => import('../screens/AccountSetupScreen'),
    ReferralLocationScreen: () => import('../screens/ReferralLocationScreen'),
    FamilySetupScreen: () => import('../screens/FamilySetupScreen'),
    InsuranceLinkingScreen: () => import('../screens/InsuranceLinkingScreen'),
    PlansScreen: () => import('../screens/PlansScreen'),
    PlanComparisonScreen: () => import('../screens/PlanComparisonScreen'),
    PlanSelectionScreen: () => import('../screens/PlanSelectionScreen'),
    BillingCycleScreen: () => import('../screens/BillingCycleScreen'),
    CheckoutScreen: () => import('../screens/CheckoutScreen'),
    PaymentSuccessScreen: () => import('../screens/PaymentSuccessScreen'),
    DashboardScreen: () => import('../screens/DashboardScreen'),
    ProfileScreen: () => import('../screens/ProfileScreen'),
  };

  console.log('🔍 Checking screen file exports...\n');

  const results = {};

  for (const [screenName, importFn] of Object.entries(screenFiles)) {
    try {
      const module = await importFn();
      const screenComponent = module.default;

      if (!screenComponent) {
        console.log(`❌ ${screenName}: No default export found`);
        results[screenName] = 'MISSING_DEFAULT_EXPORT';
      } else if (typeof screenComponent !== 'function') {
        console.log(`❌ ${screenName}: Exported value is not a function (${typeof screenComponent})`);
        results[screenName] = 'NOT_A_FUNCTION';
      } else {
        console.log(`✅ ${screenName}: Valid React component`);
        results[screenName] = 'VALID';
      }
    } catch (error) {
      console.log(`❌ ${screenName}: Failed to import - ${error.message}`);
      results[screenName] = 'IMPORT_ERROR';
    }
  }

  // Summary
  const valid = Object.values(results).filter((status) => status === 'VALID').length;
  const total = Object.keys(results).length;

  console.log(`\n📊 Summary: ${valid}/${total} screens are valid`);

  return results;
};

/**
 * Generate a template for a properly structured screen
 */
export const screenTemplate = `
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const YourScreenName = ({ navigation, route }) => {
  // Safely extract route parameters
  const params = route?.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Screen Name</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

// ✅ ALWAYS export as default
export default YourScreenName;
`;

console.log('✅ screenValidator.js loaded');
