// CORRECTED: LoginScreen.js - Navigation & Theme Best Practices

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, firebaseConfig } from '../firebase/firebaseConfig';

// ===== ADMIN CREDENTIALS =====
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@123',
};

const LoginScreen = ({ navigation }) => {
  // Ensure navigation prop is available
  if (!navigation) {
    console.error('[ERROR] Navigation prop missing from LoginScreen');
    return null;
  }

  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    const checkRecaptcha = setTimeout(() => {
      if (recaptchaVerifier.current) {
        setRecaptchaReady(true);
      }
    }, 500);
    return () => clearTimeout(checkRecaptcha);
  }, []);

  // ===== EMAIL LOGIN =====
  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email login successful:', result.user.email);
      Alert.alert('Success', 'Logged in successfully!');
      
      // ✅ CORRECT: Navigate to Dashboard with params
      navigation.replace('Dashboard', {
        fullName: result.user.displayName || 'User',
        email: result.user.email,
        language: 'en',
      });
    } catch (error) {
      console.error('❌ Email login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== PHONE OTP LOGIN =====
  const handlePhoneOTPLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!recaptchaVerifier.current) {
      Alert.alert('Error', 'reCAPTCHA is initializing. Please wait and try again.');
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifier.current
      );

      Alert.alert('Success', 'OTP sent to your mobile number');
      
      // ✅ CORRECT: Navigate to OTP screen with confirmation
      navigation.navigate('Otp', {
        phoneNumber: fullPhoneNumber,
        mode: 'login',
        confirmation,
      });
    } catch (error) {
      console.error('❌ Phone OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== ADMIN LOGIN =====
  const handleAdminLogin = async () => {
    if (!adminUsername.trim() || !adminPassword.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      // Verify credentials against constants
      if (
        adminUsername === ADMIN_CREDENTIALS.username &&
        adminPassword === ADMIN_CREDENTIALS.password
      ) {
        console.log('✅ Admin login successful');
        Alert.alert('Success', 'Admin login successful!');
        
        // ✅ CORRECT: Navigate to Dashboard with admin=true flag
        navigation.replace('Dashboard', {
          fullName: 'Admin',
          email: 'admin@healthpass.local',
          isAdmin: true,
        });
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== GOOGLE LOGIN (Placeholder) =====
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // For React Native, you would need @react-native-google-signin/google-signin
      Alert.alert(
        'Google Sign-In',
        'Google authentication integration. Please install @react-native-google-signin/google-signin package and configure Google Cloud Console credentials.',
      );
    } catch (error) {
      console.error('❌ Google login error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Login form content here */}
          <Text style={styles.title}>Welcome to HealthPass</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Email Login Section */}
          {loginMethod === 'email' && (
            <View style={styles.formSection}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Admin Login Section */}
          {loginMethod === 'admin' && (
            <View style={styles.formSection}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={adminUsername}
                onChangeText={setAdminUsername}
                editable={!loading}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry={!showAdminPassword}
                editable={!loading}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleAdminLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Admin Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Phone OTP Section */}
          {loginMethod === 'phone' && (
            <View style={styles.formSection}>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Mobile Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="numeric"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handlePhoneOTPLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Login Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'email' && styles.methodButtonActive,
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Text style={styles.methodButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'phone' && styles.methodButtonActive,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text style={styles.methodButtonText}>OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'admin' && styles.methodButtonActive,
              ]}
              onPress={() => setLoginMethod('admin')}
            >
              <Text style={styles.methodButtonText}>Admin</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>
              Don't have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 32,
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1E293B',
  },
  loginButton: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  methodButtonActive: {
    backgroundColor: '#0D9488',
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  signupLink: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
  },
  signupLinkBold: {
    color: '#0D9488',
    fontWeight: '600',
  },
});

export default LoginScreen;

/**
 * KEY CORRECTIONS:
 *
 * ✅ Navigation Safety:
 *    - Check that navigation prop exists
 *    - Use navigation.replace() to navigate after successful login
 *    - Pass user data as route params: { fullName, email, language }
 *
 * ✅ Email Login:
 *    - Validates email format and password length
 *    - Navigates: navigation.replace('Dashboard', { fullName, email, language })
 *    - Shows appropriate error messages for different auth failures
 *
 * ✅ Phone OTP Login:
 *    - Validates phone number (10 digits)
 *    - Navigates: navigation.navigate('Otp', { phoneNumber, mode, confirmation })
 *    - Uses reCAPTCHA verification
 *
 * ✅ Admin Login:
 *    - Compares against ADMIN_CREDENTIALS
 *    - Navigates: navigation.replace('Dashboard', { fullName, email, isAdmin })
 *    - No Firebase dependency
 *
 * ✅ All navigation calls follow React Navigation v5+ best practices
 * ✅ Proper error handling with user-friendly messages
 * ✅ Loading state prevents double-submissions
 * ✅ Safe null checks on navigation prop
 */
