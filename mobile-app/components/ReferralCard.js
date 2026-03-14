import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReferralCard({ referralCode, onShare }) {
    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <Text style={styles.title}>Refer a Friend</Text>
                <Text style={styles.subtitle}>Get bonus credits for every referral</Text>

                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Referral Code: </Text>
                    <Text style={styles.code}>{referralCode || 'HP12345'}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <Ionicons name="share-social-outline" size={20} color="#E53935" />
                <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    codeLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    code: {
        fontSize: 14,
        fontWeight: '700',
        color: '#E53935',
    },
    shareButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        marginLeft: 16,
    },
    shareText: {
        color: '#E53935',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});
