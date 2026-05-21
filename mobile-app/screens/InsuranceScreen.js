import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Spacing, FontSize, FontWeight, BorderRadius } from '../theme/index';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import PrimaryButton from '../components/PrimaryButton';
import { insuranceService } from '../services/userServices';
import { MOCK_INSURANCE } from '../data/mockData';

const InsuranceScreen = ({ navigation }) => {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('policies');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [claimData, setClaimData] = useState({ provider: '', amount: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [policiesRes, claimsRes] = await Promise.all([
        insuranceService.getPolicies(),
        insuranceService.getClaims()
      ]);
      if (policiesRes.success) setPolicies(policiesRes.policies || []);
      if (claimsRes.success) setClaims(claimsRes.claims || []);
    } catch (error) {
      console.log('Error fetching insurance data:', error);
      setPolicies(MOCK_INSURANCE.policies);
      setClaims(MOCK_INSURANCE.claims);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitClaim = async () => {
    if (!claimData.provider || !claimData.amount || !claimData.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await insuranceService.submitClaim({
        ...claimData,
        amount: parseFloat(claimData.amount)
      });
      if (res.success) {
        Alert.alert('Success', 'Claim submitted successfully', [
          { text: 'OK', onPress: () => setShowClaimModal(false) }
        ]);
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayPremium = async () => {
    if (!selectedPolicy) return;
    
    setSubmitting(true);
    try {
      const res = await insuranceService.payPremium(
        selectedPolicy._id,
        selectedPolicy.premiumAmount,
        'UPI'
      );
      if (res.success) {
        Alert.alert('Success', 'Premium payment successful', [
          { text: 'OK', onPress: () => setShowPaymentModal(false) }
        ]);
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = (policy) => {
    Alert.alert('Download', `Receipt for policy ${policy.policyNumber} will be downloaded.`);
  };

  const renderPolicy = ({ item }) => (
    <Card style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <View>
          <Text style={styles.insurerName}>{item.insurer}</Text>
          <Text style={styles.policyNumber}>{item.policyNumber}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.policyDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan</Text>
          <Text style={styles.detailValue}>{item.planName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sum Insured</Text>
          <Text style={styles.detailValue}>₹{item.sumInsured.toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valid Till</Text>
          <Text style={styles.detailValue}>{new Date(item.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </View>
      </View>

      <View style={[styles.premiumBanner, { backgroundColor: item.premiumStatus === 'Due' ? Colors.warningLight : Colors.gray100 }]}>
        <View>
          <Text style={styles.premiumLabel}>Premium Due</Text>
          <Text style={styles.premiumAmount}>₹{item.premiumAmount.toLocaleString()}</Text>
        </View>
        {item.premiumStatus === 'Due' && (
          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={() => { setSelectedPolicy(item); setShowPaymentModal(true); }}
          >
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.coverageSection}>
        <Text style={styles.coverageTitle}>Coverage Includes</Text>
        <View style={styles.coverageList}>
          {item.coverageDetails.map((coverage, index) => (
            <View key={index} style={styles.coverageItem}>
              <MaterialCommunityIcons name="check" size={14} color={Colors.success} />
              <Text style={styles.coverageText}>{coverage}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.receiptBtn} onPress={() => handleDownloadReceipt(item)}>
        <MaterialCommunityIcons name="download" size={18} color={Colors.primary} />
        <Text style={styles.receiptText}>Download Policy Document</Text>
      </TouchableOpacity>
    </Card>
  );

  const renderClaim = ({ item }) => (
    <Card style={styles.claimCard}>
      <View style={styles.claimHeader}>
        <Text style={styles.claimNumber}>{item.claimNumber}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={styles.claimDesc}>{item.description}</Text>
      <View style={styles.claimDetails}>
        <View>
          <Text style={styles.claimLabel}>Provider</Text>
          <Text style={styles.claimValue}>{item.provider}</Text>
        </View>
        <View>
          <Text style={styles.claimLabel}>Claim Amount</Text>
          <Text style={styles.claimValue}>₹{item.claimAmount.toLocaleString()}</Text>
        </View>
        {item.approvedAmount > 0 && (
          <View>
            <Text style={styles.claimLabel}>Approved</Text>
            <Text style={[styles.claimValue, { color: Colors.success }]}>₹{item.approvedAmount.toLocaleString()}</Text>
          </View>
        )}
      </View>
      {item.status === 'Rejected' && item.rejectionReason && (
        <View style={styles.rejectionBox}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.error} />
          <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
        </View>
      )}
      <Text style={styles.claimDate}>Submitted: {new Date(item.submittedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading insurance...</Text>
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
        <Text style={styles.headerTitle}>Insurance</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowClaimModal(true)}>
          <Feather name="plus" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'policies' && styles.activeTab]}
          onPress={() => setActiveTab('policies')}
        >
          <Text style={[styles.tabText, activeTab === 'policies' && styles.activeTabText]}>Policies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'claims' && styles.activeTab]}
          onPress={() => setActiveTab('claims')}
        >
          <Text style={[styles.tabText, activeTab === 'claims' && styles.activeTabText]}>Claims</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={Colors.primary} />
        }
      >
        {activeTab === 'policies' ? (
          policies.length > 0 ? (
            policies.map((item) => renderPolicy({ item, key: item._id }))
          ) : (
            <EmptyState
              icon="shield-outline"
              title="No Policies Found"
              subtitle="Link your insurance policy to start claiming benefits"
            />
          )
        ) : (
          <>
            <TouchableOpacity style={styles.newClaimBtn} onPress={() => setShowClaimModal(true)}>
              <MaterialCommunityIcons name="plus-circle" size={22} color={Colors.primary} />
              <Text style={styles.newClaimText}>Submit New Claim</Text>
            </TouchableOpacity>
            {claims.length > 0 ? (
              claims.map((item) => renderClaim({ item, key: item._id }))
            ) : (
              <EmptyState
                icon="file-document-outline"
                title="No Claims"
                subtitle="Your insurance claims will appear here"
              />
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Submit New Claim"
      >
        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Healthcare Provider</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter provider name"
              value={claimData.provider}
              onChangeText={(text) => setClaimData({ ...claimData, provider: text })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Claim Amount (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={claimData.amount}
              onChangeText={(text) => setClaimData({ ...claimData, amount: text })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe the treatment"
              multiline
              numberOfLines={3}
              value={claimData.description}
              onChangeText={(text) => setClaimData({ ...claimData, description: text })}
            />
          </View>
          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.uploadBtn}>
              <MaterialCommunityIcons name="cloud-upload" size={24} color={Colors.primary} />
              <Text style={styles.uploadText}>Upload Documents</Text>
            </TouchableOpacity>
            <Text style={styles.uploadHint}>Upload bill, prescription, and medical reports</Text>
          </View>
          <PrimaryButton
            title="Submit Claim"
            onPress={handleSubmitClaim}
            loading={submitting}
            style={{ marginTop: 16 }}
          />
        </View>
      </Modal>

      <Modal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Pay Premium"
      >
        <View style={styles.modalContent}>
          {selectedPolicy && (
            <>
              <View style={styles.premiumSummary}>
                <Text style={styles.premiumSummaryLabel}>Policy</Text>
                <Text style={styles.premiumSummaryValue}>{selectedPolicy.policyNumber}</Text>
                <Text style={styles.premiumSummaryAmount}>₹{selectedPolicy.premiumAmount.toLocaleString()}</Text>
              </View>
              <Text style={styles.paymentMethodLabel}>Select Payment Method</Text>
              <View style={styles.paymentMethods}>
                {['UPI', 'Card', 'NetBanking'].map((method) => (
                  <TouchableOpacity key={method} style={styles.paymentOption}>
                    <MaterialCommunityIcons
                      name={method === 'UPI' ? 'cellphone' : method === 'Card' ? 'credit-card' : 'bank'}
                      size={24}
                      color={Colors.primary}
                    />
                    <Text style={styles.paymentOptionText}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <PrimaryButton
                title="Pay ₹{selectedPolicy.premiumAmount.toLocaleString()}"
                onPress={handlePayPremium}
                loading={submitting}
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </View>
      </Modal>
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
  addBtn: { padding: 5 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 16, borderRadius: 12, padding: 4, ...Shadows.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  activeTabText: { color: '#fff' },
  scroll: { padding: 20, paddingBottom: 120 },
  policyCard: { marginBottom: 20, padding: 20 },
  policyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  insurerName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  policyNumber: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  policyDetails: { marginTop: 16, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: Colors.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  premiumBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginTop: 16 },
  premiumLabel: { fontSize: 12, color: Colors.textSecondary },
  premiumAmount: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  payNowBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  payNowText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  coverageSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.divider },
  coverageTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  coverageList: { gap: 8 },
  coverageItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverageText: { fontSize: 13, color: Colors.textSecondary },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, marginTop: 16, gap: 8 },
  receiptText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  newClaimBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primary, marginBottom: 20, gap: 10 },
  newClaimText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  claimCard: { marginBottom: 16, padding: 16 },
  claimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  claimNumber: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  claimDesc: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  claimDetails: { flexDirection: 'row', gap: 20 },
  claimLabel: { fontSize: 11, color: Colors.textSecondary },
  claimValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  rejectionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.errorLight, padding: 10, borderRadius: 8, marginTop: 12, gap: 8 },
  rejectionText: { flex: 1, fontSize: 12, color: Colors.error },
  claimDate: { fontSize: 11, color: Colors.textTertiary, marginTop: 12 },
  modalContent: { padding: 0 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  textInput: { backgroundColor: Colors.gray50, borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 80, textAlignVertical: 'top' },
  uploadSection: { alignItems: 'center', padding: 20, backgroundColor: Colors.gray50, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.border },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  uploadText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  uploadHint: { fontSize: 11, color: Colors.textSecondary, marginTop: 8 },
  premiumSummary: { alignItems: 'center', padding: 20, backgroundColor: Colors.gray50, borderRadius: 16, marginBottom: 20 },
  premiumSummaryLabel: { fontSize: 12, color: Colors.textSecondary },
  premiumSummaryValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 4 },
  premiumSummaryAmount: { fontSize: 28, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  paymentMethodLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  paymentMethods: { flexDirection: 'row', gap: 12 },
  paymentOption: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: Colors.gray50, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  paymentOptionText: { fontSize: 11, color: Colors.textSecondary, marginTop: 6 },
});

export default InsuranceScreen;
