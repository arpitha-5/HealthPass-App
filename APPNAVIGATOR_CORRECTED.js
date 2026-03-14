import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OtpScreen from '../screens/OtpScreen';

// Onboarding Screens
import AccountSetupScreen from '../screens/AccountSetupScreen';
import ReferralLocationScreen from '../screens/ReferralLocationScreen';
import FamilySetupScreen from '../screens/FamilySetupScreen';
import InsuranceLinkingScreen from '../screens/InsuranceLinkingScreen';
import AddFamilyMemberScreen from '../screens/AddFamilyMemberScreen';

// Plan & Checkout Screens
import PlansScreen from '../screens/PlansScreen';
import PlanComparisonScreen from '../screens/PlanComparisonScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import BillingCycleScreen from '../screens/BillingCycleScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

// Main App Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  // Validation: Ensure critical screens imported successfully
  if (!WelcomeScreen || !LoginScreen || !SignupScreen) {
    console.error('[ERROR] One or more screens failed to import');
    return null;
  }

  try {
    return (
      <NavigationContainer
        onReady={() => console.log('✅ Navigation container is ready')}
        onStateChange={(state) => {
          if (state) {
            const currentRoute = state.routes[state.index].name;
            console.log(`📍 Navigated to: ${currentRoute}`);
          }
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'default',
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
          initialRouteName="Welcome"
        >
          {/* Splash / Welcome Screen */}
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ gestureEnabled: false }}
          />

          {/* Auth Flow */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
          />
          <Stack.Screen
            name="Otp"
            component={OtpScreen}
          />

          {/* Onboarding Flow */}
          <Stack.Screen
            name="AccountSetup"
            component={AccountSetupScreen}
          />
          <Stack.Screen
            name="ReferralLocation"
            component={ReferralLocationScreen}
          />
          <Stack.Screen
            name="FamilySetup"
            component={FamilySetupScreen}
          />
          <Stack.Screen
            name="InsuranceLinking"
            component={InsuranceLinkingScreen}
          />
          <Stack.Screen
            name="AddFamilyMember"
            component={AddFamilyMemberScreen}
          />

          {/* Plan Selection Flow */}
          <Stack.Screen
            name="Plans"
            component={PlansScreen}
          />
          <Stack.Screen
            name="PlanSelection"
            component={PlanSelectionScreen}
          />
          <Stack.Screen
            name="PlanComparison"
            component={PlanComparisonScreen}
          />
          <Stack.Screen
            name="BillingCycle"
            component={BillingCycleScreen}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
          />
          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccessScreen}
            options={{ gestureEnabled: false }}
          />

          {/* Main App Screens */}
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } catch (error) {
    console.error('[ERROR] AppNavigator rendering error:', error);
    return null;
  }
};

export default AppNavigator;
