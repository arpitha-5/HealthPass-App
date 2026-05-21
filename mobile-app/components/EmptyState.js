import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../theme/index';
import PrimaryButton from './PrimaryButton';

const EmptyState = ({
  icon = 'folder-open-outline',
  title = 'No Data Found',
  subtitle = 'There is nothing to display here.',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon} size={60} color={Colors.gray300} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <View style={styles.action}>
          <PrimaryButton title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.sub,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    marginTop: Spacing.xl,
    width: '100%',
  },
});

export default EmptyState;
