import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import { PrimaryButton } from '../components/Buttons';

const PaymentSuccessScreen = ({ route, navigation }) => {
    const { transactionId, planName, validUntil } = route.params;

    const formattedDate = (validUntil && validUntil !== 'N/A') 
        ? new Date(validUntil).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'N/A';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.successIcon}>
                    <Feather name="check-circle" size={80} color="#10B981" />
                </View>

                <View style={styles.textWrapper}>
                    <Text style={styles.title}>Subscription Active!</Text>
                    <Text style={styles.subtitle}>Welcome to the {planName} Membership</Text>
                </View>

                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>{transactionId}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Plan Validity</Text>
                        <Text style={styles.detailValue}>Until {formattedDate}</Text>
                    </View>
                </View>

                <View style={styles.badgeWrapper}>
                    <Feather name="shield" size={20} color="#E53935" />
                    <Text style={styles.badgeText}>HealthPass Membership ID Active</Text>
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        title="Go to Dashboard"
                        onPress={() => navigation.replace('Dashboard')}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: Theme.spacing.lg, paddingBottom: 24, alignItems: 'center', justifyContent: 'center' },
    successIcon: { marginBottom: 32 },
    textWrapper: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '800', color: '#1F2937' },
    subtitle: { fontSize: 16, color: '#6B7280', marginTop: 12, textAlign: 'center' },
    detailsCard: {
        backgroundColor: '#F9FAFB',
        width: '100%',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 32
    },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    detailLabel: { fontSize: 14, color: '#6B7280' },
    detailValue: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
    badgeWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 },
    badgeText: { fontSize: 15, fontWeight: '700', color: '#E53935' },
    footer: { width: '100%' }
});

export default PaymentSuccessScreen;
