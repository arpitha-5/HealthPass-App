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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import apiClient from '../services/apiService';

const { width } = Dimensions.get('window');

const MembershipScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await apiClient.get('/user/dashboard');
      if (res.data.success) {
        setUserData(res.data.dashboard.user);
      }
    } catch (e) {
      console.log('Error fetching user:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator color={Colors.primary} /></View>;

  const sub = userData?.currentSubscription || {};
  const plan = sub.plan || { name: 'HealthPass Gold', color: '#B71C1C' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Membership</Text>
        <TouchableOpacity>
           <Feather name="help-circle" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Luxury Plan Card */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.planCard}>
           <View style={styles.planHeader}>
              <View>
                 <Text style={styles.planName}>{plan.name.toUpperCase()}</Text>
                 <Text style={styles.planStatus}>Active until {new Date(sub.endDate || '2027-03-31').toLocaleDateString()}</Text>
              </View>
              <View style={styles.planBadge}><MaterialCommunityIcons name="shield-check" size={32} color={Colors.primary} /></View>
           </View>
           
           <View style={styles.planValueBox}>
              <Text style={styles.valueLabel}>Cashless Wallet Balance</Text>
              <Text style={styles.valueText}>₹{userData?.walletBalance?.toLocaleString() || '0'}</Text>
           </View>

           <View style={styles.planDivider} />

           <View style={styles.planGrid}>
              <View style={styles.gridItem}>
                 <Text style={styles.gridLabel}>OPD VISITS</Text>
                 <Text style={styles.gridValue}>{sub.visitsRemaining || '10'} Left</Text>
              </View>
              <View style={styles.gridDivider} />
              <View style={styles.gridItem}>
                 <Text style={styles.gridLabel}>LAB DISCOUNTS</Text>
                 <Text style={styles.gridValue}>25% OFF</Text>
              </View>
           </View>

           <TouchableOpacity 
             style={styles.topupBtn} 
             onPress={() => navigation.navigate('Checkout', { type: 'wallet', amount: 500 })}
           >
              <Text style={styles.topupText}>Top-up Wallet</Text>
              <Feather name="plus-circle" size={16} color="#0F172A" />
           </TouchableOpacity>
        </LinearGradient>

        <View style={styles.section}>
           <SectionTitle title="Exclusive Benefits" />
           
           {[
             { title: 'Free Specialist Consultations', icon: 'stethoscope', color: '#3B82F6', bg: '#EFF6FF' },
             { title: 'Home Sample Collection', icon: 'home-heart', color: '#10B981', bg: '#ECFDF5' },
             { title: 'Express Medicine Delivery', icon: 'truck-delivery', color: '#F59E0B', bg: '#FFFBEB' },
             { title: 'Priority Support (24/7)', icon: 'headset', color: '#8B5CF6', bg: '#F5F3FF' },
           ].map((b, i) => (
             <Card key={i} style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: b.bg }]}>
                   <MaterialCommunityIcons name={b.icon} size={24} color={b.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                   <Text style={styles.benefitTitle}>{b.title}</Text>
                   <Text style={styles.benefitSub}>Included with your {plan.name} plan.</Text>
                </View>
             </Card>
           ))}
        </View>

        <View style={styles.upgradeSection}>
           <LinearGradient colors={[Colors.primary, '#991B1B']} style={styles.upgradeCard}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.upgradeTitle}>Thinking of Upgrading?</Text>
                 <Text style={styles.upgradeSub}>Upgrade to ELITE and get unlimited consultations and zero convenience fees.</Text>
              </View>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Plans')}>
                 <Text style={styles.upgradeBtnText}>Compare Plans</Text>
              </TouchableOpacity>
           </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' }, // Dark background for the membership context
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  
  scroll: { backgroundColor: '#F8F9FB', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 10, paddingBottom: 60 },
  
  planCard: {
    margin: 20, marginTop: 25, borderRadius: 24, padding: 24,
    ...Shadows.lg,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { color: Colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  planStatus: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  planBadge: { padding: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  
  planValueBox: { marginTop: 25 },
  valueLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  valueText: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 5 },
  
  planDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  
  planGrid: { flexDirection: 'row', alignItems: 'center' },
  gridItem: { flex: 1 },
  gridLabel: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  gridValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 },
  gridDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
  
  topupBtn: { 
    backgroundColor: '#fff', borderRadius: 14, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingVertical: 12, marginTop: 25,
  },
  topupText: { color: '#0F172A', fontSize: 14, fontWeight: '800' },

  section: { padding: 20, marginTop: 10 },
  benefitCard: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 15, borderRadius: 20 },
  benefitIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  benefitTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  benefitSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  
  upgradeSection: { padding: 20 },
  upgradeCard: { borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 15 },
  upgradeTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  upgradeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, lineHeight: 18 },
  upgradeBtn: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  upgradeBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
});

export default MembershipScreen;
