/**
 * Theme System Exports
 * Central export point for the design system
 */

// Theme objects and creation functions
export {
  Border,
  BorderRadius,
  // Legacy exports (for gradual migration)
  Color,
  CommonStyles,
  // Design tokens
  ComponentTokens,
  createTheme,
  darkTheme,
  Dimensions,
  FontFamily,
  FontSize,
  Gap,
  lightTheme,
  LineHeight,
  Margin,
  Opacity,
  Padding,
  Palette,
  Shadow,
  Typography,
  ZIndex,
} from './global-styles';

// Theme hooks
export {
  useIsDarkTheme,
  useTheme,
  useThemeColors,
  useThemeSelection,
} from './use-theme';

// Types
export type {
  BorderRadiusKeys,
  ColorKeys,
  ColorSchemeType,
  FontFamilyKeys,
  FontSizeKeys,
  GapKeys,
  PaddingKeys,
  Theme,
  ThemeColors,
} from './global-styles';
