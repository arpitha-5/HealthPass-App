import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Theme from '../components/Theme';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';

const PlanComparisonScreen = ({ navigation }) => {
    const features = [
        { name: 'Monthly Price', basic: '₹499', plus: '₹999', premium: '₹1999' },
        { name: 'OPD Visits', basic: '5', plus: '15', premium: '50' },
        { name: 'Diagnostic Discount', basic: '10%', plus: '20%', premium: '50%' },
        { name: 'Pharmacy Discount', basic: '5%', plus: '15%', premium: '30%' },
        { name: 'Teleconsultation', basic: true, plus: true, premium: true },
        { name: 'Insurance Cover', basic: 'None', plus: 'Partial', premium: 'Full' },
        { name: 'Priority Support', basic: false, plus: true, premium: true },
        { name: 'Home Lab Collection', basic: false, plus: true, premium: true },
    ];

    const FeatureRow = ({ feature, index }) => (
        <View style={[styles.row, index % 2 === 0 && styles.evenRow]}>
            <View style={styles.featureNameCell}>
                <Text style={styles.featureName}>{feature.name}</Text>
            </View>
            <View style={styles.cell}>
                {typeof feature.basic === 'boolean' ? (
                    feature.basic ? <Feather name="check" size={18} color="#10B981" /> : <Feather name="minus" size={18} color="#9CA3AF" />
                ) : <Text style={styles.valueText}>{feature.basic}</Text>}
            </View>
            <View style={styles.cell}>
                {typeof feature.plus === 'boolean' ? (
                    feature.plus ? <Feather name="check" size={18} color="#10B981" /> : <Feather name="minus" size={18} color="#9CA3AF" />
                ) : <Text style={styles.valueText}>{feature.plus}</Text>}
            </View>
            <View style={styles.cell}>
                {typeof feature.premium === 'boolean' ? (
                    feature.premium ? <Feather name="check" size={18} color="#10B981" /> : <Feather name="minus" size={18} color="#9CA3AF" />
                ) : <Text style={styles.valueText}>{feature.premium}</Text>}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.title}>Plan Comparison</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <View style={styles.tableHeader}>
                        <View style={styles.featureNameCell}>
                            <Text style={styles.headerLabel}>Features</Text>
                        </View>
                        <View style={styles.cell}>
                            <Text style={styles.planHeader}>Basic</Text>
                        </View>
                        <View style={styles.cell}>
                            <Text style={styles.planHeader}>Plus</Text>
                        </View>
                        <View style={styles.cell}>
                            <Text style={styles.planHeader}>Premium</Text>
                        </View>
                    </View>

                    {features.map((f, i) => (
                        <FeatureRow key={i} feature={f} index={i} />
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Choose a Plan"
                    onPress={() => navigation.navigate('PlanSelection')}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { padding: 24, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
    tableHeader: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
    headerLabel: { fontSize: 14, fontWeight: '700', color: '#6B7280', paddingLeft: 24 },
    planHeader: { fontSize: 14, fontWeight: '800', color: '#E53935' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', minHeight: 60, alignItems: 'center' },
    evenRow: { backgroundColor: '#F9FAFB' },
    featureNameCell: { width: 160, paddingLeft: 24 },
    featureName: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
    cell: { width: 100, alignItems: 'center', justifyContent: 'center' },
    valueText: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
    footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' }
});

export default PlanComparisonScreen;
