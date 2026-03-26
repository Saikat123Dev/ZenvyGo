/**
 * ZenvyGo Design System - Theme Constants
 * A professional, lightweight design system for React Native with NativeWind
 */

// Brand Scale (Vibrant Violet)
export const brand: Record<number, string> = {
  50: '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
  800: '#5B21B6',
  900: '#4C1D95',
};

// Slate/Neutral Scale (Refined Aesthetic Dark Mode)
export const slate: Record<number, string> = {
  50: '#FAFAFC',
  100: '#F3F4F7',
  200: '#E4E6EB',
  300: '#C9CDD4',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
  950: '#000000',  // pure black
};

// Semantic Colors
export const semantic = {
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#047857',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#B45309',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#B91C1C',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',
};

// Theme Colors interface
export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryLight: string;
  primaryLighter: string;
  primaryDark: string;
  border: string;
  borderLight: string;
  borderFocus: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabBackground: string;
  tabBorder: string;
  headerBackground: string;
  headerText: string;
  cardBackground: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputPlaceholder: string;
  inputError: string;
  inputErrorBackground: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;
  buttonDanger: string;
  buttonDangerText: string;
  buttonDisabled: string;
  buttonDisabledText: string;
  tint: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  danger: string;
  dangerLighter: string;
  dangerBackground: string;
  info: string;
  infoBackground: string;
  alertUnreadBackground: string;
  alertUnreadBorder: string;
  alertReadBackground: string;
  alertReadBorder: string;
  overlay: string;
  overlayLight: string;
}

// Theme Colors for Light/Dark mode
export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#F9FAFB',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',
    primary: brand[600],
    primaryLight: brand[400],
    primaryLighter: brand[50],
    primaryDark: brand[800],
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderFocus: brand[500],
    tabIconDefault: '#9CA3AF',
    tabIconSelected: brand[600],
    tabBackground: '#FFFFFF',
    tabBorder: '#E5E7EB',
    headerBackground: '#FFFFFF',
    headerText: '#111827',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,0.05)',
    inputBackground: '#F9FAFB',
    inputBorder: '#D1D5DB',
    inputBorderFocus: brand[500],
    inputPlaceholder: '#9CA3AF',
    inputError: semantic.danger,
    inputErrorBackground: semantic.dangerLight,
    buttonPrimary: brand[600],
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#F3F4F6',
    buttonSecondaryText: '#111827',
    buttonSecondaryBorder: '#E5E7EB',
    buttonDanger: semantic.danger,
    buttonDangerText: '#FFFFFF',
    buttonDisabled: '#E5E7EB',
    buttonDisabledText: '#9CA3AF',
    tint: brand[600],
    success: semantic.success,
    successBackground: semantic.successLight,
    warning: semantic.warning,
    warningBackground: semantic.warningLight,
    danger: semantic.danger,
    dangerLighter: '#FEF2F2',
    dangerBackground: semantic.dangerLight,
    info: semantic.info,
    infoBackground: semantic.infoLight,
    alertUnreadBackground: brand[50],
    alertUnreadBorder: brand[200],
    alertReadBackground: '#FFFFFF',
    alertReadBorder: '#E5E7EB',
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.15)',
  },
  dark: {
    background: '#040405', // Deep midnight
    backgroundSecondary: '#0E0E12', // Slightly lighter midnight
    surface: '#15151A', // Rich dark surface
    surfaceSecondary: '#1C1C24', // Elevated surface
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textInverse: '#000000',
    primary: brand[500], // Vibrant violet focus point
    primaryLight: brand[400],
    primaryLighter: '#1C1C24', // Solid elevated tint
    primaryDark: brand[600],
    border: '#272730', // Harmonized border
    borderLight: '#1C1C24', 
    borderFocus: brand[400],
    tabIconDefault: '#71717A',
    tabIconSelected: brand[500],
    tabBackground: '#040405', // Solid midnight background 
    tabBorder: '#272730',
    headerBackground: '#040405',
    headerText: '#FFFFFF',
    cardBackground: '#15151A', // Solid cards
    cardBorder: '#272730',
    inputBackground: '#15151A', // Solid inputs
    inputBorder: '#272730',
    inputBorderFocus: brand[500],
    inputPlaceholder: '#71717A',
    inputError: semantic.danger,
    inputErrorBackground: '#15151A',
    buttonPrimary: brand[500],
    buttonPrimaryText: '#FFFFFF', // White text on violet
    buttonSecondary: '#1C1C24',
    buttonSecondaryText: '#FFFFFF',
    buttonSecondaryBorder: '#272730',
    buttonDanger: semantic.danger,
    buttonDangerText: '#FFFFFF',
    buttonDisabled: '#1C1C24',
    buttonDisabledText: '#71717A',
    tint: brand[500],
    success: semantic.success,
    successBackground: '#15151A',
    warning: semantic.warning,
    warningBackground: '#15151A',
    danger: semantic.danger,
    dangerLighter: 'rgba(239, 68, 68, 0.12)',
    dangerBackground: '#15151A',
    info: semantic.info,
    infoBackground: '#15151A',
    alertUnreadBackground: '#1C1C24',
    alertUnreadBorder: '#272730',
    alertReadBackground: '#15151A',
    alertReadBorder: '#272730',
    overlay: 'rgba(0, 0, 0, 0.85)', // Keep dimming for modals
    overlayLight: 'rgba(0, 0, 0, 0.7)',
  },
};

// Typography utilities for NativeWind
export const typography = {
  display: 'font-sans text-[32px] leading-[40px] font-bold tracking-tight',
  h1: 'font-sans text-[28px] leading-[36px] font-bold tracking-tight',
  h2: 'font-sans text-[24px] leading-[32px] font-semibold tracking-tight',
  h3: 'font-sans text-[20px] leading-[28px] font-semibold',
  h4: 'font-sans text-[18px] leading-[26px] font-semibold',
  bodyLarge: 'font-sans text-[17px] leading-[26px]',
  body: 'font-sans text-[15px] leading-[24px]',
  bodySmall: 'font-sans text-[13px] leading-[20px]',
  caption: 'font-sans text-[12px] leading-[16px]',
  overline: 'font-sans text-[11px] leading-[16px] uppercase tracking-widest font-medium',
};

// Spacing scale (8-point grid)
export const spacing = {
  none: 0,
  hairline: 2,
  tight: 4,
  default: 8,
  component: 12,
  section: 16,
  card: 20,
  large: 24,
  xlarge: 32,
  page: 40,
  hero: 48,
  screen: 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 8,
  default: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
};

// Shadow styles (Softer, deeper premium shadows)
export const shadows = {
  sm: {
    shadowColor: brand[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  default: {
    shadowColor: brand[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  md: {
    shadowColor: brand[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  lg: {
    shadowColor: brand[500],
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
};

// Component heights
export const componentHeights = {
  button: 52,
  buttonSmall: 40,
  input: 52,
  header: 56,
  tabBar: 64,
  otpCell: 56,
};

// Animation durations
export const animations = {
  fast: 150,
  default: 200,
  slow: 300,
  shimmer: 1500,
};

export type ColorScheme = 'light' | 'dark';
