import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, Shadows, BorderRadius, FontSize, FontWeight, Spacing } from '../theme/index';

/**
 * PrimaryButton
 * Props: title, onPress, loading, disabled, variant, icon, style, textStyle
 * variant: 'filled' (default) | 'outline' | 'ghost'
 */
const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'filled',
  icon = null,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'filled'  && styles.filled,
    variant === 'outline' && styles.outline,
    variant === 'ghost'   && styles.ghost,
    isDisabled            && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    variant === 'outline' && styles.labelOutline,
    variant === 'ghost'   && styles.labelGhost,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? '#FFF' : Colors.primary} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={labelStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  filled: {
    backgroundColor: Colors.primary,
    ...Shadows.primary,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  disabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: FontSize.button,
    fontWeight: FontWeight.semibold,
    color: Colors.textWhite,
    letterSpacing: 0.3,
  },
  labelOutline: {
    color: Colors.primary,
  },
  labelGhost: {
    color: Colors.primary,
  },
});

export default PrimaryButton;
