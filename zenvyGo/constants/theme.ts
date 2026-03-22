/**
 * ZenvyGo Design System - Theme Constants
 * A professional, lightweight design system for React Native with NativeWind
 */

// Brand Blue Scale
export const brand: Record<number, string> = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
};

// Slate/Neutral Scale
export const slate: Record<number, string> = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
};

// Semantic Colors
export const semantic = {
  success: '#0D9488',
  successLight: '#CCFBF1',
  successDark: '#0F766E',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  danger: '#E11D48',
  dangerLight: '#FFE4E6',
  dangerDark: '#BE123C',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
  infoDark: '#0284C7',
};

// Theme Colors interface
export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  // Primary/Brand
  primary: string;
  primaryLight: string;
  primaryLighter: string;
  primaryDark: string;
  // Borders
  border: string;
  borderLight: string;
  borderFocus: string;
  // Tab bar
  tabIconDefault: string;
  tabIconSelected: string;
  tabBackground: string;
  tabBorder: string;
  // Header
  headerBackground: string;
  headerText: string;
  // Cards
  cardBackground: string;
  cardBorder: string;
  // Inputs
  inputBackground: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputPlaceholder: string;
  inputError: string;
  inputErrorBackground: string;
  // Buttons
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;
  buttonDanger: string;
  buttonDangerText: string;
  buttonDisabled: string;
  buttonDisabledText: string;
  // Tint
  tint: string;
  // Semantic
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  danger: string;
  dangerBackground: string;
  info: string;
  infoBackground: string;
  // Alert specific
  alertUnreadBackground: string;
  alertUnreadBorder: string;
  alertReadBackground: string;
  alertReadBorder: string;
  // Overlays
  overlay: string;
  overlayLight: string;
}

// Theme Colors for Light/Dark mode
export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    // Background colors
    background: slate[100],
    backgroundSecondary: slate[50],
    surface: '#FFFFFF',
    surfaceSecondary: slate[50],

    // Text colors
    text: slate[900],
    textSecondary: slate[600],
    textMuted: slate[400],
    textInverse: '#FFFFFF',

    // Primary/Brand
    primary: brand[900],
    primaryLight: brand[500],
    primaryLighter: brand[100],
    primaryDark: brand[800],

    // Borders
    border: slate[200],
    borderLight: slate[100],
    borderFocus: brand[500],

    // Tab bar
    tabIconDefault: slate[400],
    tabIconSelected: brand[600],
    tabBackground: '#FFFFFF',
    tabBorder: slate[100],

    // Header
    headerBackground: '#FFFFFF',
    headerText: slate[900],

    // Cards
    cardBackground: '#FFFFFF',
    cardBorder: slate[100],

    // Inputs
    inputBackground: '#FFFFFF',
    inputBorder: slate[300],
    inputBorderFocus: brand[500],
    inputPlaceholder: slate[400],
    inputError: semantic.danger,
    inputErrorBackground: '#FFF1F2',

    // Buttons
    buttonPrimary: brand[900],
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: brand[100],
    buttonSecondaryText: brand[900],
    buttonSecondaryBorder: brand[200],
    buttonDanger: semantic.danger,
    buttonDangerText: '#FFFFFF',
    buttonDisabled: slate[200],
    buttonDisabledText: slate[400],

    // Tint
    tint: brand[600],

    // Semantic
    success: semantic.success,
    successBackground: semantic.successLight,
    warning: semantic.warning,
    warningBackground: semantic.warningLight,
    danger: semantic.danger,
    dangerBackground: semantic.dangerLight,
    info: semantic.info,
    infoBackground: semantic.infoLight,

    // Alert specific
    alertUnreadBackground: brand[50],
    alertUnreadBorder: brand[200],
    alertReadBackground: '#FFFFFF',
    alertReadBorder: slate[100],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.25)',
  },
  dark: {
    // Background colors
    background: slate[900],
    backgroundSecondary: '#020617',
    surface: slate[800],
    surfaceSecondary: slate[700],

    // Text colors
    text: slate[50],
    textSecondary: slate[300],
    textMuted: slate[500],
    textInverse: slate[900],

    // Primary/Brand
    primary: brand[500],
    primaryLight: brand[400],
    primaryLighter: brand[900],
    primaryDark: brand[600],

    // Borders
    border: slate[700],
    borderLight: slate[800],
    borderFocus: brand[400],

    // Tab bar
    tabIconDefault: slate[500],
    tabIconSelected: brand[400],
    tabBackground: slate[800],
    tabBorder: slate[700],

    // Header
    headerBackground: slate[800],
    headerText: slate[50],

    // Cards
    cardBackground: slate[800],
    cardBorder: slate[700],

    // Inputs
    inputBackground: slate[800],
    inputBorder: slate[600],
    inputBorderFocus: brand[400],
    inputPlaceholder: slate[500],
    inputError: semantic.danger,
    inputErrorBackground: '#4C0519',

    // Buttons
    buttonPrimary: brand[500],
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: brand[900],
    buttonSecondaryText: brand[300],
    buttonSecondaryBorder: brand[700],
    buttonDanger: semantic.danger,
    buttonDangerText: '#FFFFFF',
    buttonDisabled: slate[700],
    buttonDisabledText: slate[500],

    // Tint
    tint: brand[400],

    // Semantic
    success: semantic.success,
    successBackground: '#042F2E',
    warning: semantic.warning,
    warningBackground: '#451A03',
    danger: semantic.danger,
    dangerBackground: '#4C0519',
    info: semantic.info,
    infoBackground: '#082F49',

    // Alert specific
    alertUnreadBackground: brand[900],
    alertUnreadBorder: brand[700],
    alertReadBackground: slate[800],
    alertReadBorder: slate[700],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  },
};

// Typography utilities for NativeWind
export const typography = {
  display: 'text-[32px] leading-[40px] font-bold tracking-tight',
  h1: 'text-[28px] leading-[36px] font-bold tracking-tight',
  h2: 'text-[24px] leading-[32px] font-semibold tracking-tight',
  h3: 'text-[20px] leading-[28px] font-semibold',
  h4: 'text-[18px] leading-[26px] font-semibold',
  bodyLarge: 'text-[17px] leading-[26px]',
  body: 'text-[15px] leading-[24px]',
  bodySmall: 'text-[13px] leading-[20px]',
  caption: 'text-[12px] leading-[16px]',
  overline: 'text-[11px] leading-[16px] uppercase tracking-widest font-medium',
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
  sm: 6,
  default: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadow styles
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
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
