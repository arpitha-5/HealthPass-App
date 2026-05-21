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
import { userAPI } from '../services/apiService';

const AddFamilyMemberScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [familyMembers, setFamilyMembers] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);

  const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];
  const genders = ['Male', 'Female', 'Other'];

  const handleAddMember = async () => {
    if (!name.trim() || !age.trim() || !gender.trim() || !relation.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const res = await userAPI.addFamilyMember({
        name: name.trim(),
        age: parseInt(age),
        gender: gender,
        relationship: relation,
      });

      if (res.success) {
        const newMember = { id: Date.now(), name, age, gender, relation };
        setFamilyMembers([...familyMembers, newMember]);
        setName('');
        setAge('');
        setGender('');
        setRelation('');
        Alert.alert('Success', `${name} added successfully!`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add family member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (id, memberName) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
    Alert.alert('Removed', `${memberName} removed from family members`);
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      console.log('Saving family members:', familyMembers);
      
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'Family members saved successfully!', [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('Plans', {
                ...params,
                familyMembers,
              });
            },
          },
        ]);
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save family members');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Plans', {
      ...params,
      familyMembers: [],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >


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
            <Feather name="users" size={32} color={Theme.colors.primary} />
          </View>
          <Text style={styles.title}>Add Family Members</Text>
          <Text style={styles.subtitle}>
            Extend health coverage to your loved ones
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>ℹ</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Add up to 5 members</Text>
              <Text style={styles.infoSubtitle}>
                You can add more family members for a better group coverage
              </Text>
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Member Details</Text>
            <InputField
              label="Full Name"
              placeholder="Enter member's name"
              value={name}
              onChangeText={setName}
            />
            <InputField
              label="Age"
              placeholder="Enter age"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={2}
            />
            <View style={styles.dropdownRow}>
              <View style={styles.dropdownHalf}>
                <DropdownField
                  label="Gender"
                  value={gender}
                  onSelect={setGender}
                  options={genders}
                />
              </View>
              <View style={styles.dropdownHalf}>
                <DropdownField
                  label="Relation"
                  value={relation}
                  onSelect={setRelation}
                  options={relations}
                />
              </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                (!name.trim() || !age.trim() || !gender.trim() || !relation.trim())
                  && styles.addButtonDisabled
              ]}
              onPress={handleAddMember}
              disabled={!name.trim() || !age.trim() || !gender.trim() || !relation.trim()}
            >
              <Feather name="plus-circle" size={20} color={Theme.colors.background} />
              <Text style={styles.addButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>

          {/* Members List */}
          {familyMembers.length > 0 && (
            <View style={styles.membersSection}>
              <View style={styles.membersHeader}>
                <Text style={styles.membersTitle}>
                  Family Members Added ({familyMembers.length}/5)
                </Text>
                <View style={styles.memberCountBadge}>
                  <Text style={styles.memberCountText}>{familyMembers.length}</Text>
                </View>
              </View>

              {familyMembers.map((member, index) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberIndex}>
                    <Text style={styles.memberIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={styles.memberMeta}>
                      <View style={styles.metaItem}>
                        <Feather name="calendar" size={14} color={Theme.colors.textTertiary} />
                        <Text style={styles.metaText}>{member.age} years</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="user" size={14} color={Theme.colors.textTertiary} />
                        <Text style={styles.metaText}>{member.gender}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="heart" size={14} color={Theme.colors.textTertiary} />
                        <Text style={styles.metaText}>{member.relation}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveMember(member.id, member.name)}
                  >
                    <Feather name="trash-2" size={18} color={Theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {familyMembers.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={48} color={Theme.colors.textTertiary} />
              </View>
              <Text style={styles.emptyText}>No family members added yet</Text>
              <Text style={styles.emptySubtext}>Add members to extend coverage</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={loading ? 'Saving...' : 'Continue'}
            onPress={handleContinue}
            loading={loading}
            disabled={familyMembers.length === 0}
            style={styles.primaryButton}
          />
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DropdownField = ({ label, value, onSelect, options }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.dropdownButtonText}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Feather
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Theme.colors.textTertiary}
        />
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                value === option && styles.dropdownOptionSelected,
              ]}
              onPress={() => {
                onSelect(option);
                setShowDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option && styles.dropdownOptionTextSelected,
                ]}
              >
                {option}
              </Text>
              {value === option && (
                <Feather name="check" size={16} color={Theme.colors.primary} />
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

  infoCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.secondaryLight,
    borderRadius: Theme.borders.radius,
    padding: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.secondary,
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
  },

  infoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },

  infoBadgeText: {
    color: Theme.colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    ...Theme.typography.subheading,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },

  infoSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },

  inputSection: {
    gap: Theme.spacing.lg,
  },

  sectionLabel: {
    ...Theme.typography.subheading,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
  },

  dropdownRow: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },

  dropdownHalf: {
    flex: 1,
  },

  dropdownContainer: {
    marginBottom: Theme.spacing.md,
  },

  dropdownLabel: {
    ...Theme.typography.subheading,
    marginBottom: Theme.spacing.sm,
  },

  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    height: 48,
  },

  dropdownButtonText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    flex: 1,
  },

  dropdownMenu: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: Theme.borders.radius,
    zIndex: 10,
    overflow: 'hidden',
    ...Theme.shadows.medium,
    maxHeight: 200,
  },

  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  dropdownOptionSelected: {
    backgroundColor: Theme.colors.primaryLight,
  },

  dropdownOptionText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
  },

  dropdownOptionTextSelected: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },

  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borders.radius,
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },

  addButtonDisabled: {
    backgroundColor: Theme.colors.textTertiary,
    opacity: 0.6,
  },

  addButtonText: {
    ...Theme.typography.subheading,
    color: Theme.colors.background,
  },

  membersSection: {
    marginTop: Theme.spacing.lg,
  },

  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },

  membersTitle: {
    ...Theme.typography.subheading,
    color: Theme.colors.textPrimary,
  },

  memberCountBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberCountText: {
    color: Theme.colors.background,
    fontWeight: '600',
    fontSize: 12,
  },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    ...Theme.shadows.small,
  },

  memberIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },

  memberIndexText: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    ...Theme.typography.subheading,
    marginBottom: Theme.spacing.xs,
  },

  memberMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },

  metaText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },

  deleteButton: {
    padding: Theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },

  emptyIcon: {
    marginBottom: Theme.spacing.lg,
    opacity: 0.3,
  },

  emptyText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },

  emptySubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },

  buttonContainer: {
    gap: Theme.spacing.md,
  },

  primaryButton: {
    marginBottom: Theme.spacing.md,
  },

  skipButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },

  skipButtonText: {
    ...Theme.typography.subheading,
    color: Theme.colors.primary,
  },
});

export default AddFamilyMemberScreen;
