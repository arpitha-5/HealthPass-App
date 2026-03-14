import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Shadows, Spacing } from '../theme/index';

const TABS = [
  { key: 'home',         icon: 'home',              label: 'Home' },
  { key: 'appointments', icon: 'calendar-check',    label: 'Appointments' },
  { key: 'benefits',     icon: 'shield-star',       label: 'Benefits' },
  { key: 'wallet',       icon: 'wallet',            label: 'Wallet' },
  { key: 'profile',      icon: 'account-circle',    label: 'Profile' },
];

/**
 * BottomTabBar
 * Props: activeTab (key string), onTabPress(key)
 */
const BottomTabBar = ({ activeTab = 'home', onTabPress }) => {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress?.(tab.key)}
            activeOpacity={0.75}
          >
            {isActive && <View style={styles.activePill} />}
            <MaterialCommunityIcons
              name={isActive ? tab.icon : `${tab.icon}-outline`.replace('-outline-outline', '-outline')}
              size={24}
              color={isActive ? Colors.primary : Colors.textTertiary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 16,
    paddingTop: Spacing.sm + 2,
    ...Shadows.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -Spacing.sm - 2,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
    marginTop: 3,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});

export default BottomTabBar;
