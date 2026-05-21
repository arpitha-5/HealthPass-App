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
import EditProfileScreen from '../screens/EditProfileScreen';

// New Healthcare Feature Screens
import DoctorListScreen from '../screens/DoctorListScreen';
import DoctorProfileScreen from '../screens/DoctorProfileScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import HospitalMapScreen from '../screens/HospitalMapScreen';
import HealthRecordsScreen from '../screens/HealthRecordsScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import LabTestsScreen from '../screens/LabTestsScreen';
import AISymptomCheckerScreen from '../screens/AISymptomCheckerScreen';
import MembershipScreen from '../screens/MembershipScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FamilyManagementScreen from '../screens/FamilyManagementScreen';

// New Feature Screens (UC01-UC21)
import WalletScreen from '../screens/WalletScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import InsuranceScreen from '../screens/InsuranceScreen';
import DiagnosticsScreen from '../screens/DiagnosticsScreen';
import SupportScreen from '../screens/SupportScreen';
import ReferralsScreen from '../screens/ReferralsScreen';
import BillsScreen from '../screens/BillsScreen';
import ChatScreen from '../screens/ChatScreen';
import AccountSuspensionScreen from '../screens/AccountSuspensionScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer
      onReady={() => console.log('✅ Navigation container is ready')}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
        initialRouteName="Welcome"
      >
        {/* Splash / Welcome Screen */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        {/* Auth Flow */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />

        {/* Onboarding Flow */}
        <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
        <Stack.Screen name="ReferralLocation" component={ReferralLocationScreen} />
        <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
        <Stack.Screen name="InsuranceLinking" component={InsuranceLinkingScreen} />
        <Stack.Screen name="AddFamilyMember" component={AddFamilyMemberScreen} />

        <Stack.Screen name="Plans" component={PlansScreen} />
        <Stack.Screen name="PlansScreen" component={PlansScreen} />
        <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
        <Stack.Screen name="PlanComparison" component={PlanComparisonScreen} />
        <Stack.Screen name="BillingCycle" component={BillingCycleScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Feature Specific Screens */}
        <Stack.Screen name="DoctorList" component={DoctorListScreen} />
        <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        
        <Stack.Screen name="HospitalMap" component={HospitalMapScreen} />
        <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
        <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
        <Stack.Screen name="LabTests" component={LabTestsScreen} />
        <Stack.Screen name="AISymptomChecker" component={AISymptomCheckerScreen} />
        <Stack.Screen name="Membership" component={MembershipScreen} />
        <Stack.Screen name="FamilyManagement" component={FamilyManagementScreen} />
        
        {/* New Feature Routes (UC01-UC21) */}
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Benefits" component={BenefitsScreen} />
        <Stack.Screen name="Insurance" component={InsuranceScreen} />
        <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Referrals" component={ReferralsScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="AccountSuspension" component={AccountSuspensionScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
