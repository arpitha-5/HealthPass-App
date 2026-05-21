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
import { authAPI } from '../services/apiService';
import { setPhoneAuthSession } from '../services/phoneAuthSession';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

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
      const fullPhoneNumber = `+91${phoneNumber}`;
      const response = await authAPI.sendOtp(phoneNumber, false);
      
      setPhoneAuthSession({ phoneNumber: fullPhoneNumber, mode: 'login' });

      setLoading(false);
      const otpMsg = response?.data?.otp ? ` (Internal Debug: ${response.data.otp})` : '';
      Alert.alert('Success', 'OTP sent to your mobile number.' + otpMsg);
      navigation.navigate('Otp', {
        phoneNumber: fullPhoneNumber,
        mode: 'login',
      });
    } catch (error) {
      console.error('❌ Phone OTP error:', error);
      setLoading(false);
      
      if (error.response?.status === 404) {
        Alert.alert('Account Not Found', 'Number not found. Please sign up first.', [
          { text: 'Sign Up', onPress: () => navigation.navigate('Signup') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        const errorMsg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
        Alert.alert('Error', errorMsg);
      }
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color="#E53935" />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={40}
                color="#E53935"
              />
            </View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Sign in with your mobile number</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  placeholder="Enter 10-digit mobile"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
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

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create One</Text>
            </TouchableOpacity>
          </View>

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
  headerSection: {
    alignItems: 'center',
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 16,
  },
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
    color: '#E53935',
    fontWeight: '700',
  },
  bottomSpace: {
    height: 10,
  },
});

export default LoginScreen;
