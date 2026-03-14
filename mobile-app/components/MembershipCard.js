import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MembershipCard({ planDetails }) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="card" size={24} color="#E53935" />
                <Text style={styles.planName}>{planDetails?.planName || 'Premium Plan'}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Visits</Text>
                    <Text style={styles.statValue}>{planDetails?.visits || '10 / 12'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Credits</Text>
                    <Text style={styles.statValue}>{planDetails?.credits || '900 / 1000'}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.validityLabel}>Valid until:</Text>
                <Text style={styles.validityDate}>{planDetails?.validUntil || '12 Dec 2026'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    planName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    validityLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    validityDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E53935',
    },
});
