import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileHeader({ user, onEdit }) {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: user?.profilePicture || 'https://via.placeholder.com/100' }}
                    style={styles.profilePic}
                />
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Ionicons name="pencil" size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user?.name || 'Arpitha Medarametla'}</Text>
            <Text style={styles.mobile}>{user?.mobile || '+1 234 567 890'}</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.plan || 'Premium Member'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#E53935',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    mobile: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    badgeText: {
        color: '#E53935',
        fontSize: 14,
        fontWeight: '600',
    },
});
