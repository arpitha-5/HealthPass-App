import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/index';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

// IMPORTANT: Use your Google API Key here for photos if needed
const GOOGLE_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

const HospitalCard = ({ hospital, onPress }) => {
    const {
        name,
        rating,
        vicinity,
        isOpen,
        distance,
        photos,
    } = hospital;

    const imageUrl = (photos && photos.length > 0 && GOOGLE_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE')
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
        : null;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.card}
        >
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons name="hospital-building" size={40} color={Colors.primary} />
                    </View>
                )}
                <View style={styles.badgeContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#CCFBF1' : '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: isOpen ? '#0D9488' : '#DC2626' }]}>
                            {isOpen ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <View style={styles.ratingBox}>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text style={styles.ratingText}>{rating > 0 ? rating : 'NEW'}</Text>
                    </View>
                </View>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.vicinity} numberOfLines={1}>{vicinity}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.distanceBox}>
                        <Feather name="navigation" size={14} color={Colors.primary} />
                        <Text style={styles.distanceText}>{distance} km away</Text>
                    </View>
                    <TouchableOpacity style={styles.navigateBtn} onPress={onPress}>
                        <Text style={styles.navigateText}>View Map</Text>
                        <Feather name="arrow-right" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 24,
        marginRight: 20,
        marginBottom: 10,
        overflow: 'hidden',
        ...Shadows.md,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    imageContainer: {
        height: 140,
        width: '100%',
        position: 'relative',
        backgroundColor: '#F8FAFC',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    badgeContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
        flex: 1,
        marginRight: 8,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400E',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 16,
    },
    vicinity: {
        fontSize: 13,
        color: '#64748B',
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distanceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    distanceText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    navigateBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
        ...Shadows.sm,
    },
    navigateText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
});

export default HospitalCard;
