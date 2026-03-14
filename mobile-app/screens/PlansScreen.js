import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import Header from '../components/Header';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';
import apiClient from '../services/apiService';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    period: 'month',
    badge: null,
    color: Colors.gray700,
    gradient: ['#546E7A', '#37474F'],
    features: [
      '2 Free Consultations/month',
      '1 Lab Test/month',
      'Health Records Storage',
      'Emergency Helpline',
    ],
    missing: ['Hospital Cashless', 'Ambulance Service', 'Family Coverage'],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 299,
    period: 'month',
    badge: 'Most Popular',
    color: '#F57F17',
    gradient: ['#E53935', '#B71C1C'],
    features: [
      '10 Free Consultations/month',
      '5 Lab Tests/month',
      'Hospital Cashless (₹25,000)',
      '2 Ambulance Rides/year',
      'Health Records Storage',
      'Family Coverage (up to 4)',
    ],
    missing: ['International Coverage'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 599,
    period: 'month',
    badge: 'All Inclusive',
    color: '#6A1B9A',
    gradient: ['#7B1FA2', '#4A148C'],
    features: [
      'Unlimited Consultations',
      'Unlimited Lab Tests',
      'Hospital Cashless (₹1,00,000)',
      'Unlimited Ambulance Rides',
      'International OPD Coverage',
      'Entire Family Coverage',
      'Dedicated Health Manager',
    ],
    missing: [],
  },
];

const PlanCard = ({ plan, isActive, onSelect }) => {
  const isPopular = plan.badge === 'Most Popular';

  return (
    <TouchableOpacity
      style={[styles.planCard, isActive && styles.planCardActive]}
      onPress={() => onSelect(plan.id)}
      activeOpacity={0.85}
    >
      {plan.badge && (
        <View style={[styles.planBadge, { backgroundColor: isPopular ? Colors.primary : '#6A1B9A' }]}>
          <Text style={styles.planBadgeText}>{plan.badge}</Text>
        </View>
      )}

      {/* Plan Header */}
      <LinearGradient 
        colors={plan.gradient || ['#546E7A', '#37474F']} 
        style={styles.planHeader} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.planCurrency}>₹</Text>
          <Text style={styles.planPrice}>{plan.price?.monthly || plan.price}</Text>
          <Text style={styles.planPeriod}>/{plan.period || 'month'}</Text>
        </View>
      </LinearGradient>

      {/* Features */}
      <View style={styles.featuresSection}>
        {(plan.features || []).map(f => (
          <View key={f} style={styles.featureRow}>
            <View style={styles.featureCheck}>
              <MaterialCommunityIcons name="check" size={14} color={Colors.success} />
            </View>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
        {(plan.missing || []).map(f => (
          <View key={f} style={styles.featureRow}>
            <View style={[styles.featureCheck, styles.featureX]}>
              <MaterialCommunityIcons name="close" size={14} color={Colors.textTertiary} />
            </View>
            <Text style={[styles.featureText, { color: Colors.textTertiary, textDecorationLine: 'line-through' }]}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Select */}
      <View style={styles.planFooter}>
        {isActive ? (
          <View style={styles.selectedPill}>
            <MaterialCommunityIcons name="check-circle" size={16} color={Colors.primary} />
            <Text style={styles.selectedPillText}>Selected</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.selectBtn} onPress={() => onSelect(plan.id)}>
            <Text style={styles.selectBtnText}>Choose {plan.name}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const PlansScreen = ({ navigation, route }) => {
  const [selectedPlan, setSelectedPlan] = useState('gold');
  const [plans, setPlans] = useState(PLANS); // Fallback to static if fetch fails
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/subscription'); // Assuming /subscription gets plans, wait let's check routes
        if (response.data.success && Array.isArray(response.data.plans)) {
          setPlans(response.data.plans);
          if (response.data.plans.length > 0) {
            setSelectedPlan(response.data.plans[1]?._id || response.data.plans[0]?._id);
          }
        }
      } catch (e) {
        console.log('Fetch Plans Error:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const plan = plans.find(p => (p._id === selectedPlan || p.id === selectedPlan));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Header
        title="Choose Your Plan"
        subtitle="Cancel anytime. No hidden fees."
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.heroInfo}>
          <Text style={styles.heroTitle}>Invest in your health 💙</Text>
          <Text style={styles.heroSub}>All plans include 24/7 emergency support and a HealthPass digital card.</Text>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          plans.map(p => (
            <PlanCard
              key={p._id || p.id}
              plan={p}
              isActive={(p._id === selectedPlan || p.id === selectedPlan)}
              onSelect={() => setSelectedPlan(p._id || p.id)}
            />
          ))
        )}

        <View style={styles.ctaSection}>
          <PrimaryButton
            title={`Get ${plan?.name} Plan — ₹${plan?.price?.monthly || plan?.price}/mo`}
            onPress={() => {
              if (plan?._id) {
                navigation.navigate('BillingCycle', { plan });
              } else {
                console.log('No plan selected or plan missing _id');
              }
            }}
          />
          <TouchableOpacity style={styles.compareLink}>
            <Text style={styles.compareLinkText}>Compare all plans →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          All plans auto-renew monthly. Cancel anytime from your profile.
        </Text>
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingBottom: Spacing.xxl },

  heroInfo: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  heroTitle: { fontSize: FontSize.section, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 6 },
  heroSub: { fontSize: FontSize.caption, color: Colors.textSecondary, lineHeight: 19 },

  planCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    position: 'relative',
    ...Shadows.sm,
  },
  planCardActive: {
    borderColor: Colors.primary,
    ...Shadows.primary,
  },
  planBadge: {
    position: 'absolute',
    top: 12, right: 12,
    zIndex: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  planBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.white },

  planHeader: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  planName: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  planCurrency: { fontSize: FontSize.section, fontWeight: FontWeight.bold, color: Colors.white, lineHeight: 40, marginBottom: 4 },
  planPrice: { fontSize: 44, fontWeight: FontWeight.extrabold, color: Colors.white, lineHeight: 48 },
  planPeriod: { fontSize: FontSize.body, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },

  featuresSection: { padding: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  featureCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.successLight,
    justifyContent: 'center', alignItems: 'center',
  },
  featureX: { backgroundColor: Colors.gray100 },
  featureText: { fontSize: FontSize.caption, fontWeight: FontWeight.medium, color: Colors.textPrimary, flex: 1 },

  planFooter: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  selectedPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  selectedPillText: { fontSize: FontSize.button, fontWeight: FontWeight.bold, color: Colors.primary },
  selectBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  selectBtnText: { fontSize: FontSize.button, fontWeight: FontWeight.semibold, color: Colors.textSecondary },

  ctaSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.sm, gap: Spacing.md },
  compareLink: { alignItems: 'center' },
  compareLinkText: { fontSize: FontSize.caption, fontWeight: FontWeight.semibold, color: Colors.primary },

  disclaimer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    lineHeight: 18,
  },
});

export default PlansScreen;
