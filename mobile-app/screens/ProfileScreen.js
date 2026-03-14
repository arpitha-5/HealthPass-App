// HealthPass Profile Screen - Updated 2026-03-10
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { userAPI } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';
import Card from '../components/Card';

/** Mirrors the key used in EditProfileScreen */
const PROFILE_STORAGE_KEY = '@healthpass_profile';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonBox = ({ width, height, style }) => {
  const opacity = React.useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        { height, borderRadius: BorderRadius.sm, backgroundColor: '#F1F5F9' },
        typeof width === 'string' ? { flex: 1 } : { width },
        { opacity },
        style,
      ]}
    />
  );
};

const ProfileSkeleton = () => (
  <View>
    <View style={sk.hero}>
      <SkeletonBox width={88} height={88} style={{ borderRadius: 44 }} />
      <SkeletonBox width={180} height={18} style={{ marginTop: 16 }} />
      <SkeletonBox width={130} height={14} style={{ marginTop: 8 }} />
    </View>
    {[0, 1].map(i => (
      <View key={i} style={sk.card}>
        {[0, 1, 2].map(j => (
          <View key={j} style={sk.row}>
            <SkeletonBox width={36} height={36} style={{ borderRadius: 8 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonBox width="40%" height={11} />
              <SkeletonBox width="70%" height={15} style={{ marginTop: 6 }} />
            </View>
          </View>
        ))}
      </View>
    ))}
  </View>
);
const sk = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, margin: 16, marginBottom: 0, padding: 16 },
  row:  { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
});

// ─── Reusable sub-components ─────────────────────────────────────────────────
const InfoCardHeader = ({ icon, title, color = Colors.primary }) => (
  <View style={styles.infoCardHeader}>
    <View style={[styles.infoCardIconBox, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.infoCardTitle}>{title}</Text>
  </View>
);

const InfoRow = ({ label, value, last }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const ActionRow = ({ icon, label, sublabel, onPress, danger, last, color = Colors.primary }) => (
  <TouchableOpacity
    style={[styles.actionRow, !last && styles.actionRowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.actionIconBox, danger ? { backgroundColor: '#FEE2E2' } : { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={20} color={danger ? Colors.primary : color} />
    </View>
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={[styles.actionLabel, danger && { color: Colors.primary }]}>{label}</Text>
      {sublabel ? <Text style={styles.actionSublabel}>{sublabel}</Text> : null}
    </View>
    <Feather name="chevron-right" size={18} color={danger ? Colors.primary : '#94A3B8'} />
  </TouchableOpacity>
);

const ProfileAvatar = ({ name = '', avatar = null, size = 88 }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || 'U';
  
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
      )}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation, route }) => {
  const { user, logout: contextLogout } = useContext(AuthContext);
  const [userData,   setUserData]   = useState(user || null);
  const [loading,    setLoading]    = useState(!user);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  // ── Load profile — checks backend for freshest data ──
  const loadProfile = useCallback(async (silent = false) => {
    try {
      if (!silent && !userData) setLoading(true);
      setError('');

      const res = await userAPI.getProfile();
      const profile = res?.user || res?.data || res;
      
      if (profile) {
        setUserData({
          ...profile,
          name:            profile.fullName || profile.name || userData?.name || 'User',
          email:           profile.email || userData?.email || '',
          phone:           profile.mobileNumber || profile.phone || userData?.phone || '',
          walletBalance:   profile.walletBalance ?? 0,
          visitsRemaining: profile.visitsRemaining ?? 10,
          familyCount:     profile.familyMembers?.length || profile.familyCount || 0,
          membershipPlan:  profile.membershipPlan || 'Free',
          dob:             profile.dob || '',
          gender:          profile.gender || '',
          address:         profile.address || '',
          emergencyContact: profile.emergencyContact || '',
          avatar:          profile.avatar || profile.profilePicture || null,
        });
      }
    } catch (err) {
      console.log('Profile load error:', err.message);
      if (!userData) setError('Could not load profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData]);

  useEffect(() => { 
    if (!userData) loadProfile(); 
  }, [loadProfile, userData]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => loadProfile(true));
    return unsub;
  }, [navigation, loadProfile]);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'You will be signed out of HealthPass. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
             await contextLogout();
             navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ]
    );
  };

  const planColor = (plan = '') => {
    const p = plan.toLowerCase();
    if (p.includes('elite')) return '#1E293B';
    if (p.includes('gold'))  return '#F59E0B';
    return Colors.primary;
  };

  if (!loading && error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="wifi-off" size={48} color={Colors.primary} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadProfile()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const u = userData || {};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditProfile', { userData: u })}
        >
          <Feather name="edit-3" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} tintColor={Colors.primary} />
        }
      >
        {loading ? <ProfileSkeleton /> : (
          <>
            {/* ── Profile Hero ── */}
            <TouchableOpacity 
              style={styles.hero}
              onPress={() => navigation.navigate('EditProfile', { userData: u })}
              activeOpacity={0.9}
            >
              <ProfileAvatar name={u.name} avatar={u.avatar} size={90} />
              <View style={styles.heroInfo}>
                 <Text style={styles.heroName}>{u.name}</Text>
                 <Text style={styles.heroEmail}>{u.email || u.phone}</Text>
                 <View style={[styles.planBadge, { backgroundColor: planColor(u.membershipPlan) + '15' }]}>
                    <MaterialCommunityIcons name="shield-check" size={14} color={planColor(u.membershipPlan)} />
                    <Text style={[styles.planBadgeText, { color: planColor(u.membershipPlan) }]}>{u.membershipPlan} Member</Text>
                 </View>
              </View>
            </TouchableOpacity>

            {/* ── Profile Completion Tracker ── */}
            {!u.address || !u.dob || !u.emergencyContact ? (
              <TouchableOpacity 
                style={styles.completionCard}
                onPress={() => navigation.navigate('EditProfile', { userData: u })}
              >
                <View style={styles.completionHeader}>
                   <Text style={styles.completionTitle}>Complete Your Profile</Text>
                   <Text style={styles.completionPercent}>70%</Text>
                </View>
                <View style={styles.completionBarBg}>
                   <View style={[styles.completionBarFill, { width: '70%' }]} />
                </View>
                <Text style={styles.completionSub}>Add your DOB and address to unlock full benefits.</Text>
              </TouchableOpacity>
            ) : null}

            {/* ── Stats Stats Row ── */}
            <View style={styles.statsRow}>
               <View style={styles.statItem}>
                  <Text style={styles.statVal}>₹{u.walletBalance?.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Health Wallet</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.statItem}>
                  <Text style={styles.statVal}>{u.visitsRemaining}</Text>
                  <Text style={styles.statLabel}>OPD Visits</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.statItem}>
                  <Text style={styles.statVal}>{u.familyCount}</Text>
                  <Text style={styles.statLabel}>Family</Text>
               </View>
            </View>

            {/* ── Personal Info Section ── */}
            <View style={styles.section}>
               <Card style={styles.infoCard}>
                  <InfoCardHeader icon="account-circle-outline" title="Personal Details" />
                  <InfoRow label="Full Name" value={u.name} />
                  <InfoRow label="Phone Number" value={u.phone} />
                  <InfoRow label="Gender" value={u.gender} />
                  <InfoRow label="Date of Birth" value={u.dob} />
                  <InfoRow label="Residential Address" value={u.address} last />
               </Card>
            </View>

            {/* ── Emergency & Insurance Section ── */}
            <View style={styles.section}>
               <Card style={styles.infoCard}>
                  <InfoCardHeader icon="shield-alert-outline" title="Critical Info" color="#EF4444" />
                  <InfoRow label="Emergency Contact" value={u.emergencyContact} />
                  <InfoRow label="Insurance Partner" value={u.insuranceProvider} />
                  <InfoRow label="Policy Number" value={u.insurancePolicyNumber} last />
               </Card>
            </View>

            {/* ── Action List ── */}
            <View style={[styles.section, { marginTop: 10 }]}>
               <Card style={styles.actionCard}>
                  <ActionRow 
                    icon="file-document-outline" 
                    label="Health Vault" 
                    sublabel="Access reports & prescriptions" 
                    onPress={() => navigation.navigate('HealthRecords')} 
                  />
                  <ActionRow 
                    icon="account-group-outline" 
                    label="Family Members" 
                    sublabel="Manage dependents & sub-profiles" 
                    onPress={() => navigation.navigate('FamilyManagement')} 
                  />
                  <ActionRow 
                    icon="bell-ring-outline" 
                    label="Notifications" 
                    sublabel="Reminders & health updates" 
                    onPress={() => navigation.navigate('Notifications')} 
                    color="#F59E0B"
                  />
                  <ActionRow 
                    icon="credit-card-outline" 
                    label="Plans & Subscriptions" 
                    sublabel="View active membership benefits" 
                    onPress={() => navigation.navigate('Membership')} 
                    color="#10B981"
                  />
                  <ActionRow 
                    icon="logout" 
                    label="Sign Out" 
                    sublabel="Securely logout from your account" 
                    onPress={handleLogout} 
                    danger 
                    last 
                  />
               </Card>
            </View>

            <Text style={styles.version}>HealthPass Premium Version 1.2.0</Text>
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingFamilyBtn}
        onPress={() => navigation.navigate('AddFamilyMember')}
      >
         <MaterialCommunityIcons name="account-plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  editBtn: { padding: 5 },
  
  scroll: { paddingBottom: 60, backgroundColor: '#F8F9FB' },
  
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  avatar: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  avatarText: { color: '#fff', fontWeight: '800' },
  heroInfo: { marginLeft: 20, flex: 1 },
  heroName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  heroEmail: { fontSize: 14, color: '#64748B', marginTop: 4 },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  planBadgeText: { fontSize: 11, fontWeight: '800' },

  completionCard: {
    margin: 20, marginTop: 0, padding: 16,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#FEE2E2',
    ...Shadows.sm,
  },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completionTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  completionPercent: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  completionBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginVertical: 10, overflow: 'hidden' },
  completionBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  completionSub: { fontSize: 12, color: '#64748B', lineHeight: 18 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#F1F5F9' },

  section: { paddingHorizontal: 20, marginTop: 20 },
  infoCard: { padding: 0, borderRadius: 20, overflow: 'hidden' },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoCardIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoCardTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginLeft: 12 },
  
  infoRow: { padding: 16 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 15, color: '#111827', fontWeight: '600', marginTop: 4 },

  actionCard: { padding: 0, borderRadius: 20, overflow: 'hidden' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  actionIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  actionSublabel: { fontSize: 12, color: '#64748B', marginTop: 2 },

  floatingFamilyBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.primary,
  },

  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 20 },
  errorSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
  retryBtn: { 
    marginTop: 25, 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 12 
  },
  retryText: { color: '#fff', fontWeight: '800' },
  
  version: { textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 30 },
});

export default ProfileScreen;
