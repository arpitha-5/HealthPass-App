import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Theme from './Theme';

export const PrimaryButton = ({ title, onPress, disabled, loading, style }) => (
    <TouchableOpacity
        style={[styles.primaryButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
    >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>{title}</Text>}
    </TouchableOpacity>
);

export const SecondaryButton = ({ title, onPress, disabled, loading, style }) => (
    <TouchableOpacity
        style={[styles.secondaryButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
    >
        {loading ? <ActivityIndicator color={Theme.colors.primary} /> : <Text style={styles.secondaryText}>{title}</Text>}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borders.radius,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    secondaryButton: {
        backgroundColor: Theme.colors.background,
        borderWidth: 1.5,
        borderColor: Theme.colors.primary,
        borderRadius: Theme.borders.radius,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryText: {
        color: Theme.colors.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.6,
    }
});
