// screens/PlansScreen.js - Complete Healthcare Plans Implementation
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
  FlatList,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';
import apiClient from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ─── Plan Card Component ───────────────────────────────────────────────────────

const PlanCard = ({ plan, isCurrentPlan, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect(plan);
  };

  return (
    <Animated.View style={[styles.planCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        <LinearGradient
          colors={[plan.color + '15', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planCard}
        >
          {/* Badges */}
          {plan.popular && (
            <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.badgeText}>{plan.badge || 'POPULAR'}</Text>
            </View>
          )}
          {isCurrentPlan && (
            <View style={[styles.badge, styles.currentBadge]}>
              <Text style={styles.badgeText}>CURRENT</Text>
            </View>
          )}

          {/* Plan Header */}
          <View style={styles.planHeader}>
            <View style={[styles.planIconContainer, { backgroundColor: plan.color + '20' }]}>
              <MaterialCommunityIcons
                name={plan.name === 'Platinum' ? 'crown' : plan.name === 'Gold' ? 'shield-star' : 'shield'}
                size={36}
                color={plan.color}
              />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name} Plan</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>₹{plan.price}</Text>
                <Text style={styles.planDuration}>/{plan.duration}</Text>
              </View>
            </View>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresPreview}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.featureText}>{plan.features?.freeVisits || 0} Free Visits</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.featureText}>{plan.medical?.bloodTestsDiscount || 0}% Blood Tests Off</Text>
            </View>
            {plan.features?.priorityLine && (
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                <Text style={styles.featureText}>Priority Booking</Text>
              </View>
            )}
          </View>

          {/* Expand/Collapse */}
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandText}>
              {expanded ? 'Hide Details' : 'View Full Details'}
            </Text>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={plan.color} />
          </TouchableOpacity>

          {/* Expanded Details */}
          {expanded && (
            <PlanDetails plan={plan} onSelect={handlePress} isCurrentPlan={isCurrentPlan} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Plan Details (Expanded View) ─────────────────────────────────────────────

const PlanDetails = ({ plan, onSelect, isCurrentPlan }) => (
  <View style={styles.detailsContainer}>
    <View style={styles.divider} />

    {/* Members & Network Coverage */}
    <Text style={styles.sectionTitle}>Coverage Details</Text>
    <View style={styles.coverageGrid}>
      <View style={styles.coverageBox}>
        <MaterialCommunityIcons name="account-group" size={24} color={plan.color} />
        <Text style={styles.coverageValue}>{plan.maxMembers}</Text>
        <Text style={styles.coverageLabel}>Members</Text>
      </View>
      <View style={styles.coverageBox}>
        <MaterialCommunityIcons name="hospital-building" size={24} color={plan.color} />
        <Text style={styles.coverageValue}>
          {plan.networkType === 'premium' ? 'All' : plan.networkType === 'network' ? 'Network' : 'Select'}
        </Text>
        <Text style={styles.coverageLabel}>Network</Text>
      </View>
      <View style={styles.coverageBox}>
        <MaterialCommunityIcons name="wallet" size={24} color={plan.color} />
        <Text style={styles.coverageValue}>₹{plan.features?.walletCredits || 0}</Text>
        <Text style={styles.coverageLabel}>Credits</Text>
      </View>
    </View>

    {/* Medical Benefits */}
    <Text style={styles.sectionTitle}>Medical Benefits</Text>
    <View style={styles.benefitsList}>
      <BenefitRow
        icon="test-tube"
        label="Blood Tests"
        value={`${plan.medical?.bloodTestsDiscount || 0}% Off`}
        color="#8B5CF6"
      />
      <BenefitRow
        icon="heart-pulse"
        label="Health Checkups"
        value={`${plan.medical?.healthCheckupDiscount || 0}% Off`}
        color="#EC4899"
      />
      <BenefitRow
        icon="microscope"
        label="Diagnostics"
        value={`${plan.medical?.diagnosticsDiscount || 0}% Off`}
        color="#06B6D4"
      />
      <BenefitRow
        icon="medical-bag"
        label="Free Checkups"
        value={plan.medical?.freeHealthCheckups || 0}
        color="#10B981"
      />
    </View>

    {/* Plan Features */}
    <Text style={styles.sectionTitle}>Features & Services</Text>
    <View style={styles.featuresGrid}>
      <FeatureBadge
        label="Free Visits"
        value={plan.features?.freeVisits || 0}
        active={plan.features?.freeVisits > 0}
      />
      <FeatureBadge
        label="Priority Line"
        active={plan.features?.priorityLine}
      />
      <FeatureBadge
        label="Claim Tracking"
        active={plan.features?.claimTracking}
      />
      <FeatureBadge
        label="AI Support"
        active={plan.extraFeatures?.aiSupport}
      />
      <FeatureBadge
        label="Reminders"
        active={plan.extraFeatures?.reminders}
      />
      <FeatureBadge
        label="Health Tracking"
        active={plan.extraFeatures?.healthTracking}
      />
    </View>

    {/* Accidental Coverage */}
    {plan.accidentalCoverage?.enabled && (
      <>
        <Text style={styles.sectionTitle}>Accidental Coverage</Text>
        <View style={styles.accidentalCard}>
          <MaterialCommunityIcons name="shield-check" size={28} color="#EF4444" />
          <View style={styles.accidentalInfo}>
            <Text style={styles.accidentalTitle}>
              Cover up to ₹{plan.accidentalCoverage.maxAmount.toLocaleString()}
            </Text>
            <Text style={styles.accidentalSub}>
              {plan.accidentalCoverage.claimLimit} claim{plan.accidentalCoverage.claimLimit > 1 ? 's' : ''} per year
            </Text>
          </View>
        </View>
      </>
    )}

    {/* Limitations */}
    {plan.limitations?.exclusions?.length > 0 && (
      <>
        <Text style={styles.sectionTitle}>Limitations & Exclusions</Text>
        <View style={styles.limitationsBox}>
          {plan.limitations.exclusions.map((item, index) => (
            <Text key={index} style={styles.exclusionText}>
              • {item}
            </Text>
          ))}
          {plan.limitations.maxClaimsPerYear > 0 && (
            <Text style={styles.exclusionText}>
              • Max {plan.limitations.maxClaimsPerYear} claims per year
            </Text>
          )}
          {plan.limitations.waitingPeriodDays > 0 && (
            <Text style={styles.exclusionText}>
              • {plan.limitations.waitingPeriodDays} days waiting period
            </Text>
          )}
        </View>
      </>
    )}

    {/* CTA Button */}
    <TouchableOpacity
      style={[
        styles.selectBtn,
        { backgroundColor: isCurrentPlan ? '#10B981' : plan.color },
      ]}
      onPress={onSelect}
    >
      <Text style={styles.selectBtnText}>
        {isCurrentPlan ? '✓ Current Plan' : `Select ${plan.name} Plan`}
      </Text>
      {!isCurrentPlan && (
        <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  </View>
);

// ─── Helper Components ─────────────────────────────────────────────────────────

const BenefitRow = ({ icon, label, value, color }) => (
  <View style={styles.benefitRow}>
    <View style={[styles.benefitIcon, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.benefitLabel}>{label}</Text>
    <Text style={styles.benefitValue}>{value}</Text>
  </View>
);

const FeatureBadge = ({ label, value, active }) => (
  <View style={[styles.featureBadge, !active && styles.featureBadgeInactive]}>
    <MaterialCommunityIcons
      name={active ? 'check-circle' : 'close-circle'}
      size={16}
      color={active ? '#10B981' : '#D1D5DB'}
    />
    <Text style={[styles.featureBadgeText, !active && styles.featureBadgeTextInactive]}>
      {label}
    </Text>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────

const PlansScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/plans');
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.log('Failed to fetch plans:', err);
      // Use fallback static plans
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const res = await apiClient.get('/subscriptions/active');
      if (res.data.success && res.data.subscription) {
        setCurrentPlanId(res.data.subscription.plan?._id);
      }
    } catch (err) {
      console.log('No active subscription');
    }
  };

  const handlePlanSelect = (plan) => {
    if (currentPlanId === plan._id) {
      navigation.navigate('Membership');
    } else {
      navigation.navigate('PlanSelection', { plan });
    }
  };

  const renderPlan = ({ item }) => (
    <PlanCard
      plan={item}
      isCurrentPlan={currentPlanId === item._id}
      onSelect={handlePlanSelect}
    />
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loaderText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>Cancel anytime • No hidden fees</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Info */}
      <View style={styles.heroInfo}>
        <Text style={styles.heroTitle}>Invest in your health 💙</Text>
        <Text style={styles.heroSub}>
          All plans include 24/7 support and a HealthPass digital card
        </Text>
      </View>

      {/* Plans List */}
      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPlans();
              fetchCurrentSubscription();
              setRefreshing(false);
            }}
            tintColor="#E53935"
          />
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </SafeAreaView>
  );
};

// ─── Fallback Static Plans ─────────────────────────────────────────────────────

const FALLBACK_PLANS = [
  {
    _id: 'silver',
    name: 'Silver',
    price: 99,
    duration: 'month',
    color: '#6B7280',
    popular: false,
    badge: '',
    maxMembers: 1,
    networkType: 'individual',
    features: {
      freeVisits: 2,
      priorityLine: false,
      claimTracking: false,
      walletCredits: 50,
    },
    medical: {
      bloodTestsDiscount: 10,
      healthCheckupDiscount: 5,
      diagnosticsDiscount: 5,
      freeHealthCheckups: 0,
    },
    accidentalCoverage: { enabled: false, maxAmount: 0, claimLimit: 0 },
    extraFeatures: {
      aiSupport: false,
      reminders: true,
      healthTracking: false,
      walletRewards: true,
    },
    limitations: {
      maxClaimsPerYear: 2,
      waitingPeriodDays: 30,
      exclusions: ['Pre-existing conditions', 'Cosmetic procedures'],
    },
  },
  {
    _id: 'gold',
    name: 'Gold',
    price: 299,
    duration: 'month',
    color: '#F59E0B',
    popular: true,
    badge: 'POPULAR',
    maxMembers: 4,
    networkType: 'network',
    features: {
      freeVisits: 10,
      priorityLine: true,
      claimTracking: true,
      walletCredits: 200,
    },
    medical: {
      bloodTestsDiscount: 30,
      healthCheckupDiscount: 20,
      diagnosticsDiscount: 25,
      freeHealthCheckups: 2,
    },
    accidentalCoverage: { enabled: true, maxAmount: 50000, claimLimit: 2 },
    extraFeatures: {
      aiSupport: true,
      reminders: true,
      healthTracking: true,
      walletRewards: true,
    },
    limitations: {
      maxClaimsPerYear: 10,
      waitingPeriodDays: 15,
      exclusions: ['International treatments'],
    },
  },
  {
    _id: 'platinum',
    name: 'Platinum',
    price: 599,
    duration: 'month',
    color: '#7C3AED',
    popular: false,
    badge: 'PREMIUM',
    maxMembers: 6,
    networkType: 'premium',
    features: {
      freeVisits: 999,
      priorityLine: true,
      claimTracking: true,
      walletCredits: 500,
    },
    medical: {
      bloodTestsDiscount: 50,
      healthCheckupDiscount: 40,
      diagnosticsDiscount: 45,
      freeHealthCheckups: 4,
    },
    accidentalCoverage: { enabled: true, maxAmount: 150000, claimLimit: 3 },
    extraFeatures: {
      aiSupport: true,
      reminders: true,
      healthTracking: true,
      walletRewards: true,
    },
    limitations: {
      maxClaimsPerYear: 50,
      waitingPeriodDays: 0,
      exclusions: [],
    },
  },
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#666', fontSize: 14 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },

  heroInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  heroSub: { fontSize: 13, color: '#666', marginTop: 4 },

  listContent: { padding: 20 },

  planCardWrapper: { marginBottom: 20 },
  planCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },

  badge: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  currentBadge: { left: 20, right: 'auto', backgroundColor: '#10B981' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  planIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: { marginLeft: 16, flex: 1 },
  planName: { fontSize: 24, fontWeight: '800', color: '#111' },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  planPrice: { fontSize: 32, fontWeight: '800', color: '#111' },
  planDuration: { fontSize: 16, color: '#666', marginBottom: 4 },

  featuresPreview: { gap: 10, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: '#444', fontWeight: '500' },

  expandBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  expandText: { fontSize: 14, fontWeight: '600', color: '#E53935' },

  detailsContainer: { marginTop: 20 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 20 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 14,
    marginTop: 8,
  },

  coverageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  coverageBox: { alignItems: 'center' },
  coverageValue: { fontSize: 20, fontWeight: '800', color: '#111', marginTop: 8 },
  coverageLabel: { fontSize: 12, color: '#666', marginTop: 4 },

  benefitsList: { marginBottom: 20 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitLabel: { flex: 1, marginLeft: 12, fontSize: 14, color: '#444', fontWeight: '500' },
  benefitValue: { fontSize: 14, fontWeight: '700', color: '#10B981' },

  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  featureBadgeInactive: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
  featureBadgeText: { fontSize: 12, color: '#166534', fontWeight: '600' },
  featureBadgeTextInactive: { color: '#9CA3AF' },

  accidentalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
  },
  accidentalInfo: { flex: 1 },
  accidentalTitle: { fontSize: 16, fontWeight: '700', color: '#991B1B' },
  accidentalSub: { fontSize: 13, color: '#B91C1C', marginTop: 2 },

  limitationsBox: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  exclusionText: { fontSize: 13, color: '#92400E', marginBottom: 6 },

  selectBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    marginTop: 8,
  },
  selectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PlansScreen;
