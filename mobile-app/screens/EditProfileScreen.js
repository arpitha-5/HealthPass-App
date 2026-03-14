import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import Header from '../components/Header';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';

const CITIES = [
  'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
];

/** Key used to persist profile in AsyncStorage */
const PROFILE_STORAGE_KEY = '@healthpass_profile';

const EditProfileScreen = ({ navigation, route }) => {
  const { user, login } = useContext(AuthContext);
  const existing = route?.params?.userData || user || {};

  const [name,             setName]             = useState(existing.fullName || existing.name || '');
  const [email,            setEmail]            = useState(existing.email || '');
  const [phone,            setPhone]            = useState(existing.mobileNumber || existing.phone || '');
  const [dob,              setDob]              = useState(existing.dob || '');
  const [gender,           setGender]           = useState(existing.gender || '');
  const [address,          setAddress]          = useState(existing.address || '');
  const [emergencyContact, setEmergencyContact] = useState(existing.emergencyContact || '');
  const [city,             setCity]             = useState(existing.city || '');
  const [avatar,           setAvatar]           = useState(existing.avatar || existing.profilePicture || null);
  
  const [showCityPicker,   setShowCityPicker]   = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [errors,           setErrors]           = useState({});

  const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!emergencyContact.trim()) errs.emergencyContact = 'Emergency contact is required';
    return errs;
  };

  // ─── Image Picker ───
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick image.');
    }
  };

  // ─── Save handler ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = {
        ...existing,
        name:      name.trim(),
        email:     email.trim().toLowerCase(),
        city:      city.trim(),
        updatedAt: new Date().toISOString(),
      };

      // 1️⃣  Always persist locally — works even without a backend session
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

      // 2️⃣  Backend sync
      try {
        const res = await userAPI.updateProfile({
          fullName:         name.trim(),
          email:            email.trim().toLowerCase(),
          phone:            phone.trim(),
          dob:              dob.trim(),
          gender:           gender.trim(),
          address:          address.trim(),
          emergencyContact: emergencyContact.trim(),
          city:             city.trim(),
          avatar:           avatar,
        });
        
        // 3️⃣ Update AuthContext so changes reflect everywhere immediately
        if (res.success && res.user) {
          await login(res.user, await AsyncStorage.getItem('token'));
        }
      } catch (apiErr) {
        console.warn('Backend profile sync skipped:', apiErr?.message);
      }

      Alert.alert(
        'Profile Updated',
        'Your profile has been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('EditProfile save error:', err);
      Alert.alert('Save Failed', 'Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    name.trim()             !== (existing.fullName || existing.name || '').trim() ||
    email.trim()            !== (existing.email || '').trim() ||
    phone.trim()            !== (existing.mobileNumber || existing.phone || '').trim() ||
    dob.trim()              !== (existing.dob || '').trim() ||
    gender.trim()           !== (existing.gender || '').trim() ||
    address.trim()          !== (existing.address || '').trim() ||
    emergencyContact.trim() !== (existing.emergencyContact || '').trim() ||
    city.trim()             !== (existing.city || '').trim() ||
    avatar                  !== (existing.avatar || existing.profilePicture);

  // ─── Avatar preview ───────────────────────────────────────────────────────
  const initials = (name || 'U').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <Header
        title="Edit Profile"
        subtitle="Update your personal information"
        onBack={() => {
          if (hasChanges) {
            Alert.alert(
              'Discard Changes?',
              'You have unsaved changes. Go back anyway?',
              [
                { text: 'Keep Editing', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          } else {
            navigation.goBack();
          }
        }}
        rightAction={
          hasChanges ? (
            <TouchableOpacity
              style={styles.saveHeaderBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <Text style={styles.saveHeaderBtnText}>Save</Text>
              }
            </TouchableOpacity>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar Picker ── */}
          <View style={styles.avatarBlock}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials || 'U'}</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarName}>{name || 'Your Name'}</Text>
            <Text style={styles.avatarHint}>Tap to upload profile photo</Text>
          </View>

          {/* ── Form Fields ── */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>PERSONAL INFORMATION</Text>

            <InputField
              label="Full Name"
              value={name}
              onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: '' })); }}
              placeholder="Enter your full name"
              icon={<MaterialCommunityIcons name="account" size={20} color={Colors.primary} />}
              error={errors.name}
              autoCapitalize="words"
            />

            <InputField
              label="Email Address"
              value={email}
              onChangeText={v => { setEmail(v); setErrors(e => ({ ...e, email: '' })); }}
              placeholder="Enter your email"
              icon={<MaterialCommunityIcons name="email" size={20} color={Colors.primary} />}
              keyboardType="email-address"
              error={errors.email}
            />

            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Your mobile number"
              icon={<MaterialCommunityIcons name="phone" size={20} color={Colors.primary} />}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Date of Birth"
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD-MM-YYYY"
                  icon={<MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />}
                />
              </View>
              <View style={{ width: Spacing.lg }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <TouchableOpacity
                  style={[styles.miniSelector, showGenderPicker && styles.citySelectorOpen]}
                  onPress={() => setShowGenderPicker(!showGenderPicker)}
                >
                  <Text style={[styles.citySelectorText, !gender && styles.citySelectorPlaceholder]}>
                    {gender || 'Select'}
                  </Text>
                  <Feather name="chevron-down" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {showGenderPicker && (
              <View style={styles.cityDropdown}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={styles.cityOption}
                    onPress={() => { setGender(g); setShowGenderPicker(false); }}
                  >
                    <Text style={styles.cityOptionText}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <InputField
              label="Residential Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Full street address, flat no."
              icon={<MaterialCommunityIcons name="home-map-marker" size={20} color={Colors.primary} />}
              multiline
            />

            <InputField
              label="Emergency Contact"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="Friend or relative's number"
              icon={<MaterialCommunityIcons name="shield-account" size={20} color="#EF4444" />}
              keyboardType="phone-pad"
              error={errors.emergencyContact}
            />

            {/* ── City Picker ── */}
            <View style={styles.cityWrapper}>
              <Text style={styles.fieldLabel}>City</Text>
              <TouchableOpacity
                style={[styles.citySelector, showCityPicker && styles.citySelectorOpen]}
                onPress={() => setShowCityPicker(v => !v)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="map-marker" size={20} color={Colors.primary} />
                <Text style={[styles.citySelectorText, !city && styles.citySelectorPlaceholder]}>
                  {city || 'Select your city'}
                </Text>
                <Feather
                  name={showCityPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>

              {showCityPicker && (
                <View style={styles.cityDropdown}>
                  {CITIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.cityOption, c === city && styles.cityOptionActive]}
                      onPress={() => { setCity(c); setShowCityPicker(false); }}
                    >
                      <Text style={[styles.cityOptionText, c === city && styles.cityOptionTextActive]}>
                        {c}
                      </Text>
                      {c === city && (
                        <MaterialCommunityIcons name="check" size={16} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Info Note ── */}
          <View style={styles.infoNote}>
            <MaterialCommunityIcons name="information" size={15} color={Colors.info} />
            <Text style={styles.infoNoteText}>
              All your medical records are securely stored and encrypted according to HealthPass HIPAA-aligned standards.
            </Text>
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.btnSection}>
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              disabled={!hasChanges || saving}
            />
            <PrimaryButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{ marginTop: Spacing.sm + 4 }}
            />
          </View>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1 },

  // Header save button
  saveHeaderBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  saveHeaderBtnText: {
    fontSize: FontSize.body - 1,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // Avatar preview
  avatarBlock: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  avatarContainer: {
    position: 'relative',
    ...Shadows.md,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    letterSpacing: 1,
  },
  avatarName: {
    fontSize: FontSize.sub,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  avatarHint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },

  // Form
  formSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  formSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.9,
    marginBottom: Spacing.lg,
  },

  // City picker
  cityWrapper: { marginBottom: Spacing.lg },
  fieldLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
    letterSpacing: 0.2,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  citySelectorOpen:  { borderColor: Colors.primary },
  citySelectorText:  { flex: 1, fontSize: FontSize.body, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  citySelectorPlaceholder: { color: Colors.textTertiary },
  cityDropdown: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  // Mini selectors
  rowInputs: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.lg },
  miniSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
  },

  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cityOptionActive:     { backgroundColor: Colors.primaryLight },
  cityOptionText:       { fontSize: FontSize.body - 1, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  cityOptionTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },

  // Info note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  infoNoteText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  // Buttons
  btnSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
  },
});

export default EditProfileScreen;
