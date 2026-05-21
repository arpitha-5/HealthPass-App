// screens/CheckoutScreen.js - Fixed with proper wallet integration
import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Theme from '../components/Theme';
import { Colors } from '../theme/index';

const CheckoutScreen = ({ route, navigation }) => {
  const params = route?.params || {};
  const {
    type = 'plan',
    plan: routePlan,
    billingCycle,
    items = [],
    amount: routeAmount,
    serviceType = 'appointment',
  } = params;

  const { token } = useContext(AuthContext);
  const { walletBalance, applyWallet, currentPlan, freeVisitsRemaining, calculateDiscount } = useSubscription();

  const [loading, setLoading] = useState(false);
  const [applyWalletCredit, setApplyWalletCredit] = useState(false);

  // ─── Calculate totals ─────────────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    if (type === 'plan') {
      const plan = routePlan || {};
      const prices = plan.price || {};
      return prices[billingCycle?.toLowerCase()] || plan.priceMonthly || 0;
    }
    if (type === 'lab' || type === 'diagnostics') {
      return routeAmount || items.reduce((acc, item) => acc + (item.price || 0), 0);
    }
    if (type === 'pharmacy') {
      return items.reduce((acc, item) => acc + (item.price || 0), 0);
    }
    if (type === 'wallet') {
      return routeAmount || 0;
    }
    return 0;
  }, [type, routePlan, billingCycle, items, routeAmount]);

  // ─── Calculate discounts ─────────────────────────────────────────────────────
  const discountInfo = useMemo(() => {
    if (type === 'appointment' && freeVisitsRemaining > 0) {
      return { discount: subtotal, label: 'Free Visit', isFree: true };
    }
    return calculateDiscount(serviceType, subtotal);
  }, [type, freeVisitsRemaining, serviceType, subtotal, calculateDiscount]);

  const gst = Math.round((subtotal - (discountInfo.isFree ? subtotal : 0)) * 0.18);
  const afterDiscount = discountInfo.isFree ? 0 : subtotal - discountInfo.discount;
  const total = afterDiscount + gst;

  // ─── Wallet application ───────────────────────────────────────────────────────
  const walletDiscount = applyWalletCredit ? Math.min(walletBalance, total) : 0;
  const finalAmount = Math.max(0, total - walletDiscount);

  const toggleWallet = () => {
    if (walletBalance <= 0) {
      Alert.alert('No Wallet Balance', 'Add money to your wallet to use for payments.');
      return;
    }
    setApplyWalletCredit(!applyWalletCredit);
  };

  // ─── Payment handler ─────────────────────────────────────────────────────────
  const handlePayment = async () => {
    setLoading(true);
    try {
      // Apply wallet credit first if selected
      if (applyWalletCredit && walletDiscount > 0) {
        const walletResult = await applyWallet({
          amount: walletDiscount,
          type: type,
          referenceId: `ORDER-${Date.now()}`,
        });
        
        if (!walletResult.success) {
          Alert.alert('Wallet Error', walletResult.error || 'Failed to apply wallet credit');
          setLoading(false);
          return;
        }
      }

      // Simulate payment gateway
      Alert.alert(
        'Payment Gateway',
        `Pay ₹${finalAmount.toLocaleString()} via Razorpay`,
        [
          {
            text: 'Confirm Payment',
            onPress: () => handlePaymentSuccess(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoading(false),
          },
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigation.replace('PaymentSuccess', {
      transactionId: `TXN-${Date.now()}`,
      planName: type === 'plan' ? routePlan?.name : type === 'wallet' ? 'Wallet Top-up' : 'Payment',
      amount: finalAmount,
      walletUsed: walletDiscount,
    });
  };

  // ─── Get order details ───────────────────────────────────────────────────────
  const getOrderDetails = () => {
    switch (type) {
      case 'plan':
        return {
          title: `${routePlan?.name || 'Plan'} Membership`,
          subtitle: `${billingCycle} subscription`,
        };
      case 'lab':
        return {
          title: 'Lab Test Booking',
          subtitle: `${items.length || 1} test(s)`,
        };
      case 'diagnostics':
        return {
          title: 'Diagnostics',
          subtitle: 'Diagnostic services',
        };
      case 'pharmacy':
        return {
          title: 'Pharmacy Order',
          subtitle: `${items.length} item(s)`,
        };
      case 'wallet':
        return {
          title: 'Wallet Top-up',
          subtitle: 'Add credits to wallet',
        };
      default:
        return { title: 'Checkout', subtitle: 'Review your order' };
    }
  };

  const order = getOrderDetails();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{order.title}</Text>
          <Text style={styles.subtitle}>{order.subtitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {/* Wallet Toggle */}
            {type !== 'wallet' && (
              <TouchableOpacity
                style={[
                  styles.walletOption,
                  { borderColor: applyWalletCredit ? '#10B981' : '#E5E7EB' },
                ]}
                onPress={toggleWallet}
              >
                <View style={styles.walletLeft}>
                  <View style={[styles.walletIcon, applyWalletCredit && styles.walletIconActive]}>
                    <MaterialCommunityIcons name="wallet" size={22} color={applyWalletCredit ? '#fff' : Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.walletTitle}>HealthPass Wallet</Text>
                    <Text style={styles.walletBalance}>Balance: ₹{walletBalance.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={[styles.toggle, applyWalletCredit && styles.toggleActive]}>
                  <View style={[styles.toggleDot, applyWalletCredit && styles.toggleDotActive]} />
                </View>
              </TouchableOpacity>
            )}

            {/* Applied Discounts */}
            {discountInfo.discount > 0 && (
              <View style={styles.discountRow}>
                <View style={styles.discountLabel}>
                  <MaterialCommunityIcons name="tag" size={16} color="#10B981" />
                  <Text style={styles.discountText}>{discountInfo.label}</Text>
                </View>
                <Text style={styles.discountValue}>-₹{discountInfo.discount.toLocaleString()}</Text>
              </View>
            )}

            {/* Free Visit */}
            {discountInfo.isFree && (
              <View style={styles.freeVisitBanner}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.freeVisitText}>✓ Free Visit Applied ({freeVisitsRemaining} remaining)</Text>
              </View>
            )}

            {/* Applied Wallet */}
            {applyWalletCredit && walletDiscount > 0 && (
              <View style={styles.walletAppliedRow}>
                <View style={styles.discountLabel}>
                  <MaterialCommunityIcons name="wallet" size={16} color="#6366F1" />
                  <Text style={styles.discountText}>Wallet Credit Applied</Text>
                </View>
                <Text style={styles.walletAppliedValue}>-₹{walletDiscount.toLocaleString()}</Text>
              </View>
            )}

            {/* Line Items */}
            {type === 'plan' && routePlan && (
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>{routePlan.name} - {billingCycle}</Text>
                <Text style={styles.lineValue}>₹{subtotal.toLocaleString()}</Text>
              </View>
            )}

            {type !== 'plan' && items.map((item, idx) => (
              <View key={idx} style={styles.lineItem}>
                <Text style={styles.lineLabel}>{item.name || item.brand}</Text>
                <Text style={styles.lineValue}>₹{(item.price || 0).toLocaleString()}</Text>
              </View>
            ))}

            {type === 'wallet' && (
              <View style={styles.lineItem}>
                <Text style={styles.lineLabel}>Wallet Recharge</Text>
                <Text style={styles.lineValue}>₹{subtotal.toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.divider} />

            {/* Totals */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (18%)</Text>
              <Text style={styles.totalValue}>₹{gst.toLocaleString()}</Text>
            </View>

            {discountInfo.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: '#10B981' }]}>Plan Discount</Text>
                <Text style={[styles.totalValue, { color: '#10B981' }]}>-₹{discountInfo.discount.toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.grandTotal}>
              <Text style={styles.grandLabel}>Total Amount</Text>
              <Text style={styles.grandValue}>₹{finalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={[styles.paymentOption, styles.paymentSelected]}>
            <View style={styles.paymentLeft}>
              <View style={[styles.iconBox, styles.iconBoxSelected]}>
                <Feather name="smartphone" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.paymentLabel}>UPI (Google Pay, PhonePe)</Text>
            </View>
            <View style={[styles.radio, styles.radioActive]}>
              <View style={styles.radioInner} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption}>
            <View style={styles.paymentLeft}>
              <View style={styles.iconBox}>
                <Feather name="credit-card" size={20} color="#666" />
              </View>
              <Text style={styles.paymentLabel}>Credit / Debit Card</Text>
            </View>
            <View style={styles.radio} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption}>
            <View style={styles.paymentLeft}>
              <View style={styles.iconBox}>
                <Feather name="home" size={20} color="#666" />
              </View>
              <Text style={styles.paymentLabel}>Net Banking</Text>
            </View>
            <View style={styles.radio} />
          </TouchableOpacity>
        </View>

        {/* Security Badge */}
        <View style={styles.secureBadge}>
          <Feather name="shield" size={18} color="#10B981" />
          <Text style={styles.secureText}>256-bit SSL Encrypted Payment</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerAmount}>
          <Text style={styles.footerLabel}>Payable Amount</Text>
          <Text style={styles.footerValue}>₹{finalAmount.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay Now</Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 5 },
  headerText: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  scroll: { paddingBottom: 100 },
  
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  walletIconActive: { backgroundColor: '#10B981' },
  walletTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  walletBalance: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#D1D5DB', justifyContent: 'center', paddingHorizontal: 3 },
  toggleActive: { backgroundColor: '#10B981' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  toggleDotActive: { alignSelf: 'flex-end' },
  
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  discountLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  discountText: { fontSize: 14, color: '#065F46', fontWeight: '600' },
  discountValue: { fontSize: 14, color: '#065F46', fontWeight: '800' },
  
  walletAppliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  walletAppliedValue: { fontSize: 14, color: '#4338CA', fontWeight: '800' },
  
  freeVisitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  freeVisitText: { fontSize: 14, color: '#065F46', fontWeight: '600' },
  
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  lineLabel: { color: '#6B7280', fontSize: 14 },
  lineValue: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { color: '#6B7280', fontSize: 14 },
  totalValue: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  grandLabel: { color: '#1F2937', fontSize: 18, fontWeight: '800' },
  grandValue: { color: '#E53935', fontSize: 24, fontWeight: '900' },
  
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  paymentSelected: { borderColor: Colors.primary, backgroundColor: '#FEF2F2' },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  iconBoxSelected: { backgroundColor: '#FFFFFF' },
  paymentLabel: { color: '#1F2937', fontSize: 15, fontWeight: '600' },
  
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  
  secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  secureText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerAmount: { flex: 1 },
  footerLabel: { fontSize: 12, color: '#6B7280' },
  footerValue: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    height: 54,
    borderRadius: 14,
  },
  payButtonDisabled: { opacity: 0.7 },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
