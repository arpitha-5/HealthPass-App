/**
 * Theme.js — legacy re-export shim
 * All new code should import from '../theme/index'.
 * This file ensures backward-compatibility for any screen
 * that still imports from '../components/Theme'.
 */
import Theme, { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../theme/index';

// Legacy shape mapping (used by older screens)
const LegacyTheme = {
  colors: {
    primary:       Colors.primary,
    primaryLight:  Colors.primaryLight,
    primaryDark:   Colors.primaryDark,
    secondary:     Colors.primaryLight,
    secondaryLight: Colors.primaryLight,
    accent:        Colors.info,
    background:    Colors.background,
    white:         Colors.white,
    card:          Colors.surface,
    cardBorder:    Colors.border,
    textPrimary:   Colors.textPrimary,
    textSecondary: Colors.textSecondary,
    textTertiary:  Colors.textTertiary,
    border:        Colors.border,
    success:       Colors.success,
    successLight:  Colors.successLight,
    warning:       Colors.warning,
    error:         Colors.error,
    errorLight:    Colors.errorLight,
    overlay:       Colors.overlay,
  },
  typography: {
    fontFamily: 'System',
    heading1:   { fontSize: 32, fontWeight: '700', color: Colors.textPrimary },
    heading2:   { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
    heading3:   { fontSize: 22, fontWeight: '600', color: Colors.textPrimary },
    subheading: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
    body:       { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
    caption:    { fontSize: 12, fontWeight: '400', color: Colors.textTertiary },
    button:     { fontSize: 16, fontWeight: '600', color: Colors.white },
  },
  spacing: {
    xs: Spacing.xs,
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
    xl: Spacing.xl,
    xxl: Spacing.xxl,
    padding: Spacing.lg,
    cardGap: Spacing.md,
  },
  borders: {
    radius:      BorderRadius.md,
    radiusLarge: BorderRadius.lg,
    radiusSmall: BorderRadius.sm,
  },
  shadows: {
    small:  Shadows.sm,
    medium: Shadows.md,
    large:  Shadows.lg,
  },
};

export default LegacyTheme;
