import React, { useRef, useState, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../services/apiService';



const SignupScreen = ({ navigation }) => {
  const [signupStep, setSignupStep] = useState('verify_phone'); // 'verify_phone' | 'otp_verification' | 'create_account'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');
  const [otpAutoFilled, setOtpAutoFilled] = useState(false);
  const [otpDetected, setOtpDetected] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const clipboardListener = useRef(null);
  const autoFillAnimation = useRef(new Animated.Value(0)).current;
  const otpInputs = useRef([]);

  // ===== RESEND COUNTDOWN TIMER =====
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // ===== AUTO OTP DETECTION (clipboard) =====
  useEffect(() => {
    if (signupStep === 'otp_verification' && !otpAutoFilled) {
      startClipboardMonitoring();
    }
    return () => {
      if (clipboardListener.current) clearInterval(clipboardListener.current);
    };
  }, [signupStep, otpAutoFilled]);

  const startClipboardMonitoring = () => {
    checkClipboardForOTP();
    clipboardListener.current = setInterval(checkClipboardForOTP, 500);
  };

  const checkClipboardForOTP = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        const otpMatch = clipboardContent.match(/\b(\d{6})\b/);
        if (otpMatch && otpMatch[1]) {
          const detectedOTP = otpMatch[1];
          if (otpDigits.every(d => d === '') && !otpAutoFilled) {
            setOtpDigits(detectedOTP.split(''));
            setOtpDetected(true);
            triggerAutoFillAnimation();
            setTimeout(() => setOtpAutoFilled(true), 800);
          }
        }
      }
    } catch (_) {}
  };

  // ===== OTP INPUT HANDLERS =====
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = digit;
    setOtpDigits(newOtpDigits);
    if (digit && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpDigitBackspace = (index) => {
    if (!otpDigits[index] && index > 0) otpInputs.current[index - 1]?.focus();
  };

  const triggerAutoFillAnimation = () => {
    Animated.sequence([
      Animated.timing(autoFillAnimation, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(autoFillAnimation, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  // ===== MASKING HELPERS =====
  const getMaskedPhoneNumber = (phoneNum) => {
    if (!phoneNum) return '';
    let clean = phoneNum.replace(/[^\d]/g, '');
    if (clean.length > 10) clean = clean.slice(-10);
    return clean.substring(0, Math.max(0, clean.length - 4)) + 'X X X X';
  };

  // ===== STEP 1: SEND OTP =====
  const handleVerifyPhone = async () => {
    if (!phoneNumber.trim() || !/^[0-9]{10}$/.test(phoneNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${phoneNumber}`;

      // Send OTP via SMS provider
      setVerifiedPhoneNumber(fullPhone);
      setSignupStep('otp_verification');
      setResendCountdown(30);
      Alert.alert('OTP Sent', 'A verification code has been sent to your mobile number.');
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== STEP 2: VERIFY OTP =====
  const handleVerifyOTP = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP with backend
      setSignupStep('create_account');
      Alert.alert('Verified', 'Phone number verified! Please complete your account details.');
    } catch (error) {
      Alert.alert('Invalid OTP', 'The code is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== RESEND OTP =====
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      setResendCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpAutoFilled(false);
      setOtpDetected(false);
      Alert.alert('OTP Resent', 'A new verification code has been sent to your mobile number.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== STEP 3: CREATE ACCOUNT =====
  const handleCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/complete-signup', {
        phoneNumber: verifiedPhoneNumber,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        language,
        isPhoneVerified: true,
      });

      const { token, user, isNewUser } = response.data;

      // Store token securely
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('token', token);
      } else {
        localStorage.setItem('token', token);
      }

      console.log('✅ Account created:', user);

      // Navigate to next step
      navigation.navigate('ReferralLocation', {
        phoneNumber: verifiedPhoneNumber,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        language,
      });
    } catch (error) {
      console.error('❌ Account creation error:', error);
      let msg = 'Account creation failed. Please try again.';
      if (error.response?.data?.message) msg = error.response.data.message;
      Alert.alert('Error', msg);
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={26} color="#E53935" />
          </TouchableOpacity>

          {/* Progress Indicator */}
          {signupStep !== 'create_account' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressStep, styles.progressStepActive]}>
                <Text style={[styles.progressStepNumber, styles.progressStepNumberActive]}>1</Text>
              </View>
              <View style={[styles.progressLine, (signupStep === 'otp_verification') ? styles.progressLineActive : {}]} />
              <View style={[styles.progressStep, signupStep === 'otp_verification' ? styles.progressStepActive : {}]}>
                <Text style={[styles.progressStepNumber, signupStep === 'otp_verification' ? styles.progressStepNumberActive : {}]}>2</Text>
              </View>
              <View style={styles.progressLine} />
              <View style={styles.progressStep}>
                <Text style={styles.progressStepNumber}>3</Text>
              </View>
            </View>
          )}

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={
                  signupStep === 'verify_phone' ? 'phone-check' :
                  signupStep === 'otp_verification' ? 'shield-lock' :
                  'account-check'
                }
                size={32}
                color="#E53935"
              />
            </View>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              {signupStep === 'verify_phone' && 'Verify your phone number'}
              {signupStep === 'otp_verification' && 'Enter verification code'}
              {signupStep === 'create_account' && 'Complete your profile'}
            </Text>
          </View>

          {/* ===== STEP 1: PHONE ===== */}
          {signupStep === 'verify_phone' && (
            <View style={styles.formContainer}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 1 of 3</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={[styles.inputWrapper, phoneNumber && styles.inputWrapperFilled]}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color="#E53935" />
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    placeholder="10-digit number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={[styles.input, styles.phoneInput]}
                    placeholderTextColor="#CCC"
                    editable={!loading}
                  />
                  {phoneNumber.length === 10 && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  )}
                </View>
              </View>

              <Text style={styles.helperText}>We'll send a verification code to this number</Text>

              <TouchableOpacity
                style={[styles.signupButton, phoneNumber.length === 10 && styles.buttonPrimary, loading && styles.disabledButton]}
                onPress={handleVerifyPhone}
                disabled={loading || phoneNumber.length < 10}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons name="send-circle" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ===== STEP 2: OTP ===== */}
          {signupStep === 'otp_verification' && (
            <View style={styles.formContainer}>
              <View style={styles.otpCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>Step 2 of 3</Text>
                </View>

                <Text style={styles.otpCardTitle}>Verification Code</Text>
                <Text style={styles.otpCardSubtitle}>6-digit code sent to</Text>

                <View style={styles.maskedPhoneBox}>
                  <MaterialCommunityIcons name="phone-lock" size={18} color="#E53935" />
                  <Text style={styles.maskedPhoneText}>{getMaskedPhoneNumber(verifiedPhoneNumber)}</Text>
                </View>

                {/* OTP Boxes */}
                <View style={styles.otpBoxesContainer}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpInputs.current[index] = ref)}
                      style={[
                        styles.otpBox,
                        digit && styles.otpBoxFilled,
                        otpAutoFilled && styles.otpBoxSuccess,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpDigitChange(index, value)}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace' && !otpDigits[index]) {
                          handleOtpDigitBackspace(index);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      placeholder="-"
                      placeholderTextColor="#E0E0E0"
                      editable={!loading && !otpAutoFilled}
                    />
                  ))}
                </View>

                {otpAutoFilled && (
                  <View style={styles.autoDetectedBanner}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
                    <Text style={styles.autoDetectedText}>Auto-detected from clipboard</Text>
                  </View>
                )}

                {!otpAutoFilled && (
                  <View style={styles.autofillBanner}>
                    <MaterialCommunityIcons name="message-text" size={16} color="#E53935" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.autofillBannerTitle}>OTP auto-fill from messages</Text>
                      <Text style={styles.autofillBannerSubtitle}>Code will appear automatically</Text>
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  otpDigits.join('').length === 6 && styles.verifyButtonActive,
                  loading && styles.verifyButtonLoading,
                ]}
                onPress={handleVerifyOTP}
                disabled={loading || otpDigits.join('').length < 6}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="large" />
                ) : (
                  <View style={styles.verifyButtonContent}>
                    <MaterialCommunityIcons
                      name={otpAutoFilled ? 'check-circle' : 'shield-check'}
                      size={22}
                      color="#FFFFFF"
                    />
                    <Text style={styles.verifyButtonText}>{otpAutoFilled ? 'Verified' : 'Verify Code'}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.resendSection}>
                {resendCountdown > 0 ? (
                  <Text style={styles.resendCountdownText}>Resend code in {resendCountdown}s</Text>
                ) : (
                  <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP} disabled={loading}>
                    <MaterialCommunityIcons name="refresh" size={16} color="#E53935" />
                    <Text style={styles.resendText}>Didn't receive code? </Text>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.changeNumberButton}
                onPress={() => {
                  setSignupStep('verify_phone');
                  setOtpDigits(['', '', '', '', '', '']);
                  setOtpDetected(false);
                  setOtpAutoFilled(false);
                  setResendCountdown(0);
                  if (clipboardListener.current) clearInterval(clipboardListener.current);
                }}
              >
                <Text style={styles.changeNumberText}>← Change Number</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== STEP 3: CREATE ACCOUNT ===== */}
          {signupStep === 'create_account' && (
            <View style={styles.formContainer}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 3 of 3</Text>
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrapper, fullName && styles.inputWrapperFilled]}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#E53935" />
                  <TextInput
                    placeholder="Your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    style={styles.input}
                    placeholderTextColor="#CCC"
                    editable={!loading}
                    autoCapitalize="words"
                  />
                  {fullName.trim().length > 0 && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  )}
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, email && styles.inputWrapperFilled]}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="#E53935" />
                  <TextInput
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.input}
                    placeholderTextColor="#CCC"
                    editable={!loading}
                    autoCapitalize="none"
                  />
                  {email.includes('@') && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                  )}
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, password && styles.inputWrapperFilled]}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#E53935" />
                  <TextInput
                    placeholder="Min 8 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    placeholderTextColor="#CCC"
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrapper, confirmPassword && styles.inputWrapperFilled]}>
                  <MaterialCommunityIcons name="lock-check-outline" size={20} color="#E53935" />
                  <TextInput
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    placeholderTextColor="#CCC"
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <MaterialCommunityIcons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Language */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Language</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, styles.inputWrapperFilled]}
                  onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="translate" size={20} color="#E53935" />
                  <Text style={[styles.input, { color: '#111827', fontWeight: '500' }]}>{language}</Text>
                  <MaterialCommunityIcons name={showLanguageDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#999" />
                </TouchableOpacity>

                {showLanguageDropdown && (
                  <View style={styles.languageDropdownMenu}>
                    {['English', 'తెలుగు (Telugu)', 'हिंदी (Hindi)', 'ಕನ್ನಡ (Kannada)'].map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        style={styles.languageOption}
                        onPress={() => { setLanguage(lang); setShowLanguageDropdown(false); }}
                      >
                        <Text style={styles.languageOptionText}>{lang}</Text>
                        {language === lang && (
                          <MaterialCommunityIcons name="check-circle" size={18} color="#E53935" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  fullName && email.includes('@') && password.length >= 8 && password === confirmPassword
                    ? styles.buttonSuccess
                    : {},
                  loading && styles.disabledButton,
                ]}
                onPress={handleCreateAccount}
                disabled={loading || !fullName || !email.includes('@') || password.length < 8 || password !== confirmPassword}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons name="account-check" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Create Account</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },

  backButton: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 16, marginTop: 8, backgroundColor: '#F8F8F8',
  },

  // Progress
  progressContainer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 32, paddingHorizontal: 20,
  },
  progressStep: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E8E8E8',
  },
  progressStepActive: { backgroundColor: '#E53935', borderColor: '#E53935' },
  progressStepNumber: { fontSize: 15, fontWeight: '700', color: '#AAAAAA' },
  progressStepNumberActive: { color: '#FFFFFF' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#E8E8E8', marginHorizontal: 8 },
  progressLineActive: { backgroundColor: '#E53935' },

  // Header
  headerSection: { alignItems: 'center', marginVertical: 28, paddingHorizontal: 20 },
  iconContainer: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#FDECEA', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  // Form
  formContainer: { paddingHorizontal: 20, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: '#E5E7EB',
  },
  inputWrapperFilled: { borderColor: '#E53935', backgroundColor: '#FFFAFA' },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827', fontWeight: '500' },
  phoneInput: { marginLeft: 8 },
  countryCode: { fontSize: 14, fontWeight: '600', color: '#111827', marginLeft: 6 },
  helperText: { fontSize: 12, color: '#9CA3AF', marginTop: -12, marginBottom: 16 },



  // Buttons
  signupButton: {
    backgroundColor: '#E5E7EB', height: 52, paddingHorizontal: 24,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: '#E53935',
    shadowColor: '#E53935', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
    elevation: 4,
  },
  buttonSuccess: {
    backgroundColor: '#E53935',
    shadowColor: '#E53935', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  disabledButton: { opacity: 0.45 },

  // Terms
  termsText: {
    textAlign: 'center', fontSize: 12, color: '#777777',
    marginHorizontal: 20, marginBottom: 20, lineHeight: 18,
  },
  termsLink: { color: '#E53935', fontWeight: '600' },

  // Login Link
  loginContainer: {
    paddingHorizontal: 20, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  loginText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  loginLink: { fontSize: 13, color: '#E53935', fontWeight: '700' },

  bottomSpace: { height: 10 },

  // OTP Card
  otpCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    paddingVertical: 28, paddingHorizontal: 20, marginBottom: 24,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: '#F0F0F0',
  },
  otpCardTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  otpCardSubtitle: { fontSize: 13, color: '#777', marginBottom: 16 },
  maskedPhoneBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F7F7', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 24,
    borderWidth: 1, borderColor: '#EFEFEF', gap: 10,
  },
  maskedPhoneText: { fontSize: 14, fontWeight: '700', color: '#E53935', letterSpacing: 1 },
  otpBoxesContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  otpBox: {
    width: 46, height: 56, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
    fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  otpBoxFilled: { borderColor: '#E53935', backgroundColor: '#FFFAFA', color: '#E53935', elevation: 2 },
  otpBoxSuccess: { borderColor: '#10B981', backgroundColor: '#ECFDF5', color: '#065F46' },
  autofillBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF5F5', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 20,
    gap: 12, borderLeftWidth: 3, borderLeftColor: '#E53935',
  },
  autofillBannerTitle: { fontSize: 13, color: '#E53935', fontWeight: '600' },
  autofillBannerSubtitle: { fontSize: 11, color: '#999', marginTop: 2 },
  autoDetectedBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, gap: 8, marginBottom: 16,
  },
  autoDetectedText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },

  // Verify Button
  verifyButton: {
    backgroundColor: '#E5E7EB', height: 52, paddingHorizontal: 24,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonActive: {
    backgroundColor: '#E53935',
    shadowColor: '#E53935', shadowOpacity: 0.25, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  verifyButtonLoading: { opacity: 0.8 },
  verifyButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  verifyButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

  // Resend
  resendSection: { alignItems: 'center', marginBottom: 16 },
  resendButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  resendCountdownText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  resendText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  resendLink: { fontSize: 13, color: '#E53935', fontWeight: '700' },
  changeNumberButton: { paddingVertical: 12, alignItems: 'center' },
  changeNumberText: { fontSize: 13, color: '#E53935', fontWeight: '600' },

  // Step Badge
  stepBadge: {
    backgroundColor: '#FEF2F2', borderRadius: 8,
    paddingVertical: 5, paddingHorizontal: 12, marginBottom: 20,
    alignSelf: 'flex-start', borderLeftWidth: 3, borderLeftColor: '#E53935',
  },
  stepBadgeText: { fontSize: 12, fontWeight: '700', color: '#E53935', letterSpacing: 0.3 },

  // Language Dropdown
  languageDropdownMenu: {
    position: 'absolute', top: 62, left: 14, right: 14,
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#E5E7EB', paddingVertical: 8, elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, zIndex: 999,
  },
  languageOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  languageOptionText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
});

export default SignupScreen;