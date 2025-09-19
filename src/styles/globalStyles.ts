import { StyleSheet } from 'react-native';

// Design System Colors
export const Colors = {
  primary: '#7AB42C',
  label: '#000000',
  background: '#FBFBFB',
  white: '#FFFFFF',
  textSecondary: '#666666',
  border: '#A6CD724D',
  inputBackground: '#F9F9F9',
  gray: {
    light: '#F5F5F5',
    medium: '#CCCCCC',
    dark: '#666666',
  },
  error: '#FF4444',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

// Typography
export const Typography = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 44,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Global Styles
export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  screenPadding: {
    paddingHorizontal: Spacing.md,
  },
  // Typography Styles
  h1: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['3xl'],
    lineHeight: Typography.lineHeight['3xl'],
    color: Colors.label,
  },
  h2: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    lineHeight: Typography.lineHeight['2xl'],
    color: Colors.label,
  },
  h3: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xl,
    lineHeight: Typography.lineHeight.xl,
    color: Colors.label,
  },
  h4: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.lg,
    lineHeight: Typography.lineHeight.lg,
    color: Colors.label,
  },
  bodyLarge: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.base,
    color: Colors.label,
  },
  body: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.sm,
    color: Colors.label,
  },
  caption: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.lineHeight.xs,
    color: Colors.gray.dark,
  },
  // Button Styles
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
  },
  // Input Styles
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray.medium,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    backgroundColor: Colors.inputBackground,
    color: Colors.label,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  // Card Styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.label,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});

export default GlobalStyles;