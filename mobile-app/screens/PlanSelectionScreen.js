// screens/PlanSelectionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../theme/index';
import apiClient from '../services/apiService';
import walletService from '../services/walletService';

const PlanSelectionScreen = ({ navigation, route }) => {
  const { plan } = route.params;
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [loading, setLoading] = useState(false);

  const getPrice = () => {
    switch (billingCycle) {
      case 'MONTHLY': return plan.priceMonthly || plan.price;
      case 'QUARTERLY': return plan.priceQuarterly;
      case 'ANNUAL': return plan.priceAnnually;
      default: return plan.priceMonthly || plan.price;
    }
  };

  const getSavings = () => {
    const monthlyTotal = (plan.priceMonthly || plan.price) * 12;
    const annualPrice = plan.priceAnnually;
    if (!annualPrice) return 0;
    return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/subscription/subscribe', {
        planId: plan._id,
        billingCycle,
      });

      if (res.data.success) {
        Alert.alert(
          '🎉 Welcome to ' + (plan.displayName || plan.name) + '!',
          'Your subscription is now active. Wallet credits have been added.',
          [
            {
              text: 'View Dashboard',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Plan Summary Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[plan.color + '20', '#FFFFFF']}
            style={styles.planCard}
          >
            <View style={styles.planHeader}>
              <View style={[styles.planIcon, { backgroundColor: plan.color + '30' }]}>
                <MaterialCommunityIcons
                  name={plan.name === 'Platinum' ? 'crown' : plan.name === 'Gold' ? 'shield-star' : 'shield'}
                  size={40}
                  color={plan.color}
                />
              </View>
              <Text style={styles.planName}>{plan.displayName || plan.name} Plan</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>

            {/* Billing Cycle Selection */}
            <View style={styles.billingSection}>
              <Text style={styles.sectionTitle}>Billing Cycle</Text>
              <View style={styles.billingOptions}>
                {['MONTHLY', 'QUARTERLY', 'ANNUAL'].map((cycle) => (
                  <TouchableOpacity
                    key={cycle}
                    style={[
                      styles.billingOption,
                      billingCycle === cycle && styles.billingOptionActive,
                    ]}
                    onPress={() => setBillingCycle(cycle)}
                  >
                    <Text
                      style={[
                        styles.billingText,
                        billingCycle === cycle && styles.billingTextActive,
                      ]}
                    >
                      {cycle === 'MONTHLY' ? 'Monthly' : cycle === 'QUARTERLY' ? 'Quarterly' : 'Annually'}
                    </Text>
                    {cycle === 'ANNUAL' && getSavings() > 0 && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>Save {getSavings()}%</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total</Text>
                <View style={styles.priceDisplay}>
                  <Text style={styles.priceCurrency}>₹</Text>
                  <Text style={styles.priceAmount}>{getPrice()}</Text>
                </View>
              </View>
              {billingCycle === 'ANNUAL' && (
                <Text style={styles.perMonthText}>
                  That's just ₹{Math.round(getPrice() / 12)}/month
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* What You Get */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionHeader}>What You Get</Text>

          {/* Free Visits */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#EF4444" />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitValue}>{plan.freeVisits || 0} Free Visits</Text>
              <Text style={styles.benefitDesc}>Per month consultation</Text>
            </View>
          </View>

          {/* Medical Benefits */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="test-tube" size={24} color="#3B82F6" />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitValue}>{(plan.medical?.bloodTestsDiscount || 0)}% Off Lab Tests</Text>
              <Text style={styles.benefitDesc}>On all diagnostic services</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#D1FAE5' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#10B981" />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitValue}>{(plan.medical?.healthCheckupDiscount || 0)}% Off Health Checkups</Text>
              <Text style={styles.benefitDesc}>Preventive health packages</Text>
            </View>
          </View>

          {/* Coverage */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="account-group" size={24} color="#F59E0B" />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitValue}>{(plan.maxAdults || 1)} Adults + {(plan.maxChildren || 0)} Kids</Text>
              <Text style={styles.benefitDesc}>Covered under this plan</Text>
            </View>
          </View>

          {/* Wallet Credits */}
          {(plan.features?.walletCredits > 0) && (
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="wallet-giftcard" size={24} color="#6366F1" />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitValue}>₹{plan.features.walletCredits} Welcome Credits</Text>
                <Text style={styles.benefitDesc}>Added to your wallet instantly</Text>
              </View>
            </View>
          )}

          {/* Extra Features */}
          {plan.extraFeatures?.aiSupport && (
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="robot" size={24} color="#9333EA" />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitValue}>AI Health Assistant</Text>
                <Text style={styles.benefitDesc}>24/7 symptom checker & support</Text>
              </View>
            </View>
          )}

          {/* Accidental Coverage */}
          {plan.accidentalCoverage?.enabled && (
            <View style={[styles.benefitCard, styles.accidentalCard]}>
              <View style={[styles.benefitIcon, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#DC2626" />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitValue}>Accidental Coverage up to ₹{plan.accidentalCoverage.maxAmount?.toLocaleString() || 0}</Text>
                <Text style={styles.benefitDesc}>Peace of mind for you & family</Text>
              </View>
            </View>
          )}
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            You can cancel anytime from your profile settings.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: plan.color }]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.ctaText}>Subscribe Now • ₹{getPrice()}</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },

  cardContainer: { padding: 20 },
  planCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planHeader: { alignItems: 'center', marginBottom: 24 },
  planIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: { fontSize: 28, fontWeight: '800', color: '#111' },
  planDescription: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },

  billingSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 12 },
  billingOptions: { flexDirection: 'row', gap: 10 },
  billingOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  billingOptionActive: { borderColor: '#E53935', backgroundColor: '#FEF2F2' },
  billingText: { fontSize: 13, fontWeight: '600', color: '#666' },
  billingTextActive: { color: '#E53935' },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  savingsText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  priceSection: { alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceLabel: { fontSize: 16, color: '#666' },
  priceDisplay: { flexDirection: 'row', alignItems: 'flex-start' },
  priceCurrency: { fontSize: 24, fontWeight: '700', color: '#111', marginTop: 8 },
  priceAmount: { fontSize: 48, fontWeight: '800', color: '#111' },
  perMonthText: { fontSize: 13, color: '#10B981', fontWeight: '600', marginTop: 4 },

  benefitsSection: { paddingHorizontal: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },

  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accidentalCard: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitInfo: { flex: 1, marginLeft: 14 },
  benefitValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  benefitDesc: { fontSize: 13, color: '#666', marginTop: 2 },

  termsSection: { paddingHorizontal: 20, paddingVertical: 20 },
  termsText: { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },

  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ctaButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PlanSelectionScreen;
