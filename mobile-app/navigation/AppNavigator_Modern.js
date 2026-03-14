/**
 * App Navigation Structure
 * Stack + Tab Navigation using React Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import Colors from '../theme/Colors';
import { Fonts } from '../theme/Typography';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen_Modern';
import LoginScreen from '../screens/LoginScreen_Modern';
import OTPScreen from '../screens/OTPScreen_Modern';
import SignupScreen from '../screens/SignupScreen_Modern';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen_Modern';
import DoctorListScreen from '../screens/DoctorListScreen_Modern';
import DoctorProfileScreen from '../screens/DoctorProfileScreen_Modern';
import AppointmentBookingScreen from '../screens/AppointmentBookingScreen_Modern';
import FamilySetupScreen from '../screens/FamilySetupScreen_Modern';
import InsuranceLinkingScreen from '../screens/InsuranceLinkingScreen_Modern';
import PlansScreen from '../screens/PlansScreen_Modern';
import PaymentScreen from '../screens/PaymentScreen_Modern';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen_Modern';
import ProfileScreen from '../screens/ProfileScreen_Modern';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icons
const TabIcon = ({ name, focused }) => {
  const iconMap = {
    Home: '🏠',
    Doctors: '👨‍⚕️',
    Appointments: '📅',
    Profile: '👤',
  };

  return (
    <Text
      style={{
        fontSize: 24,
        opacity: focused ? 1 : 0.5,
      }}
    >
      {iconMap[name]}
    </Text>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
      <Stack.Screen name="Insurance" component={InsuranceLinkingScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
};

// App Stack Navigator (Tab Navigation)
const AppStackNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingVertical: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 8,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
          elevation: 0,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          ...Fonts.h5,
          color: Colors.text.primary,
        },
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="HomeTab"
        component={DashboardStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Home" focused={focused} />
          ),
          headerShown: false,
        }}
      />

      {/* Doctors Tab */}
      <Tab.Screen
        name="DoctorsTab"
        component={DoctorsStackNavigator}
        options={{
          title: 'Doctors',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Doctors" focused={focused} />
          ),
          headerShown: false,
        }}
      />

      {/* Appointments Tab */}
      <Tab.Screen
        name="AppointmentsTab"
        component={AppointmentsStackNavigator}
        options={{
          title: 'Appointments',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Appointments" focused={focused} />
          ),
          headerShown: false,
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Profile" focused={focused} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Dashboard Stack
const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen
        name="AppointmentBooking"
        component={AppointmentBookingScreen}
      />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
};

// Doctors Stack
const DoctorsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="DoctorListMain" component={DoctorListScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen
        name="AppointmentBooking"
        component={AppointmentBookingScreen}
      />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
};

// Appointments Stack
const AppointmentsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="AppointmentsMain"
        component={DashboardScreen}
        options={{
          title: 'My Appointments',
        }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
      <Stack.Screen name="Insurance" component={InsuranceLinkingScreen} />
    </Stack.Navigator>
  );
};

// Root Navigator
export const RootNavigator = () => {
  // TODO: Replace with actual auth state from your context/redux
  const isAuthenticated = false; // Change based on actual auth state

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppStackNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
