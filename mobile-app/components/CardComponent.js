/**
 * Card Component
 * Professional card with soft shadows
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../theme/Colors';
import { Spacing, BorderRadius, Shadows } from '../theme/Typography';

const CardComponent = ({
  children,
  style,
  onPress = null,
  padding = true,
  elevation = 'md',
  variant = 'default',
}) => {
  const baseStyle = [styles.card];

  if (padding) {
    baseStyle.push(styles.cardPadded);
  }

  if (elevation === 'sm') {
    baseStyle.push(styles.elevationSm);
  } else if (elevation === 'md') {
    baseStyle.push(styles.elevationMd);
  } else if (elevation === 'lg') {
    baseStyle.push(styles.elevationLg);
  }

  if (variant === 'highlighted') {
    baseStyle.push(styles.cardHighlighted);
  } else if (variant === 'minimal') {
    baseStyle.push(styles.cardMinimal);
  }

  const renderContent = () => (
    <View style={[baseStyle, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },

  cardPadded: {
    padding: Spacing.lg,
  },

  elevationSm: {
    ...Shadows.sm,
  },

  elevationMd: {
    ...Shadows.md,
  },

  elevationLg: {
    ...Shadows.lg,
  },

  cardHighlighted: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  cardMinimal: {
    backgroundColor: Colors.background,
    ...Shadows.sm,
  },
});

export default CardComponent;
