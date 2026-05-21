import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme/index';

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.row}>
    <View style={styles.labelRow}>
      {icon && <MaterialCommunityIcons name={icon} size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />}
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

const InfoCard = ({ title, children, style }) => (
  <View style={[styles.card, style]}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    {children}
  </View>
);

const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <Text style={styles.sectionAction} onPress={onAction}>{action}</Text>
    )}
  </View>
);

const ProgressBar = ({ value, max, color = Colors.primary, label }) => (
  <View style={styles.progressContainer}>
    {label && (
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}/{max}</Text>
      </View>
    )}
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${(value / max) * 100}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: FontSize.sub,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sub,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  progressContainer: {
    marginVertical: Spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export { InfoRow, InfoCard, SectionHeader, ProgressBar };
