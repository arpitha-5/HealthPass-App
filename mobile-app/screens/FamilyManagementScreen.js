import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import { userAPI } from '../services/apiService';
import { useSubscription } from '../context/SubscriptionContext';

const FamilyManagementScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const { currentPlan, walletBalance } = useSubscription();

  const planLimits = {
    maxAdults: currentPlan?.maxAdults || 1,
    maxChildren: currentPlan?.maxChildren || 0,
  };

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getFamilyMembers();
      if (res.success) {
        setMembers(res.familyMembers || []);
      }
    } catch (err) {
      console.log('Error fetching family:', err.message);
      setMembers([
        {
          _id: '1',
          name: 'Priya Medharametla',
          relationship: 'Spouse',
          age: 32,
          gender: 'Female',
          visitsUsed: 2,
          visitsLimit: 5,
          lastVisit: '2026-03-20',
          isAdult: true,
        },
        {
          _id: '2',
          name: 'Aarav Medharametla',
          relationship: 'Son',
          age: 8,
          gender: 'Male',
          visitsUsed: 1,
          visitsLimit: 5,
          lastVisit: '2026-03-15',
          isAdult: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDeleteMember = async (id, name) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${name}? They will no longer be eligible for plan benefits.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await userAPI.deleteFamilyMember(id);
              if (res.success) {
                Alert.alert('Success', 'Family member removed successfully');
                fetchMembers();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to remove family member');
            }
          }
        }
      ]
    );
  };

  const canAddMore = () => {
    const adults = members.filter(m => m.isAdult || m.relationship?.toLowerCase() !== 'son' && m.relationship?.toLowerCase() !== 'daughter').length;
    const children = members.length - adults;
    return adults < planLimits.maxAdults || children < planLimits.maxChildren;
  };

  const getUsagePercentage = (member) => {
    const used = member.visitsUsed || 0;
    const limit = member.visitsLimit || currentPlan?.freeVisits || 5;
    return (used / limit) * 100;
  };

  const renderMemberCard = ({ item }) => {
    const usagePercent = getUsagePercentage(item);
    const isSelected = selectedMember?._id === item._id;

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setSelectedMember(isSelected ? null : item)}
      >
        <Card style={[styles.memberCard, isSelected && styles.memberCardSelected]}>
          <View style={styles.memberHeader}>
            <View style={styles.memberInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'F'}</Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberMeta}>
                  {item.relationship} • {item.age} years • {item.isAdult ? 'Adult' : 'Child'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => handleDeleteMember(item._id || item.id, item.name)}
            >
              <Feather name="trash-2" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.usageSection}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Benefit Usage</Text>
              <Text style={styles.usageCount}>
                {item.visitsUsed || 0}/{item.visitsLimit || currentPlan?.freeVisits || 5} visits
              </Text>
            </View>
            <View style={styles.usageBar}>
              <View 
                style={[
                  styles.usageFill, 
                  { width: `${usagePercent}%` },
                  usagePercent > 80 && styles.usageFillWarning
                ]} 
              />
            </View>
          </View>

          {item.lastVisit && (
            <View style={styles.lastVisitRow}>
              <MaterialCommunityIcons name="calendar-check" size={14} color={Colors.textSecondary} />
              <Text style={styles.lastVisitText}>
                Last visit: {new Date(item.lastVisit).toLocaleDateString('en-IN', { 
                  day: '2-digit', month: 'short', year: 'numeric' 
                })}
              </Text>
            </View>
          )}

          {isSelected && (
            <View style={styles.expandedInfo}>
              <View style={styles.expandedRow}>
                <View style={styles.expandedStat}>
                  <Text style={styles.expandedLabel}>Diagnostics Used</Text>
                  <Text style={styles.expandedValue}>
                    {item.diagnosticsUsed || 0} tests
                  </Text>
                </View>
                <View style={styles.expandedStat}>
                  <Text style={styles.expandedLabel}>Credits Earned</Text>
                  <Text style={styles.expandedValue}>
                    ₹{(item.creditsEarned || 0).toLocaleString()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.bookForBtn}
                onPress={() => navigation.navigate('BookAppointment', { familyMember: item })}
              >
                <MaterialCommunityIcons name="calendar-plus" size={18} color="#fff" />
                <Text style={styles.bookForBtnText}>Book for {item.name}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const totalVisitsUsed = members.reduce((sum, m) => sum + (m.visitsUsed || 0), 0);
  const totalVisitsLimit = members.length * (currentPlan?.freeVisits || 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Members</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.planLimitsCard}>
          <View style={styles.limitsHeader}>
            <MaterialCommunityIcons name="shield-account" size={24} color={Colors.primary} />
            <Text style={styles.limitsTitle}>Plan Coverage</Text>
          </View>
          <View style={styles.limitsRow}>
            <View style={styles.limitItem}>
              <Text style={styles.limitValue}>{planLimits.maxAdults}</Text>
              <Text style={styles.limitLabel}>Adults</Text>
            </View>
            <View style={styles.limitDivider} />
            <View style={styles.limitItem}>
              <Text style={styles.limitValue}>{planLimits.maxChildren}</Text>
              <Text style={styles.limitLabel}>Children</Text>
            </View>
            <View style={styles.limitDivider} />
            <View style={styles.limitItem}>
              <Text style={styles.limitValue}>{currentPlan?.freeVisits || 5}</Text>
              <Text style={styles.limitLabel}>Visits/Member</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{members.length}</Text>
              <Text style={styles.summaryLabel}>Members</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalVisitsUsed}</Text>
              <Text style={styles.summaryLabel}>Visits Used</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalVisitsLimit - totalVisitsUsed}</Text>
              <Text style={styles.summaryLabel}>Visits Left</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          {canAddMore() && (
            <TouchableOpacity 
              style={styles.addMemberBtn}
              onPress={() => navigation.navigate('AddFamilyMember', { onComplete: fetchMembers })}
            >
              <Feather name="plus" size={16} color={Colors.primary} />
              <Text style={styles.addMemberText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>Loading family...</Text>
          </View>
        ) : members.length > 0 ? (
          members.map((item) => renderMemberCard({ item, key: item._id }))
        ) : (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Family Members Yet</Text>
            <Text style={styles.emptySub}>Add your loved ones to manage their health together.</Text>
            <TouchableOpacity 
              style={styles.addFirstBtn}
              onPress={() => navigation.navigate('AddFamilyMember', { onComplete: fetchMembers })}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addFirstText}>Add First Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {members.length > 0 && (
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              Tap on a family member card to view detailed usage and book appointments directly.
            </Text>
          </View>
        )}
      </ScrollView>

      {canAddMore() && members.length > 0 && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFamilyMember', { onComplete: fetchMembers })}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Family Member</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  planLimitsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Shadows.sm,
  },
  limitsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  limitsTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginLeft: 10 },
  limitsRow: { flexDirection: 'row', alignItems: 'center' },
  limitItem: { flex: 1, alignItems: 'center' },
  limitValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  limitLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  limitDivider: { width: 1, height: 40, backgroundColor: Colors.divider },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addMemberText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  infoBox: { 
    flexDirection: 'row', backgroundColor: '#EFF6FF', 
    padding: 15, borderRadius: 15, marginTop: 20, gap: 10 
  },
  infoText: { flex: 1, fontSize: 12, color: '#3B82F6', lineHeight: 18, fontWeight: '500' },
  memberCard: { marginBottom: 15, borderRadius: 18, padding: 16 },
  memberCardSelected: { borderWidth: 2, borderColor: Colors.primary },
  memberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  memberInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: Colors.primary, fontWeight: '800', fontSize: 18 },
  memberDetails: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  memberMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  deleteBtn: { padding: 8 },
  usageSection: { marginTop: 16 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  usageLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  usageCount: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  usageBar: { height: 8, backgroundColor: Colors.gray100, borderRadius: 4, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 4 },
  usageFillWarning: { backgroundColor: Colors.warning },
  lastVisitRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  lastVisitText: { fontSize: 11, color: Colors.textSecondary },
  expandedInfo: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.divider },
  expandedRow: { flexDirection: 'row', gap: 12 },
  expandedStat: { flex: 1, backgroundColor: Colors.gray50, padding: 12, borderRadius: 12 },
  expandedLabel: { fontSize: 11, color: Colors.textSecondary },
  expandedValue: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 4 },
  bookForBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, padding: 14, borderRadius: 12, marginTop: 16 },
  bookForBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  loader: { paddingVertical: 60, alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#64748B' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  addFirstBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  addFirstText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  addButton: {
    position: 'absolute', bottom: 30, right: 20, left: 20,
    backgroundColor: Colors.primary, height: 56, borderRadius: 28,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, ...Shadows.lg,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default FamilyManagementScreen;
