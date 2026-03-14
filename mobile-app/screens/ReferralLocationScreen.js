
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

const ReferralLocationScreen = ({ route, navigation }) => {
  const { phoneNumber, fullName, email, language } = route?.params || {};
  
  const [referralCode, setReferralCode] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const cities = [
    '🏙️ Hyderabad',
    '🏙️ Bangalore',
    '🏙️ Chennai',
    '🏙️ Mumbai',
    '🏙️ Delhi',
    '🏙️ Pune',
    '🏙️ Kolkata',
    '🏙️ Ahmedabad',
  ];

  const handleContinue = async () => {
    if (!selectedCity.trim()) {
      Alert.alert('Error', 'Please select your city');
      return;
    }

    setLoading(true);
    try {
      console.log('Saving referral and location:', {
        referralCode,
        city: selectedCity,
      });

      setTimeout(() => {
        setLoading(false);
        navigation.navigate('FamilySetup', {
          phoneNumber,
          fullName,
          email,
          language,
          referralCode,
          city: selectedCity,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save location. Please try again.');
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
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.stepIndicator}>Step 5 of 12</Text>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Feather name="map-pin" size={32} color={Theme.colors.primary} />
            </View>
            <Text style={styles.title}>Tell us About You</Text>
            <Text style={styles.subtitle}>
              Your referral code & location info
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Referral Card */}
            <View style={styles.referralCard}>
              <View style={styles.cardHeader}>
                <Feather name="gift" size={24} color={Theme.colors.primary} />
                <Text style={styles.cardTitle}>Referral Code</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Have a code from a friend? Enter it here
              </Text>
              <InputField
                placeholder="Enter referral code (optional)"
                value={referralCode}
                onChangeText={setReferralCode}
              />
              <Text style={styles.cardHint}>
                💡 Referral codes unlock special rewards
              </Text>
            </View>

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.cardHeader}>
                <Feather name="home" size={24} color={Theme.colors.primary} />
                <Text style={styles.cardTitle}>Select Your City</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                We'll show nearby hospitals & healthcare providers
              </Text>

              {/* City selector */}
              <View style={styles.cityContainer}>
                <TouchableOpacity
                  style={styles.cityButton}
                  onPress={() => setShowCityDropdown(!showCityDropdown)}
                >
                  <Feather name="map-pin" size={18} color={Theme.colors.primary} />
                  <Text style={styles.cityButtonText}>
                    {selectedCity || 'Choose your city'}
                  </Text>
                  <Feather
                    name={showCityDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Theme.colors.textTertiary}
                  />
                </TouchableOpacity>

                {showCityDropdown && (
                  <View style={styles.cityDropdown}>
                    {cities.map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.cityOption,
                          selectedCity === city && styles.cityOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedCity(city);
                          setShowCityDropdown(false);
                        }}
                      >
                        <View style={styles.cityOptionLeft}>
                          <Feather name="map-pin" size={16} color={selectedCity === city ? Theme.colors.primary : Theme.colors.textSecondary} />
                          <Text
                            style={[
                              styles.cityOptionText,
                              selectedCity === city && styles.cityOptionTextSelected,
                            ]}
                          >
                            {city}
                          </Text>
                        </View>
                        {selectedCity === city && (
                          <Feather name="check-circle" size={18} color={Theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeIcon}>✓</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  Your location helps us personalize your healthcare experience with local providers.
                </Text>
              </View>
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
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },

  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },

  title: {
    ...Theme.typography.heading2,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },

  formContainer: {
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },

  referralCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    padding: Theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    ...Theme.shadows.small,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },

  cardTitle: {
    ...Theme.typography.subheading,
    color: Theme.colors.textPrimary,
  },

  cardSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },

  cardHint: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    marginTop: Theme.spacing.md,
    fontStyle: 'italic',
  },

  locationCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    padding: Theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.secondary,
    ...Theme.shadows.small,
  },

  cityContainer: {
    marginTop: Theme.spacing.md,
  },

  cityLabel: {
    ...Theme.typography.subheading,
    marginBottom: Theme.spacing.sm,
  },

  cityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borders.radius,
    borderWidth: 2,
    borderColor: Theme.colors.cardBorder,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    height: 56,
    gap: Theme.spacing.md,
  },

  cityButtonText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    flex: 1,
  },

  cityArrow: {
    color: Theme.colors.textTertiary,
    fontSize: 12,
  },

  cityDropdown: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: Theme.borders.radius,
    overflow: 'hidden',
    zIndex: 10,
    ...Theme.shadows.medium,
    maxHeight: 300,
    marginTop: Theme.spacing.sm,
  },

  cityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  cityOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },

  cityOptionSelected: {
    backgroundColor: Theme.colors.primaryLight,
  },

  cityOptionText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
  },

  cityOptionTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.successLight,
    borderRadius: Theme.borders.radius,
    padding: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.success,
    gap: Theme.spacing.md,
    alignItems: 'flex-start',
  },

  infoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    marginTop: 2,
  },

  infoBadgeIcon: {
    color: Theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },

  infoContent: {
    flex: 1,
  },

  infoText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },

  continueButton: {
    marginBottom: Theme.spacing.lg,
  },
});

export default ReferralLocationScreen;
