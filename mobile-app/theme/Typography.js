/**
 * Medical Healthcare App Typography
 */

export const Fonts = {
  // Font Families
  poppins: 'Poppins',
  poppinsBold: 'Poppins-Bold',
  inter: 'Inter',
  interRegular: 'Inter-Regular',

  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Text Styles
  h1: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: 40,
  },

  h2: {
    fontSize: 28,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: 36,
  },

  h3: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: 32,
  },

  h4: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: 28,
  },

  h5: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    lineHeight: 26,
  },

  h6: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    lineHeight: 24,
  },

  body1: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 24,
  },

  body2: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 22,
  },

  bodySmall: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },

  button: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    lineHeight: 24,
  },

  buttonSmall: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    lineHeight: 22,
  },

  caption: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 18,
  },

  overline: {
    fontSize: 11,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

export default {
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
};
