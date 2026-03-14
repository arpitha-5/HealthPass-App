/**
 * HealthPass Global Design System
 * Inspired by Practo / Apollo healthcare UI
 */

export const Colors = {
  // Brand
  primary:        '#E53935',
  primaryLight:   '#FFCDD2',
  primaryDark:    '#B71C1C',
  primaryGlow:    'rgba(229, 57, 53, 0.12)',

  // Backgrounds
  background:     '#FFFFFF',
  surface:        '#F9FAFB',
  surfaceAlt:     '#F3F4F6',

  // Text
  textPrimary:    '#111827',
  textSecondary:  '#6B7280',
  textTertiary:   '#9CA3AF',
  textWhite:      '#FFFFFF',
  textOnPrimary:  '#FFFFFF',

  // Borders
  border:         '#E5E7EB',
  divider:        '#F3F4F6',

  // Semantic
  success:        '#10B981',
  successLight:   '#ECFDF5',
  successDark:    '#065F46',
  warning:        '#F59E0B',
  warningLight:   '#FEF3C7',
  error:          '#EF4444',
  errorLight:     '#FEE2E2',
  info:           '#3B82F6',
  infoLight:      '#EFF6FF',



  // Grays
  gray50:  '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Special
  overlay:     'rgba(0, 0, 0, 0.45)',
  cardBorder:  '#E5E7EB',
  white:       '#FFFFFF',
  transparent: 'transparent',
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const FontSize = {
  xs:      11,
  caption: 13,
  body:    15,
  button:  15,
  sub:     17,
  section: 20,
  title:   26,
  hero:    32,
};

export const FontWeight = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
};

export const BorderRadius = {
  xs:    6,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  xxl:   28,
  full:  999,
};

export const Shadows = {
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
  },
  primary: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 5,
  },
};

const Theme = {
  colors:       Colors,
  spacing:      Spacing,
  fontSize:     FontSize,
  fontWeight:   FontWeight,
  borderRadius: BorderRadius,
  shadows:      Shadows,
};

export default Theme;
