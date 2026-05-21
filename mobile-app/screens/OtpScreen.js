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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/MedicalTheme';
import { authAPI } from '../services/apiService';
import { auth } from '../firebase/firebaseConfig';
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
      handleVerifyOTP(newOtp);
    }
  };

  const handleBackspace = (value, index) => {
    if (!value && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (currentOtp = null) => {
    // If currentOtp is a React event (from onPress), it won't be an array.
    const otpToVerify = (currentOtp && Array.isArray(currentOtp)) ? currentOtp : otp;
    const otpCode = otpToVerify.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '').slice(-10);
      
      const apiResponse = await authAPI.verifyOtp(cleanPhone, otpCode);
      const data = apiResponse?.data || apiResponse;

      const userData = {
        _id: data.userId || data.user?.id || data.user?._id,
        phoneNumber: phoneNumber,
        isProfileComplete: data.isProfileComplete !== undefined ? data.isProfileComplete : (data.user?.isProfileComplete !== undefined ? data.user.isProfileComplete : false),
        role: data.role || data.user?.role,
      };

      await login(userData, data.accessToken || data.token);

      const nextScreen = userData.isProfileComplete ? 'Dashboard' : 'AccountSetup';
      
      navigation.reset({
        index: 0,
        routes: [{
          name: nextScreen,
          params: nextScreen === 'AccountSetup' ? { phoneNumber, userData } : undefined,
        }],
      });
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      const errorMessage = error.response?.data?.message || 'The OTP is invalid or expired. Please try again.';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(30);
    setHasResendExpired(false);
    otpInputRefs.current[0]?.focus();

    try {
      // Simulate Resend (aligned with simulation in Login/Signup)
      Alert.alert('OTP Resent', 'A new verification code has been sent to your mobile number.');
    } catch (error) {
      console.error('OTP resend error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const formatPhoneNumber = (phone) => {
    if (phone.length >= 13) {
      return phone.slice(0, -4) + 'XXXX';
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color={colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="shield-lock" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              6-digit code sent to {'\n'}
              <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
            </Text>
          </View>

          {/* OTP Input Container */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpInputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                keyboardType="number-pad"
                maxLength={1}
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
                selectionColor={colors.primary}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={() => handleVerifyOTP()}
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

          {/* Resend OTP Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {hasResendExpired ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>Resend in {timer}s</Text>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Don't share your OTP with anyone. HealthPass will never ask for it.
            </Text>
          </View>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },

  otpInput: {
    width: 50,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.borderColor,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
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
    marginBottom: spacing.xl,
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

  resendContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },

  resendText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },

  resendLink: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },

  resendTimer: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },

  infoIcon: {
    fontSize: 16,
  },

  infoText: {
    flex: 1,
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default OtpScreen;
