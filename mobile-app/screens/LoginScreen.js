import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { setPhoneAuthSession } from '../services/phoneAuthSession';

// ===== ADMIN CREDENTIALS =====
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@123',
};

const LoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'phone', or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

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
      // Navigate to home/dashboard
      navigation.replace('Dashboard');
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

  // ===== GOOGLE LOGIN =====
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // For React Native, you would need @react-native-google-signin/google-signin
      // For now, showing the structure
      Alert.alert(
        'Google Sign-In',
        'Google authentication integration. Please install @react-native-google-signin/google-signin package and configure Google Cloud Console credentials.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Future: Implement actual Google Sign-In here
              console.log('Google Sign-In placeholder');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Google login error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
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

    setLoading(true);
    try {
      // Simulation of OTP sending (aligned with backend expectation of client-side verification)
      // and matching the 'Mock OTP service for development' requirement.
      const fullPhoneNumber = `+91${phoneNumber}`;
      
      // Set the session so OtpScreen doesn't reject us, marking it as mock
      setPhoneAuthSession({ 
        phoneNumber: fullPhoneNumber, 
        mode: 'login',
        isMock: true,
        confirmation: { confirm: async () => ({ user: { phoneNumber: fullPhoneNumber } }) } 
      });

      // Navigate to Otp screen
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'OTP sent to your mobile number');
        navigation.navigate('Otp', {
          phoneNumber: fullPhoneNumber,
          mode: 'login',
        });
      }, 800);
    } catch (error) {
      console.error('❌ Phone OTP error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
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
        // Navigate to Dashboard
        navigation.replace('Dashboard');
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

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color="#E53935" />
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={loginMethod === 'phone' ? 'phone-check' : 'login'}
                size={32}
                color="#E53935"
              />
            </View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Sign in to your account</Text>
          </View>

          {/* Login Method Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMethod === 'email' && styles.activeTab,
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <MaterialCommunityIcons
                name="email"
                size={18}
                color={loginMethod === 'email' ? '#FF6B6B' : '#999'}
              />
              <Text
                style={[
                  styles.tabText,
                  loginMethod === 'email' && styles.activeTabText,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                loginMethod === 'phone' && styles.activeTab,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <MaterialCommunityIcons
                name="phone"
                size={18}
                color={loginMethod === 'phone' ? '#FF6B6B' : '#999'}
              />
              <Text
                style={[
                  styles.tabText,
                  loginMethod === 'phone' && styles.activeTabText,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="email"
                    size={20}
                    color="#FF6B6B"
                  />
                  <TextInput
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.input}
                    placeholderTextColor="#999"
                    editable={!loading}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#FF6B6B"
                  />
                  <TextInput
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity style={styles.forgotLink}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Phone OTP Login Form */}
          {loginMethod === 'phone' && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.countryCode}>🇮🇳 +91</Text>
                  <TextInput
                    placeholder="Enter 10-digit mobile"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={[styles.input, styles.phoneInput]}
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>

              <Text style={styles.helperText}>
                We'll send you a one-time password to verify your account
              </Text>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handlePhoneOTPLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.googleButton, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create One</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Login Button */}
          <View style={styles.adminButtonContainer}>
            <TouchableOpacity
              style={styles.adminLoginButton}
              onPress={() => {
                setAdminUsername('');
                setAdminPassword('');
                setShowAdminPassword(false);
                setLoginMethod('admin_modal');
              }}
            >
              <MaterialCommunityIcons
                name="shield-account-outline"
                size={18}
                color="#FF6B6B"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.adminLoginButtonText}>Admin Login</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Login Form - Modal Style */}
          {loginMethod === 'admin_modal' && (
            <View style={styles.adminModalContainer}>
              {/* Admin Warning */}
              <View style={styles.adminWarning}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#FF6B6B"
                />
                <Text style={styles.adminWarningText}>
                  Restricted Admin Access
                </Text>
              </View>

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color="#FF6B6B"
                  />
                  <TextInput
                    placeholder="Enter admin username"
                    value={adminUsername}
                    onChangeText={setAdminUsername}
                    style={styles.input}
                    placeholderTextColor="#999"
                    editable={!loading}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Admin Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#FF6B6B"
                  />
                  <TextInput
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChangeText={setAdminPassword}
                    secureTextEntry={!showAdminPassword}
                    style={styles.input}
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowAdminPassword(!showAdminPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showAdminPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Admin Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleAdminLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLoginMethod('email')}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomSpace} />
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
    paddingBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: '#F8F8F8',
  },

  // ===== HEADER SECTION =====
  headerSection: {
    alignItems: 'center',
    marginVertical: 32,
    paddingHorizontal: 20,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerIcon: {
    fontSize: 36,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },

  // ===== TABS =====
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 6,
  },

  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
  },

  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '700',
  },

  // ===== FORM =====
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  adminWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    gap: 10,
  },

  adminWarningText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    flex: 1,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },



  phoneInput: {
    marginLeft: 8,
  },

  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: -12,
    marginBottom: 16,
  },

  forgotLink: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },

  forgotText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },

  // ===== BUTTONS =====
  loginButton: {
    backgroundColor: '#E53935',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#E53935',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.6,
  },

  // ===== DIVIDER =====
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },

  dividerText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    marginHorizontal: 12,
  },

  // ===== GOOGLE BUTTON =====
  googleButton: {
    marginHorizontal: 20,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 20,
  },

  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
    marginRight: 10,
  },

  googleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // ===== SIGNUP =====
  signupContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  signupText: {
    fontSize: 13,
    color: '#777777',
    fontWeight: '500',
  },

  signupLink: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '700',
  },

  // ===== ADMIN LOGIN =====
  adminButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  adminLoginButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FFD5D5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminLoginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
  },

  adminModalContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginTop: 12,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999999',
  },

  bottomSpace: {
    height: 10,
  },
});

export default LoginScreen;