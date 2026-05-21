import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import apiClient from '../services/apiService';
import { useSubscription } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

const MembershipScreen = ({ navigation }) => {
  const { subscription, currentPlan, fetchSubscription, hasActiveSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalCycle, setRenewalCycle] = useState('annual');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchSubscription();
    } catch (e) {
      console.log('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = () => {
    if (!subscription?.endDate) return null;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiry();
  const isExpiringSoon = daysLeft !== null && daysLeft <= 30;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  const renewalPrices = {
    monthly: currentPlan?.billingCycles?.monthly || 499,
    quarterly: currentPlan?.billingCycles?.quarterly || 1299,
    annual: currentPlan?.billingCycles?.annual || 3999,
  };

  const handleRenew = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Renewal Successful!',
        `Your ${currentPlan?.name || 'membership'} has been renewed for the ${renewalCycle} cycle.`,
        [
          {
            text: 'View Details',
            onPress: () => {
              setShowRenewalModal(false);
              navigation.navigate('Benefits');
            },
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process renewal. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator color={Colors.primary} /></View>;

  const plan = currentPlan || { name: 'Basic', color: '#B71C1C' };
  const sub = subscription || {};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Membership</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Support')}>
           <MaterialCommunityIcons name="headphones" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {(isExpiringSoon || isExpired) && (
          <View style={styles.expiryBanner}>
            <MaterialCommunityIcons name="alert" size={24} color="#fff" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.expiryTitle}>
                {isExpired ? 'Membership Expired' : 'Membership Expiring Soon'}
              </Text>
              <Text style={styles.expirySub}>
                {isExpired 
                  ? 'Renew now to continue enjoying your benefits.' 
                  : `${daysLeft} days left. Renew now to avoid interruption.`}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.renewNowBtn}
              onPress={() => setShowRenewalModal(true)}
            >
              <Text style={styles.renewNowText}>Renew</Text>
            </TouchableOpacity>
          </View>
        )}

        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.planCard}>
           <View style={styles.planHeader}>
              <View>
                 <Text style={styles.planName}>{plan.name?.toUpperCase() || 'BASIC'}</Text>
                 <View style={styles.statusRow}>
                   <View style={[styles.statusDot, { backgroundColor: isExpired ? Colors.error : Colors.success }]} />
                   <Text style={styles.planStatus}>
                     {isExpired ? 'Expired' : hasActiveSubscription ? 'Active' : 'Inactive'}
                   </Text>
                 </View>
              </View>
              <View style={styles.planBadge}>
                <MaterialCommunityIcons name="shield-check" size={32} color={Colors.primary} />
              </View>
           </View>
           
           {!isExpired && subscription?.endDate && (
             <View style={styles.validityBox}>
               <Text style={styles.validityLabel}>Valid Until</Text>
               <Text style={styles.validityDate}>
                 {new Date(subscription.endDate).toLocaleDateString('en-IN', {
                   day: '2-digit', month: 'long', year: 'numeric'
                 })}
               </Text>
             </View>
           )}

           <View style={styles.planDivider} />

           <View style={styles.planGrid}>
              <View style={styles.gridItem}>
                 <Text style={styles.gridLabel}>FREE VISITS</Text>
                 <Text style={styles.gridValue}>{sub.freeVisitsRemaining || plan.freeVisits || 0} Left</Text>
              </View>
              <View style={styles.gridDivider} />
              <View style={styles.gridItem}>
                 <Text style={styles.gridLabel}>LAB DISCOUNT</Text>
                 <Text style={styles.gridValue}>{plan.medical?.bloodTestsDiscount || 0}% OFF</Text>
              </View>
              <View style={styles.gridDivider} />
              <View style={styles.gridItem}>
                 <Text style={styles.gridLabel}>FAMILY</Text>
                 <Text style={styles.gridValue}>{(plan.maxAdults || 1) + (plan.maxChildren || 0)} Members</Text>
              </View>
           </View>

           <TouchableOpacity 
             style={styles.topupBtn} 
             onPress={() => navigation.navigate('Wallet')}
           >
              <MaterialCommunityIcons name="wallet" size={18} color="#0F172A" />
              <Text style={styles.topupText}>Manage Wallet</Text>
              <Feather name="chevron-right" size={16} color="#0F172A" />
           </TouchableOpacity>
        </LinearGradient>

        <View style={styles.section}>
           <SectionTitle title="Your Benefits" />
           
           {[
             { title: 'Free Specialist Consultations', icon: 'stethoscope', color: '#3B82F6', bg: '#EFF6FF', value: `${plan.freeVisits || 0}/month` },
             { title: 'Lab Test Discount', icon: 'test-tube', color: '#10B981', bg: '#ECFDF5', value: `${plan.medical?.bloodTestsDiscount || 0}% off` },
             { title: 'Diagnostics Discount', icon: 'microscope', color: '#F59E0B', bg: '#FFFBEB', value: `${plan.medical?.diagnosticsDiscount || 0}% off` },
             { title: 'Family Members', icon: 'account-group', color: '#8B5CF6', bg: '#F5F3FF', value: `${(plan.maxAdults || 1)} adults` },
           ].map((b, i) => (
             <Card key={i} style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: b.bg }]}>
                   <MaterialCommunityIcons name={b.icon} size={24} color={b.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                   <Text style={styles.benefitTitle}>{b.title}</Text>
                   <Text style={styles.benefitSub}>Included with your plan</Text>
                </View>
                <View style={[styles.benefitValue, { backgroundColor: b.bg }]}>
                  <Text style={[styles.benefitValueText, { color: b.color }]}>{b.value}</Text>
                </View>
             </Card>
           ))}
        </View>

        <View style={styles.renewalSection}>
           <Text style={styles.sectionTitle}>Subscription Renewal</Text>
           <Text style={styles.sectionSubtitle}>Choose your preferred billing cycle</Text>
           
           <View style={styles.cycleOptions}>
             {['monthly', 'quarterly', 'annual'].map((cycle) => (
               <TouchableOpacity
                 key={cycle}
                 style={[styles.cycleOption, renewalCycle === cycle && styles.cycleOptionActive]}
                 onPress={() => setRenewalCycle(cycle)}
               >
                 <View style={styles.cycleHeader}>
                   <Text style={[styles.cycleLabel, renewalCycle === cycle && styles.cycleLabelActive]}>
                     {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                   </Text>
                   {cycle === 'annual' && (
                     <View style={styles.saveBadge}>
                       <Text style={styles.saveBadgeText}>Save 20%</Text>
                     </View>
                   )}
                 </View>
                 <Text style={[styles.cyclePrice, renewalCycle === cycle && styles.cyclePriceActive]}>
                   ₹{renewalPrices[cycle].toLocaleString()}
                 </Text>
                 {cycle !== 'monthly' && (
                   <Text style={styles.cycleNote}>
                     ₹{Math.round(renewalPrices[cycle] / (cycle === 'quarterly' ? 3 : 12))}/month
                   </Text>
                 )}
               </TouchableOpacity>
             ))}
           </View>
           
           <TouchableOpacity
             style={styles.renewBtn}
             onPress={handleRenew}
             disabled={processing}
           >
             {processing ? (
               <ActivityIndicator color="#fff" />
             ) : (
               <>
                 <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                 <Text style={styles.renewBtnText}>
                   Renew Now - ₹{renewalPrices[renewalCycle].toLocaleString()}
                 </Text>
               </>
             )}
           </TouchableOpacity>
        </View>

        <View style={styles.upgradeSection}>
           <LinearGradient colors={[Colors.primary, '#991B1B']} style={styles.upgradeCard}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.upgradeTitle}>Want More Benefits?</Text>
                 <Text style={styles.upgradeSub}>
                   Upgrade to Advanced or Enhanced plan for unlimited consultations and premium benefits.
                 </Text>
              </View>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Plans')}>
                 <Text style={styles.upgradeBtnText}>View Plans</Text>
              </TouchableOpacity>
           </LinearGradient>
        </View>
      </ScrollView>

      {showRenewalModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Renew Subscription</Text>
              <TouchableOpacity onPress={() => setShowRenewalModal(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Current plan: {plan.name} | Price: ₹{renewalPrices[renewalCycle]}/{renewalCycle}
            </Text>
            
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleRenew}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Confirm Renewal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  
  scroll: { backgroundColor: '#F8FAFB', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 10, paddingBottom: 60 },
  
  expiryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },
  expiryTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  expirySub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  renewNowBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  renewNowText: { color: Colors.warning, fontSize: 13, fontWeight: '700' },
  
  planCard: {
    margin: 20, marginTop: 25, borderRadius: 24, padding: 24,
    ...Shadows.lg,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { color: Colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  planStatus: { color: '#94A3B8', fontSize: 12 },
  planBadge: { padding: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  
  validityBox: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12 },
  validityLabel: { color: '#64748B', fontSize: 11 },
  validityDate: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  
  planDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  
  planGrid: { flexDirection: 'row', alignItems: 'center' },
  gridItem: { flex: 1, alignItems: 'center' },
  gridLabel: { color: '#64748B', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  gridValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  gridDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  
  topupBtn: { 
    backgroundColor: '#fff', borderRadius: 14, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingVertical: 12, marginTop: 25,
  },
  topupText: { color: '#0F172A', fontSize: 14, fontWeight: '800', flex: 1 },

  section: { padding: 20, marginTop: 10 },
  benefitCard: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 12, borderRadius: 16 },
  benefitIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  benefitTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  benefitSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  benefitValue: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  benefitValueText: { fontSize: 12, fontWeight: '700' },
  
  renewalSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    ...Shadows.sm,
  },
  renewalSectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, marginTop: 4 },
  cycleOptions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  cycleOption: {
    flex: 1,
    backgroundColor: Colors.gray50,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray200,
  },
  cycleOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cycleLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  cycleLabelActive: { color: Colors.primary },
  saveBadge: { backgroundColor: Colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  saveBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  cyclePrice: { fontSize: 18, fontWeight: '800', color: '#111827' },
  cyclePriceActive: { color: Colors.primary },
  cycleNote: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  renewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  renewBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  upgradeSection: { padding: 20 },
  upgradeCard: { borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 15 },
  upgradeTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  upgradeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, lineHeight: 18 },
  upgradeBtn: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  upgradeBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  modalBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default MembershipScreen;
