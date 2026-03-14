import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    FlatList,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../theme/index';
import hospitalService from '../services/hospitalService';

const { width } = Dimensions.get('window');

const HospitalMapScreen = ({ navigation }) => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHospital, setSelectedHospital] = useState(null);

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        try {
            setLoading(true);
            // Default to Hyderabad mock coords
            const lat = 17.3850;
            const lng = 78.4867;
            const results = await hospitalService.fetchNearbyHospitals(lat, lng);
            setHospitals(results);
        } catch (error) {
            console.log('Error loading hospitals on web:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderHospitalCard = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.hCard,
                selectedHospital?.id === item.id && styles.selectedHCard
            ]}
            activeOpacity={0.9}
            onPress={() => setSelectedHospital(item)}
        >
            <View style={styles.hRow}>
                <View style={[styles.hIconBox, { backgroundColor: item.isOpen ? '#FEE2E2' : '#F1F5F9' }]}>
                    <MaterialCommunityIcons
                        name="hospital-building"
                        size={24}
                        color={item.isOpen ? Colors.primary : '#94A3B8'}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.hName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.hType}>{item.vicinity}</Text>
                    <View style={styles.hMeta}>
                        <Text style={styles.hDist}>{item.distance} km away</Text>
                        <Text style={styles.hRating}>⭐ {item.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Web Map Placeholder */}
            <View style={styles.mapPlaceholder}>
                <MaterialCommunityIcons name="map-marker-radius" size={64} color={Colors.primaryGlow || '#FEE2E2'} />
                <Text style={styles.placeholderTitle}>Map View (Native Only)</Text>
                <Text style={styles.placeholderSub}>
                    Interactive maps are currently optimized for our mobile application.
                    You can still browse the nearby hospitals below.
                </Text>
                <TouchableOpacity
                    style={styles.webBtn}
                    onPress={() => window.open('https://www.google.com/maps/search/hospitals/@17.385,78.4867,15z', '_blank')}
                >
                    <Text style={styles.webBtnText}>Open Google Maps</Text>
                </TouchableOpacity>
            </View>

            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Hospitals Near You (Web)</Text>
                    </View>
                </View>

                <View style={styles.carouselContainer}>
                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={hospitals}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={renderHospitalCard}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                            snapToInterval={width - 60}
                            decelerationRate="fast"
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    overlay: { ...StyleSheet.absoluteFillObject },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F1F5F9',
    },
    placeholderTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginTop: 20,
    },
    placeholderSub: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
    },
    webBtn: {
        marginTop: 25,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Shadows.sm,
    },
    webBtnText: {
        fontWeight: '700',
        color: '#1E293B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        ...Shadows.md,
    },
    headerTitleContainer: {
        flex: 1, marginLeft: 15,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 10, paddingHorizontal: 20,
        ...Shadows.md,
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    carouselContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0, right: 0,
    },
    hCard: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginRight: 20,
        ...Shadows.lg,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    selectedHCard: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    hRow: { flexDirection: 'row', gap: 12 },
    hIconBox: {
        width: 48, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    hName: { fontSize: 16, fontWeight: '800', color: '#111827' },
    hType: { fontSize: 13, color: '#64748B', marginTop: 2 },
    hMeta: { flexDirection: 'row', gap: 10, marginTop: 10 },
    hDist: { fontSize: 12, fontWeight: '600', color: Colors.primary },
    hRating: { fontSize: 12, color: '#64748B' },
    loadingBox: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        marginHorizontal: 40,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        ...Shadows.md,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
});

export default HospitalMapScreen;
