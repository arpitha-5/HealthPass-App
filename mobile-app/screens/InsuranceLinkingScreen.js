import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';

const InsuranceLinkingScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [linkInsurance, setLinkInsurance] = useState(false);
  const [insurer, setInsurer] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const insurers = ['Aetna', 'Apollo', 'Cigna', 'Max Bupa', 'Star Health', 'Go Digit', 'Niva Bupa'];

  const handleContinue = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('AddFamilyMember', {
          ...params,
          insurance: linkInsurance ? { insurer, policyNumber } : null,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save insurance details');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '65%' }]} />
        </View>
        <Text style={styles.stepIndicator}>Step 2 of 4</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Link Insurance (Optional)</Text>
          <Text style={styles.subtitle}>Integrate your existing policy</Text>
        </View>

        <View style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleTitle}>Link Insurance Policy</Text>
            <Text style={styles.toggleSubtitle}>Connect existing insurance coverage</Text>
          </View>
          <Switch value={linkInsurance} onValueChange={setLinkInsurance} trackColor={{ false: Theme.colors.border, true: Theme.colors.primaryLight }} thumbColor={linkInsurance ? Theme.colors.primary : '#E2E8F0'} />
        </View>

        {linkInsurance && (
          <View style={styles.formContainer}>
            <InsuranceDropdown value={insurer} onSelect={setInsurer} options={insurers} />
            <InputField label="Policy Number" placeholder="Enter your policy number" value={policyNumber} onChangeText={setPolicyNumber} />
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>💡 Your insurance details will be securely stored and verified with the provider.</Text>
            </View>
          </View>
        )}

        <View style={styles.skipContainer}>
          <Text style={styles.skipText}>You can {linkInsurance ? 'update' : 'add'} insurance details later from your profile.</Text>
        </View>

        <PrimaryButton title={loading ? 'Saving...' : 'Continue'} onPress={handleContinue} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const InsuranceDropdown = ({ value, onSelect, options }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>Insurance Provider</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShow(!show)}>
        <Text style={styles.dropdownButtonText}>{value || 'Select insurance provider'}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {show && (
        <View style={styles.dropdownMenu}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={[styles.dropdownOption, value === opt && styles.dropdownOptionSelected]} onPress={() => { onSelect(opt); setShow(false); }}>
              <Text style={[styles.dropdownOptionText, value === opt && styles.dropdownOptionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.lg, paddingBottom: Theme.spacing.lg },
  progressBar: { height: 4, backgroundColor: Theme.colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: Theme.spacing.sm },
  progressFill: { height: '100%', backgroundColor: Theme.colors.primary },
  stepIndicator: { ...Theme.typography.caption, color: Theme.colors.textTertiary, marginBottom: Theme.spacing.xl },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.card, marginBottom: Theme.spacing.lg },
  header: { marginBottom: Theme.spacing.xl },
  title: { ...Theme.typography.heading2, marginBottom: Theme.spacing.sm },
  subtitle: { ...Theme.typography.body, color: Theme.colors.textSecondary },
  toggleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Theme.colors.card, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderRadius: Theme.borders.radius, marginBottom: Theme.spacing.xl, borderWidth: 1, borderColor: Theme.colors.cardBorder },
  toggleTitle: { ...Theme.typography.subheading, marginBottom: Theme.spacing.xs },
  toggleSubtitle: { ...Theme.typography.caption, color: Theme.colors.textSecondary },
  formContainer: { gap: Theme.spacing.lg, marginBottom: Theme.spacing.xl },
  dropdownContainer: { marginBottom: Theme.spacing.md },
  dropdownLabel: { ...Theme.typography.subheading, marginBottom: Theme.spacing.sm },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Theme.colors.card, borderRadius: Theme.borders.radius, borderWidth: 1, borderColor: Theme.colors.cardBorder, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, height: 56 },
  dropdownButtonText: { ...Theme.typography.body, color: Theme.colors.textPrimary },
  dropdownArrow: { color: Theme.colors.textTertiary, fontSize: 12 },
  dropdownMenu: { position: 'absolute', top: 85, left: Theme.spacing.lg, right: Theme.spacing.lg, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.cardBorder, borderRadius: Theme.borders.radius, zIndex: 10, ...Theme.shadows.medium },
  dropdownOption: { paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  dropdownOptionSelected: { backgroundColor: Theme.colors.primaryLight },
  dropdownOptionText: { ...Theme.typography.body },
  dropdownOptionTextSelected: { color: Theme.colors.primary, fontWeight: '600' },
  infoBox: { backgroundColor: Theme.colors.primaryLight, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderRadius: Theme.borders.radiusSmall, borderLeftWidth: 4, borderLeftColor: Theme.colors.primary },
  infoText: { ...Theme.typography.caption, color: Theme.colors.primary },
  skipContainer: { backgroundColor: Theme.colors.secondaryLight, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderRadius: Theme.borders.radiusSmall, marginBottom: Theme.spacing.xl },
  skipText: { ...Theme.typography.caption, color: Theme.colors.accent, textAlign: 'center' },
});

export default InsuranceLinkingScreen;
