// screens/WalletScreen.js - Fixed with proper wallet integration
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { useSubscription } from '../context/SubscriptionContext';
import { AuthContext } from '../context/AuthContext';

const WalletScreen = ({ navigation }) => {
  const { wallet, walletBalance, fetchWallet, topUpWallet } = useSubscription();
  const { token } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      await fetchWallet();
    } catch (error) {
      console.log('Error fetching wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchWallet]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 100) {
      Alert.alert('Invalid Amount', 'Minimum top-up amount is ₹100');
      return;
    }

    setTopUpLoading(true);
    try {
      const result = await topUpWallet({ amount });
      if (result.success) {
        Alert.alert('Success', `₹${amount} added to your wallet!`);
        setShowTopUpModal(false);
        setTopUpAmount('');
        navigation.navigate('Checkout', {
          type: 'wallet',
          amount,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add money. Please try again.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'CREDIT':
        return { name: 'arrow-down-left', color: '#10B981', bg: '#D1FAE5' };
      case 'DEBIT':
        return { name: 'arrow-up-right', color: '#EF4444', bg: '#FEE2E2' };
      case 'REVERSAL':
        return { name: 'undo', color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { name: 'swap-horizontal', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderTransaction = ({ item }) => {
    const iconStyle = getTransactionIcon(item.type);
    return (
      <View style={styles.txnRow}>
        <View style={[styles.txnIcon, { backgroundColor: iconStyle.bg }]}>
          <MaterialCommunityIcons name={iconStyle.name} size={20} color={iconStyle.color} />
        </View>
        <View style={styles.txnInfo}>
          <Text style={styles.txnDesc}>{item.reason || item.description || 'Wallet Transaction'}</Text>
          <Text style={styles.txnDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={[styles.txnAmount, { color: item.type === 'CREDIT' ? '#10B981' : '#111' }]}>
          {item.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(item.amount).toLocaleString()}
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity style={styles.historyBtn}>
            <MaterialCommunityIcons name="history" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={Colors.primary} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient colors={['#E53935', '#B71C1C']} style={styles.balanceGradient}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <TouchableOpacity style={styles.addMoneyBtn} onPress={() => setShowTopUpModal(true)}>
                <Feather name="plus" size={16} color={Colors.primary} />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>₹{walletBalance.toLocaleString()}</Text>
            <View style={styles.balanceFooter}>
              <TouchableOpacity 
                style={styles.cashbackBox}
                onPress={() => navigation.navigate('Referrals')}
              >
                <MaterialCommunityIcons name="gift-outline" size={18} color="#fff" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.cashbackLabel}>Earn Rewards</Text>
                  <Text style={styles.cashbackValue}>Refer friends & earn</Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Checkout', { type: 'wallet' })}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.infoLight }]}>
              <MaterialCommunityIcons name="cash-fast" size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionLabel}>Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Referrals')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
              <MaterialCommunityIcons name="account-group" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>Refer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Bills')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.warningLight }]}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.actionLabel}>Upload Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Support')}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="headphones" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {wallet.transactions && wallet.transactions.length > 0 ? (
            <Card style={styles.txnCard}>
              {wallet.transactions.slice(0, 10).map((item) => (
                <View key={item._id}>
                  {renderTransaction({ item })}
                </View>
              ))}
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <MaterialCommunityIcons name="wallet-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your wallet transactions will appear here
              </Text>
            </Card>
          )}
        </View>

        {/* How to Earn Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Earn Credits</Text>
          <View style={styles.earnCard}>
            <View style={styles.earnRow}>
              <View style={[styles.earnIcon, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="file-document" size={20} color="#EF4444" />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Upload Medical Bills</Text>
                <Text style={styles.earnSub}>Earn 10-50% cashback on approved bills</Text>
              </View>
            </View>
            <View style={styles.earnRow}>
              <View style={[styles.earnIcon, { backgroundColor: '#D1FAE5' }]}>
                <MaterialCommunityIcons name="account-group" size={20} color="#10B981" />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Refer Friends</Text>
                <Text style={styles.earnSub}>Earn ₹200 for each successful referral</Text>
              </View>
            </View>
            <View style={styles.earnRow}>
              <View style={[styles.earnIcon, { backgroundColor: '#DBEAFE' }]}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="#3B82F6" />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Book Appointments</Text>
                <Text style={styles.earnSub}>Earn rewards on completed consultations</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Enter Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.quickAmounts}>
              {[500, 1000, 2000, 5000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAmountBtn}
                  onPress={() => setTopUpAmount(amt.toString())}
                >
                  <Text style={styles.quickAmountText}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.topUpBtn, !topUpAmount && styles.topUpBtnDisabled]}
              onPress={handleTopUp}
              disabled={!topUpAmount || topUpLoading}
            >
              {topUpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.topUpBtnText}>Proceed to Pay</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: Colors.textSecondary },
  
  headerGradient: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  backBtn: { padding: 5 },
  historyBtn: { padding: 5 },
  
  scroll: { paddingBottom: 120 },
  
  balanceCard: { marginHorizontal: 20, marginTop: -20 },
  balanceGradient: { borderRadius: 24, padding: 24, ...Shadows.lg },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  addMoneyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4
  },
  addMoneyText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  balanceAmount: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 10 },
  balanceFooter: { marginTop: 20 },
  cashbackBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 12 },
  cashbackLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  cashbackValue: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 2 },
  
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, marginHorizontal: 20,
    backgroundColor: '#fff', borderRadius: 20, padding: 16, ...Shadows.sm
  },
  actionBtn: { alignItems: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  seeAllText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  
  txnCard: { padding: 0, overflow: 'hidden' },
  txnRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  txnIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txnInfo: { flex: 1, marginLeft: 12 },
  txnDesc: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  txnDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '800' },
  
  emptyCard: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  
  earnCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...Shadows.sm },
  earnRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  earnIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  earnInfo: { marginLeft: 12, flex: 1 },
  earnTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  earnSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  modalLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  amountInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: Colors.primary, borderRadius: 12, paddingHorizontal: 16, height: 56 },
  currencySymbol: { fontSize: 24, fontWeight: '700', color: '#111', marginRight: 8 },
  input: { flex: 1, fontSize: 24, fontWeight: '700', color: '#111' },
  
  quickAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 10 },
  quickAmountBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center' },
  quickAmountText: { fontSize: 14, fontWeight: '700', color: '#111' },
  
  topUpBtn: { backgroundColor: Colors.primary, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  topUpBtnDisabled: { opacity: 0.5 },
  topUpBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default WalletScreen;
