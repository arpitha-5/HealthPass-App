import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../theme/index';

/**
 * Header
 * Props: title, subtitle, onBack, rightAction (ReactNode), transparent, style
 */
const Header = ({ title, subtitle, onBack, rightAction, transparent = false, style }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[styles.header, transparent && styles.transparent, style]}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Feather name="chevron-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.titleBlock}>
          {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.right}>
          {rightAction || <View style={styles.backBtn} />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.xs,
  },
  transparent: {
    backgroundColor: Colors.transparent,
    borderBottomColor: Colors.transparent,
    ...Shadows.none,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sub,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
});

export default Header;
