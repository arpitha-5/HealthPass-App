import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';

const FamilySetupScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [familyMembers, setFamilyMembers] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);

  const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];
  const genders = ['Male', 'Female', 'Other'];

  const handleAddMember = () => {
    if (!name.trim() || !age.trim() || !gender.trim() || !relation.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const newMember = { id: Date.now(), name, age, gender, relation };
    setFamilyMembers([...familyMembers, newMember]);
    setName('');
    setAge('');
    setGender('');
    setRelation('');
  };

  const handleRemoveMember = (id) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('InsuranceLinking', {
          ...params,
          familyMembers,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save family members');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.stepIndicator}>Step 3 of 4</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Add Family Members</Text>
          <Text style={styles.subtitle}>Extend coverage to your loved ones</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField label="Name" placeholder="Enter name" value={name} onChangeText={setName} />
          <InputField label="Age" placeholder="Enter age" keyboardType="number-pad" value={age} onChangeText={setAge} maxLength={2} />
          <DropdownField label="Gender" value={gender} onSelect={setGender} options={genders} />
          <DropdownField label="Relation" value={relation} onSelect={setRelation} options={relations} />

          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Feather name="plus" size={20} color={Theme.colors.background} />
            <Text style={styles.addButtonText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {familyMembers.length > 0 && (
          <View style={styles.membersContainer}>
            <Text style={styles.membersTitle}>Family Members ({familyMembers.length})</Text>
            {familyMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberDetails}>
                    {member.age} years • {member.gender} • {member.relation}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveMember(member.id)}>
                  <Feather name="trash-2" size={20} color={Theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 You can add up to 5 family members.</Text>
        </View>

        <PrimaryButton title={loading ? 'Saving...' : 'Continue'} onPress={handleContinue} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DropdownField = ({ label, value, onSelect, options }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(!showDropdown)}>
        <Text style={styles.dropdownButtonText}>{value || `Select ${label.toLowerCase()}`}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity key={option} style={[styles.dropdownOption, value === option && styles.dropdownOptionSelected]} onPress={() => { onSelect(option); setShowDropdown(false); }}>
              <Text style={[styles.dropdownOptionText, value === option && styles.dropdownOptionTextSelected]}>{option}</Text>
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
  addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.secondary, paddingVertical: Theme.spacing.md, borderRadius: Theme.borders.radius, gap: Theme.spacing.sm },
  addButtonText: { ...Theme.typography.subheading, color: Theme.colors.background },
  membersContainer: { marginBottom: Theme.spacing.xl },
  membersTitle: { ...Theme.typography.subheading, marginBottom: Theme.spacing.md },
  memberCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Theme.colors.card, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderRadius: Theme.borders.radius, marginBottom: Theme.spacing.md, borderLeftWidth: 4, borderLeftColor: Theme.colors.primary },
  memberInfo: { flex: 1 },
  memberName: { ...Theme.typography.subheading, marginBottom: Theme.spacing.xs },
  memberDetails: { ...Theme.typography.caption, color: Theme.colors.textSecondary },
  infoBox: { backgroundColor: Theme.colors.primaryLight, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, borderRadius: Theme.borders.radiusSmall, borderLeftWidth: 4, borderLeftColor: Theme.colors.primary, marginBottom: Theme.spacing.xl },
  infoText: { ...Theme.typography.caption, color: Theme.colors.primary },
});

export default FamilySetupScreen;
