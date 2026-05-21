import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme/index';

const AccountStatusBanner = ({ 
  status = 'Active', 
  onContactSupport,
  disabledActions = false 
}) => {
  if (status === 'Active') return null;

  const isSuspended = status === 'Suspended';
  const isExpired = status === 'Expired';

  return (
    <View style={[styles.banner, isSuspended ? styles.suspendedBanner : styles.expiredBanner]}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons 
          name={isSuspended ? 'account-alert' : 'clock-alert'} 
          size={24} 
          color={isSuspended ? Colors.error : Colors.warning} 
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isSuspended ? styles.suspendedTitle : styles.expiredTitle]}>
          {isSuspended ? 'Account Suspended' : 'Plan Expired'}
        </Text>
        <Text style={styles.message}>
          {isSuspended 
            ? 'Your account is currently suspended. Booking and wallet features are disabled.'
            : 'Your subscription has expired. Renew to continue enjoying benefits.'}
        </Text>
      </View>
      {onContactSupport && (
        <TouchableOpacity style={styles.contactBtn} onPress={onContactSupport}>
          <Text style={styles.contactBtnText}>Contact</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SuspendedOverlay = ({ onRenew, onContactSupport }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <MaterialCommunityIcons name="account-alert" size={64} color={Colors.error} />
        <Text style={styles.overlayTitle}>Account Suspended</Text>
        <Text style={styles.overlayMessage}>
          Your account is currently suspended. The following features are disabled:
        </Text>
        <View style={styles.disabledList}>
          <Text style={styles.disabledItem}>• Book Appointments</Text>
          <Text style={styles.disabledItem}>• Use Wallet Credits</Text>
          <Text style={styles.disabledItem}>• Upload Bills</Text>
          <Text style={styles.disabledItem}>• Book Diagnostics</Text>
        </View>
        <View style={styles.overlayActions}>
          <TouchableOpacity style={styles.renewBtn} onPress={onRenew}>
            <Text style={styles.renewBtnText}>Renew Subscription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportBtn} onPress={onContactSupport}>
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  suspendedBanner: {
    backgroundColor: Colors.errorLight,
  },
  expiredBanner: {
    backgroundColor: Colors.warningLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  suspendedTitle: {
    color: Colors.error,
  },
  expiredTitle: {
    color: Colors.warning,
  },
  message: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  contactBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  contactBtnText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    zIndex: 100,
  },
  overlayContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  overlayTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    color: Colors.error,
    marginTop: Spacing.lg,
  },
  overlayMessage: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  disabledList: {
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.lg,
  },
  disabledItem: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginVertical: Spacing.xs,
  },
  overlayActions: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  renewBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  renewBtnText: {
    color: Colors.white,
    fontSize: FontSize.button,
    fontWeight: FontWeight.semibold,
  },
  supportBtn: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  supportBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.button,
    fontWeight: FontWeight.semibold,
  },
});

export { AccountStatusBanner, SuspendedOverlay };
