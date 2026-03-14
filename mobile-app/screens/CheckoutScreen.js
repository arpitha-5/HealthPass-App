import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Theme from '../components/Theme';
import { PrimaryButton } from '../components/Buttons';
import { paymentAPI, userAPI } from '../services/apiService';

const CheckoutScreen = ({ route, navigation }) => {
    const params = route?.params || {};
    const {
        plan: routePlan,
        billingCycle: routeBillingCycle,
        type = 'plan', // 'plan', 'pharmacy', 'lab', 'wallet'
        items = [],
        amount: routeAmount
    } = params;

    // 1. Resolve Plan Data (if type is plan)
    const plan = routePlan || {
        _id: 'default',
        name: 'HealthPass Gold',
        price: { monthly: 1999, quarterly: 5697, annual: 21588 }
    };
    const billingCycle = routeBillingCycle || 'Monthly';

    // 2. Calculate Totals based on type
    let subtotal = 0;
    let orderTitle = 'Checkout';
    let orderSubtitle = 'Review your selection';

    if (type === 'plan') {
        subtotal = plan.price[billingCycle.toLowerCase()] || 0;
        orderTitle = `${plan.name} Plan`;
        orderSubtitle = `Membership for ${billingCycle}`;
    } else if (type === 'pharmacy') {
        subtotal = items.reduce((acc, item) => acc + item.price, 0);
        orderTitle = 'Pharmacy Checkout';
        orderSubtitle = `${items.length} Medicines in cart`;
    } else if (type === 'lab') {
        subtotal = routeAmount || items.reduce((acc, item) => acc + item.price, 0);
        orderTitle = 'Diagnostics Checkout';
        orderSubtitle = 'Lab test booking';
    } else if (type === 'wallet') {
        subtotal = routeAmount || 500;
        orderTitle = 'Wallet Top-up';
        orderSubtitle = 'Add money to HealthPass wallet';
    }

    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    const { token, API_URL } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [familyCount, setFamilyCount] = useState(0);

    useEffect(() => {
        const fetchFamily = async () => {
            if (!token) return;
            try {
                const response = await userAPI.getFamilyMembers();
                if (response.success) {
                    setFamilyCount(response.familyMembers.length);
                }
            } catch (e) {
                console.log('Fetch Family Error (Silent)');
            }
        };
        fetchFamily();
    }, [token]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const orderData = {
                planId: type === 'plan' ? plan._id : undefined,
                billingCycle: type === 'plan' ? billingCycle : undefined,
                type,
                amount: total,
                items: items.map(i => i.id || i._id)
            };

            const response = await paymentAPI.createOrder(orderData);

            if (response.success) {
                Alert.alert(
                    "Secure Payment Gateway",
                    `Simulating payment of ₹${total} via Razorpay...`,
                    [{
                        text: "Confirm Payment",
                        onPress: () => verifyPaymentSimulation(response.order_id)
                    }, {
                        text: "Cancel",
                        onPress: () => setLoading(false),
                        style: "cancel"
                    }]
                );
            }
        } catch (e) {
            console.error('Payment Error:', e.message);
            Alert.alert('Payment Error', 'Failed to initialize payment. Please try again.');
            setLoading(false);
        }
    };

    const verifyPaymentSimulation = async (orderId) => {
        try {
            const mockPaymentId = "pay_sim_" + Math.random().toString(36).substr(2, 9);
            const verifyData = {
                razorpay_order_id: orderId,
                razorpay_payment_id: mockPaymentId,
                razorpay_signature: 'mock_signature',
                type,
                planId: type === 'plan' ? plan._id : undefined,
                billingCycle: type === 'plan' ? billingCycle : undefined
            };

            const response = await paymentAPI.verifyPayment(verifyData);

            if (response.success) {
                navigation.replace('PaymentSuccess', {
                    transactionId: mockPaymentId,
                    planName: type === 'plan' ? plan.name : orderTitle,
                    validUntil: response.subscription?.expiryDate || 'N/A'
                });
            }
        } catch (e) {
            console.error('Verification Error:', e.message);
            Alert.alert('Verification Failed', 'Transaction successful but server sync failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="chevron-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{orderTitle}</Text>
                    <Text style={styles.subtitle}>{orderSubtitle}</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <View style={styles.summaryCard}>
                            {type === 'plan' ? (
                                <>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>{plan.name} - {billingCycle}</Text>
                                        <Text style={styles.summaryValue}>₹{subtotal}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, { fontSize: 13 }]}>Coverage for {familyCount + 1} Members</Text>
                                        <Text style={styles.summaryValue}>Included</Text>
                                    </View>
                                </>
                            ) : (
                                items.map((item, idx) => (
                                    <View key={idx} style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>{item.name || item.brand}</Text>
                                        <Text style={styles.summaryValue}>₹{item.price}</Text>
                                    </View>
                                ))
                            )}

                            {type === 'wallet' && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Wallet Recharge</Text>
                                    <Text style={styles.summaryValue}>₹{subtotal}</Text>
                                </View>
                            )}

                            <View style={styles.divider} />

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>₹{subtotal}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Taxes & GST (18%)</Text>
                                <Text style={styles.summaryValue}>₹{gst}</Text>
                            </View>
                            <View style={[styles.summaryTotal, { marginTop: 16 }]}>
                                <Text style={styles.totalLabel}>Grand Total</Text>
                                <Text style={styles.totalValue}>₹{total}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <PaymentOption icon={<Feather name="smartphone" size={20} color="#E53935" />} label="UPI (Google Pay, PhonePe)" selected={true} />
                        <PaymentOption icon={<Feather name="credit-card" size={20} color="#E53935" />} label="Credit / Debit Card" />
                        <PaymentOption icon={<Feather name="home" size={20} color="#E53935" />} label="Net Banking" />
                    </View>

                    <View style={styles.secureBadge}>
                        <Feather name="shield" size={18} color="#10B981" />
                        <Text style={styles.secureText}>PCI-DSS Secure Payments</Text>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <PrimaryButton
                        title={`Confirm & Pay ₹${total}`}
                        onPress={handlePayment}
                        loading={loading}
                    />

                    <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Dashboard')}>
                        <Text style={styles.skipText}>⏭️ Cancel & Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const PaymentOption = ({ icon, label, selected }) => (
    <TouchableOpacity style={[styles.paymentOption, selected && styles.paymentSelected]}>
        <View style={styles.paymentLeft}>
            <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>{icon}</View>
            <Text style={styles.paymentLabel}>{label}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioActive]}>
            {selected && <View style={styles.radioInner} />}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: Theme.spacing.lg },
    header: { marginTop: 24, marginBottom: 24 },
    backBtn: { marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
    subtitle: { fontSize: 16, color: '#6B7280', marginTop: 8 },
    scrollArea: { paddingBottom: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
    summaryCard: { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: '#6B7280', fontSize: 14 },
    summaryValue: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16, borderStyle: 'dashed' },
    summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: '#1F2937', fontSize: 18, fontWeight: '800' },
    totalValue: { color: '#E53935', fontSize: 24, fontWeight: '900' },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    paymentSelected: { borderColor: '#E53935', backgroundColor: '#FEF2F2' },
    paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    iconBoxSelected: { backgroundColor: '#FFFFFF' },
    paymentLabel: { color: '#1F2937', fontSize: 15, fontWeight: '600' },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: '#E53935' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E53935' },
    secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
    secureText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
    footer: { paddingVertical: 24 },
    skipButton: { marginTop: 16, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB' },
    skipText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
});

export default CheckoutScreen;
