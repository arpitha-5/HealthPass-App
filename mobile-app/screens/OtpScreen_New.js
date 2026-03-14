import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/MedicalTheme';
import { authAPI } from '../services/apiService';
import { auth, firebaseConfig } from '../firebase/firebaseConfig';
import { clearPhoneAuthSession, getPhoneAuthSession, setPhoneAuthSession } from '../services/phoneAuthSession';
import { AuthContext } from '../context/AuthContext';

const OtpScreen = ({ route, navigation }) => {
  const phoneNumber = route?.params?.phoneNumber || '+91 XXXXXXXXXX';
  const flowMode = route?.params?.mode || 'login';
  const suppliedName = route?.params?.name || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [hasResendExpired, setHasResendExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpInputRefs = useRef([]);
  const recaptchaVerifier = useRef(null);
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (!getPhoneAuthSession()) {
      Alert.alert('Session expired', 'Please request a new OTP.');
      navigation.replace(flowMode === 'signup' ? 'Signup' : 'Login');
    }
  }, [flowMode, navigation]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !hasResendExpired) {
      setHasResendExpired(true);
    }
    return () => clearInterval(interval);
  }, [timer, hasResendExpired]);

  const handleOtpChange = (value, index) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (numericValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && numericValue) {
      handleVerifyOTP();
    }
  };

  const handleBackspace = (value, index) => {
    if (!value && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const session = getPhoneAuthSession();

      if (!session?.confirmation) {
        throw new Error('OTP session expired. Please request a new code.');
      }

      let userCredential = null;
      
      try {
        userCredential = await session.confirmation.confirm(otpCode);
      } catch (firebaseError) {
        console.error('❌ Firebase verification error:', firebaseError);
        throw new Error('Invalid OTP. Please try again.');
      }

      const firebaseToken = await userCredential.user.getIdToken();

      if (flowMode === 'signup') {
        const signupData = {
          name: suppliedName,
          phone: phoneNumber.replace(/\D/g, ''),
          firebaseToken,
        };

        const signupResponse = await authAPI.signup(signupData);
        
        login({
          ...signupResponse,
          firebaseToken,
        });

        Alert.alert('Success', 'Account created successfully!');
        clearPhoneAuthSession();
        navigation.replace('Dashboard');
      } else {
        const loginResponse = await authAPI.login({
          phone: phoneNumber,
          firebaseToken,
        });

        login({
          ...loginResponse,
          firebaseToken,
        });

        Alert.alert('Success', 'Logged in successfully!');
        clearPhoneAuthSession();
        navigation.replace('Dashboard');
      }
    } catch (error) {
      console.error('❌ OTP Verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setHasResendExpired(false);
      const session = getPhoneAuthSession();

      if (!session?.confirmation || !recaptchaVerifier.current) {
        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier.current
        );
        setPhoneAuthSession({ confirmation, phoneNumber, mode: flowMode });
      }

      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
      Alert.alert('Success', 'OTP resent to your phone number');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerEmoji}>🔐</Text>
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to {'\n'}
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <View style={styles.otpInputsWrapper}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      handleBackspace(digit, index);
                    }
                  }}
                  editable={!loading}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.verifyButtonText}>Verifying...</Text>
                </>
              ) : (
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Timer & Resend */}
          <View style={styles.timerSection}>
            {!hasResendExpired ? (
              <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Didn't receive the code? Check your SMS or SPAM folder
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },

  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },

  headerEmoji: {
    fontSize: 44,
  },

  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  phoneNumber: {
    fontWeight: '600',
    color: colors.primary,
  },

  otpContainer: {
    marginBottom: spacing.xxxl,
  },

  otpInputsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  otpInput: {
    width: 50,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderColor,
    backgroundColor: colors.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textPrimary,
    ...shadows.sm,
  },

  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },

  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    ...shadows.md,
  },

  verifyButtonDisabled: {
    opacity: 0.7,
  },

  verifyButtonText: {
    color: colors.white,
    fontSize: typography.button.fontSize,
    fontWeight: '600',
  },

  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  timerText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },

  resendLink: {
    fontSize: typography.body.fontSize,
    color: colors.primary,
    fontWeight: '600',
  },

  helpText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OtpScreen;
