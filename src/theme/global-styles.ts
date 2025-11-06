/**
 * Global Design System Theme
 * Consolidated from all Figma-generated screens
 * Supports both light and dark modes without Nativewind
 */

/* ================================
   FONT FAMILIES
   ================================ */
export const FontFamily = {
  // Manrope family (primary) - using Expo Google Fonts naming
  manropeRegular: 'Manrope_400Regular',
  manropeMedium: 'Manrope_500Medium',
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',

  // Secondary fonts (now properly loaded)
  interBold: 'Inter_700Bold',
  sFProText: 'SF Pro Text', // iOS system font fallback
  robotoMedium: 'Roboto_500Medium',

  // Accent fonts
  russoOneRegular: 'RussoOne_400Regular',

  // Goldman (accent/branding)
  goldmanRegular: 'Goldman_400Regular',
  goldmanBold: 'Goldman_700Bold',

  // KdamThmorPro (accent/branding)
  kdamThmorProRegular: 'KdamThmorPro_400Regular',
} as const;

/* ================================
   FONT SIZES
   ================================ */
export const FontSize = {
  size_10: 10,
  size_12: 12,
  size_14: 14,
  size_15: 15, // For status bar time
  size_16: 16,
  size_18: 18,
  size_20: 20,
  size_22: 22,
  size_28: 28, // For app branding
} as const;

/* ================================
   LINE HEIGHTS
   ================================ */
export const LineHeight = {
  tight: 12, // 10px font
  small: 14, // 14px font
  normal: 16, // 12px font
  relaxed: 18, // 14px font
  loose: 20, // 16px font
  heading: 22, // 18-20px font
  large: 24, // 22px+ font
  extraLarge: 28, // 28px font
  brand: 36, // 28px font
} as const;

/* ================================
   TYPOGRAPHY PRESETS
   ================================ */
export const Typography = {
  // Headings
  h1: {
    fontSize: FontSize.size_28,
    lineHeight: LineHeight.brand,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  h2: {
    fontSize: FontSize.size_22,
    lineHeight: LineHeight.brand,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  h3: {
    fontSize: FontSize.size_20,
    lineHeight: LineHeight.extraLarge,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  h4: {
    fontSize: FontSize.size_18,
    lineHeight: LineHeight.large,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },

  // Body text
  body: {
    fontSize: FontSize.size_16,
    lineHeight: LineHeight.heading,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: FontSize.size_14,
    lineHeight: LineHeight.loose,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: FontSize.size_12,
    lineHeight: LineHeight.small,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },

  // Labels and UI text
  label: {
    fontSize: FontSize.size_14,
    lineHeight: LineHeight.loose,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: FontSize.size_12,
    lineHeight: LineHeight.small,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  overline: {
    fontSize: FontSize.size_10,
    lineHeight: LineHeight.tight,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },

  // Interactive elements
  button: {
    fontSize: FontSize.size_16,
    lineHeight: LineHeight.heading,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
  link: {
    fontSize: FontSize.size_14,
    lineHeight: LineHeight.loose,
    fontFamily: FontFamily.kdamThmorProRegular,
    fontWeight: '400' as const,
  },
} as const;

/* ================================
   RAW COLOR PALETTE
   ================================ */
export const Palette = {
  // Primary brand colors
  primary: '#1068eb', // Royal blue
  primaryLight: '#e8f0fd', // Light blue variant

  // Grays for dark theme
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Dark theme specific grays (from Figma)
  charcoal50: '#f2f2f2',
  charcoal100: '#e5e5e5',
  charcoal200: '#c9c9c9',
  charcoal300: '#b0b0b0',
  charcoal400: '#969696',
  charcoal500: '#7d7d7d',
  charcoal600: '#616161',
  charcoal700: '#474747',
  charcoal800: '#383838',
  charcoal850: '#2e2e2e',
  charcoal900: '#1e1e1e',
  charcoal950: '#101213', // Main dark background

  // Status colors
  success: '#37b24d',
  successAlt: '#1ce783',
  mediumSpringGreen: '#1ce783', // Figma design status indicator
  warning: '#FA8C16',
  warningAlt: '#FA8C161A',
  error: '#FF3C3C',
  errorAlt: '#D52B2B33',

  // Semantic
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0, 0, 0, 0)',

  // Additional colors from designs
  gainsboro: '#dee2e6',
  lightGray: '#ced4da',
  lightGrayOpacity: 'rgba(209, 209, 209, 0.05)', // Figma design avatar background
  darkGray: '#adb5bd',
  mediumGray: '#6a7178',
  dimGray: '#4f575e',
  darkSlateGray: '#49454f',
  whiteSmoke: '#f8f9fa',
  aliceBlue: '#e8f0fd',

  primary50: '#e8f3fa',
  primary100: '#b8d9ef',
  primary200: '#95c6e8',
  primary300: '#65addd',
  primary400: '#479dd6',
  primary500: '#1984cc',
  primary600: '#1778ba',
  primary700: '#125e91',
  primary800: '#0e4970',
  primary900: '#0b3756',
  primary1000: '#111827',
  primary1100: '#121c2e',
  primary1200: '#0B355666',

  secondary50: '#eaeaea',
  secondary100: '#bfbfbf',
  secondary200: '#a0a0a0',
  secondary300: '#747474',
  secondary400: '#595959',
  secondary500: '#303030',
  secondary600: '#2c2c2c',
  secondary700: '#222222',
  secondary800: '#1a1a1a',
  secondary900: '#141414',
  secondary1000: '#091b32',

  // Blue color palette
  blue50: '#e6f4ff',
  blue100: '#b0dbff',
  blue200: '#8acaff',
  blue300: '#54b2ff',
  blue400: '#33a3ff',
  blue500: '#008cff',
  blue600: '#007fe8',
  blue700: '#0063b5',
  blue800: '#004d8c',
  blue900: '#003b6b',
  blue1000: '#5DA9DC66',
  blue1100: '#1778BA66',

  // Yellow color palette
  yellow50: '#fdf6e6',
  yellow100: '#f8e2b0',
  yellow200: '#f5d48a',
  yellow300: '#f0c054',
  yellow400: '#edb433',
  yellow500: '#e9a100',
  yellow600: '#d49300',
  yellow700: '#a57200',
  yellow800: '#805900',
  yellow900: '#624400',

  // Green color palette
  green50: '#eaf6ea',
  green100: '#bfe3be',
  green200: '#9fd69e',
  green300: '#74c372',
  green400: '#59b757',
  green500: '#2fa52d',
  green600: '#2b9629',
  green700: '#217520',
  green800: '#1a5b19',
  green900: '#144513',

  // Red color palette
  red50: '#ffecec',
  red100: '#ffc3c3',
  red200: '#ffa5a5',
  red300: '#ff7c7c',
  red400: '#ff6363',
  red500: '#ff3c3c',
  red600: '#e83737',
  red700: '#b52b2b',
  red800: '#8c2121',
  red900: '#6b1919',

  primary90030: '#0B3556',
  toastStatusBg: '#0B355666',
  buttonGhostDef: '#125E9166',
  input: '#5DA9DC66',
  backgroundSecondary: '#1984CC66',

  brown50: '#374151',
  brown100: '#6B7280',
  brown200: '#4B5563',
} as const;

/* ================================
   THEME COLOR DEFINITIONS
   ================================ */
const createColors = (isDark: boolean) => ({
  // Primary brand color
  primary: Palette.primary1000,
  primaryLight: Palette.primaryLight,

  // Background colors
  background: {
    primary: isDark ? Palette.primary1000 : Palette.white,
    secondary: isDark ? Palette.secondary1000 : Palette.gray50,
    tertiary: isDark ? Palette.primary1100 : Palette.gray100,
    overlay: isDark ? Palette.primary900 : 'rgba(0, 0, 0, 0.05)',
    input: isDark ? Palette.primary1200 : Palette.gray400,
    qua: isDark ? `${Palette.primary50}0D` : `${Palette.primary1100}0D`, //alpha 5%
},

  // Text colors
  text: {
    primary: isDark ? Palette.primary200 : Palette.charcoal950,
    secondary: isDark ? Palette.primary500 : Palette.blue500,
    tertiary: isDark ? Palette.primary400 : Palette.gray900,
    muted: isDark ? Palette.primary800 : Palette.gray600,
    disabled: isDark ? Palette.blue1000 : Palette.blue1000,
    placeholder: isDark ? Palette.blue1000 : Palette.gray500,
    inverse: isDark ? Palette.primary1000 : Palette.white,
    icon: isDark ? Palette.primary400 : Palette.primary500, // For dark/light backgrounds
    accent: Palette.primary, // For highlighted text
    inactive: isDark ? Palette.blue1000 : Palette.gray400,
  },

  button: {
    primary: isDark ? Palette.primary400 : Palette.gray100,
    secondary: isDark ? Palette.primary500 : Palette.gray700,
    ghost: isDark ? Palette.buttonGhostDef : Palette.gray100,
    disabled: isDark ? `${Palette.brown200}33` : `${Palette.brown200}`,
  },

  // Status colors (same for both themes)
  status: {
    success: Palette.success,
    successAlt: Palette.successAlt,
    warning: Palette.warning,
    warningAlt: Palette.warningAlt,
    error: Palette.error,
    errorAlt: Palette.errorAlt,
  },

  // Semantic colors
  semantic: {
    white: Palette.white,
    black: Palette.black,
    transparent: Palette.transparent,
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    errorBackground: 'rgba(239, 68, 68, 0.1)',
    errorBorder: 'rgba(239, 68, 68, 0.2)',
    blue: Palette.primary500,
  },

  // Interactive states
  interactive: {
    hover: '#0f5bd1',
    pressed: '#0d4fb5',
    disabled: isDark ? '#949494' : Palette.gray400,
  },

  // Surface colors
  surface: {
    card: isDark ? Palette.primary1000 : Palette.white,
    input: isDark ? Palette.primary1200 : Palette.white,
    border: isDark ? `${Palette.primary600}66` : `${Palette.primary500}66`,
    divider: isDark ? Palette.dimGray : Palette.gray300,
    disabled: isDark ? Palette.charcoal800 : Palette.gray100,
  },

  // Additional utility colors
  utility: {
    lightGray: isDark ? Palette.lightGray : Palette.gray300,
    mediumGray: isDark ? Palette.mediumGray : Palette.gray600,
    darkGray: isDark ? Palette.darkSlateGray : Palette.gray700,
    whitesmoke: Palette.whiteSmoke,
    gainsboro: Palette.gainsboro,
    aliceblue: Palette.aliceBlue,
    overlay: isDark ? 'rgba(209, 209, 209, 0.05)' : 'rgba(0, 0, 0, 0.1)',
  },
});

/* ================================
   SPACING & LAYOUT
   ================================ */
export const Gap = {
  none: 0,
  xs: 4, // gap_4
  sm: 6, // gap_6
  md: 8, // gap_8
  lg: 12, // gap_12
  xl: 16, // gap_16
  xxl: 32, // Large sections
  xxxl: 40, // Screen sections
} as const;

export const Padding = {
  none: 0,
  xs: 1, // p_1 - Badge padding
  sm: 4, // p_4 - Small elements
  md: 6, // p_6 - Badge horizontal
  lg: 8, // p_8 - Default spacing
  xl: 12, // p_12 - Card content
  xxl: 16, // p_16 - Main containers
  xxxl: 24, // p_24 - Large spacing
} as const;

export const Margin = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const SafeArea = {
  top: 16,
  bottom: 16,
  left: 16,
  right: 16,
} as const;

/* ================================
   BORDER RADIUS
   ================================ */
export const BorderRadius = {
  none: 0,
  xs: 1, // Battery capacity
  sm: 3, // Battery border
  md: 4, // Small elements
  lg: 8, // Cards, inputs
  xl: 10, // Larger cards
  round: 64, // Avatars
  full: 100, // Badges, buttons, FAB
} as const;

// Legacy support (for gradual migration)
export const Border = {
  br_4: BorderRadius.md,
  br_8: BorderRadius.lg,
  br_10: BorderRadius.xl,
  br_64: BorderRadius.round,
  br_100: BorderRadius.full,
} as const;

/* ================================
   SHADOWS & ELEVATION
   ================================ */
export const createShadows = (isDark: boolean) => ({
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: isDark ? Palette.black : Palette.gray800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? Palette.black : Palette.gray800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: isDark ? Palette.black : Palette.gray800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

/* ================================
   COMMON DIMENSIONS
   ================================ */
export const Dimensions = {
  // Screen dimensions (from Figma)
  screenWidth: 375,
  screenHeight: {
    default: 812,
    tasks: 1084, // Extended height for scrollable content
  },

  // Component dimensions
  button: {
    height: 48,
    small: 32,
    icon: 24,
  },

  avatar: {
    small: 32,
    medium: 48,
    large: 96,
  },

  input: {
    height: 48,
  },

  appBar: {
    height: 56,
  },

  statusBar: {
    height: 50,
  },

  navBar: {
    height: 72, // Including padding
  },

  fab: {
    size: 56,
  },

  badge: {
    size: 16,
  },

  icon: {
    small: 16,
    medium: 20,
    large: 24,
  },
} as const;

/* ================================
   COMPONENT TOKENS
   ================================ */
export const ComponentTokens = {
  // Button specifications
  button: {
    height: {
      small: 32,
      medium: 48,
      large: 56,
    },
    borderRadius: BorderRadius.lg,
    padding: {
      horizontal: Padding.xxl,
      vertical: Padding.lg,
    },
    minWidth: 104,
  },

  // Input specifications
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: {
      horizontal: Padding.xxl,
      vertical: Padding.xl,
    },
  },

  // Card specifications
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: {
      small: Padding.xl,
      medium: Padding.xxl,
      large: 18, // Custom padding used in designs
    },
    gap: Gap.xl,
  },

  // Badge specifications
  badge: {
    borderRadius: BorderRadius.full,
    padding: {
      horizontal: Padding.md,
      vertical: Padding.xs,
    },
    minHeight: 24,
  },

  // Avatar specifications
  avatar: {
    size: {
      small: 32,
      medium: 48,
      large: 96,
      xl: 120, // For login logo
    },
    borderRadius: BorderRadius.round,
    borderWidth: 2,
  },

  // Navigation specifications
  navigation: {
    height: 72,
    tabHeight: 39,
    iconSize: 24,
    badgeSize: 16,
  },

  // App bar specifications
  appBar: {
    height: 56,
    padding: {
      horizontal: Padding.xxl,
      vertical: Padding.lg,
    },
  },

  // Floating Action Button
  fab: {
    size: 56,
    borderRadius: BorderRadius.full,
    iconSize: 24,
  },

  // Modal specifications
  modal: {
    borderRadius: BorderRadius.lg,
    padding: Padding.xxl,
    maxWidth: '90%',
  },
} as const;

/* ================================
   Z-INDEX LAYERS
   ================================ */
export const ZIndex = {
  base: 0,
  content: 1,
  overlay: 10,
  modal: 100,
  toast: 1000,
} as const;

/* ================================
   OPACITY VALUES
   ================================ */
export const Opacity = {
  invisible: 0,
  subtle: 0.05,
  light: 0.1,
  medium: 0.5,
  heavy: 0.7,
  visible: 1,
} as const;

/* ================================
   COMMON STYLE PATTERNS
   ================================ */
export const CommonStyles = {
  // Flexbox patterns
  flex: {
    center: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    centerVertical: {
      justifyContent: 'center' as const,
    },
    centerHorizontal: {
      alignItems: 'center' as const,
    },
    spaceBetween: {
      justifyContent: 'space-between' as const,
    },
    row: {
      flexDirection: 'row' as const,
    },
    column: {
      flexDirection: 'column' as const,
    },
  },

  // Text patterns
  text: {
    center: {
      textAlign: 'center' as const,
    },
    left: {
      textAlign: 'left' as const,
    },
    semibold: {
      fontWeight: '600' as const,
    },
    bold: {
      fontWeight: '700' as const,
    },
  },

  // Position patterns
  position: {
    absolute: {
      position: 'absolute' as const,
    },
    relative: {
      position: 'relative' as const,
    },
    fullWidth: {
      width: '100%',
    },
    fullHeight: {
      height: '100%',
    },
  },
} as const;

/* ================================
   THEME CREATION FUNCTIONS
   ================================ */
export const createTheme = (isDark: boolean) => ({
  colors: createColors(isDark),
  shadows: createShadows(isDark),
  fonts: FontFamily,
  fontSizes: FontSize,
  lineHeights: LineHeight,
  typography: Typography,
  spacing: {
    gap: Gap,
    padding: Padding,
    margin: Margin,
    safeArea: SafeArea,
  },
  borderRadius: BorderRadius,
  dimensions: Dimensions,
  components: ComponentTokens,
  zIndex: ZIndex,
  opacity: Opacity,
  common: CommonStyles,
  isDark,
});

/* ================================
   THEME INSTANCES
   ================================ */
export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);

/* ================================
   LEGACY EXPORTS (for migration)
   ================================ */
// Export individual pieces for backward compatibility
export const Color = darkTheme.colors; // Default to dark theme for now
export const Shadow = darkTheme.shadows;

/* ================================
   TYPE EXPORTS
   ================================ */
export type Theme = ReturnType<typeof createTheme>;
export type ThemeColors = Theme['colors'];
export type ColorSchemeType = 'light' | 'dark' | 'system';
export type ColorKeys = keyof typeof Color;
export type FontFamilyKeys = keyof typeof FontFamily;
export type FontSizeKeys = keyof typeof FontSize;
export type GapKeys = keyof typeof Gap;
export type PaddingKeys = keyof typeof Padding;
export type BorderRadiusKeys = keyof typeof BorderRadius;
