// HealthPass Card Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../theme/index';

/**
 * Card
 * Props: children, style, shadow, noPadding, onPress
 * shadow: 'none' | 'xs' | 'sm' | 'md' | 'lg'
 */
const Card = ({ children, style, shadow = 'sm', noPadding = false }) => {
  return (
    <View style={[styles.card, Shadows[shadow], noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noPadding: {
    padding: 0,
    overflow: 'hidden',
  },
});

export default Card;
