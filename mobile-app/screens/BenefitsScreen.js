import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import { ProgressBar } from '../components/InfoComponents';
import { useSubscription } from '../context/SubscriptionContext';

const BenefitsScreen = ({ navigation }) => {
  const {
    subscription,
    currentPlan,
    walletBalance,
    freeVisitsRemaining,
    benefits,
    loading,
    fetchBenefits,
  } = useSubscription();

  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchBenefits();
    setRefreshing(false);
  }, [fetchBenefits]);

  useEffect(() => {
    if (!benefits) {
      fetchBenefits();
    }
  }, [benefits, fetchBenefits]);

  const handleTabPress = (tab) => {
    if (tab === 'home') navigation.navigate('Dashboard');
    if (tab === 'appointments') navigation.navigate('Appointments');
    if (tab === 'benefits') setActiveTab('benefits');
    if (tab === 'wallet') navigation.navigate('Wallet');
    if (tab === 'profile') navigation.navigate('Profile');
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading benefits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = benefits?.usageStats || {};
  const plan = currentPlan;
  const planName = plan?.displayName || plan?.name || 'No Active Plan';
  const planBenefits = benefits?.planBenefits || [];

  // Generate benefits list from plan if not available
  const benefitsList = planBenefits.length > 0 ? planBenefits : (plan ? getPlanBenefitsList(plan) : []);

  function getPlanBenefitsList(p) {
    const list = [];
    if (p.freeVisits > 0) list.push(`${p.freeVisits} Free Doctor Consultations/month`);
    if (p.medical?.bloodTestsDiscount > 0) list.push(`${p.medical.bloodTestsDiscount}% Off on Lab Tests`);
    if (p.medical?.diagnosticsDiscount > 0) list.push(`${p.medical.diagnosticsDiscount}% Off on Diagnostics`);
    if (p.features?.priorityLine) list.push('Priority Booking Line');
    if (p.features?.claimTracking) list.push('Track Claims Online');
    if (p.accidentalCoverage?.enabled) list.push(`Accidental Coverage up to ₹${p.accidentalCoverage.maxAmount?.toLocaleString()}`);
    if (p.extraFeatures?.aiSupport) list.push('24/7 AI Health Assistant');
    return list;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Benefits</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={Colors.primary} />
        }
      >
        <View style={styles.activePlanCard}>
          <Card style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planLabel}>Current Plan</Text>
                <Text style={styles.planName}>{planName}</Text>
              </View>
              {subscription && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>Active</Text>
                </View>
              )}
            </View>
            {subscription && (
              <View style={styles.planMeta}>
                <View style={styles.planMetaItem}>
                  <MaterialCommunityIcons name="calendar" size={16} color={Colors.textSecondary} />
                  <Text style={styles.planMetaText}>
                    Valid until {new Date(subscription.endDate).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <View style={styles.planMetaItem}>
                  <MaterialCommunityIcons name="account-group" size={16} color={Colors.textSecondary} />
                  <Text style={styles.planMetaText}>
                    {(plan?.maxAdults || 0) + (plan?.maxChildren || 0)} Family Members
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Plans')}>
              <Text style={styles.upgradeText}>
                {subscription ? 'Change Plan' : 'Choose a Plan'}
              </Text>
              <Feather name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Statistics</Text>
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
                  <MaterialCommunityIcons name="stethoscope" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>
                  {(plan?.freeVisits || 0) - (freeVisitsRemaining || 0)}/{plan?.freeVisits || 0}
                </Text>
                <Text style={styles.statLabel}>Consultations Used</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
                  <MaterialCommunityIcons name="wallet" size={20} color={Colors.success} />
                </View>
                <Text style={styles.statValue}>₹{(walletBalance || 0).toLocaleString()}</Text>
                <Text style={styles.statLabel}>Wallet Credits</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.warningLight }]}>
                  <MaterialCommunityIcons name="gift" size={20} color={Colors.warning} />
                </View>
                <Text style={styles.statValue}>{freeVisitsRemaining || 0}</Text>
                <Text style={styles.statLabel}>Free Visits Left</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.infoLight }]}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.info} />
                </View>
                <Text style={styles.statValue}>{plan?.medical?.bloodTestsDiscount || 0}%</Text>
                <Text style={styles.statLabel}>Lab Discount</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Benefits</Text>
          <Card style={styles.benefitsCard}>
            {benefitsList.length > 0 ? (
              benefitsList.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.benefitCheck}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noBenefitsText}>
                Choose a plan to see your benefits
              </Text>
            )}
          </Card>
        </View>

        {subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coverage Details</Text>
            <Card>
              <ProgressBar
                label="Free Consultations"
                value={(plan?.freeVisits || 0) - (freeVisitsRemaining || 0)}
                max={plan?.freeVisits || 0}
                color={Colors.primary}
              />
              <View style={{ height: 16 }} />
              <ProgressBar
                label="Lab Tests Discount"
                value={plan?.medical?.bloodTestsDiscount || 0}
                max={100}
                color={Colors.success}
              />
              <View style={{ height: 16 }} />
              <ProgressBar
                label="Diagnostics Discount"
                value={plan?.medical?.diagnosticsDiscount || 0}
                max={100}
                color={Colors.info}
              />
            </Card>
          </View>
        )}

        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('FamilyManagement')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="account-multiple" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Manage Family Members</Text>
              <Text style={styles.actionSub}>Add or remove family members</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Bills')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.warningLight }]}>
              <MaterialCommunityIcons name="file-document" size={24} color={Colors.warning} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Upload Medical Bills</Text>
              <Text style={styles.actionSub}>Earn wallet credits on approved bills</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Referrals')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
              <MaterialCommunityIcons name="gift" size={24} color={Colors.success} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Refer & Earn</Text>
              <Text style={styles.actionSub}>Share your code and earn rewards</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: Colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  scroll: { paddingBottom: 120 },
  activePlanCard: { padding: 20, paddingTop: 24 },
  planCard: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
  planName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  planBadge: { backgroundColor: Colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  planBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  planMeta: { flexDirection: 'row', marginTop: 16, gap: 20 },
  planMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planMetaText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginTop: 16, gap: 6 },
  upgradeText: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  statsCard: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statItem: { width: '47%', alignItems: 'center', padding: 12 },
  statIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  benefitsCard: { gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  benefitCheck: { marginRight: 12 },
  benefitText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  noBenefitsText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', padding: 20 },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, ...Shadows.sm },
  actionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionInfo: { flex: 1, marginLeft: 12 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  actionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});

export default BenefitsScreen;
