import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../theme/index';

const ListItem = ({
  title,
  subtitle,
  leftIcon,
  rightContent,
  onPress,
  showDivider = true,
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightContent && <View style={styles.right}>{rightContent}</View>}
        {onPress && (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    marginLeft: Spacing.md,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.lg,
  },
});

export default ListItem;
