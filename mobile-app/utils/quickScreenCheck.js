/**
 * HealthPass - Quick Screen Status Checker
 * 
 * Usage: Add to App.js and run the app
 * Shows which screens are properly imported
 * 
 * Instructions:
 * 1. Add this import to your App.js:
 *    import { checkScreensOnStartup } from './utils/quickScreenCheck';
 * 
 * 2. Call in App component:
 *    useEffect(() => {
 *      if (__DEV__) {
 *        checkScreensOnStartup();
 *      }
 *    }, []);
 * 
 * 3. Run: npx expo start -c
 * 4. Check console for results
 */

// Import all screens to check them
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OtpScreen from '../screens/OtpScreen';
import AccountSetupScreen from '../screens/AccountSetupScreen';
import ReferralLocationScreen from '../screens/ReferralLocationScreen';
import FamilySetupScreen from '../screens/FamilySetupScreen';
import InsuranceLinkingScreen from '../screens/InsuranceLinkingScreen';
import PlansScreen from '../screens/PlansScreen';
import PlanComparisonScreen from '../screens/PlanComparisonScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import BillingCycleScreen from '../screens/BillingCycleScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const SCREENS_TO_CHECK = {
  'WelcomeScreen': WelcomeScreen,
  'LoginScreen': LoginScreen,
  'SignupScreen': SignupScreen,
  'OtpScreen': OtpScreen,
  'AccountSetupScreen': AccountSetupScreen,
  'ReferralLocationScreen': ReferralLocationScreen,
  'FamilySetupScreen': FamilySetupScreen,
  'InsuranceLinkingScreen': InsuranceLinkingScreen,
  'PlansScreen': PlansScreen,
  'PlanComparisonScreen': PlanComparisonScreen,
  'PlanSelectionScreen': PlanSelectionScreen,
  'BillingCycleScreen': BillingCycleScreen,
  'CheckoutScreen': CheckoutScreen,
  'PaymentSuccessScreen': PaymentSuccessScreen,
  'DashboardScreen': DashboardScreen,
  'ProfileScreen': ProfileScreen,
};

/**
 * Performs quick status check on all imported screens
 * Displays results in console with color coding
 */
export const checkScreensOnStartup = () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🔍 HealthPass Screen Status Check                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let failureCount = 0;
  const failures = [];

  Object.entries(SCREENS_TO_CHECK).forEach(([screenName, screenComponent]) => {
    const isValid =
      screenComponent !== undefined &&
      screenComponent !== null &&
      (typeof screenComponent === 'function' ||
        typeof screenComponent?.default === 'function');

    if (isValid) {
      console.log(`✅ ${screenName.padEnd(30)} [Valid Component]`);
      successCount++;
    } else {
      console.log(`❌ ${screenName.padEnd(30)} [Error: ${typeof screenComponent}]`);
      failureCount++;
      failures.push(screenName);
    }
  });

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log(`║  📊 Results: ${successCount} valid / ${failureCount} failed`.padEnd(56) + '║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (failureCount > 0) {
    console.log('❌ FAILURES DETECTED:');
    failures.forEach((screenName) => {
      console.log(`  → ${screenName}`);
      console.log(`     Fix: Check ${screenName}.js has "export default ${screenName}";`);
    });
    console.log('\n⚠️  App may crash on navigation to these screens!\n');
  } else {
    console.log('✅ ALL SCREENS ARE VALID! App should work correctly.\n');
  }

  return {
    success: successCount,
    failed: failureCount,
    failures: failures,
    isReady: failureCount === 0,
  };
};

/**
 * Generates a report that can be logged to a service
 * Useful for monitoring app health in production
 */
export const generateScreenReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    screens: {},
  };

  Object.entries(SCREENS_TO_CHECK).forEach(([screenName, screenComponent]) => {
    report.screens[screenName] = {
      imported: screenComponent !== undefined,
      isFunction: typeof screenComponent === 'function',
      isValid:
        screenComponent !== undefined &&
        (typeof screenComponent === 'function' ||
          typeof screenComponent?.default === 'function'),
    };
  });

  return report;
};

/**
 * Get list of broken screens (if any)
 */
export const getBrokenScreens = () => {
  const broken = [];

  Object.entries(SCREENS_TO_CHECK).forEach(([screenName, screenComponent]) => {
    if (
      !screenComponent ||
      (typeof screenComponent !== 'function' &&
        typeof screenComponent?.default !== 'function')
    ) {
      broken.push(screenName);
    }
  });

  return broken;
};

console.log('✅ quickScreenCheck.js loaded');
