import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Header from '../components/Header';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';

/**
 * PlaceholderScreen
 * Reusable "Coming Soon" screen for routes not yet built.
 * The route's `title` param is shown in the header and body.
 */
const PlaceholderScreen = ({ navigation, route }) => {
  const title = route?.params?.title || route?.name || 'Coming Soon';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Header title={title} onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <View style={styles.iconRing}>
          <MaterialCommunityIcons name="tools" size={56} color={Colors.primary} />
        </View>
        <Text style={styles.heading}>Coming Soon</Text>
        <Text style={styles.sub}>
          The <Text style={styles.highlight}>{title}</Text> feature is actively being built
          and will be ready in the next update.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={18} color={Colors.white} />
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  iconRing: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  heading: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sub: {
    fontSize: FontSize.body - 1,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  highlight: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.md,
    ...Shadows.primary,
  },
  backBtnText: {
    fontSize: FontSize.button,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});

export default PlaceholderScreen;
