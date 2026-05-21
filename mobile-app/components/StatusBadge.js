import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, BorderRadius } from '../theme/index';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
      case 'active':
      case 'completed':
        return { color: Colors.success, bg: Colors.successLight, icon: 'check-circle' };
      case 'pending':
      case 'under review':
      case 'processing':
        return { color: Colors.warning, bg: Colors.warningLight, icon: 'clock-outline' };
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return { color: Colors.error, bg: Colors.errorLight, icon: 'close-circle' };
      case 'no-show':
        return { color: Colors.textSecondary, bg: Colors.gray100, icon: 'account-off' };
      default:
        return { color: Colors.info, bg: Colors.infoLight, icon: 'information' };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSmall]}>
      <MaterialCommunityIcons name={config.icon} size={isSmall ? 12 : 14} color={config.color} />
      <Text style={[styles.text, { color: config.color }, isSmall && styles.textSmall]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});

export default StatusBadge;
