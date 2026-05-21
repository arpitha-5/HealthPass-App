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
  Alert,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { referralService } from '../services/userServices';
import { MOCK_REFERRALS } from '../data/mockData';

const ReferralsScreen = ({ navigation }) => {
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReferral = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await referralService.getReferralDetails();
      if (res.success) {
        setReferral(res.referral);
      }
    } catch (error) {
      console.log('Error fetching referral:', error);
      setReferral(MOCK_REFERRALS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  const handleShare = async () => {
    try {
      const shareUrl = `https://healthpass.app/register?ref=${referral?.code}`;
      await Share.share({
        message: `Join HealthPass and get exclusive healthcare benefits! Use my referral code: ${referral?.code}\n\nDownload now: ${shareUrl}`,
        title: 'Join HealthPass',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading referrals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchReferral(true)} tintColor={Colors.primary} />
        }
      >
        <View style={styles.referralBanner}>
          <View style={styles.bannerContent}>
            <MaterialCommunityIcons name="gift" size={48} color="#fff" />
            <Text style={styles.bannerTitle}>Share HealthPass</Text>
            <Text style={styles.bannerSub}>Invite friends and earn ₹100 for each signup</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Your Referral Code</Text>
              <View style={styles.codeRow}>
                <Text style={styles.code}>{referral?.code || 'CODE123'}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                  <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Feather name="share-2" size={20} color="#fff" />
              <Text style={styles.shareBtnText}>Share with Friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{referral?.referralCount || 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{(referral?.totalRewards || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </Card>
        </View>

        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialCommunityIcons name="share-variant" size={24} color={Colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Code</Text>
                <Text style={styles.stepDesc}>Share your unique referral code with friends</Text>
              </View>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.successLight }]}>
                <MaterialCommunityIcons name="account-plus" size={24} color={Colors.success} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Friend Signs Up</Text>
                <Text style={styles.stepDesc}>Your friend creates an account using your code</Text>
              </View>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.warningLight }]}>
                <MaterialCommunityIcons name="gift" size={24} color={Colors.warning} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Earn Rewards</Text>
                <Text style={styles.stepDesc}>Get ₹100 credited to your wallet instantly</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.referralHistory}>
          <Text style={styles.sectionTitle}>Referral History</Text>
          {referral?.referrals?.length > 0 ? (
            referral.referrals.map((item) => (
              <Card key={item._id} style={styles.referralCard}>
                <View style={styles.referralRow}>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{item.referredUser}</Text>
                    <Text style={styles.referralDate}>
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.referralReward}>
                    <Text style={styles.rewardAmount}>+₹{item.reward}</Text>
                    <StatusBadge status={item.status} size="sm" />
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="account-group-outline"
              title="No Referrals Yet"
              subtitle="Start referring friends to earn rewards"
            />
          )}
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
  referralBanner: { margin: 20, backgroundColor: Colors.primary, borderRadius: 24, overflow: 'hidden' },
  bannerContent: { alignItems: 'center', padding: 30 },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 16 },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  codeBox: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 16, marginTop: 24, width: '100%' },
  codeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 12 },
  code: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  copyBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  copyBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, marginTop: 24, gap: 10 },
  shareBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 20 },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  howItWorks: { padding: 20, paddingTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
  steps: { gap: 0 },
  step: { flexDirection: 'row', alignItems: 'center' },
  stepIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  stepContent: { flex: 1, marginLeft: 16 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  stepDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  stepLine: { width: 2, height: 30, backgroundColor: Colors.gray200, marginLeft: 27 },
  referralHistory: { padding: 20, paddingTop: 10 },
  referralCard: { marginBottom: 12, padding: 16 },
  referralRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referralInfo: { flex: 1 },
  referralName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  referralDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  referralReward: { alignItems: 'flex-end', gap: 6 },
  rewardAmount: { fontSize: 16, fontWeight: '800', color: Colors.success },
});

export default ReferralsScreen;
