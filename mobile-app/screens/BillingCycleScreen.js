import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import PrimaryButton from '../components/PrimaryButton';

const BillingCycleScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [loading, setLoading] = useState(false);

  const plan = params.plan || { price: { monthly: 1999, quarterly: 5697, annual: 21588 } };

  const cycles = [
    { id: 'Monthly', label: 'Monthly', price: `₹${plan.price.monthly}`, savingsPercent: '0%', description: 'Pay every month' },
    { id: 'Quarterly', label: 'Quarterly', price: `₹${plan.price.quarterly}`, savingsPercent: '5%', description: 'Save 5% • Pay every 3 months', featured: true },
    { id: 'Annual', label: 'Annual', price: `₹${plan.price.annual}`, savingsPercent: '10%', description: 'Save 10% • Pay yearly', bestseller: true },
  ];

  const handleContinue = async () => {
    if (!selectedCycle) {
      Alert.alert('Error', 'Please select a billing cycle');
      return;
    }
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Checkout', {
          ...params,
          billingCycle: selectedCycle,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to select billing cycle');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
        <Text style={styles.stepIndicator}>Step 9 of 12</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Select Billing Cycle</Text>
          <Text style={styles.subtitle}>Choose how you want to pay</Text>
        </View>

        <View style={styles.cyclesContainer}>
          {cycles.map((cycle) => (
            <TouchableOpacity
              key={cycle.id}
              style={[
                styles.cycleCard,
                selectedCycle === cycle.id && styles.cycleCardSelected,
                cycle.bestseller && styles.cycleCardBestseller,
              ]}
              onPress={() => setSelectedCycle(cycle.id)}
            >
              {cycle.bestseller && <View style={styles.bestsellerBadge}><Text style={styles.bestsellerText}>🔥 BEST VALUE</Text></View>}

              <View style={styles.cycleHeader}>
                <Text style={styles.cycleLabel}>{cycle.label}</Text>
                <View style={[styles.savingsBadge, cycle.featured && styles.savingsBadgeFeatured]}>
                  <Text style={styles.savingsText}>{cycle.savingsPercent}</Text>
                </View>
              </View>

              <Text style={styles.cyclePrice}>{cycle.price}</Text>
              <Text style={styles.cycleDescription}>{cycle.description}</Text>

              {selectedCycle === cycle.id && (
                <View style={styles.checkmarks}>
                  <Feather name="check" size={20} color={Theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title={loading ? 'Continuing...' : 'Proceed to Payment'}
          onPress={handleContinue}
          loading={loading}
        />

        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.skipText}>⏭️ Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  cyclesContainer: { gap: Theme.spacing.lg, marginBottom: Theme.spacing.xl },
  cycleCard: { backgroundColor: Theme.colors.card, borderRadius: Theme.borders.radius, padding: Theme.spacing.lg, borderWidth: 2, borderColor: Theme.colors.border, ...Theme.shadows.small },
  cycleCardSelected: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
  cycleCardBestseller: { borderColor: Theme.colors.accent },
  bestsellerBadge: { backgroundColor: Theme.colors.accent, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs, borderRadius: Theme.borders.radiusSmall, alignSelf: 'flex-start', marginBottom: Theme.spacing.md },
  bestsellerText: { ...Theme.typography.caption, color: Theme.colors.background, fontWeight: '700' },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.md },
  cycleLabel: { ...Theme.typography.heading3 },
  savingsBadge: { backgroundColor: Theme.colors.successLight, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs, borderRadius: Theme.borders.radiusSmall },
  savingsBadgeFeatured: { backgroundColor: Theme.colors.primaryLight },
  savingsText: { ...Theme.typography.caption, color: Theme.colors.success, fontWeight: '700' },
  cyclePrice: { ...Theme.typography.heading2, color: Theme.colors.primary, marginBottom: Theme.spacing.xs },
  cycleDescription: { ...Theme.typography.caption, color: Theme.colors.textSecondary },
  checkmarks: { position: 'absolute', top: Theme.spacing.lg, right: Theme.spacing.lg, width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  skipButton: { marginTop: Theme.spacing.lg, paddingVertical: Theme.spacing.md, alignItems: 'center', borderRadius: Theme.borders.radius, borderWidth: 2, borderColor: Theme.colors.textTertiary },
  skipText: { color: Theme.colors.textSecondary, fontSize: 16, fontWeight: '600' },
});

export default BillingCycleScreen;
