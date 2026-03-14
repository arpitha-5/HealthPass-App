import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import PrimaryButton from '../components/PrimaryButton';

const PlanSelectionScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoadingState] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '₹999',
      description: 'Essential protection',
      benefits: ['10 doctor visits/year', 'Free health checkup', 'OPD coverage up to ₹1000', 'Digital health records'],
      color: Theme.colors.secondary,
    },
    {
      id: 'plus',
      name: 'Plus',
      price: '₹1,999',
      description: 'Recommended plan',
      benefits: ['30 doctor visits/year', 'Free scope exam', 'OPD coverage up to ₹3000', 'Hospital cashless', 'Medicine support'],
      color: Theme.colors.primary,
      featured: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹4,999',
      description: 'Maximum coverage',
      benefits: ['Unlimited visits', 'All specialist access', 'OPD coverage up to ₹10000', '100% cashless', 'Ambulance support'],
      color: Theme.colors.accent,
    },
  ];

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a plan');
      return;
    }
    setLoadingState(true);
    try {
      setTimeout(() => {
        setLoadingState(false);
        navigation.navigate('Dashboard', {
          ...params,
          selectedPlan,
        });
      }, 1500);
    } catch (error) {
      setLoadingState(false);
      Alert.alert('Error', 'Failed to select plan');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.stepIndicator}>Step 8 of 12</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>Select the best coverage for your needs</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('PlanComparison')}>
          <Text style={styles.compareLink}>👁️ Compare all plans</Text>
        </TouchableOpacity>

        <PrimaryButton title={loading ? 'Continuing...' : 'Select Plan'} onPress={handleSelectPlan} loading={loading} />
        
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.skipText}>⏭️ Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const PlanCard = ({ plan, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[styles.planCard, isSelected && styles.planCardSelected, plan.featured && styles.planCardFeatured]}
    onPress={onSelect}
  >
    {plan.featured && <View style={styles.badge}><Text style={styles.badgeText}>⭐ RECOMMENDED</Text></View>}
    <Text style={styles.planName}>{plan.name}</Text>
    <Text style={styles.planDescription}>{plan.description}</Text>
    <Text style={styles.planPrice}>{plan.price}</Text>
    <Text style={styles.planPriceSubtitle}>per month</Text>

    <View style={styles.benefitsList}>
      {plan.benefits.map((benefit, idx) => (
        <View key={idx} style={styles.benefitItem}>
          <Feather name="check" size={16} color={plan.color} />
          <Text style={styles.benefitText}>{benefit}</Text>
        </View>
      ))}
    </View>

    {isSelected && (
      <View style={styles.selectedCheckmark}>
        <Text style={styles.selectedCheckmarkText}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

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
  plansContainer: { gap: Theme.spacing.lg, marginBottom: Theme.spacing.xl },
  planCard: { backgroundColor: Theme.colors.card, borderRadius: Theme.borders.radius, padding: Theme.spacing.lg, borderWidth: 2, borderColor: Theme.colors.border, ...Theme.shadows.small },
  planCardSelected: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
  planCardFeatured: { borderColor: Theme.colors.primary },
  badge: { backgroundColor: Theme.colors.primary, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs, borderRadius: Theme.borders.radiusSmall, alignSelf: 'flex-start', marginBottom: Theme.spacing.md },
  badgeText: { ...Theme.typography.caption, color: Theme.colors.background, fontWeight: '700' },
  planName: { ...Theme.typography.heading3, marginBottom: Theme.spacing.xs },
  planDescription: { ...Theme.typography.caption, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.md },
  planPrice: { ...Theme.typography.heading2, color: Theme.colors.primary },
  planPriceSubtitle: { ...Theme.typography.caption, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.lg },
  benefitsList: { gap: Theme.spacing.sm },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  benefitText: { ...Theme.typography.caption, color: Theme.colors.textPrimary, flex: 1 },
  selectedCheckmark: { position: 'absolute', top: Theme.spacing.md, right: Theme.spacing.md, width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  selectedCheckmarkText: { ...Theme.typography.heading3, color: Theme.colors.background },
  compareLink: { textAlign: 'center', ...Theme.typography.subheading, color: Theme.colors.primary, marginBottom: Theme.spacing.lg },
  skipButton: { marginTop: Theme.spacing.lg, paddingVertical: Theme.spacing.md, alignItems: 'center', borderRadius: Theme.borders.radius, borderWidth: 2, borderColor: Theme.colors.textTertiary },
  skipText: { color: Theme.colors.textSecondary, fontSize: 16, fontWeight: '600' },
});

export default PlanSelectionScreen;
