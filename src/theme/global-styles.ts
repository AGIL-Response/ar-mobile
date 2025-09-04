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
  normal: 16, // 12px font
  relaxed: 18, // 14px font
  loose: 20, // 16px font
  heading: 22, // 18-20px font
  large: 24, // 22px+ font
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
    fontFamily: FontFamily.manropeBold,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: FontSize.size_22,
    lineHeight: LineHeight.large,
    fontFamily: FontFamily.manropeBold,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: FontSize.size_20,
    lineHeight: LineHeight.heading,
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: FontSize.size_18,
    lineHeight: LineHeight.relaxed,
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: '600' as const,
  },

  // Body text
  body: {
    fontSize: FontSize.size_16,
    lineHeight: LineHeight.loose,
    fontFamily: FontFamily.manropeRegular,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: FontSize.size_14,
    lineHeight: LineHeight.relaxed,
    fontFamily: FontFamily.manropeRegular,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: FontSize.size_12,
    lineHeight: LineHeight.normal,
    fontFamily: FontFamily.manropeRegular,
    fontWeight: '400' as const,
  },

  // Labels and UI text
  label: {
    fontSize: FontSize.size_14,
    lineHeight: LineHeight.relaxed,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: FontSize.size_12,
    lineHeight: LineHeight.normal,
    fontFamily: FontFamily.manropeRegular,
    fontWeight: '400' as const,
  },
  overline: {
    fontSize: FontSize.size_10,
    lineHeight: LineHeight.tight,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500' as const,
  },

  // Interactive elements
  button: {
    fontSize: FontSize.size_16,
    lineHeight: LineHeight.loose,
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: '600' as const,
  },
  link: {
    fontSize: FontSize.size_14,
    lineHeight: LineHeight.relaxed,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500' as const,
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
  warning: '#f59f00',
  warningAlt: '#f76707',
  error: '#c92a2a',
  errorAlt: '#dc2020',

  // Semantic
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0, 0, 0, 0)',

  // Additional colors from designs
  gainsboro: '#dee2e6',
  lightGray: '#ced4da',
  darkGray: '#adb5bd',
  mediumGray: '#6a7178',
  dimGray: '#4f575e',
  darkSlateGray: '#49454f',
  whiteSmoke: '#f8f9fa',
  aliceBlue: '#e8f0fd',
} as const;

/* ================================
   THEME COLOR DEFINITIONS
   ================================ */
const createColors = (isDark: boolean) => ({
  // Primary brand color
  primary: Palette.primary,
  primaryLight: Palette.primaryLight,

  // Background colors
  background: {
    primary: isDark ? Palette.charcoal950 : Palette.white,
    secondary: isDark ? Palette.charcoal900 : Palette.gray50,
    tertiary: isDark ? '#272b30' : Palette.gray100,
    overlay: isDark ? 'rgba(163, 163, 163, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },

  // Text colors
  text: {
    primary: isDark ? Palette.white : Palette.charcoal950,
    secondary: isDark ? Palette.gainsboro : Palette.gray700,
    muted: isDark ? Palette.darkGray : Palette.gray600,
    disabled: isDark ? Palette.mediumGray : Palette.gray400,
    placeholder: isDark ? Palette.dimGray : Palette.gray500,
    inverse: isDark ? Palette.charcoal950 : Palette.white, // For dark/light backgrounds
    accent: Palette.primary, // For highlighted text
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
  },

  // Interactive states
  interactive: {
    hover: '#0f5bd1',
    pressed: '#0d4fb5',
    disabled: isDark ? '#949494' : Palette.gray400,
  },

  // Surface colors
  surface: {
    card: isDark ? Palette.charcoal900 : Palette.white,
    input: isDark ? Palette.charcoal950 : Palette.white,
    border: isDark ? '#272b30' : Palette.gray300,
    divider: isDark ? Palette.dimGray : Palette.gray300,
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: {
      horizontal: Padding.xxl,
      vertical: Padding.xl,
    },
  },

  // Card specifications
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
    borderWidth: 1,
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
