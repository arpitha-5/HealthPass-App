import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Theme from './Theme';

export const Card = ({ children, style, onPress }) => {
    const Component = onPress ? TouchableOpacity : View;
    return (
        <Component style={[styles.card, style]} onPress={onPress}>
            {children}
        </Component>
    );
};

export const PlanCard = ({ title, price, visits, credits, benefits, isPremium, onPress }) => (
    <Card
        style={[styles.planCard, isPremium && styles.premiumCard]}
        onPress={onPress}
    >
        {isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>Most Popular</Text></View>}
        <Text style={styles.planTitle}>{title}</Text>
        <Text style={styles.planPrice}>{price}</Text>
        <Text style={styles.planDetail}>{visits} visits included</Text>
        <Text style={styles.planDetail}>{credits} credits</Text>
        <View style={styles.benefitsContainer}>
            {benefits.map((b, i) => (
                <Text key={i} style={styles.benefitText}>• {b}</Text>
            ))}
        </View>
    </Card>
);

export const HospitalCard = ({ name, distance, rating, services, onPress }) => (
    <Card style={styles.hospitalCard} onPress={onPress}>
        <View style={styles.hospitalHeader}>
            <Text style={styles.hospitalName}>{name}</Text>
            <Text style={styles.ratingText}>★ {rating}</Text>
        </View>
        <Text style={styles.hospitalDistance}>{distance}</Text>
        <Text style={styles.hospitalServices}>{services.join(' • ')}</Text>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.borders.radius,
        padding: Theme.spacing.padding,
        marginBottom: Theme.spacing.cardGap,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    planCard: {
        position: 'relative',
    },
    premiumCard: {
        borderColor: Theme.colors.primary,
        borderWidth: 2,
    },
    premiumBadge: {
        position: 'absolute',
        top: -10,
        right: 15,
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    premiumBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    planTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.textPrimary,
        marginBottom: 8,
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '800',
        color: Theme.colors.primary,
        marginBottom: 12,
    },
    planDetail: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginBottom: 4,
    },
    benefitsContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        paddingTop: 10,
    },
    benefitText: {
        fontSize: 13,
        color: Theme.colors.textSecondary,
        marginBottom: 4,
    },
    hospitalCard: {
        paddingVertical: 20,
    },
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.textPrimary,
        flex: 1,
    },
    ratingText: {
        color: '#F59E0B',
        fontWeight: 'bold',
        fontSize: 14,
    },
    hospitalDistance: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginBottom: 8,
    },
    hospitalServices: {
        fontSize: 12,
        color: Theme.colors.primary,
        fontWeight: '500',
    }
});
