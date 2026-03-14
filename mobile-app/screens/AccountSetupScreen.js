import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';

const AccountSetupScreen = ({ route, navigation }) => {
  const phoneNumber = route?.params?.phoneNumber || '';
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('English');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleContinue = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating account:', { fullName, email, language, phoneNumber });
      
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('ReferralLocation', {
          phoneNumber,
          fullName,
          email,
          language,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error(error);
    }
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
          {/* Progress Indicator */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.stepIndicator}>Step 3 of 3</Text>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Complete your registration to get started
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Full Name Field */}
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              icon="user"
            />

            {/* Email Field */}
            <InputField
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              icon="mail"
            />

            {/* Language Field */}
            <LanguageSelector
              selectedLanguage={language}
              onLanguageChange={setLanguage}
            />

            {/* Password Field */}
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordLabel}>Password</Text>
              <View style={styles.passwordInputWrapper}>
                <InputField
                  placeholder="Enter your password (min 8 characters)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  icon="lock"
                  containerStyle={styles.passwordInput}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordLabel}>Confirm Password</Text>
              <View style={styles.passwordInputWrapper}>
                <InputField
                  placeholder="Re-enter your password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="lock"
                  containerStyle={styles.passwordInput}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsCard}>
              <Text style={styles.termsText}>
                ✓ I agree to the Terms & Conditions and Privacy Policy
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <PrimaryButton
            title={loading ? 'Saving...' : 'Continue'}
            onPress={handleContinue}
            loading={loading}
            style={styles.continueButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const languages = ['English', 'Telugu', 'Hindi', 'Kannada'];
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View style={styles.languageContainer}>
      <Text style={styles.languageLabel}>Preferred Language</Text>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.languageButtonText}>{selectedLanguage}</Text>
        <Feather
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Theme.colors.textTertiary}
        />
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={styles.languageDropdownMenu}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageOption,
                selectedLanguage === lang && styles.languageOptionSelected,
              ]}
              onPress={() => {
                onLanguageChange(lang);
                setShowDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  selectedLanguage === lang &&
                    styles.languageOptionTextSelected,
                ]}
              >
                {lang}
              </Text>
              {selectedLanguage === lang && (
                <Feather name="check-circle" size={18} color={Theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },

  progressBar: {
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },

  stepIndicator: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginBottom: Theme.spacing.xl,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    marginBottom: Theme.spacing.lg,
  },

  header: {
    marginBottom: Theme.spacing.xxl,
  },

  title: {
    ...Theme.typography.heading2,
    marginBottom: Theme.spacing.sm,
  },

  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },

  formContainer: {
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },

  languageContainer: {
    marginBottom: Theme.spacing.md,
    zIndex: 50,
  },

  languageLabel: {
    ...Theme.typography.subheading,
    marginBottom: Theme.spacing.sm,
  },

  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    height: 56,
    zIndex: 1,
  },

  languageButtonText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    flex: 1,
  },

  languageArrow: {
    color: Theme.colors.textTertiary,
    fontSize: 12,
  },

  languageDropdownMenu: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderTopWidth: 0,
    borderBottomLeftRadius: Theme.borders.radius,
    borderBottomRightRadius: Theme.borders.radius,
    overflow: 'hidden',
    marginTop: -2,
    marginHorizontal: 0,
    zIndex: 999,
    ...Theme.shadows.medium,
  },

  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  languageOptionSelected: {
    backgroundColor: Theme.colors.primaryLight,
  },

  languageOptionText: {
    ...Theme.typography.subheading,
    color: Theme.colors.textPrimary,
  },

  languageOptionTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  passwordContainer: {
    marginBottom: Theme.spacing.md,
  },

  passwordLabel: {
    ...Theme.typography.subheading,
    marginBottom: Theme.spacing.sm,
  },

  passwordInputWrapper: {
    position: 'relative',
  },

  passwordInput: {
    paddingRight: 50,
  },

  eyeIcon: {
    position: 'absolute',
    right: Theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    zIndex: 5,
  },

  termsCard: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borders.radiusSmall,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },

  termsText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    lineHeight: 18,
  },

  continueButton: {
    marginBottom: Theme.spacing.lg,
  },
});

export default AccountSetupScreen;
