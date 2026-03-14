/**
 * Banner Card Component
 * Promotional banner for dashboard
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LinearGradient,
} from 'react-native';
import Colors from '../theme/Colors';
import { Fonts, Spacing, BorderRadius, Shadows } from '../theme/Typography';

const BannerCard = ({
  title,
  subtitle,
  description,
  icon,
  onPress,
  gradient = true,
  colors = [Colors.primary, Colors.primaryDark],
}) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.textContent}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
        {icon && (
          <View style={styles.iconWrapper}>
            {icon}
          </View>
        )}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bannerGradient, Shadows.lg]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.bannerSolid, Shadows.lg]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  bannerGradient: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginVertical: Spacing.lg,
  },

  bannerSolid: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    marginVertical: Spacing.lg,
  },

  contentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textContent: {
    flex: 1,
    marginRight: Spacing.lg,
  },

  title: {
    ...Fonts.h4,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },

  subtitle: {
    ...Fonts.h6,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },

  description: {
    ...Fonts.body2,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },

  iconWrapper: {
    fontSize: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BannerCard;
